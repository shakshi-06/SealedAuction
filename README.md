# Sealed-Bid Auctions with Solvency Safeguards

A privacy-preserving sealed-bid auction dApp built on Midnight with Compact.
Built for **New Moon to Full: Monthly Moonshots on Midnight** — Level 1 (New Moon).

## Product idea

Traditional on-chain auctions expose every bid the moment it's submitted, which
invites front-running and lets other bidders game the process by watching the
mempool. Off-chain sealed-bid auctions solve that, but require trusting a
centralized auctioneer not to peek early or favor a preferred bidder. This
project uses a commit-reveal scheme backed by zero-knowledge proofs: bidders
submit only a cryptographic commitment to their bid during the commit phase,
so no one — not even the auctioneer — can see any bid amount until the reveal
phase. When a bidder reveals, the contract proves in zero-knowledge that (a)
the revealed amount matches their original sealed commitment and (b) they
actually have sufficient funds to cover it, without ever putting the losing
bids, or the winning bidder's wallet balance, on the public record. Only the
final highest bid and the identity commitment of the winner become public,
and only once the auction is resolved.

## Public ledger state vs. private witness

Compact contracts split all state into two categories: what's written to the
public, on-chain ledger (visible to everyone, forever) and what stays entirely
on the caller's own machine as a **private witness** (never touches the chain,
never appears in any transaction).

**Public ledger state** (`contract/src/auction.compact`):
- `phase` — whether the auction is in COMMIT, REVEAL, or RESOLVED
- `auctioneerSet` / `auctioneer` — a *commitment* (hash) identifying who
  controls phase transitions, not their real identity or key
- `bidCommitment` — the sealed hash of the current bid (not the amount)
- `committedBidder` — a commitment identifying who sealed that bid
- `highestBid` / `winnerId` — populated only after a successful, verified
  reveal; this is the *only* point at which an actual bid amount becomes public

**Private witnesses** (`contract/src/witnesses.ts`):
- `localSecretKey()` — the caller's private key material; used only inside
  zero-knowledge circuits to derive identity commitments, never disclosed itself
- `getBidAmount()` / `getBidNonce()` — the real bid amount and the secret
  nonce used to seal it; known only to the bidder until they choose to reveal
- `getWalletLiquidity()` — the bidder's available funds, used only to prove
  (without revealing the actual balance) that they can cover their bid

The key privacy mechanism is `disclose()`: by default, Compact refuses to let
any value derived from a witness be written to a public ledger field. Every
place in the contract where a witness-derived value becomes public
(`auctioneer`, `bidCommitment`, `committedBidder`, `highestBid`, `winnerId`,
and the `revealBid` return value) is explicitly wrapped in `disclose()` — a
deliberate developer decision that this specific value, and only this value,
is safe to reveal. Everything else (the actual bid amount before reveal, the
nonce, the wallet balance, the raw secret key) never leaves the caller's
machine.

## Prerequisites

- [Compact toolchain](https://docs.midnight.network/getting-started/installation)
  (`compact` CLI, tested with compiler `0.31.1`)
- [Docker](https://www.docker.com/products/docker-desktop/) (for the local proof server)
- Node.js ≥ 22

## Setup — run locally

```bash
# 1. Install the Compact toolchain (skip if already installed)
curl --proto '=https' --tlsv1.2 -LsSf https://github.com/midnightntwrk/compact/releases/latest/download/compact-installer.sh | sh
source $HOME/.local/bin/env
compact update

# 2. Start the local proof server (required for compiling/testing with real ZK proofs)
docker run -d -p 6300:6300 --name midnight-proof-server midnightnetwork/proof-server:latest

# 3. Clone this repo and install dependencies
git clone <this-repo-url>
cd <this-repo>/contract
npm install

# 4. Compile the contract (generates circuits, ZK keys, and the TypeScript API)
npm run compact

# 5. Build the TypeScript API
npm run build

# 6. Run the test suite
npm run test
```

Expected `npm run compact` output (circuits listed):

```
Compiling N circuits:
  circuit "claimAuctioneer" (...)
  circuit "commitBid" (...)
  circuit "advanceToReveal" (...)
  circuit "revealBid" (...)
  circuit "resolveAuction" (...)
```

### Screenshot: successful compile output

_(add screenshot here: `npm run compact` output showing circuits listed)_

### Screenshot: contract deployed with address shown

_(add screenshot here: deployment output / explorer page showing the
Preview/Preprod contract address)_

## Contract summary

| Circuit | Caller | Purpose |
|---|---|---|
| `claimAuctioneer` | first caller | Claims the auctioneer role for this auction instance |
| `commitBid` | any bidder | Seals a bid commitment hash during COMMIT phase |
| `advanceToReveal` | auctioneer only | Moves the auction from COMMIT to REVEAL |
| `revealBid` | the committed bidder | Proves the reveal matches the seal + solvency; updates the public highest bid |
| `resolveAuction` | auctioneer only | Closes the auction after reveal |

**Level 1 scope note:** this milestone supports one active sealed bid per
round (a bidder commits, reveals, then the next bidder can commit). Level 3
(Production-Grade dApp) will extend this to true concurrent multi-bidder
rounds using Compact's `Map` ledger type, so several bids can be sealed at
once before any reveal happens.

## Roadmap (per challenge levels)

- **Level 2 (Waxing Crescent):** Frontend UI wired to this contract, Lace
  wallet integration on Preprod
- **Level 3 (First Quarter):** Multi-bidder concurrent rounds via `Map`,
  full test coverage, CI/CD
- **Level 4–6:** MVP live on Preprod → user feedback loop → Mainnet launch
