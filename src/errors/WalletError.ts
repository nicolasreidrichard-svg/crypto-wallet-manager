export class WalletNotFoundError extends Error {
    constructor(chain: string) {
        super(`No wallet found for chain: ${chain}`);
        this.name = 'WalletNotFoundError';
    }
}

export class InvalidPrivateKeyError extends Error {
    constructor() {
        super('Invalid private key');
        this.name = 'InvalidPrivateKeyError';
    }
}

export class InvalidAddressError extends Error {
    constructor(address: string) {
        super(`Invalid address: ${address}`);
        this.name = 'InvalidAddressError';
    }
}

export class UnsupportedChainError extends Error {
    constructor(chain: string) {
        super(`Unsupported chain: ${chain}`);
        this.name = 'UnsupportedChainError';
    }
}

export class EncryptionError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'EncryptionError';
    }
}

export class InvalidAmountError extends Error {
    constructor(amount: string) {
        super(`Invalid amount: ${amount}. Amount must be a positive number.`);
        this.name = 'InvalidAmountError';
    }
}
