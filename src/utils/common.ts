import crypto from 'crypto';
import AWS from 'aws-sdk';
// import multer from 'multer';
// import multerS3 from 'multer-s3';

// Encryption key and algorithm setup
const algorithm = 'aes-256-cbc'; // the encryption algorithm we are using used for both encrypt and decrypt.
const encryptionKey = process.env.ENCRYPTION_KEY ?? '';

/** IV is a random value used to initialize the encryption process
 * @format For AES-256-CBC, the IV must be exactly 16 bytes (128 bits) long.
 */
const iv = crypto.randomBytes(16); // Initialization Vector (IV):

// Function to encrypt data
export async function encryptVerificationData(
  data: Record<string, any>,
): Promise<string> {
  const cipher = crypto.createCipheriv(algorithm, encryptionKey, iv);
  const jsonData = JSON.stringify(data);
  let encrypted = cipher.update(jsonData, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`; // Store IV with the encrypted data
}

// Function to decrypt data
export async function decryptVerificationData(
  encryptedData: string,
): Promise<Record<string, any>> {
  const [ivHex, encryptedText] = encryptedData.split(':');
  const decipher = crypto.createDecipheriv(
    algorithm,
    encryptionKey,
    Buffer.from(ivHex, 'hex'),
  );
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return JSON.parse(decrypted);
}

export const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;
