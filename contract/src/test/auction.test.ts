/**
 * Test suite for the sealed-bid auction contract.
 *
 * NOTE ON HARNESS BOILERPLATE:
 * The low-level context-construction boilerplate below (creating a
 * ConstructorContext / CircuitContext and driving the compiled contract
 * through @midnight-ntwrk/compact-runtime) follows the same shape used in
 * Midnight's official example templates (e.g. midnightntwrk/example-counter,
 * contract/src/test/). If any of the constructor/helper names below don't
 * match the exact version of @midnight-ntwrk/compact-runtime installed by
 * `npm install`, copy the working harness setup from that template's test
 * file and keep the business-logic assertions here — that's expected,
 * version-to-version API drift in a fast-moving toolchain is normal.
 */
import { describe, it, expect, beforeEach } from "vitest";
import * as compactRuntime from "@midnight-ntwrk/compact-runtime";
import { Contract, type Ledger } from "../managed/auction/contract/index.js";
import {
  witnesses,
  createAuctionPrivateState,
  type AuctionPrivateState,
} from "../witnesses.js";

const AUCTIONEER_KEY = new Uint8Array(32).fill(1);
const BIDDER_KEY = new Uint8Array(32).fill(2);
const OTHER_BIDDER_KEY = new Uint8Array(32).fill(3);

function makeContractAndContext(secretKey: Uint8Array) {
  const contract = new Contract<AuctionPrivateState>(witnesses);
  const privateState = createAuctionPrivateState(secretKey);
  const constructorContext = new compactRuntime.ConstructorContext(
    privateState,
    "0".repeat(64),
  );
  const { currentPrivateState, currentContractState, currentZswapLocalState } =
    contract.initialState(constructorContext);
  const context: compactRuntime.CircuitContext<AuctionPrivateState> = {
    currentPrivateState,
    currentZswapLocalState,
    originalState: currentContractState,
    transactionContext: new compactRuntime.QueryContext(
      currentContractState.data,
      compactRuntime.sampleContractAddress(),
    ),
  };
  return { contract, context };
}

function bidCommitment(amount: bigint, nonce: Uint8Array): Uint8Array {
  // Mirrors the contract's own commitment hash: persistentHash(["auction:bid:", amount, nonce])
  return compactRuntime.persistentHash(
    compactRuntime.encodeVector([
      compactRuntime.pad(32, "auction:bid:"),
      compactRuntime.encodeToPaddedBytes(amount, 32),
      nonce,
    ]),
  );
}

describe("sealed-bid auction contract", () => {
  it("initializes in the COMMIT phase with no active bid", () => {
    const { contract, context } = makeContractAndContext(AUCTIONEER_KEY);
    const ledger: Ledger = contract.ledger(context.originalState.data);
    expect(ledger.phase).toBe(0); // Phase.COMMIT
    expect(ledger.hasActiveBid).toBe(false);
    expect(ledger.highestBid).toBe(0n);
  });

  it("lets the first caller claim the auctioneer role, and blocks a second claim", () => {
    const { contract, context } = makeContractAndContext(AUCTIONEER_KEY);
    const { context: afterClaim } = contract.circuits.claimAuctioneer(context);
    const ledgerAfter: Ledger = contract.ledger(afterClaim.originalState.data);
    expect(ledgerAfter.auctioneerSet).toBe(true);

    expect(() => contract.circuits.claimAuctioneer(afterClaim)).toThrow();
  });

  it("accepts a sealed commitment during COMMIT and rejects a second concurrent bid", () => {
    const { contract, context } = makeContractAndContext(AUCTIONEER_KEY);
    const { context: afterClaim } = contract.circuits.claimAuctioneer(context);

    const bidderContext = { ...afterClaim, currentPrivateState: createAuctionPrivateState(BIDDER_KEY) };
    const commitment = bidCommitment(500n, new Uint8Array(32).fill(9));
    const { context: afterCommit } = contract.circuits.commitBid(bidderContext, commitment);

    const ledgerAfter: Ledger = contract.ledger(afterCommit.originalState.data);
    expect(ledgerAfter.hasActiveBid).toBe(true);

    const otherBidderContext = { ...afterCommit, currentPrivateState: createAuctionPrivateState(OTHER_BIDDER_KEY) };
    expect(() =>
      contract.circuits.commitBid(otherBidderContext, bidCommitment(400n, new Uint8Array(32).fill(7))),
    ).toThrow();
  });

  it("only the committed bidder can reveal, and the reveal must match the sealed commitment", () => {
    const { contract, context } = makeContractAndContext(AUCTIONEER_KEY);
    const { context: afterClaim } = contract.circuits.claimAuctioneer(context);

    const nonce = new Uint8Array(32).fill(9);
    const bidderContext = { ...afterClaim, currentPrivateState: createAuctionPrivateState(BIDDER_KEY, 500n, nonce, 1000n) };
    const { context: afterCommit } = contract.circuits.commitBid(bidderContext, bidCommitment(500n, nonce));

    const auctioneerContext = { ...afterCommit, currentPrivateState: createAuctionPrivateState(AUCTIONEER_KEY) };
    const { context: afterAdvance } = contract.circuits.advanceToReveal(auctioneerContext);

    // Wrong bidder trying to reveal should fail.
    const impostorContext = { ...afterAdvance, currentPrivateState: createAuctionPrivateState(OTHER_BIDDER_KEY, 500n, nonce, 1000n) };
    expect(() => contract.circuits.revealBid(impostorContext)).toThrow();

    // Correct bidder, correct amount + nonce -> succeeds and updates highestBid.
    const revealContext = { ...afterAdvance, currentPrivateState: createAuctionPrivateState(BIDDER_KEY, 500n, nonce, 1000n) };
    const { context: afterReveal, result } = contract.circuits.revealBid(revealContext);
    expect(result).toBe(500n);

    const ledgerAfter: Ledger = contract.ledger(afterReveal.originalState.data);
    expect(ledgerAfter.highestBid).toBe(500n);
    expect(ledgerAfter.hasActiveBid).toBe(false);
  });

  it("rejects a reveal where claimed funds are insufficient for the bid", () => {
    const { contract, context } = makeContractAndContext(AUCTIONEER_KEY);
    const { context: afterClaim } = contract.circuits.claimAuctioneer(context);

    const nonce = new Uint8Array(32).fill(4);
    const bidderContext = { ...afterClaim, currentPrivateState: createAuctionPrivateState(BIDDER_KEY, 500n, nonce, 100n) };
    const { context: afterCommit } = contract.circuits.commitBid(bidderContext, bidCommitment(500n, nonce));

    const auctioneerContext = { ...afterCommit, currentPrivateState: createAuctionPrivateState(AUCTIONEER_KEY) };
    const { context: afterAdvance } = contract.circuits.advanceToReveal(auctioneerContext);

    const revealContext = { ...afterAdvance, currentPrivateState: createAuctionPrivateState(BIDDER_KEY, 500n, nonce, 100n) };
    expect(() => contract.circuits.revealBid(revealContext)).toThrow();
  });

  it("never exposes the secret key through any public ledger field", () => {
    const { contract, context } = makeContractAndContext(AUCTIONEER_KEY);
    const { context: afterClaim } = contract.circuits.claimAuctioneer(context);
    const ledgerAfter: Ledger = contract.ledger(afterClaim.originalState.data);
    const serialized = JSON.stringify(ledgerAfter, (_key, value) =>
      typeof value === "bigint" ? value.toString() : value,
    );
    const keyHex = Buffer.from(AUCTIONEER_KEY).toString("hex");
    expect(serialized).not.toContain(keyHex);
  });
});
