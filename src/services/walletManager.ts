import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { chains, ChainId } from '../config/chains';
import {
    WalletNotFoundError,
    TransactionError,
} from '../errors/WalletError';
import {
    validatePrivateKey,
    validateAddress,
    validateChain,
    validateAmount,
} from '../utils/validation';
import { encrypt, decrypt } from '../utils/encryption';

/**
 * Parameters required to send a transaction.
 */
export interface SendTransactionParams {
    /** Target Ethereum address. */
    to: string;
    /** Amount in ether (e.g. "0.01"). */
    amount: string;
    /** Optional custom gas limit. Defaults to provider estimation. */
    gasLimit?: number;
}

/**
 * Result of an exported wallet.
 */
export interface ExportedWallet {
    address: string;
    encryptedPrivateKey: string;
}

/**
 * Manages Ethereum-compatible wallets across multiple chains.
 *
 * @example
 * ```typescript
 * const manager = new WalletManager();
 * const wallet = manager.createWallet('ethereum');
 * const balance = await manager.getBalance('ethereum');
 * ```
 */
class WalletManager {
    /** Map from chain ID to ethers Wallet instance. */
    private wallets: Record<string, ethers.Wallet>;

    constructor() {
        this.wallets = {};
    }

    /**
     * Creates a new random wallet and associates it with the given chain.
     * @param chain - The chain identifier (e.g. "ethereum", "polygon").
     * @returns The newly created ethers.Wallet.
     * @throws {UnsupportedChainError} If the chain is not supported.
     */
    createWallet(chain: string): ethers.Wallet {
        validateChain(chain);
        const wallet = ethers.Wallet.createRandom();
        this.wallets[chain] = wallet;
        return wallet;
    }

    /**
     * Imports an existing wallet using a private key for the given chain.
     * @param chain - The chain identifier.
     * @param privateKey - The wallet's private key.
     * @returns The imported ethers.Wallet.
     * @throws {UnsupportedChainError} If the chain is not supported.
     * @throws {InvalidPrivateKeyError} If the private key is invalid.
     */
    importWallet(chain: string, privateKey: string): ethers.Wallet {
        validateChain(chain);
        validatePrivateKey(privateKey);
        const wallet = new ethers.Wallet(privateKey);
        this.wallets[chain] = wallet;
        return wallet;
    }

    /**
     * Returns the provider for the specified chain.
     * @param chain - The chain identifier.
     * @returns An ethers JsonRpcProvider connected to the chain's RPC.
     */
    private getProvider(chain: ChainId): ethers.providers.JsonRpcProvider {
        const config = chains[chain];
        return new ethers.providers.JsonRpcProvider(config.rpcUrl);
    }

    /**
     * Retrieves the ETH balance for the wallet associated with the given chain.
     * @param chain - The chain identifier.
     * @returns The balance as a human-readable ether string (e.g. "1.5").
     * @throws {WalletNotFoundError} If no wallet is registered for the chain.
     * @throws {UnsupportedChainError} If the chain is not supported.
     */
    async getBalance(chain: string): Promise<string> {
        validateChain(chain);
        const wallet = this.wallets[chain];
        if (!wallet) throw new WalletNotFoundError(chain);

        const provider = this.getProvider(chain as ChainId);
        const balance = await provider.getBalance(wallet.address);
        return ethers.utils.formatEther(balance);
    }

    /**
     * Sends a transaction on the specified chain.
     * @param chain - The chain identifier.
     * @param params - Transaction parameters.
     * @returns The transaction response.
     * @throws {WalletNotFoundError} If no wallet is registered for the chain.
     * @throws {InvalidAddressError} If the recipient address is invalid.
     * @throws {TransactionError} If the transaction submission fails.
     */
    async sendTransaction(
        chain: string,
        params: SendTransactionParams
    ): Promise<ethers.providers.TransactionResponse> {
        validateChain(chain);
        const wallet = this.wallets[chain];
        if (!wallet) throw new WalletNotFoundError(chain);

        validateAddress(params.to);
        validateAmount(params.amount);

        const provider = this.getProvider(chain as ChainId);
        const connectedWallet = wallet.connect(provider);

        const tx: ethers.providers.TransactionRequest = {
            to: params.to,
            value: ethers.utils.parseEther(params.amount),
        };

        if (params.gasLimit) {
            tx.gasLimit = params.gasLimit;
        }

        try {
            return await connectedWallet.sendTransaction(tx);
        } catch (err: unknown) {
            throw new TransactionError((err as Error).message);
        }
    }

    /**
     * Exports the wallet for the given chain as an encrypted payload.
     * @param chain - The chain identifier.
     * @param password - Password used to encrypt the private key.
     * @returns An object with the wallet address and encrypted private key.
     * @throws {WalletNotFoundError} If no wallet is registered for the chain.
     */
    exportWallet(chain: string, password: string): ExportedWallet {
        validateChain(chain);
        const wallet = this.wallets[chain];
        if (!wallet) throw new WalletNotFoundError(chain);

        const encryptedPrivateKey = encrypt(wallet.privateKey, password);
        return { address: wallet.address, encryptedPrivateKey };
    }

    /**
     * Imports a wallet from an encrypted private key exported via {@link exportWallet}.
     * @param chain - The chain identifier.
     * @param encryptedPrivateKey - The encrypted private key hex string.
     * @param password - Password used to decrypt the private key.
     * @returns The imported ethers.Wallet.
     */
    importEncryptedWallet(
        chain: string,
        encryptedPrivateKey: string,
        password: string
    ): ethers.Wallet {
        validateChain(chain);
        const privateKey = decrypt(encryptedPrivateKey, password);
        return this.importWallet(chain, privateKey);
    }

    /**
     * Saves all wallets to an encrypted JSON file on disk.
     * @param filePath - Path to the output file.
     * @param password - Password used to encrypt wallet data.
     */
    saveWallets(filePath: string, password: string): void {
        const data: Record<string, ExportedWallet> = {};
        for (const chain of Object.keys(this.wallets)) {
            data[chain] = this.exportWallet(chain, password);
        }
        const encrypted = encrypt(JSON.stringify(data), password);
        const dir = path.dirname(path.resolve(filePath));
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(filePath, encrypted, 'utf8');
    }

    /**
     * Loads wallets from an encrypted JSON file saved by {@link saveWallets}.
     * @param filePath - Path to the encrypted wallets file.
     * @param password - Password to decrypt the file.
     */
    loadWallets(filePath: string, password: string): void {
        const encrypted = fs.readFileSync(filePath, 'utf8');
        const json = decrypt(encrypted, password);
        const data: Record<string, ExportedWallet> = JSON.parse(json);
        for (const [chain, exported] of Object.entries(data)) {
            this.importEncryptedWallet(chain, exported.encryptedPrivateKey, password);
        }
    }

    /**
     * Returns the wallet address for the given chain, if a wallet exists.
     * @param chain - The chain identifier.
     * @returns The wallet address, or undefined if no wallet is loaded for the chain.
     */
    getAddress(chain: string): string | undefined {
        return this.wallets[chain]?.address;
    }
}

export default WalletManager;