import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import type { NetworkConfig } from './config.js';
import type { BBoardProviders } from '../api/src/index.js';

export function buildProviders(wallet: any, zkConfigPath: string, config: NetworkConfig): BBoardProviders {
  return {
    privateStateProvider: levelPrivateStateProvider({
      db: 'midnight-auction-level-db',
      privateStoragePasswordProvider: async () => 'secret-password-16chars-minimum',
    }),
    publicDataProvider: indexerPublicDataProvider(config.indexer, config.indexerWS),
    zkConfigProvider: new NodeZkConfigProvider(zkConfigPath),
    proofProvider: httpClientProofProvider(config.proofServer),
    walletProvider: wallet.wallet.walletProvider,
    midnightProvider: wallet.wallet.midnightProvider,
  };
}
