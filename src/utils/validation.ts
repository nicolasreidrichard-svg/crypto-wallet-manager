import { ethers } from 'ethers';
import { InvalidPrivateKeyError, InvalidAddressError } from '../errors/WalletError';
import { getSupportedChains, ChainId } from '../config/chains';
import { UnsupportedChainError } from '../errors/WalletError';

/**
 * Validates that the provided private key is a valid 32-byte hex string.
 * @param privateKey - The private key to validate.
 * @throws {InvalidPrivateKeyError} If the key is not valid.
 */
export function validatePrivateKey(privateKey: string): void {
    try {
        new ethers.Wallet(privateKey);
    } catch {
        throw new InvalidPrivateKeyError();
    }
}

/**
 * Validates that the provided Ethereum address is valid (checksummed or not).
 * @param address - The address to validate.
 * @throws {InvalidAddressError} If the address is not valid.
 */
export function validateAddress(address: string): void {
    if (!ethers.utils.isAddress(address)) {
        throw new InvalidAddressError(address);
    }
}

/**
 * Validates that the given chain identifier is supported.
 * @param chain - The chain identifier to validate.
 * @throws {UnsupportedChainError} If the chain is not supported.
 */
export function validateChain(chain: string): asserts chain is ChainId {
    const supported = getSupportedChains() as string[];
    if (!supported.includes(chain)) {
        throw new UnsupportedChainError(chain);
    }
}

/**
 * Validates that the provided amount is a positive number.
 * @param amount - The amount to validate.
 * @throws {Error} If the amount is not positive.
 */
export function validateAmount(amount: string): void {
    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) {
        throw new Error(`Invalid amount: "${amount}". Amount must be a positive number.`);
    }
}
