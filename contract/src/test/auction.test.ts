import { describe, it, expect } from "vitest";
import * as compactRuntime from "@midnight-ntwrk/compact-runtime";
import {
  Contract,
  ledger,
  pureCircuits,
  type Ledger,
} from "../managed/auction/contract/index.js";
import {
  witnesses,
  createAuctionPrivateState,
  type AuctionPrivateState,
} from "../witnesses.js";

const AUCTIONEER_KEY = new Uint8Array(32).fill(1);
const BIDDER_KEY = new Uint8Array(32).fill(2);
const OTHER_BIDDER_KEY = new Uint8Array(32).fill(3);
const SAMPLE_COIN_PUBLIC_KEY = "0".repeat(64);

function makeContractAndContext(secretKey: Uint8Array) {
  const contract = new Contract<AuctionPrivateState>(witnesses);
  const privateState = createAuctionPrivateState(secretKey);

  const constructorContext = compactRuntime.createConstructorContext(
    privateState,
    SAMPLE_COIN_PUBLIC_KEY,
  );
  const { currentContractState, currentPrivateState, currentZswapLocalState } =
    contract.initialState(constructorContext);

  const address = compactRuntime.sampleContractAddress();
  const context = compactRuntime.createCircuitContext(
    address,
    currentZswapLocalState,
    currentContractState,
    currentPrivateState,
  );

  return { contract, context };
}

function withPrivateState(
  context: compactRuntime.CircuitContext<AuctionPrivateState>,
  privateState: AuctionPrivateState,
): compactRuntime.CircuitContext<AuctionPrivateState> {
  return { ...context, currentPrivateState: privateState };
}

function readLedger(
  context: compactRuntime.CircuitContext<AuctionPrivateState>,
): Ledger {
  return ledger(context.currentQueryContext.state);
}

describe("sealed-bid auction contract", () => {
  it("initializes in the COMMIT phase with no active bid", () => {
    const { context } = makeContractAndContext(AUCTIONEER_KEY);
    const state = readLedger(context);
    expect(state.phase).toBe(0); // Phase.COMMIT
    expect(state.hasActiveBid).toBe(false);
    expect(state.highestBid).toBe(0n);
  });

  it("lets the first caller claim the auctioneer role, and blocks a second claim", () => {
    const { contract, context } = makeContractAndContext(AUCTIONEER_KEY);
    const { context: afterClaim } = contract.circuits.claimAuctioneer(context);
    expect(readLedger(afterClaim).auctioneerSet).toBe(true);
    expect(() => contract.circuits.claimAuctioneer(afterClaim)).toThrow();
  });

  it("accepts a sealed commitment during COMMIT and rejects a second concurrent bid", () => {
    const { contract, context } = makeContractAndContext(AUCTIONEER_KEY);
    const { context: afterClaim } = contract.circuits.claimAuctioneer(context);

    const nonce = new Uint8Array(32).fill(9);
    const commitment = pureCircuits.computeBidCommitment(500n, nonce);
    const bidderCtx = withPrivateState(
      afterClaim,
      createAuctionPrivateState(BIDDER_KEY, 500n, nonce, 1000n),
    );
    const { context: afterCommit } = contract.circuits.commitBid(bidderCtx, commitment);
    expect(readLedger(afterCommit).hasActiveBid).toBe(true);

    const otherNonce = new Uint8Array(32).fill(7);
    const otherCommitment = pureCircuits.computeBidCommitment(400n, otherNonce);
    const otherCtx = withPrivateState(
      afterCommit,
      createAuctionPrivateState(OTHER_BIDDER_KEY, 400n, otherNonce, 1000n),
    );
    expect(() => contract.circuits.commitBid(otherCtx, otherCommitment)).toThrow();
  });

  it("only the committed bidder can reveal, and the reveal must match the sealed commitment", () => {
    const { contract, context } = makeContractAndContext(AUCTIONEER_KEY);
    const { context: afterClaim } = contract.circuits.claimAuctioneer(context);

    const nonce = new Uint8Array(32).fill(9);
    const commitment = pureCircuits.computeBidCommitment(500n, nonce);
    const bidderCtx = withPrivateState(
      afterClaim,
      createAuctionPrivateState(BIDDER_KEY, 500n, nonce, 1000n),
    );
    const { context: afterCommit } = contract.circuits.commitBid(bidderCtx, commitment);

    const auctioneerCtx = withPrivateState(afterCommit, createAuctionPrivateState(AUCTIONEER_KEY));
    const { context: afterAdvance } = contract.circuits.advanceToReveal(auctioneerCtx);

    const impostorCtx = withPrivateState(
      afterAdvance,
      createAuctionPrivateState(OTHER_BIDDER_KEY, 500n, nonce, 1000n),
    );
    expect(() => contract.circuits.revealBid(impostorCtx)).toThrow();

    const revealCtx = withPrivateState(
      afterAdvance,
      createAuctionPrivateState(BIDDER_KEY, 500n, nonce, 1000n),
    );
    const { context: afterReveal, result } = contract.circuits.revealBid(revealCtx);
    expect(result).toBe(500n);

    const stateAfter = readLedger(afterReveal);
    expect(stateAfter.highestBid).toBe(500n);
    expect(stateAfter.hasActiveBid).toBe(false);
  });

  it("rejects a reveal where claimed funds are insufficient for the bid", () => {
    const { contract, context } = makeContractAndContext(AUCTIONEER_KEY);
    const { context: afterClaim } = contract.circuits.claimAuctioneer(context);

    const nonce = new Uint8Array(32).fill(4);
    const commitment = pureCircuits.computeBidCommitment(500n, nonce);
    const bidderCtx = withPrivateState(
      afterClaim,
      createAuctionPrivateState(BIDDER_KEY, 500n, nonce, 100n),
    );
    const { context: afterCommit } = contract.circuits.commitBid(bidderCtx, commitment);

    const auctioneerCtx = withPrivateState(afterCommit, createAuctionPrivateState(AUCTIONEER_KEY));
    const { context: afterAdvance } = contract.circuits.advanceToReveal(auctioneerCtx);

    const revealCtx = withPrivateState(
      afterAdvance,
      createAuctionPrivateState(BIDDER_KEY, 500n, nonce, 100n),
    );
    expect(() => contract.circuits.revealBid(revealCtx)).toThrow();
  });

  it("never exposes the secret key through any public ledger field", () => {
    const { contract, context } = makeContractAndContext(AUCTIONEER_KEY);
    const { context: afterClaim } = contract.circuits.claimAuctioneer(context);
    const state = readLedger(afterClaim);
    const serialized = JSON.stringify(state, (_key, value) =>
      typeof value === "bigint" ? value.toString() : value,
    );
    const keyHex = Buffer.from(AUCTIONEER_KEY).toString("hex");
    expect(serialized).not.toContain(keyHex);
  });
});
