import { ethers } from 'ethers';
import {
    InvalidPrivateKeyError,
    InvalidAddressError,
    UnsupportedChainError,
    InvalidAmountError,
} from '../errors/WalletError';

export const SUPPORTED_CHAINS = ['ethereum', 'polygon', 'bsc', 'arbitrum', 'optimism', 'sepolia'];

export function validatePrivateKey(privateKey: string): void {
    try {
        new ethers.Wallet(privateKey);
    } catch {
        throw new InvalidPrivateKeyError();
    }
}

export function validateAddress(address: string): void {
    if (!ethers.utils.isAddress(address)) {
        throw new InvalidAddressError(address);
    }
}

export function validateChain(chain: string): void {
    if (!SUPPORTED_CHAINS.includes(chain.toLowerCase())) {
        throw new UnsupportedChainError(chain);
    }
}

export function validateAmount(amount: string): void {
    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) {
        throw new InvalidAmountError(amount);
    }
}
