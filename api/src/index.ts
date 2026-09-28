import type { Logger } from 'pino';
import {
  BehaviorSubject,
  type Observable,
} from 'rxjs';
import {
  deployContract,
  submitCallTx,
  type DeployedContract,
} from '@midnight-ntwrk/midnight-js-contracts';
import type { ContractAddress } from '@midnight-ntwrk/midnight-js-protocol/compact-runtime';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  Contract,
  ledger,
  pureCircuits,
  type Ledger,
} from '../../contract/src/index.js';
import { Phase } from '../../contract/src/index.js';

// ─── Types ────────────────────────────────────────────────────────────────────

export type BBoardCircuitKeys = Record<string, Uint8Array>;

export interface BBoardPrivateState {
  secretKey: Uint8Array;
  bidAmount?: bigint;
  bidNonce?: Uint8Array;
  liquidity?: bigint;
}

export interface BBoardDerivedState {
  phase: Phase;
  round: bigint;
  highestBid: bigint;
  isAuctioneer: boolean;
  isCommittedBidder: boolean;
  hasActiveBid: boolean;
}

export interface BBoardProviders {
  privateStateProvider: {
    get(key: string): Promise<BBoardPrivateState | null>;
    set(key: string, value: BBoardPrivateState): Promise<void>;
    setContractAddress?(address: string): void;
  };
  publicDataProvider: {
    queryContractState(address: ContractAddress): Promise<any>;
  };
  zkConfigProvider: any;
  proofProvider: any;
  walletProvider: any;
  midnightProvider: any;
}

export interface DeployedBBoardAPI {
  readonly deployedContractAddress: ContractAddress;
  readonly state$: Observable<BBoardDerivedState>;
  claimAuctioneer(): Promise<void>;
  commitBid(commitment: Uint8Array): Promise<void>;
  prepareAndCommitBid(amount: bigint, liquidity: bigint): Promise<void>;
  advanceToReveal(): Promise<void>;
  revealBid(): Promise<void>;
  resolveAuction(): Promise<void>;
}

// ─── Private state key ────────────────────────────────────────────────────────

const PRIVATE_STATE_KEY = 'BBoardPrivateState';

// ─── Compiled contract factory ────────────────────────────────────────────────

const currentDir = path.resolve(fileURLToPath(import.meta.url), '..', '..', '..');
const zkConfigPath = path.resolve(currentDir, 'contracts', 'managed', 'auction');

export function getCompiledContract() {
  return CompiledContract.make('Auction', Contract).pipe(
    CompiledContract.withVacantWitnesses,
    CompiledContract.withCompiledFileAssets(zkConfigPath),
  );
}

// ─── Random bytes helper ──────────────────────────────────────────────────────

async function randomBytes(n: number): Promise<Uint8Array> {
  const { randomBytes: cryptoRandomBytes } = await import('node:crypto');
  return new Uint8Array(cryptoRandomBytes(n));
}

// ─── BBoardAPI class ──────────────────────────────────────────────────────────

export class BBoardAPI implements DeployedBBoardAPI {
  readonly #stateSubject: BehaviorSubject<BBoardDerivedState>;
  readonly state$: Observable<BBoardDerivedState>;
  #pollInterval: ReturnType<typeof setInterval> | null = null;

  private constructor(
    readonly deployedContractAddress: ContractAddress,
    private readonly providers: BBoardProviders,
    private readonly deployedContract: DeployedContract<Contract>,
    private readonly logger?: Logger,
  ) {
    this.#stateSubject = new BehaviorSubject<BBoardDerivedState>({
      phase: Phase.COMMIT,
      round: 1n,
      highestBid: 0n,
      isAuctioneer: false,
      isCommittedBidder: false,
      hasActiveBid: false,
    });
    this.state$ = this.#stateSubject.asObservable();
    void this.#startPolling();
  }

  // ─── Factory: Deploy ──────────────────────────────────────────────────────

  static async deploy(providers: BBoardProviders, logger?: Logger): Promise<BBoardAPI> {
    logger?.info('Deploying Auction contract...');

    // Generate a fresh auctioneer key pair
    const auctioneerSk = await randomBytes(32);
    const auctioneerHash = (pureCircuits as any).auctioneer_key(auctioneerSk);

    // Store secret key in private state
    const privateState: BBoardPrivateState = { secretKey: auctioneerSk };
    await providers.privateStateProvider.set(PRIVATE_STATE_KEY, privateState);

    const compiledContract = getCompiledContract();

    const deployed = await deployContract<Contract>(providers as any, {
      compiledContract: compiledContract as any,
      privateStateId: PRIVATE_STATE_KEY,
      initialPrivateState: {},
      args: [auctioneerHash],
    });

    const address = deployed.deployTxData.public.contractAddress;
    logger?.info({ address }, 'Auction contract deployed');

    return new BBoardAPI(address, providers, deployed, logger);
  }

  // ─── Factory: Join ────────────────────────────────────────────────────────

  static async join(providers: BBoardProviders, contractAddress: ContractAddress, logger?: Logger): Promise<BBoardAPI> {
    logger?.info({ contractAddress }, 'Joining existing Auction contract...');

    // Generate a fresh bidder key pair for joining
    const bidderSk = await randomBytes(32);
    const privateState: BBoardPrivateState = { secretKey: bidderSk };
    await providers.privateStateProvider.set(PRIVATE_STATE_KEY, privateState);

    const compiledContract = getCompiledContract();

    // Create a mock deployed contract reference for joining
    const mockDeployed = {
      deployTxData: { public: { contractAddress } },
      providers,
      compiledContract,
    } as unknown as DeployedContract<Contract>;

    return new BBoardAPI(contractAddress, providers, mockDeployed, logger);
  }

  // ─── State polling ────────────────────────────────────────────────────────

  async #startPolling(): Promise<void> {
    const poll = async () => {
      try {
        const raw = await this.providers.publicDataProvider.queryContractState(this.deployedContractAddress);
        if (!raw) return;

        const state = ledger(raw.data);
        const privateState = await this.providers.privateStateProvider.get(PRIVATE_STATE_KEY);

        // Determine if this user is the auctioneer by checking if their key hashes match
        let isAuctioneer = false;
        if (privateState?.secretKey) {
          try {
            const myHash = (pureCircuits as any).auctioneer_key(privateState.secretKey);
            isAuctioneer = Buffer.from(myHash).equals(Buffer.from(state.auctioneer));
          } catch { /* ignore */ }
        }

        this.#stateSubject.next({
          phase: Number(state.phase) as Phase,
          round: state.round,
          highestBid: state.highest_bid,
          isAuctioneer,
          isCommittedBidder: !!privateState?.bidAmount,
          hasActiveBid: ((state as any).bid_commitments?.size ?? 0n) > 0n,
        });
      } catch (err) {
        this.logger?.warn({ err }, 'State poll failed');
      }
    };

    await poll();
    this.#pollInterval = setInterval(() => void poll(), 5000);
  }

  // ─── Circuit calls ────────────────────────────────────────────────────────

  async claimAuctioneer(): Promise<void> {
    this.logger?.info('Claiming auctioneer role...');
    const privateState = await this.providers.privateStateProvider.get(PRIVATE_STATE_KEY);
    if (!privateState?.secretKey) throw new Error('No secret key found — deploy or join first');

    const sk = privateState.secretKey;
    await submitCallTx<Contract>(this.providers as any, this.deployedContract as any, {
      circuitId: 'claimAuctioneer',
      witnesses: { auctioneer_secret: () => sk },
      args: [],
    });
    this.logger?.info('Claimed auctioneer role');
  }

  async commitBid(commitment: Uint8Array): Promise<void> {
    this.logger?.info('Committing sealed bid...');
    const privateState = await this.providers.privateStateProvider.get(PRIVATE_STATE_KEY);
    if (!privateState?.secretKey) throw new Error('No secret key found');

    const sk = privateState.secretKey;
    await submitCallTx<Contract>(this.providers as any, this.deployedContract as any, {
      circuitId: 'commitBid',
      witnesses: { bidder_secret: () => sk },
      args: [commitment],
    });
    this.logger?.info('Bid committed');
  }

  async prepareAndCommitBid(amount: bigint, liquidity: bigint): Promise<void> {
    this.logger?.info({ amount, liquidity }, 'Preparing and committing bid...');

    const nonce = await randomBytes(32);
    const existing = await this.providers.privateStateProvider.get(PRIVATE_STATE_KEY);
    const secretKey = existing?.secretKey ?? await randomBytes(32);

    const updated: BBoardPrivateState = { secretKey, bidAmount: amount, bidNonce: nonce, liquidity };
    await this.providers.privateStateProvider.set(PRIVATE_STATE_KEY, updated);

    const commitment = (pureCircuits as any).computeBidCommitment(amount, nonce);
    await this.commitBid(commitment);
  }

  async advanceToReveal(): Promise<void> {
    this.logger?.info('Advancing to reveal phase...');
    const privateState = await this.providers.privateStateProvider.get(PRIVATE_STATE_KEY);
    if (!privateState?.secretKey) throw new Error('No secret key found');

    const sk = privateState.secretKey;
    await submitCallTx<Contract>(this.providers as any, this.deployedContract as any, {
      circuitId: 'advanceToReveal',
      witnesses: { auctioneer_secret: () => sk },
      args: [],
    });
    this.logger?.info('Advanced to reveal phase');
  }

  async revealBid(): Promise<void> {
    this.logger?.info('Revealing bid...');
    const privateState = await this.providers.privateStateProvider.get(PRIVATE_STATE_KEY);
    if (!privateState?.secretKey || !privateState.bidAmount || !privateState.bidNonce) {
      throw new Error('No bid state found — commit a bid first');
    }

    const { bidAmount, bidNonce } = privateState;
    await submitCallTx<Contract>(this.providers as any, this.deployedContract as any, {
      circuitId: 'revealBid',
      witnesses: {
        bid_amount: () => bidAmount,
        bid_nonce: () => bidNonce,
      },
      args: [],
    });
    this.logger?.info('Bid revealed');
  }

  async resolveAuction(): Promise<void> {
    this.logger?.info('Resolving auction...');
    const privateState = await this.providers.privateStateProvider.get(PRIVATE_STATE_KEY);
    if (!privateState?.secretKey) throw new Error('No secret key found');

    const sk = privateState.secretKey;
    await submitCallTx<Contract>(this.providers as any, this.deployedContract as any, {
      circuitId: 'resolveAuction',
      witnesses: { auctioneer_secret: () => sk },
      args: [],
    });
    this.logger?.info('Auction resolved');
  }
}
