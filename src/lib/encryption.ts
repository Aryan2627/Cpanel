import crypto from 'crypto';

const SECRET_KEY = process.env.ENCRYPTION_KEY || 'enterprise_pii_encryption_key_default_32bytes!!';
// Generate exact 32-byte key buffer for AES-256
const KEY_BUFFER = crypto.createHash('sha256').update(SECRET_KEY).digest();

/**
 * Encrypt sensitive string data using AES-256-GCM
 */
export function encrypt(text: string): string {
  if (!text) return '';
  if (text.startsWith('enc:gcm:')) return text; // Prevent double encryption

  try {
    const iv = crypto.randomBytes(12); // 12-byte IV for AES-256-GCM
    const cipher = crypto.createCipheriv('aes-256-gcm', KEY_BUFFER, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    return `enc:gcm:${iv.toString('hex')}:${authTag}:${encrypted}`;
  } catch (err) {
    console.error('AES-256-GCM Encryption Error:', err);
    return text;
  }
}

/**
 * Decrypt AES-256-GCM or legacy CBC encrypted strings
 */
export function decrypt(text: string): string {
  if (!text) return '';
  
  // Format check for AES-256-GCM
  if (text.startsWith('enc:gcm:')) {
    try {
      const parts = text.split(':');
      if (parts.length !== 5) return text;
      
      const [, , ivHex, authTagHex, encryptedHex] = parts;
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      const decipher = crypto.createDecipheriv('aes-256-gcm', KEY_BUFFER, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (err) {
      console.error('AES-256-GCM Decryption Error:', err);
      return text;
    }
  }

  // Legacy CBC support "iv:encrypted"
  if (text.includes(':')) {
    try {
      const parts = text.split(':');
      if (parts.length === 2) {
        const iv = Buffer.from(parts[0], 'hex');
        const encryptedText = Buffer.from(parts[1], 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', KEY_BUFFER, iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString('utf8');
      }
    } catch {
      return text;
    }
  }

  // Unencrypted plain text
  return text;
}

export const encryptPII = encrypt;
export const decryptPII = decrypt;

/**
 * Mask PII data for display/logging
 */
export function maskPII(value: string): string {
  if (!value) return '';
  const plain = decrypt(value);
  if (plain.includes('@')) {
    const [local, domain] = plain.split('@');
    return local.slice(0, 2) + '***@' + domain;
  }
  if (plain.length <= 4) return '****';
  return plain.slice(0, 2) + '****' + plain.slice(-2);
}
