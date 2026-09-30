# SealedAuction

**Privacy-Preserving Sealed-Bid Auctions on the Midnight Network**

[![Midnight Network](https://img.shields.io/badge/Network-Midnight-blueviolet?style=for-the-badge)](https://midnight.network)
[![Language](https://img.shields.io/badge/Language-Compact-orange?style=for-the-badge)](https://midnight.network)
[![Tested With](https://img.shields.io/badge/Tested%20With-Vitest-yellow?style=for-the-badge)](https://vitest.dev)
[![State](https://img.shields.io/badge/Status-MVP-blue?style=for-the-badge)](#hackathon-progression-levels-1-4)
[![CI](https://github.com/shakshi-06/SealedAuction/actions/workflows/ci.yaml/badge.svg)](https://github.com/shakshi-06/SealedAuction/actions/workflows/ci.yaml)
[![Deploy on Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/new/clone?repository-url=https://github.com/shakshi-06/SealedAuction&root=bboard-ui)
[![GitHub](https://img.shields.io/badge/GitHub-shakshi--06-181717?style=for-the-badge&logo=github)](https://github.com/shakshi-06)
[![X (Twitter) Follow](https://img.shields.io/twitter/follow/ShakshiKotwala?style=for-the-badge)](https://x.com/ShakshiKotwala)
[![License](https://img.shields.io/badge/License-Apache--2.0-blue?style=for-the-badge)](LICENSE)

---

## Abstract

**SealedAuction**, presented as **SealedBid** in the application, is a decentralized application (dApp) built on the **Midnight Network** using the **Compact** smart contract language. It implements a sealed-bid auction workflow: participants commit cryptographic hashes of their bids, the auctioneer opens a reveal phase, and the contract verifies that revealed bids match their earlier commitments before tracking the highest bid.

The application combines a React interface, wallet-based transaction proving and signing, and a three-phase contract state machine. Bid amounts are concealed by commitments during the commit phase. During reveal, the current contract explicitly discloses the amount and updates a public highest-bid field; it does not promise permanent privacy for revealed bids.

---

## Table of Contents

1. [Official Submission Links](#official-submission-links)
2. [Architectural Overview](#architectural-overview)
3. [Zero-Knowledge Privacy Model](#zero-knowledge-privacy-model)
4. [Submission Updates](#submission-updates)
5. [Smart Contract Implementation](#smart-contract-implementation)
6. [Hackathon Progression (Levels 1-4)](#hackathon-progression-levels-1-4)
7. [Project Showcase & Verification Proofs](#project-showcase--verification-proofs)
8. [Local Development & Setup Guide](#local-development--setup-guide)
9. [Author & Acknowledgements](#author--acknowledgements)
10. [Contributing](#contributing)
11. [Code of Conduct](#code-of-conduct)
12. [License](#license)

---

## Official Submission Links

- **Live Application (Vercel):** [https://sealedbid-app.vercel.app/](https://sealedbid-app.vercel.app/)
- **Source Repository:** [shakshi-06/SealedAuction](https://github.com/shakshi-06/SealedAuction)
- **Deployed Contract (Midnight Preprod):** [`085ef817861a1e5dcd59c7a565c6beefce492b272b496be8e2326726933b3c82`](https://preprod.midnightexplorer.com/contracts/085ef817861a1e5dcd59c7a565c6beefce492b272b496be8e2326726933b3c82)
- **Demo Video Presentation:** [Watch the SealedBid demo](https://drive.google.com/file/d/10XZJ_X5aB1z7HW69VQeWEbsAKkB5_Cgm/view?usp=sharing)
- **Public Brand Presence (GitHub):** [@shakshi-06](https://github.com/shakshi-06)
- **Public Brand Presence (X Profile):** [@ShakshiKotwala](https://x.com/ShakshiKotwala)

---

## Architectural Overview

SealedAuction connects a modern web application with Midnight's privacy-oriented smart contract infrastructure.

- **Smart Contract Layer:** Written in Compact in [`contracts/auction.compact`](contracts/auction.compact). Compilation generates contract bindings, ZKIR/BZKIR artifacts, and prover/verifier keys in `contracts/managed/auction/`.
- **Frontend Application Layer:** Built with React 19, TypeScript, Vite 6, and Material UI. Includes a home page with recent auctions, an auction creation portal, an auction room dashboard, a privacy explainer, and a manual-verification interface.
- **Wallet Infrastructure:** Uses `@midnight-ntwrk/dapp-connector-api` for browser-wallet integration. The active session adapter obtains a proving provider from the wallet and delegates transaction balancing and submission to it. Actual proving locality depends on the wallet/provider configuration.
- **Application & State Layer:** `api/src/` and `contract/src/` provide contract integration and witness/state helpers. The frontend queries indexed contract state and stores recent auctions and some bid-related data in browser local storage.
- **Testing & CI/CD:** Vitest integration tests use the Docker-based Midnight node, indexer, and proof server. GitHub Actions compiles the contract, runs local tests, and builds the frontend. Vercel hosts the web application.

---

## Zero-Knowledge Privacy Model

The central privacy goal is to keep bids sealed while participants submit their offers, then verify their authenticity during reveal.

### The Traditional Vulnerability

Open-bid systems expose participants' offers while an auction is still accepting bids. This allows competitors to react to visible valuations and can enable strategic copying or front-running. A sealed commitment avoids publishing the plaintext amount during the commit phase.

### The SealedAuction ZK Solution

1. **Public State (Ledger Data):** The contract stores the auction phase, auctioneer key hash, bid commitments, revealed-commitment set, highest revealed bid, round counter, and nullifiers.
2. **Private Witness (User Data):** Auctioneer and bidder secrets, bid amount, and nonce enter the contract through witness functions. Commitments are computed from the nonce and amount using `persistentHash`.
3. **Proof Generation:** The client prepares a contract call and uses the configured proving provider. In the active frontend session, that provider is obtained through the connected wallet. A private witness is not automatically a guarantee that data never reaches a configured proving service.
4. **On-Chain Verification:** The commit circuit records a commitment and bidder nullifier. During reveal, the contract verifies commitment membership, rejects duplicate reveals, explicitly discloses the amount, and updates `highest_bid` if appropriate.

**Observer Matrix:**

| Information | Visibility |
| :--- | :--- |
| Auction phase, round, and auctioneer hash | Public ledger state |
| Commitments, revealed-commitment membership, and nullifiers | Public ledger state |
| Plaintext bid amount during commit | Not published as an amount by `commitBid`; represented by a hash commitment |
| Bid amount during reveal | Explicitly disclosed by `revealBid`; not guaranteed private |
| Highest revealed bid | Public ledger state |
| Auctioneer secret, bidder secret, and nonce | Private witness inputs; not explicitly disclosed by these circuits |

**Privacy boundaries:** Strong, unpredictable nonces are essential for hiding committed amounts. Browser local storage and exported bid receipts contain sensitive bid-related data and must be protected. The current contract does not implement escrow, payment settlement, or a winner-identity ledger field. Resolution closes the auction; it does not transfer funds automatically.

---

## Submission Updates

### Bug Fixes & Refactors

The application includes the following integration and interface improvements:

- **Wallet Session Adapter:** Centralizes wallet configuration, proving-provider access, transaction balancing, and submission in `bboard-ui/src/lib/midnight.ts`.
- **Contract Address Display:** Adds a reusable reveal/collapse address component in `bboard-ui/src/components/AddressHash.tsx`.
- **Shared Layout:** Separates the header, footer, and main layout into reusable components.
- **Auction State Refresh:** Provides indexed state loading and a manual sync action in the dashboard.
- **Transaction Feedback:** Displays in-progress, success, and error states for auction actions.
- **Responsive Presentation:** Uses responsive Material UI layouts with light and dark themes.

### Test Additions

The current integration suite is [`src/test/auction.test.ts`](src/test/auction.test.ts):

| Test | What it covers |
|------|----------------|
| `deploys the auction contract` | Deployment address, initial commit phase, round 1, and zero highest bid |
| `auctioneer claims their role successfully` | Auctioneer role claim and resulting application state |
| `bidder can commit a sealed bid and auctioneer can advance to reveal` | Bid commitment followed by transition into reveal |
| `rejects a second bid from the same bidder (nullifier)` | Rejection of a subsequent commit attempt; the test runs after phase advancement, so it does not isolate nullifier protection |

### New Features

- **Auction Room Dashboard** (`bboard-ui/src/pages/DashboardPage.tsx`)
  - Loads an auction by contract address and reads indexed state.
  - Supports commit/reveal actions and auctioneer phase controls.
  - Offers shareable room links and downloadable bid receipts.
- **Auction Creation Portal** (`bboard-ui/src/pages/AdminPage.tsx`)
  - Deploys an auction through the connected wallet.
  - Stores recent auction metadata locally and links to the room dashboard.
- **Recent Auctions & Address Reveal** (`bboard-ui/src/App.tsx`, `bboard-ui/src/components/AddressHash.tsx`)
  - Displays locally remembered auctions and expandable contract addresses.
- **Privacy & Verification Pages**
  - Explains the sealed-bid workflow on `/privacy`.
  - Provides a manual-verification UI on `/verify`.

---

## Smart Contract Implementation

The Compact contract ([`contracts/auction.compact`](contracts/auction.compact)) uses a three-phase state machine:

```text
COMMIT (0)  --->  REVEAL (1)  --->  RESOLVED (2)
```

### Circuit Definitions

| Circuit | Responsibility |
|---------|----------------|
| `claimAuctioneer()` | Checks the commit phase, proves knowledge of the auctioneer secret, and records a claim nullifier |
| `commitBid(commitment: Bytes<32>)` | Records a public commitment and bidder nullifier during commit |
| `advanceToReveal()` | Allows the auctioneer to open the reveal phase |
| `revealBid()` | Reads amount and nonce from witnesses, checks the commitment, prevents duplicate reveals, and updates the public highest bid |
| `resolveAuction()` | Allows the auctioneer to close the reveal phase and increment the round counter |

The pure helper circuits are `auctioneer_key`, `bidder_nullifier`, and `computeBidCommitment`. The following excerpts show the commitment format and reveal behavior; they are not a standalone contract:

```compact
export pure circuit computeBidCommitment(amount: Uint<64>, nonce: Bytes<32>): Bytes<32> {
    return persistentHash<Vector<2, Bytes<32>>>([nonce, amount as Bytes<32>]);
}

export circuit revealBid(): [] {
    assert(disclose(phase) == (1 as Uint<8>), "Not in reveal phase");

    const amount = bid_amount();
    const nonce = bid_nonce();
    const expected = computeBidCommitment(amount, nonce);
    assert(bid_commitments.member(disclose(expected)), "Bid commitment not found in ledger");
    assert(!revealed_bids.member(disclose(expected)), "Bid already revealed");

    revealed_bids.insert(disclose(expected));

    const disclosed_amount = disclose(amount);
    if (disclosed_amount > highest_bid) {
        highest_bid = disclosed_amount;
    }
}
```

---

## Hackathon Progression (Levels 1-4)

The following maps the repository's implementation to the Midnight builder journey.

### Level 1: Setup & First Contract
- **Objective:** Establish the Compact/Docker toolchain and implement the foundational sealed-bid contract.
- **Implementation:** Compact source, generated contract bindings, proving artifacts, and Docker services are present.
- **Documentation:** See [`PHASE_3_ARCHITECTURE.md`](PHASE_3_ARCHITECTURE.md) and [`MIDNIGHT_MASTER_GUIDE.md`](MIDNIGHT_MASTER_GUIDE.md) for additional architecture and toolchain context.

### Level 2: Frontend Integration
- **Objective:** Build the interface and connect a Midnight browser wallet.
- **Implementation:** React routes, wallet context, proving/submission adapters, auction creation, and auction-room actions are present.
- **Deployed Contract Address (Preprod):** [`085ef817861a1e5dcd59c7a565c6beefce492b272b496be8e2326726933b3c82`](https://preprod.midnightexplorer.com/contracts/085ef817861a1e5dcd59c7a565c6beefce492b272b496be8e2326726933b3c82)

### Level 3: Production-Grade dApp
- **Objective:** Add automated tests, CI, and a polished interface.
- **Implementation:** Vitest integration tests, contract/test and frontend-build CI jobs, shared layouts, responsive pages, and theme support are present.
- **Verification:** GitHub Actions runs provide the current CI status.

### Level 4: MVP Goes Live
- **Objective:** Publish the frontend, document the project, and prepare submission evidence.
- **Live Application:** [https://sealedbid-app.vercel.app/](https://sealedbid-app.vercel.app/)
- **Deployed Contract (Preprod):** [`085ef817861a1e5dcd59c7a565c6beefce492b272b496be8e2326726933b3c82`](https://preprod.midnightexplorer.com/contracts/085ef817861a1e5dcd59c7a565c6beefce492b272b496be8e2326726933b3c82)
- **Demo Video Presentation:** [Watch the SealedBid demo](https://drive.google.com/file/d/10XZJ_X5aB1z7HW69VQeWEbsAKkB5_Cgm/view?usp=sharing)
- **Public Brand Presence:** [@shakshi-06 on GitHub](https://github.com/shakshi-06)
- **X Profile:** [@ShakshiKotwala](https://x.com/ShakshiKotwala)

---

## Project Showcase & Verification Proofs

### CI/CD & Automated Verification Proofs

![CI/CD Pipeline Build & Test Passing Status](https://github.com/user-attachments/assets/8e80a542-1bee-45f7-8452-ad554110c250)

### User Interface Showcase

#### Full Application Dashboard & Hero Section
![SealedBid Application Dashboard Overview](https://github.com/user-attachments/assets/df725b99-4542-4c51-81e8-fb6f0b3a6bef)

#### Interactive Sealed Auction Room
![Sealed-Bid Auction Room Interface](https://github.com/user-attachments/assets/c0c16d13-f46e-4f9c-808e-a93f149334b5)

#### Interface Features Gallery

![SealedBid home page and recent auctions](https://github.com/user-attachments/assets/33171447-c5d9-4588-8011-42c922048985)

![Interactive contract address reveal](https://github.com/user-attachments/assets/29f9e88c-239b-4e5b-b678-5183b9d080ef)

![SealedBid auction room dashboard](https://github.com/user-attachments/assets/b0a282d7-a553-41d9-b26d-25f1238426b6)

![Create auction admin portal](https://github.com/user-attachments/assets/e7cf8483-6b0e-4e4c-a5d9-361d22b0ca99)

![SealedBid privacy model and architecture](https://github.com/user-attachments/assets/f08ffe4c-4a9e-474b-985f-0800fec279e3)

---

## Local Development & Setup Guide

For developers and reviewers wishing to compile the circuits and run the application locally, follow these steps.

### 1. System Requirements
- **OS:** Linux/macOS or Windows with WSL2 for the Linux-oriented toolchain.
- **Containerization:** Docker with Compose; enable WSL2 integration when using Docker Desktop on Windows.
- **Runtime:** Node.js 22 or higher and Yarn 1.22.22.
- **Compact Compiler:** Version 0.31.0, matching the CI setup; ensure `compact` is on your `PATH`.
- **Browser Wallet:** A compatible Midnight wallet, such as Lace / 1AM, configured for the intended network and funded with test tokens as required.

### 2. Dependency Initialization

```bash
git clone https://github.com/shakshi-06/SealedAuction.git
cd SealedAuction
yarn install --frozen-lockfile
```

The root and frontend have separate dependency installations and lockfiles.

### 3. Smart Contract Compilation

```bash
# If the compiler is installed in this location:
export PATH="$HOME/.local/bin:$PATH"
yarn compile

# Synchronize generated assets for the frontend (Linux/macOS/WSL):
yarn copy:managed:unix
```

For native Windows Command Prompt, use `yarn copy:managed:win` instead of the Unix copy command.

Compilation populates `contracts/managed/auction/`. The copy script updates frontend contract bindings and public proving assets. Re-run it after contract changes.

### 4. Running the Local Midnight Network and Test Suite

```bash
yarn env:up

# Wait for local test-wallet DUST, as the CI workflow does:
npx vite-node scripts/wait-for-dust.ts

yarn test:local
```

The local services expose the node on port `9944`, indexer on `8088`, and proof server on `6300`. Test configuration is in `src/config.ts`.

For optional Preprod integration tests, securely set `MIDNIGHT_PREPROD_MNEMONIC` in your shell and provide a running proof server using `MIDNIGHT_PROOF_SERVER` if it is not available at `http://127.0.0.1:6300`, then run:

```bash
yarn test:preprod
```

Use a dedicated test wallet. Never commit mnemonics or place secrets in `VITE_*` variables, which are exposed to browser clients. The test runner reads shell environment variables; an example environment file is not automatically loaded by these scripts.

When finished, stop local Docker services:

```bash
yarn env:down
```

### 5. Running the Frontend Application

```bash
cd bboard-ui
yarn install --frozen-lockfile
yarn dev
```

Open [http://localhost:5173](http://localhost:5173). The frontend's default `dev` and `build` scripts use Preprod mode. Its `.env.preprod` defines `VITE_NETWORK_ID=preprod` and logging configuration; the active wallet session also obtains network and service configuration directly from the wallet. Configure the wallet for the intended network before interacting.

To check types, build, and preview the frontend:

```bash
yarn typecheck
yarn build
yarn preview
```

The frontend lives in `bboard-ui/` and its production output is `bboard-ui/dist/`. Vercel configuration is available in the repository and frontend directories.

---

## Author & Acknowledgements

**SealedAuction / SealedBid** is developed by **Shakshi Kotwala**.

- **GitHub:** [@shakshi-06](https://github.com/shakshi-06)
- **X (Twitter):** [@ShakshiKotwala](https://x.com/ShakshiKotwala)
- **Reporting Email:** [shakshikotwala20100309@gmail.com](mailto:shakshikotwala20100309@gmail.com)
- **Project Repository:** [SealedAuction](https://github.com/shakshi-06/SealedAuction)
- **Live Application:** [sealedbid-app.vercel.app](https://sealedbid-app.vercel.app/)

Thanks to the Midnight ecosystem for the Compact language, SDKs, wallet tooling, and developer resources, and to the open-source projects powering the frontend and testing infrastructure.

*Built with privacy and verifiable sealed bidding in mind on the Midnight Network.*

---

## Contributing

Contributions are welcome! Read [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, issue reporting, pull request guidelines, testing expectations, and licensing requirements.

---

## Code of Conduct

We are committed to a welcoming, inclusive, and harassment-free community. Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md) when participating in the project.

---

## License

Distributed under the **Apache License, Version 2.0** (`Apache-2.0`). See [LICENSE](LICENSE) for the complete terms.
