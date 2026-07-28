import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export enum Phase { COMMIT = 0, REVEAL = 1, RESOLVED = 2 }

export type Witnesses<PS> = {
  localSecretKey(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  getBidAmount(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  getBidNonce(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  getWalletLiquidity(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
}

export type ImpureCircuits<PS> = {
  claimAuctioneer(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  commitBid(context: __compactRuntime.CircuitContext<PS>,
            newCommitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  advanceToReveal(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  revealBid(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint>;
  resolveAuction(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
}

export type ProvableCircuits<PS> = {
  claimAuctioneer(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  commitBid(context: __compactRuntime.CircuitContext<PS>,
            newCommitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  advanceToReveal(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  revealBid(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint>;
  resolveAuction(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
  auctioneerId(sk_0: Uint8Array): Uint8Array;
  bidderId(sk_0: Uint8Array): Uint8Array;
  computeBidCommitment(bidAmount_0: bigint, nonce_0: Uint8Array): Uint8Array;
}

export type Circuits<PS> = {
  auctioneerId(context: __compactRuntime.CircuitContext<PS>, sk_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  bidderId(context: __compactRuntime.CircuitContext<PS>, sk_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  computeBidCommitment(context: __compactRuntime.CircuitContext<PS>,
                       bidAmount_0: bigint,
                       nonce_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  claimAuctioneer(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  commitBid(context: __compactRuntime.CircuitContext<PS>,
            newCommitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  advanceToReveal(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  revealBid(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint>;
  resolveAuction(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
}

export type Ledger = {
  readonly phase: Phase;
  readonly auctioneerSet: boolean;
  readonly auctioneer: Uint8Array;
  readonly round: bigint;
  readonly hasActiveBid: boolean;
  readonly bidCommitment: Uint8Array;
  readonly committedBidder: Uint8Array;
  readonly highestBid: bigint;
  readonly winnerId: Uint8Array;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
