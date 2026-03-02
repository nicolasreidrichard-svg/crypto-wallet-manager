# Session Context — Crypto Wallet Manager

> **Purpose of this file:** Every AI session starts with zero memory of previous work.
> This file is the fix. At the start of any new session — on any platform, with any assistant —
> paste this one sentence into the chat:
>
> *"Please read SESSION_CONTEXT.md in my repo before we start:
> https://github.com/nicolasreidrichard-svg/crypto-wallet-manager"*
>
> The assistant will read this file and immediately know everything it needs.
> **Update the "Current Status" section before ending each session.**

---

## Project Overview

**What this is:** A Node.js / TypeScript crypto wallet manager that tracks Ethereum and Solana
wallets, queries balances and transaction history via Etherscan and Solscan, and monitors
a portfolio of crypto assets in real time.

**Repository:** https://github.com/nicolasreidrichard-svg/crypto-wallet-manager

**Primary owner:** Nic (nicolasreidrichard-svg)

**Tech stack:**
- TypeScript / Node.js backend
- ethers.js for Ethereum interaction
- Etherscan API for ETH transaction history (free tier)
- Solscan API for Solana transaction history (free tier)
- SQLite database (via `src/db/database.ts`)

---

## What Has Been Completed

- [x] Project scaffold — `src/index.ts`, `src/services/walletManager.ts`,
  `src/services/portfolioTracker.ts`, `src/db/database.ts`, `src/utils/logger.ts`
- [x] `walletManager.ts` updated to read `ETHERSCAN_API_KEY` from environment and use
  `EtherscanProvider` automatically when the key is present (with a network allowlist
  so non-Ethereum chains fall back to the default provider)
- [x] `.env.example` updated with `ETHERSCAN_API_KEY` and `SOLSCAN_API_KEY` entries,
  each with a comment explaining where to get the key
- [x] `README.md` expanded with step-by-step guides for obtaining each API key and
  a section explaining why sessions disconnect and how to work around it

---

## Current Status

<!-- ✏️  UPDATE THIS SECTION AT THE END OF EVERY SESSION -->

**Last updated:** 2026-03-02

**Last completed task:**
Added Etherscan and Solscan API key support to the codebase and `.env.example`.
Added session-disconnect explanation and self-help steps to README.
Created this SESSION_CONTEXT file.

**In progress / partially done:**
- Nothing currently in progress.

**Known blockers / open errors:**
- None currently known.

**Next task (start here next session):**
Wire up the Solscan API in a new `src/services/solanaService.ts` file, similar to how
`walletManager.ts` uses EtherscanProvider. It should fetch SOL balance and recent
transactions for a given Solana wallet address using `SOLSCAN_API_KEY` from the
environment.

---

## How to Update This File

At the **end of every session**, before closing the chat:

1. Open `SESSION_CONTEXT.md` in your editor (or ask the assistant to update it).
2. Replace the three fields under **Current Status**:
   - **Last completed task** — one sentence on what got done
   - **In progress / partially done** — anything half-finished
   - **Next task** — the very first thing to do next session
3. Run:
   ```bash
   git add SESSION_CONTEXT.md
   git commit -m "chore: update session context"
   git push
   ```
4. Done. The next session — on any platform — can pick up exactly here.

---

## Working Preferences

The following preferences apply to **all sessions** on this project.
Any assistant reading this file should follow them without needing to be reminded.

- **Pace:** Work step-by-step. Confirm each step completes before moving to the next.
  Do not rush through multiple changes at once.
- **Explanations:** Plain language please — avoid heavy jargon. When a technical term
  is necessary, give a one-line plain-English explanation alongside it.
- **Tone:** Patient and encouraging. No impatience, no criticism if something needs
  repeating or re-explaining.
- **Confirmation before action:** For any change that touches `.env`, wallet addresses,
  or API keys, ask for confirmation before proceeding.
- **Session length:** Keep individual sessions short and focused — one task at a time.
  This avoids the context-window cutoff that ended the 7-hour session.

---

## File & Folder Map (quick reference)

```
crypto-wallet-manager/
├── .env.example              ← copy to .env and fill in your keys
├── SESSION_CONTEXT.md        ← THIS FILE — update before ending each session
├── README.md                 ← setup guide, API key instructions, session tips
├── architecture-overview.md  ← Mermaid diagram of the system
└── src/
    ├── index.ts                      ← app entry point
    ├── db/database.ts                ← SQLite database wrapper
    ├── services/
    │   ├── walletManager.ts          ← Ethereum wallet + EtherscanProvider
    │   └── portfolioTracker.ts       ← multi-chain asset tracker
    └── utils/logger.ts               ← simple timestamped logger
```

---

## Keys & Credentials Status

> **Important:** Never paste actual key values into this file. Use the table below only
> to track whether each key has been obtained and added to your local `.env`.

| Key | Purpose | Obtained? | Added to .env? |
|-----|---------|-----------|----------------|
| `ETHERSCAN_API_KEY` | ETH balance + tx history | — | — |
| `SOLSCAN_API_KEY` | Solana tx history | — | — |
| `INFURA_API_KEY` | Ethereum RPC endpoint | — | — |
| `GITHUB_TOKEN` | Access private repos (optional) | — | — |

Mark each cell with ✅ once complete. This table carries across sessions so you always
know exactly which keys are still missing.
