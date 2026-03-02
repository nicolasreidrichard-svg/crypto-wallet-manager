# Crypto Wallet Manager

## Overview
Crypto Wallet Manager is a comprehensive tool designed for managing crypto wallets securely and efficiently.

## Features
- **Multi-cryptocurrency support**: Manage various types of cryptocurrencies with ease.
- **Secure Transactions**: Utilizes advanced encryption protocols to ensure transaction security.
- **User-friendly Interface**: Intuitive design for easy navigation and management.
- **Real-time Tracking**: Monitor wallet balances and transaction histories in real-time.

## Architecture
The project is built using a microservices architecture, consisting of the following components:
- **Frontend**: A responsive web application built with React.js.
- **Backend**: Node.js server handling API requests and managing wallet operations.
- **Database**: MongoDB for storing user data and wallet information.

## Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/nicolasreidrichard-svg/crypto-wallet-manager.git
cd crypto-wallet-manager
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables

Copy the example file and fill in your own values:

```bash
cp .env.example .env
```

Then open `.env` in any text editor and replace the placeholder values.

#### How to get an Etherscan API key (free)

1. Go to <https://etherscan.io> and click **Sign In → Register** (top-right).
2. After confirming your email, click your username → **My Profile → API Keys**.
3. Click **+ Add** → give it a name (e.g. `crypto-wallet-manager`) → **Create New API Key**.
4. Copy the key and paste it as the value for `ETHERSCAN_API_KEY` in your `.env` file.

The free plan allows **5 calls per second** and **100,000 calls per day**, which is more than enough for personal use.

#### How to get a Solscan API key (free)

1. Go to <https://pro-api.solscan.io> and create a free account.
2. After logging in, open the **Dashboard** and look for the **API** or **API Keys** section.
3. Generate a new token, then copy it and paste it as the value for `SOLSCAN_API_KEY` in your `.env` file.

> **Tip:** The public Solscan endpoint works without any key for basic requests. You only need a key when you hit rate-limit errors or need Pro-tier data.

### 4. Start the application
```bash
npm start
```

---

## Keeping context across sessions (important)

Every AI assistant session — on any platform — starts with zero memory of previous work.
The fix is [`SESSION_CONTEXT.md`](./SESSION_CONTEXT.md), a file in this repository that
acts as a persistent memory card.

**How to use it:**

1. At the start of any new session, paste this into the chat:
   > *"Please read SESSION_CONTEXT.md in my repo before we start:
   > https://github.com/nicolasreidrichard-svg/crypto-wallet-manager"*

2. The assistant will read it and immediately know the project, what was last done,
   what's next, and how you prefer to work — no re-explaining needed.

3. At the end of each session, update the **Current Status** section of `SESSION_CONTEXT.md`
   (what got done, what's next), then commit and push it.

See [`SESSION_CONTEXT.md`](./SESSION_CONTEXT.md) for full details, including the
working-preferences that apply to all sessions.

### Why sessions disconnect

Long sessions (7+ hours) hit a hard **context-window limit**: the model can only hold a
certain number of words in memory at once. When the ceiling is reached, the session ends —
this is a platform constraint, not anything you did wrong. The `SESSION_CONTEXT.md` workflow
above means a disconnection costs you nothing — the next session picks up in seconds.

---

## Usage Examples
- **Creating a new wallet:**
  - Send a POST request to `/api/wallets` with the necessary data.
- **Viewing wallet details:**
  - Send a GET request to `/api/wallets/:id`.

## API Reference
- **POST /api/wallets**: Create a new wallet.
- **GET /api/wallets/:id**: Retrieve wallet details.
- **POST /api/wallets/:id/transactions**: Add a transaction to a wallet.

## Database Schema
- **User**: Represents users with fields for username, password, and email.
- **Wallet**: Stores wallet information, including wallet ID, user ID, and cryptocurrency type.
- **Transaction**: Records transaction history with fields for wallet ID, amount, and timestamp.

## Security Considerations
- Always use HTTPS to encrypt data in transit.
- Utilize environment variables to manage sensitive information such as API keys and database credentials.
- Regularly update dependencies to avoid vulnerabilities.
- **Never share private keys or seed phrases** — these give full control of your funds. Etherscan/Solscan API keys are safe to share for debugging, but keep them out of public Git commits (the `.env` file is in `.gitignore`).

## Conclusion
Crypto Wallet Manager provides complete tools for managing cryptocurrencies, ensuring security and ease of use in all transactions. For more details or contributions, please refer to the official documentation at [repository link].