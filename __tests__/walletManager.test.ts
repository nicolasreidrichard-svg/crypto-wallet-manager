import WalletManager from '../src/services/walletManager';
import { encrypt, decrypt } from '../src/utils/encryption';
import { validatePrivateKey, validateAddress, validateChain, validateAmount } from '../src/utils/validation';
import {
    WalletNotFoundError,
    InvalidPrivateKeyError,
    InvalidAddressError,
    UnsupportedChainError,
    EncryptionError,
} from '../src/errors/WalletError';

// ── WalletManager ─────────────────────────────────────────────────────────────

describe('WalletManager', () => {
    let manager: WalletManager;

    beforeEach(() => {
        manager = new WalletManager();
    });

    describe('createWallet', () => {
        it('creates a wallet for a supported chain', () => {
            const wallet = manager.createWallet('ethereum');
            expect(wallet).toBeDefined();
            expect(wallet.address).toMatch(/^0x[0-9a-fA-F]{40}$/);
        });

        it('returns a unique wallet on each call', () => {
            const w1 = manager.createWallet('ethereum');
            const manager2 = new WalletManager();
            const w2 = manager2.createWallet('ethereum');
            expect(w1.address).not.toBe(w2.address);
        });

        it('throws UnsupportedChainError for unknown chains', () => {
            expect(() => manager.createWallet('unknownchain')).toThrow(UnsupportedChainError);
        });
    });

    describe('importWallet', () => {
        const validKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

        it('imports a wallet from a valid private key', () => {
            const wallet = manager.importWallet('ethereum', validKey);
            expect(wallet.address).toBe('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
        });

        it('throws InvalidPrivateKeyError for an invalid key', () => {
            expect(() => manager.importWallet('ethereum', 'not-a-key')).toThrow(InvalidPrivateKeyError);
        });

        it('throws UnsupportedChainError for unknown chains', () => {
            expect(() => manager.importWallet('fakechain', validKey)).toThrow(UnsupportedChainError);
        });
    });

    describe('getBalance', () => {
        it('throws WalletNotFoundError when no wallet is registered', async () => {
            await expect(manager.getBalance('ethereum')).rejects.toThrow(WalletNotFoundError);
        });

        it('throws UnsupportedChainError for unknown chains', async () => {
            await expect(manager.getBalance('nochain')).rejects.toThrow(UnsupportedChainError);
        });
    });

    describe('sendTransaction', () => {
        const validKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
        const validTo = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';

        it('throws WalletNotFoundError when no wallet is registered', async () => {
            await expect(
                manager.sendTransaction('ethereum', { to: validTo, amount: '0.01' })
            ).rejects.toThrow(WalletNotFoundError);
        });

        it('throws InvalidAddressError for a bad recipient address', async () => {
            manager.importWallet('ethereum', validKey);
            await expect(
                manager.sendTransaction('ethereum', { to: 'not-an-address', amount: '0.01' })
            ).rejects.toThrow(InvalidAddressError);
        });

        it('throws an error for zero or negative amounts', async () => {
            manager.importWallet('ethereum', validKey);
            await expect(
                manager.sendTransaction('ethereum', { to: validTo, amount: '0' })
            ).rejects.toThrow();
        });
    });

    describe('exportWallet / importEncryptedWallet', () => {
        const validKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
        const password = 'test-password-123';

        it('exports and re-imports a wallet with encryption', () => {
            manager.importWallet('ethereum', validKey);
            const exported = manager.exportWallet('ethereum', password);

            expect(exported.address).toBe('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
            expect(exported.encryptedPrivateKey).not.toBe(validKey);

            const manager2 = new WalletManager();
            const reimported = manager2.importEncryptedWallet(
                'polygon',
                exported.encryptedPrivateKey,
                password
            );
            expect(reimported.address).toBe('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
        });

        it('throws WalletNotFoundError when exporting from empty manager', () => {
            expect(() => manager.exportWallet('ethereum', password)).toThrow(WalletNotFoundError);
        });
    });

    describe('getAddress', () => {
        it('returns undefined when no wallet exists for chain', () => {
            expect(manager.getAddress('ethereum')).toBeUndefined();
        });

        it('returns the address after wallet creation', () => {
            const wallet = manager.createWallet('ethereum');
            expect(manager.getAddress('ethereum')).toBe(wallet.address);
        });
    });
});

// ── Encryption utilities ──────────────────────────────────────────────────────

describe('encrypt / decrypt', () => {
    it('encrypts and decrypts a string correctly', () => {
        const plaintext = 'hello world';
        const password = 'secure-password';
        const ciphertext = encrypt(plaintext, password);
        expect(ciphertext).not.toBe(plaintext);
        expect(decrypt(ciphertext, password)).toBe(plaintext);
    });

    it('produces different ciphertext for the same input (random IV/salt)', () => {
        const plaintext = 'same data';
        const password = 'same-password';
        const c1 = encrypt(plaintext, password);
        const c2 = encrypt(plaintext, password);
        expect(c1).not.toBe(c2);
    });

    it('throws EncryptionError when decrypting with a wrong password', () => {
        const ciphertext = encrypt('secret', 'correct-password');
        expect(() => decrypt(ciphertext, 'wrong-password')).toThrow(EncryptionError);
    });
});

// ── Validation utilities ──────────────────────────────────────────────────────

describe('validation utilities', () => {
    describe('validatePrivateKey', () => {
        it('accepts a valid private key', () => {
            expect(() =>
                validatePrivateKey('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80')
            ).not.toThrow();
        });

        it('throws InvalidPrivateKeyError for an invalid key', () => {
            expect(() => validatePrivateKey('not-a-key')).toThrow(InvalidPrivateKeyError);
        });
    });

    describe('validateAddress', () => {
        it('accepts a valid Ethereum address', () => {
            expect(() =>
                validateAddress('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266')
            ).not.toThrow();
        });

        it('throws InvalidAddressError for an invalid address', () => {
            expect(() => validateAddress('not-an-address')).toThrow(InvalidAddressError);
        });
    });

    describe('validateChain', () => {
        it('accepts supported chains', () => {
            const supported = ['ethereum', 'polygon', 'bsc', 'arbitrum', 'optimism', 'sepolia'];
            for (const chain of supported) {
                expect(() => validateChain(chain)).not.toThrow();
            }
        });

        it('throws UnsupportedChainError for unknown chains', () => {
            expect(() => validateChain('fakechain')).toThrow(UnsupportedChainError);
        });
    });

    describe('validateAmount', () => {
        it('accepts positive amounts', () => {
            expect(() => validateAmount('1.5')).not.toThrow();
            expect(() => validateAmount('0.001')).not.toThrow();
        });

        it('throws for zero', () => {
            expect(() => validateAmount('0')).toThrow();
        });

        it('throws for negative numbers', () => {
            expect(() => validateAmount('-1')).toThrow();
        });

        it('throws for non-numeric strings', () => {
            expect(() => validateAmount('abc')).toThrow();
        });
    });
});
