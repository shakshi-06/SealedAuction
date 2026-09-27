# Sealed-Bid Auction on Midnight Network

[![CI](https://github.com/YOUR_USERNAME/auction-cli-scaffold/actions/workflows/ci.yaml/badge.svg)](https://github.com/YOUR_USERNAME/auction-cli-scaffold/actions/workflows/ci.yaml)

> Prove your bid is the highest — without revealing the amount until the reveal phase.

## Live Demo
- App: https://myproject.vercel.app  (Deploy to Vercel)
- Contract (Preprod): `YOUR_64_CHAR_HEX_ADDRESS_HERE`
- Explorer: https://preprod.midnightexplorer.com/contracts/YOUR_ADDRESS
- Twitter/X: https://twitter.com/YourHandle
- Demo Video: https://youtube.com/watch?v=...

## Privacy Model

When a bidder calls `commitBid`, only a **commitment hash** `H(amount, nonce)` is stored on-chain. The actual bid amount stays in the bidder's browser, never disclosed.

When the auctioneer opens the reveal phase, each bidder calls `revealBid`. A ZK proof verifies that `H(amount, nonce) == stored_commitment` before updating the highest bid — proving authenticity without intermediate disclosure.

An observer CAN see:
- That a bid commitment was submitted
- Whether the reveal phase is open
- The final highest bid (after resolution)
- Which contract address to join
- The total number of bids submitted

An observer CANNOT see:
- Any bidder's actual bid amount before resolution
- The nonce used in the commitment
- The auctioneer's identity (no `msg.sender` in Midnight!)
- Who submitted a bid (nullifier pattern prevents double-bidding anonymously)

## How It Works

```
COMMIT PHASE
  Auctioneer deploys contract → Bidders submit H(amount, nonce) → Auctioneer opens reveal

REVEAL PHASE
  Each bidder proves: H(amount, nonce) == commitment
  Highest bid updated if ZK proof passes

RESOLVED
  Auctioneer closes the auction → winner is on-chain
```

---

## Setup
Prerequisites: Node.js >= 22.0.0, Yarn 1.22.22, Docker Desktop, Compact Compiler 0.31.0, 1AM wallet

Install:
  yarn install && yarn compile

Local dev:
  yarn env:up
  cd bboard-ui && yarn dev

Deploy to Preprod:
  1. Connect 1AM wallet on Preprod
  2. Open app at http://localhost:5173
  3. Click "Deploy new auction" (Admin page deployment)
  4. Copy the contract address that appears on the card

Deploy to Vercel:
  - Root Directory: bboard-ui
  - Build Command: yarn build
  - Output Directory: dist
  - Install Command: yarn install

## Running Tests

```bash
# Local Docker network
yarn test:local

# Preprod network (requires MIDNIGHT_PREPROD_MNEMONIC in .env.preprod)
yarn test:preprod
```

**Tests cover:**
1. Deploys the auction contract
2. Auctioneer claims their role (ZK proof of auctioneer key)
3. Bidder commits a sealed bid, auctioneer advances to reveal phase
4. Nullifier prevents double-bidding from the same bidder

---

## Project Structure

```
auction-cli-scaffold/
├── contracts/
│   └── auction.compact          ← Sealed-bid auction Compact contract
├── contract/src/
│   └── index.ts                 ← Phase enum + managed re-exports
├── api/src/
│   └── index.ts                 ← BBoardAPI class (all circuit calls)
├── bboard-ui/                   ← React + Vite frontend
│   ├── src/
│   │   ├── components/          ← AuctionCard, AuctionSeal, BidDialog, Layout
│   │   ├── contexts/            ← BrowserDeployedBoardManager, DeployedBoardProvider
│   │   └── config/theme.ts      ← Black/white/red design system
│   └── public/managed/          ← ZK proving keys (copy from contracts/managed/)
├── src/
│   ├── config.ts                ← Network configs (local/preprod/preview)
│   ├── providers.ts             ← Provider builder for tests
│   └── test/auction.test.ts     ← 4-test Vitest suite
├── scripts/
│   └── wait-for-dust.ts         ← Wait for local wallet DUST before tests
├── compose.yml                  ← Docker local network (proof-server, indexer, node)
└── .github/workflows/ci.yaml   ← CI pipeline
```

---

## Contract Circuits

| Circuit | Privacy | Description |
|---|---|---|
| `claimAuctioneer` | ZK-proves secret key matches on-chain hash | Sets the caller as auctioneer without revealing key |
| `commitBid` | Only commitment hash goes on-chain | Bid amount stays private until reveal |
| `advanceToReveal` | Auctioneer-only | Opens the reveal phase |
| `revealBid` | ZK-proves commitment matches bid | Highest bid updated if proof passes |
| `resolveAuction` | Auctioneer-only | Finalizes and closes the auction |

---

## Author

Built for the **Midnight Journey to Mastery** hackathon challenge.

- Midnight Network: [midnight.network](https://midnight.network)
- Explorer (Preprod): [preprod.midnightexplorer.com](https://preprod.midnightexplorer.com)

## License

MIT
