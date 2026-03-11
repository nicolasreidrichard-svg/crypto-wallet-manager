import * as crypto from 'crypto';
import { EncryptionError } from '../errors/WalletError';

const ALGORITHM = 'aes-256-cbc';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const SALT_LENGTH = 16;
const PBKDF2_ITERATIONS = 100000;
const PBKDF2_DIGEST = 'sha256';

export function encrypt(plaintext: string, password: string): string {
    const salt = crypto.randomBytes(SALT_LENGTH);
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, KEY_LENGTH, PBKDF2_DIGEST);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    return Buffer.concat([salt, iv, encrypted]).toString('base64');
}

export function decrypt(ciphertext: string, password: string): string {
    try {
        const data = Buffer.from(ciphertext, 'base64');
        const salt = data.slice(0, SALT_LENGTH);
        const iv = data.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
        const encrypted = data.slice(SALT_LENGTH + IV_LENGTH);
        const key = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, KEY_LENGTH, PBKDF2_DIGEST);
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
        return decrypted.toString('utf8');
    } catch (err) {
        throw new EncryptionError('Decryption failed: invalid password or corrupted data');
    }
}
