# Contributing

We welcome your contributions to SealedAuction! By contributing, you'll play a vital role in building privacy-preserving sealed-bid auctions on the Midnight Network.

## Contributor License Agreement

Contributions intentionally submitted for inclusion in SealedAuction are provided under the project's [Apache License, Version 2.0](LICENSE), unless explicitly stated otherwise, as described in Section 5 of that license. This repository does not currently configure a separate Contributor License Agreement or CLA Assistant signing workflow. If a separate agreement becomes necessary, the maintainer will document the process before requiring it.

## Getting Started

* **Review Existing Contributions and Issues:** Before submitting, check whether a similar issue or feature request already exists in our [issue tracker](https://github.com/shakshi-06/SealedAuction/issues).
* **Understand the Project:** Familiarize yourself with the auction state machine, public ledger fields, private witnesses, and frontend wallet integration. Start with the [README](README.md), [`contracts/auction.compact`](contracts/auction.compact), and [`PHASE_3_ARCHITECTURE.md`](PHASE_3_ARCHITECTURE.md). Consult the source where older architecture notes differ.
* **Set up Your Development Environment:** Follow the [local development guide](README.md#local-development--setup-guide). You will need Node.js 22+, Yarn 1.22.22, Compact 0.31.0, and Docker for integration tests. See the [Midnight developer documentation](https://docs.midnight.network/) for platform details.
* **Read the Code of Conduct:** All participants must follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## Submitting Issues

Submit an issue through the [issue tracker](https://github.com/shakshi-06/SealedAuction/issues/new). The maintainer or a community member will address it if it is relevant. Ensure the title clearly summarizes the request and provides enough context. No custom issue templates are currently configured.

**Issue Types:**

* **Bug Report:** Provide reproduction steps, expected and actual behavior, relevant screenshots or sanitized logs, your runtime/browser version, and the network used. Never include wallet mnemonics, secret keys, bid nonces, or private bid receipts.
* **Documentation Improvement:** Describe the requested improvement or missing documentation and what should be included.
* **Feature Request:** Describe the feature, its benefits, and the expected outcome so that maintainers can evaluate the proposal and alternatives.
* **Enhancement:** Describe the existing behavior, the proposed improvement, and any privacy, compatibility, or performance implications.

## Code Contribution Process

* **Pull Requests:** Submit code contributions through pull requests.
* **Fork the Repository:** Create your own fork of [SealedAuction](https://github.com/shakshi-06/SealedAuction).
* **Create a Branch:** Make changes in a separate branch, prefixed with a short name moniker (e.g. `jill-auction-tests`).
* **Follow Coding Standards:** Match the existing TypeScript, React, and Compact conventions in the files you change. Keep private witness data separate from public ledger data and document any new disclosure.
* **Write Tests:** Include unit or integration tests appropriate to the change. Contract tests live in `src/test/auction.test.ts`.
* **Compile and Verify:** Run the relevant checks below. If your environment prevents a check from running, say so in the pull request rather than claiming it passed.
* **Commit Messages:** Write clear and concise commit messages.
* **Submit Pull Request:** Target the `main` branch of the upstream repository. Explain the change, link related issues, list checks performed, and include screenshots for UI changes where useful.
* **Please do not `--force` pushes** — doing so means reviewers may need to re-review all commits rather than only those since the last review.
* **Code Review:** All pull requests undergo maintainer review. Be prepared to address feedback.

From the repository root:

```bash
yarn install --frozen-lockfile
yarn compile
yarn copy:managed:unix  # Native Windows Command Prompt: yarn copy:managed:win
yarn env:up
npx vite-node scripts/wait-for-dust.ts
yarn test:local
```

Stop the local services when finished, including after a failed test run:

```bash
yarn env:down
```

For frontend changes:

```bash
cd bboard-ui
yarn install --frozen-lockfile
yarn typecheck
yarn build
```

Do not hand-edit generated contract bindings or proving artifacts. Regenerate them from the Compact source and follow the repository's existing generated-file conventions.

## Requirements for Acceptable Contributions:

* **Coding Standards:** Follow the surrounding code style and maintain clear boundaries between contract, API, and UI responsibilities.
* **Testing:** New functionality should include corresponding tests. Changes to bid handling should consider phase restrictions, commitment matching, duplicate submissions, reveal behavior, and authorization.
* **Documentation:** Include relevant documentation updates. Do not describe revealed amounts as permanently private: the current contract explicitly discloses them.
* **Privacy:** Do not commit mnemonics, secret keys, environment secrets, or real bid data. Do not put secrets in client-exposed `VITE_*` variables.
* **License:** All contributions must be compatible with the project's Apache-2.0 license. Preserve existing third-party copyright and license notices. Where appropriate, new project-owned files should carry this header, with the actual copyright year and owner:

```ts
// This file is part of SealedAuction.
// Copyright (C) [year] [copyright owner]
// SPDX-License-Identifier: Apache-2.0
// Licensed under the Apache License, Version 2.0 (the "License");
// You may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
```

For files owned by the project author, use **Shakshi Kotwala** as the copyright owner. Do not replace another contributor's ownership notice. Where a header is not possible, include a copy of Apache 2.0 or the repository's top-level `LICENSE` file in the same directory when distributing those files separately.

## Support and Communication:

For SealedAuction questions, use the [issue tracker](https://github.com/shakshi-06/SealedAuction/issues) or the relevant pull request. The project maintainer is **Shakshi Kotwala**, [@shakshi-06](https://github.com/shakshi-06). Follow project updates on [X (@ShakshiKotwala)](https://x.com/ShakshiKotwala).

For confidential Code of Conduct reports, email [shakshikotwala20100309@gmail.com](mailto:shakshikotwala20100309@gmail.com) and follow the [Code of Conduct](CODE_OF_CONDUCT.md#enforcement). Do not publish sensitive reports in the issue tracker.

For general Midnight platform questions, consult the [developer documentation](https://docs.midnight.network/) or the wider Midnight community on [Discord](https://discord.com/invite/midnightnetwork), [Telegram](https://t.me/Midnight_Network_Official), and [X](https://x.com/MidnightNtwrk). These are platform community channels, not SealedAuction's private reporting contacts.

We appreciate your contributions!
