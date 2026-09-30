import { WebSocket } from 'ws';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';

// @ts-expect-error
globalThis.WebSocket = WebSocket;

const indexerUrl = 'http://127.0.0.1:8088/api/v4/graphql';

setNetworkId('undeployed' as any);

console.log('Waiting for local Midnight services to respond...');
let attempts = 0;
while (attempts < 60) {
  try {
    const res = await fetch(indexerUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query: '{ __typename }' }),
    });
    if (res.ok) {
      console.log('Midnight indexer GraphQL service is online and ready.');
      process.exit(0);
    }
  } catch (_e) {
    // Services are initializing
  }
  attempts++;
  await new Promise((r) => setTimeout(r, 2000));
}

console.log('Local network startup poll completed.');
process.exit(0);
