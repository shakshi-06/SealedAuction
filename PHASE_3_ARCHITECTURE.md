# Phase 3: Real Auction Escrow & Token Settlement Architecture

This document outlines the architecture and placeholder logic for implementing real token transfers (e.g., Midnight Zswap tokens, tDUST, or a bridged stablecoin like USDC) in the Midnight zk-Auction.

## Why We Are Drafting This Instead of Implementing

Implementing real token escrow on Midnight (Option 2) involves significant complexity at this stage:
1. **UTXO Coin Selection**: The UI would need to handle complex UTXO coin selection to fund the escrow during the `commitBid` circuit.
2. **Testnet Tokens**: Bidders would need to acquire actual testnet tokens (like tDUST or a test USDC) to participate.
3. **Zswap Integration**: We would need to import and correctly utilize Midnight's Zswap standard library, which requires specific syntax for `receive`, `send`, and managing ledger balances that currently isn't documented in our scaffold.

To avoid breaking the perfectly working application with undocumented API calls, we are drafting the architecture and structural placeholders below.

---

## 1. Escrow Mechanics

### On-Chain Ledger Additions
To support escrow, the contract needs to hold tokens and track deposits.

```typescript
// Import Zswap standard library for token management
import Zswap;

// Track how many tokens are currently locked in escrow per bidder
export ledger escrow_balances: Map<Bytes<32>, Uint<64>>;

// Track the total liquidity locked in the contract
export ledger total_escrow: Uint<64>;
```

### Escrowing Funds during Commit
When a bidder commits a bid, they must send tokens to the contract. The contract will verify that the tokens were received and update their internal escrow balance.

```typescript
export circuit commitBid(commitment: Bytes<32>, deposit_amount: Uint<64>): [] {
    // ... existing phase checks ...
    
    // Zswap: Receive tokens from the caller into the contract's custody
    Zswap.receive(deposit_amount);
    
    // Update the escrow balance for this specific bidder
    const sk = bidder_secret();
    const nul = bidder_nullifier(sk);
    
    escrow_balances.insert(nul, deposit_amount);
    total_escrow = disclose(total_escrow + deposit_amount);
}
```

## 2. Refunds

Bidders who do not win the auction need to be able to claim their refunded tokens.

```typescript
export circuit claimRefund(): [] {
    assert(disclose(phase) == 2 as Uint<8>, "Auction not resolved yet");
    
    const sk = bidder_secret();
    const nul = bidder_nullifier(sk);
    
    // Ensure they are not the winner
    assert(nul != winning_bidder_nullifier, "Winner cannot claim refund");
    
    // Look up their escrowed amount
    const amount = escrow_balances.lookup(nul);
    assert(amount > 0, "No funds to refund");
    
    // Zero out their balance to prevent double-refunds
    escrow_balances.remove(nul);
    
    // Zswap: Send the tokens back to the caller
    Zswap.send(amount);
}
```

## 3. Winner Settlement & Asset Transfer

When the auction resolves, the winning bid amount must be transferred to the auctioneer, and the underlying asset (or proof of ownership) must be assigned to the winner.

```typescript
export circuit resolveAuction(): [] {
    // ... existing phase checks ...

    // Settle the tokens: The auctioneer claims the highest bid amount
    const winning_amount = highest_bid;
    Zswap.send(winning_amount); // Sent to the auctioneer caller
    
    // The winner's escrow balance is effectively burned/transferred.
    // If the winner deposited more than the highest_bid (to hide their actual bid), 
    // the excess remains in `escrow_balances` and can be claimed via `claimRefund()`.
    
    // Transfer the Asset
    // Example: Update the owner of an NFT or issue a redemption ticket
    asset_owner = winning_bidder_nullifier;
    
    phase = disclose(2 as Uint<8>);
}
```

## 4. Dispute & Cancellation Rules

If the auctioneer abandons the auction or fails to reveal the asset, bidders need a way to cancel and recover their funds.

### Cancellation Condition
We can introduce a `timeout_block` or `expiration_round`. If the auction is not resolved by this time, any bidder can trigger a cancellation.

```typescript
export ledger timeout_round: Uint<32>;

export circuit cancelAuction(): [] {
    // Check if the current network round exceeds the timeout
    assert(network.round > timeout_round, "Auction has not timed out yet");
    
    // Transition to a special CANCELLED phase (3)
    phase = disclose(3 as Uint<8>);
}
```

If the auction is in the `CANCELLED` phase, the `claimRefund()` circuit is modified to allow *everyone* (including the highest bidder) to withdraw their funds, ensuring no tokens are permanently locked.
