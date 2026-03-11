/**
 * Base error class for wallet-related errors.
 */
export class WalletError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'WalletError';
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

/**
 * Thrown when a requested wallet is not found for a given chain.
 */
export class WalletNotFoundError extends WalletError {
    constructor(chain: string) {
        super(`Wallet not found for chain: ${chain}`);
        this.name = 'WalletNotFoundError';
    }
}

/**
 * Thrown when an invalid private key is provided.
 */
export class InvalidPrivateKeyError extends WalletError {
    constructor() {
        super('Invalid private key provided.');
        this.name = 'InvalidPrivateKeyError';
    }
}

/**
 * Thrown when an invalid Ethereum address is provided.
 */
export class InvalidAddressError extends WalletError {
    constructor(address: string) {
        super(`Invalid Ethereum address: ${address}`);
        this.name = 'InvalidAddressError';
    }
}

/**
 * Thrown when a transaction fails.
 */
export class TransactionError extends WalletError {
    constructor(message: string) {
        super(`Transaction failed: ${message}`);
        this.name = 'TransactionError';
    }
}

/**
 * Thrown when an unsupported chain is referenced.
 */
export class UnsupportedChainError extends WalletError {
    constructor(chain: string) {
        super(`Unsupported chain: ${chain}`);
        this.name = 'UnsupportedChainError';
    }
}

/**
 * Thrown when encryption or decryption fails.
 */
export class EncryptionError extends WalletError {
    constructor(message: string) {
        super(`Encryption error: ${message}`);
        this.name = 'EncryptionError';
    }
}
