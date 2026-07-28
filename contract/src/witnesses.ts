import { WitnessContext } from "@midnight-ntwrk/compact-runtime";
import { Ledger } from "./managed/auction/contract/index.js";

/**
 * Private state held locally by each participant (auctioneer or bidder).
 * None of this ever touches the public ledger.
 */
export type AuctionPrivateState = {
  readonly secretKey: Uint8Array;
  readonly pendingBidAmount: bigint;
  readonly pendingBidNonce: Uint8Array;
  readonly walletLiquidity: bigint;
};

export const createAuctionPrivateState = (
  secretKey: Uint8Array,
  pendingBidAmount: bigint = 0n,
  pendingBidNonce: Uint8Array = new Uint8Array(32),
  walletLiquidity: bigint = 0n,
): AuctionPrivateState => ({
  secretKey,
  pendingBidAmount,
  pendingBidNonce,
  walletLiquidity,
});

export const witnesses = {
  localSecretKey: ({
    privateState,
  }: WitnessContext<Ledger, AuctionPrivateState>): [AuctionPrivateState, Uint8Array] => [
    privateState,
    privateState.secretKey,
  ],

  getBidAmount: ({
    privateState,
  }: WitnessContext<Ledger, AuctionPrivateState>): [AuctionPrivateState, bigint] => [
    privateState,
    privateState.pendingBidAmount,
  ],

  getBidNonce: ({
    privateState,
  }: WitnessContext<Ledger, AuctionPrivateState>): [AuctionPrivateState, Uint8Array] => [
    privateState,
    privateState.pendingBidNonce,
  ],

  getWalletLiquidity: ({
    privateState,
  }: WitnessContext<Ledger, AuctionPrivateState>): [AuctionPrivateState, bigint] => [
    privateState,
    privateState.walletLiquidity,
  ],
};
