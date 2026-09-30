import crypto from 'crypto';

// Match Configurations exactly: 32-byte key for AES-256-CBC
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default_super_secret_key_0000000'; // Must be 32 bytes
const IV_LENGTH = 16; 

export function encrypt(text: string) {
  if (!text) return '';
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  } catch(e) {
    return text;
  }
}

export function decrypt(text: string) {
  if (!text) return '';
  try {
    if (!text.includes(':')) return text;
    const textParts = text.split(':');
    if (textParts.length !== 2) return text; // gcm would have 3, cbc has 2
    
    const iv = Buffer.from(textParts.shift()!, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (e) {
    // Return original text if not encrypted or decryption fails (for backwards compatibility)
    return text;
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
