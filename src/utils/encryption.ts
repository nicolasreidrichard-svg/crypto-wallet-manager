import crypto from 'crypto';
import { EncryptionError } from '../errors/WalletError';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 12;
const SALT_LENGTH = 16;
const TAG_LENGTH = 16;
const ITERATIONS = 100000;
const DIGEST = 'sha256';

/**
 * Derives a 256-bit key from a password and salt using PBKDF2.
 * @param password - The password to derive the key from.
 * @param salt - The random salt bytes.
 * @returns A 32-byte derived key.
 */
function deriveKey(password: string, salt: Buffer): Buffer {
    return crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST);
}

/**
 * Encrypts plaintext using AES-256-GCM with a password-derived key.
 * @param plaintext - The string to encrypt.
 * @param password - The password used to derive the encryption key.
 * @returns A hex-encoded string containing: salt + iv + authTag + ciphertext.
 */
export function encrypt(plaintext: string, password: string): string {
    try {
        const salt = crypto.randomBytes(SALT_LENGTH);
        const iv = crypto.randomBytes(IV_LENGTH);
        const key = deriveKey(password, salt);

        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
        const encrypted = Buffer.concat([
            cipher.update(plaintext, 'utf8'),
            cipher.final(),
        ]);
        const authTag = cipher.getAuthTag();

        return Buffer.concat([salt, iv, authTag, encrypted]).toString('hex');
    } catch (err: unknown) {
        throw new EncryptionError((err as Error).message);
    }
}

/**
 * Decrypts a hex-encoded string produced by {@link encrypt}.
 * @param ciphertext - The hex-encoded encrypted payload.
 * @param password - The password used to derive the decryption key.
 * @returns The original plaintext string.
 * @throws {EncryptionError} If decryption fails (e.g., wrong password).
 */
export function decrypt(ciphertext: string, password: string): string {
    try {
        const data = Buffer.from(ciphertext, 'hex');
        const salt = data.subarray(0, SALT_LENGTH);
        const iv = data.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
        const authTag = data.subarray(
            SALT_LENGTH + IV_LENGTH,
            SALT_LENGTH + IV_LENGTH + TAG_LENGTH
        );
        const encrypted = data.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

        const key = deriveKey(password, salt);
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);

        return Buffer.concat([
            decipher.update(encrypted),
            decipher.final(),
        ]).toString('utf8');
    } catch (err: unknown) {
        throw new EncryptionError((err as Error).message);
    }
}
