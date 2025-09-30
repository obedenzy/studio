
'use server';

import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

/**
 * Hashes a password using scrypt.
 * @param password The password to hash.
 * @returns A promise that resolves to the hashed password string.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString('hex')}`;
}

/**
 * Verifies a password against a stored hash.
 * @param password The plaintext password to verify.
 * @param hash The stored hash (including salt).
 * @returns A promise that resolves to true if the password is correct, false otherwise.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const [salt, key] = hash.split(':');
  const keyBuffer = Buffer.from(key, 'hex');
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;

  // Use timingSafeEqual to prevent timing attacks
  if (derivedKey.length !== keyBuffer.length) {
    return false;
  }
  
  return timingSafeEqual(keyBuffer, derivedKey);
}
