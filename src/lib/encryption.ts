import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const rawKey = process.env.ENCRYPTION_KEY || '0'.repeat(64);
const KEY = Buffer.from(rawKey.slice(0, 64), 'hex').slice(0, 32);

export function encrypt(plaintext: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv.toString('hex'), authTag.toString('hex'), encrypted.toString('hex')].join(':');
}

export function decrypt(ciphertext: string): string {
  try {
    const [ivHex, authTagHex, encryptedHex] = ciphertext.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    decipher.setAuthTag(authTag);
    return decipher.update(encrypted) + decipher.final('utf8');
  } catch {
    return '';
  }
}

export function maskPII(value: string): string {
  if (!value) return '';
  if (value.includes('@')) {
    const [local, domain] = value.split('@');
    return local.slice(0, 2) + '***@' + domain;
  }
  return value.slice(0, 3) + '***' + value.slice(-2);
}
