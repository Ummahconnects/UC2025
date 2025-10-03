import { encryptSensitiveData, decryptSensitiveData } from '../services/security/encryptionUtils';

async function testEncryption() {
  const original = 'Sensitive data to encrypt!';
  try {
    const encrypted = await encryptSensitiveData(original);
    console.log('Encrypted:', encrypted);
    const decrypted = await decryptSensitiveData(encrypted);
    console.log('Decrypted:', decrypted);
    if (decrypted === original) {
      console.log('✅ Encryption/Decryption successful!');
    } else {
      console.error('❌ Decrypted value does not match original!');
    }
  } catch (err) {
    console.error('Error during encryption/decryption test:', err);
  }
}

testEncryption(); 