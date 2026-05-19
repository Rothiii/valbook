import 'server-only';

import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const ACCOUNT_ID = process.env.R2_ACCOUNT_ID ?? '';
const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID ?? '';
const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY ?? '';
const BUCKET = process.env.R2_BUCKET ?? 'valbook-dev';

const r2 = new S3Client({
  region: 'auto',
  endpoint: ACCOUNT_ID
    ? `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`
    : 'https://placeholder.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: ACCESS_KEY_ID || 'placeholder',
    secretAccessKey: SECRET_ACCESS_KEY || 'placeholder',
  },
});

const UPLOAD_URL_EXPIRY_SECONDS = 600;
const DOWNLOAD_URL_EXPIRY_SECONDS = 300;
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;

const ALLOWED_UPLOAD_MIME_TYPES = new Set<string>([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'text/plain',
]);

export type UploadUrlInput = {
  key: string;
  contentType: string;
  sizeBytes: number;
};

export async function getUploadUrl({ key, contentType, sizeBytes }: UploadUrlInput) {
  if (sizeBytes > MAX_FILE_SIZE_BYTES) {
    throw new Error(`File size exceeds limit (${MAX_FILE_SIZE_BYTES} bytes)`);
  }
  if (!ALLOWED_UPLOAD_MIME_TYPES.has(contentType)) {
    throw new Error(`MIME type not allowed: ${contentType}`);
  }

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
    ContentLength: sizeBytes,
  });
  return getSignedUrl(r2, command, { expiresIn: UPLOAD_URL_EXPIRY_SECONDS });
}

export async function getDownloadUrl(key: string) {
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  return getSignedUrl(r2, command, { expiresIn: DOWNLOAD_URL_EXPIRY_SECONDS });
}

export async function deleteObject(key: string) {
  await r2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

export { ALLOWED_UPLOAD_MIME_TYPES, BUCKET as R2_BUCKET, MAX_FILE_SIZE_BYTES };
