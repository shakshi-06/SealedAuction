import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { WebSocket } from 'ws';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import type { EnvironmentConfiguration } from '@midnight-ntwrk/testkit-js';
import { waitForFunds, FluentWalletBuilder } from '@midnight-ntwrk/testkit-js';
import pino from 'pino';
import crypto from 'crypto';
import { getConfig } from '../config.js';
import { buildProviders } from '../providers.js';
import { BBoardAPI, pureCircuits as auctionPureCircuits } from '../../api/src/index.js';
import { Phase } from '../../contract/src/index.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { firstValueFrom, filter } from 'rxjs';

// @ts-expect-error
globalThis.WebSocket = WebSocket;

const ALICE_SEED = '0000000000000000000000000000000000000000000000000000000000000001';
const BOB_SEED   = '0000000000000000000000000000000000000000000000000000000000000002';
const logger = pino({ level: 'info', transport: { target: 'pino-pretty' } });
const network = process.env['MIDNIGHT_NETWORK'] ?? 'local';

const currentDir = path.resolve(fileURLToPath(import.meta.url), '..', '..', '..');
const zkConfigPath = path.resolve(currentDir, 'contracts', 'managed', 'auction');

function resolveSecret(seed: string) {
  if (network === 'local') return { kind: 'seed' as const, value: seed };
  const upper = network.toUpperCase();
  const mnemonic = process.env[`MIDNIGHT_${upper}_MNEMONIC`]?.trim().replace(/\s+/g, ' ');
  if (mnemonic) return { kind: 'mnemonic' as const, value: mnemonic };
  throw new Error(`Set MIDNIGHT_${upper}_MNEMONIC`);
}

async function waitForPhase(api: BBoardAPI, targetPhase: Phase, timeoutMs = 30000): Promise<void> {
  await firstValueFrom(
    api.state$.pipe(filter((s) => s.phase === targetPhase)),
  );
}

describe(`Auction Contract (${network})`, () => {
  let aliceWallet: any;
  let bobWallet: any;
  let auctioneerAPI: BBoardAPI;
  let bidderAPI: BBoardAPI;

  const config = getConfig();
  const aliceSecret = resolveSecret(ALICE_SEED);
  const bobSecret = resolveSecret(BOB_SEED);
  const isRemote = config.faucet !== '';

  const envConfig: EnvironmentConfiguration = {
    walletNetworkId: config.networkId as any,
    networkId: config.networkId as any,
    indexer: config.indexer,
    indexerWS: config.indexerWS,
    node: config.node,
    nodeWS: config.nodeWS,
    faucet: config.faucet,
    proofServer: config.proofServer,
  };

  beforeAll(async () => {
    setNetworkId(config.networkId as any);

    aliceWallet = aliceSecret.kind === 'seed'
      ? await FluentWalletBuilder.forEnvironment(envConfig).withSeed(aliceSecret.value).build()
      : await FluentWalletBuilder.forEnvironment(envConfig).withMnemonic(aliceSecret.value).build();

    bobWallet = bobSecret.kind === 'seed'
      ? await FluentWalletBuilder.forEnvironment(envConfig).withSeed(bobSecret.value).build()
      : await FluentWalletBuilder.forEnvironment(envConfig).withMnemonic(bobSecret.value).build();

    if (isRemote) {
      const aliceBalance = await waitForFunds(aliceWallet, envConfig, true, aliceWallet.unshieldedKeystore);
      logger.info(`Alice balance: ${aliceBalance}`);
    }
  });

  afterAll(async () => {
    if (aliceWallet) await aliceWallet.stop?.();
    if (bobWallet) await bobWallet.stop?.();
  });

  // ─── Test 1: Deploy the contract ──────────────────────────────────────────

  it('deploys the auction contract', async () => {
    const aliceProviders = buildProviders(aliceWallet, zkConfigPath, config);
    auctioneerAPI = await BBoardAPI.deploy(aliceProviders, logger);

    expect(auctioneerAPI.deployedContractAddress).toBeDefined();
    expect(auctioneerAPI.deployedContractAddress.length).toBe(64);

    // Wait for state to be indexed
    const state = await firstValueFrom(
      auctioneerAPI.state$.pipe(filter((s) => s.round > 0n)),
    );
    expect(state.phase).toBe(Phase.COMMIT);
    expect(state.round).toBe(1n);
    expect(state.highestBid).toBe(0n);
    logger.info(`Deployed at: ${auctioneerAPI.deployedContractAddress}`);
  });

  // ─── Test 2: Auctioneer claims their role ─────────────────────────────────

  it('auctioneer claims their role successfully', async () => {
    await auctioneerAPI.claimAuctioneer();

    const state = await firstValueFrom(
      auctioneerAPI.state$.pipe(filter((s) => s.isAuctioneer)),
    );
    expect(state.isAuctioneer).toBe(true);
    expect(state.phase).toBe(Phase.COMMIT);
  });

  // ─── Test 3: Bidder commits a sealed bid ─────────────────────────────────

  it('bidder can commit a sealed bid and auctioneer can advance to reveal', async () => {
    const bobProviders = buildProviders(bobWallet, zkConfigPath, config);
    bidderAPI = await BBoardAPI.join(bobProviders, auctioneerAPI.deployedContractAddress, logger);

    // Bob commits a bid of 500 tokens
    await bidderAPI.prepareAndCommitBid(500n, 600n);

    // Auctioneer opens the reveal phase
    await auctioneerAPI.advanceToReveal();

    const state = await firstValueFrom(
      auctioneerAPI.state$.pipe(filter((s) => s.phase === Phase.REVEAL)),
    );
    expect(state.phase).toBe(Phase.REVEAL);
  });

  // ─── Test 4: Reject double bid (nullifier protection) ────────────────────

  it('rejects a second bid from the same bidder (nullifier)', async () => {
    // Bob already committed a bid — a second one should fail
    await expect(
      bidderAPI.prepareAndCommitBid(999n, 1000n),
    ).rejects.toThrow();
  });
});
