import { ethers } from 'ethers';

class WalletManager {
    private wallets: Record<string, ethers.Wallet>;
    private etherscanApiKey: string | undefined;

    constructor(etherscanApiKey?: string) {
        this.wallets = {};
        // Use the supplied key, or fall back to the environment variable.
        this.etherscanApiKey = etherscanApiKey ?? process.env.ETHERSCAN_API_KEY;
    }

    createWallet(chain: string) {
        const wallet = ethers.Wallet.createRandom();
        this.wallets[chain] = wallet;
        return wallet;
    }

    importWallet(chain: string, privateKey: string) {
        const wallet = new ethers.Wallet(privateKey);
        this.wallets[chain] = wallet;
        return wallet;
    }

    async getBalance(chain: string) {
        if (!this.wallets[chain]) throw new Error('Wallet not found for chain: ' + chain);
        // EtherscanProvider only supports Ethereum networks (mainnet / testnets).
        // For other chains (e.g. polygon, solana) fall back to the default provider.
        const etherscanNetworks = new Set(['homestead', 'mainnet', 'goerli', 'sepolia', 'ropsten', 'rinkeby', 'kovan']);
        const useEtherscan = this.etherscanApiKey && etherscanNetworks.has(chain.toLowerCase());
        const provider = useEtherscan
            ? new ethers.providers.EtherscanProvider(chain, this.etherscanApiKey)
            : ethers.getDefaultProvider(chain);
        const balance = await provider.getBalance(this.wallets[chain].address);
        return ethers.utils.formatEther(balance);
    }
}

export default WalletManager;