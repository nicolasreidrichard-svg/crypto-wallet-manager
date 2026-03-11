import { ethers } from 'ethers';
import { encrypt, decrypt } from '../utils/encryption';
import { validatePrivateKey, validateAddress, validateChain, validateAmount } from '../utils/validation';
import { WalletNotFoundError, InvalidPrivateKeyError } from '../errors/WalletError';
import Logger from '../utils/logger';

interface TransactionRequest {
    to: string;
    amount: string;
}

interface ExportedWallet {
    address: string;
    encryptedPrivateKey: string;
}

const RPC_URLS: Record<string, string> = {
    ethereum: process.env.ETH_RPC_URL || 'https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID',
    polygon: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com/',
    bsc: process.env.BSC_RPC_URL || 'https://bsc-dataseed.binance.org/',
    arbitrum: process.env.ARBITRUM_RPC_URL || 'https://rpc.ankr.com/arbitrum',
    optimism: process.env.OPTIMISM_RPC_URL || 'https://opt-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY',
    sepolia: process.env.SEPOLIA_RPC_URL || 'https://rpc.sepolia.org',
};

class WalletManager {
    private wallets: Record<string, ethers.Wallet>;

    constructor() {
        this.wallets = {};
    }

    createWallet(chain: string): ethers.Wallet {
        validateChain(chain);
        const wallet = ethers.Wallet.createRandom();
        this.wallets[chain.toLowerCase()] = wallet;
        Logger.log(`Created new wallet for chain: ${chain}, address: ${wallet.address}`);
        return wallet;
    }

    importWallet(chain: string, privateKey: string): ethers.Wallet {
        validateChain(chain);
        validatePrivateKey(privateKey);
        const wallet = new ethers.Wallet(privateKey);
        this.wallets[chain.toLowerCase()] = wallet;
        Logger.log(`Imported wallet for chain: ${chain}, address: ${wallet.address}`);
        return wallet;
    }

    async getBalance(chain: string): Promise<string> {
        validateChain(chain);
        const key = chain.toLowerCase();
        if (!this.wallets[key]) {
            throw new WalletNotFoundError(chain);
        }
        const rpcUrl = RPC_URLS[key];
        const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
        const balance = await provider.getBalance(this.wallets[key].address);
        return ethers.utils.formatEther(balance);
    }

    async sendTransaction(chain: string, tx: TransactionRequest): Promise<ethers.providers.TransactionResponse> {
        validateChain(chain);
        const key = chain.toLowerCase();
        if (!this.wallets[key]) {
            throw new WalletNotFoundError(chain);
        }
        validateAddress(tx.to);
        validateAmount(tx.amount);
        const rpcUrl = RPC_URLS[key];
        const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
        const signer = this.wallets[key].connect(provider);
        const txResponse = await signer.sendTransaction({
            to: tx.to,
            value: ethers.utils.parseEther(tx.amount),
        });
        Logger.log(`Sent transaction on ${chain}: ${txResponse.hash}`);
        return txResponse;
    }

    exportWallet(chain: string, password: string): ExportedWallet {
        const key = chain.toLowerCase();
        if (!this.wallets[key]) {
            throw new WalletNotFoundError(chain);
        }
        const wallet = this.wallets[key];
        const encryptedPrivateKey = encrypt(wallet.privateKey, password);
        return { address: wallet.address, encryptedPrivateKey };
    }

    importEncryptedWallet(chain: string, encryptedPrivateKey: string, password: string): ethers.Wallet {
        validateChain(chain);
        const privateKey = decrypt(encryptedPrivateKey, password);
        return this.importWallet(chain, privateKey);
    }

    getAddress(chain: string): string | undefined {
        return this.wallets[chain.toLowerCase()]?.address;
    }
}

export default WalletManager;