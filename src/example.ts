/**
 * Example usage of WalletManager and PortfolioTracker.
 *
 * Run with:
 *   npx ts-node src/example.ts
 */
import WalletManager from './services/walletManager';
import PortfolioTracker from './services/portfolioTracker';
import Logger from './utils/logger';

function main() {
    // ── Wallet Management ────────────────────────────────────────────────────

    const manager = new WalletManager();

    // Create wallets on different chains
    const ethWallet = manager.createWallet('ethereum');
    Logger.log(`Ethereum wallet created: ${ethWallet.address}`);

    const polygonWallet = manager.createWallet('polygon');
    Logger.log(`Polygon wallet created: ${polygonWallet.address}`);

    // Import an existing wallet using a private key
    const knownPrivateKey =
        '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
    const importedWallet = manager.importWallet('sepolia', knownPrivateKey);
    Logger.log(`Sepolia wallet imported: ${importedWallet.address}`);

    // Export and re-import a wallet with encryption
    const exported = manager.exportWallet('ethereum', 'my-strong-password');
    Logger.log(`Ethereum wallet exported (encrypted private key stored).`);

    const reimported = manager.importEncryptedWallet(
        'bsc',
        exported.encryptedPrivateKey,
        'my-strong-password'
    );
    Logger.log(`BSC wallet imported from encrypted key: ${reimported.address}`);

    // ── Portfolio Tracking ───────────────────────────────────────────────────

    const tracker = new PortfolioTracker();
    tracker.addAsset('ethereum', 'ETH', 1.5);
    tracker.addAsset('ethereum', 'USDC', 500);
    tracker.addAsset('polygon', 'MATIC', 200);

    const summary = tracker.getPortfolioSummary();
    Logger.log('Portfolio summary: ' + JSON.stringify(summary, null, 2));

    // ── Balance Fetching (requires live RPC) ─────────────────────────────────
    //
    // Uncomment the block below once a valid RPC endpoint is configured in .env
    //
    // try {
    //     const balance = await manager.getBalance('ethereum');
    //     Logger.log(`Ethereum balance: ${balance} ETH`);
    // } catch (err) {
    //     Logger.error(`Failed to fetch balance: ${(err as Error).message}`);
    // }
}

try {
    main();
} catch (err) {
    Logger.error((err as Error).message);
    Deno.exit(1);
}
