import { randomUUID } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const PUBLIC_DIR = join(process.cwd(), 'public');
const UPLOADS_SUBDIR = 'uploads';

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

const MIME_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'text/csv': 'csv',
  'text/plain': 'txt',
};

export type SaveFileInput = {
  buffer: Buffer | Uint8Array;
  contentType: string;
  workspaceId: string;
  originalName?: string;
};

export type SavedFile = {
  key: string;
  url: string;
  sizeBytes: number;
};

export async function saveFile({
  buffer,
  contentType,
  workspaceId,
  originalName,
}: SaveFileInput): Promise<SavedFile> {
  const sizeBytes = buffer.byteLength;
  if (sizeBytes > MAX_FILE_SIZE_BYTES) {
    throw new Error(`File size exceeds limit (${MAX_FILE_SIZE_BYTES} bytes)`);
  }
  if (!ALLOWED_UPLOAD_MIME_TYPES.has(contentType)) {
    throw new Error(`MIME type not allowed: ${contentType}`);
  }

  const extension = MIME_EXTENSIONS[contentType] ?? 'bin';
  const id = randomUUID();
  const filename = originalName ? `${id}-${sanitizeFilename(originalName)}` : `${id}.${extension}`;

  const relativeDir = join(UPLOADS_SUBDIR, workspaceId);
  const absoluteDir = join(PUBLIC_DIR, relativeDir);
  await mkdir(absoluteDir, { recursive: true });

  const absolutePath = join(absoluteDir, filename);
  await writeFile(absolutePath, buffer);

  const key = join(relativeDir, filename).replaceAll('\\', '/');
  return {
    key,
    url: `/${key}`,
    sizeBytes,
  };
}

export function getFileUrl(key: string): string {
  return key.startsWith('/') ? key : `/${key}`;
}

export async function deleteFile(key: string): Promise<void> {
  const cleanKey = key.startsWith('/') ? key.slice(1) : key;
  if (!cleanKey.startsWith(`${UPLOADS_SUBDIR}/`)) {
    throw new Error('Refusing to delete file outside uploads directory');
  }
  const absolutePath = join(PUBLIC_DIR, cleanKey);
  try {
    await unlink(absolutePath);
  } catch (error) {
    if (isFsError(error) && error.code === 'ENOENT') {
      return;
    }
    throw error;
  }
}

function sanitizeFilename(name: string): string {
  return name
    .replaceAll(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 80);
}

function isFsError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error;
}

export { ALLOWED_UPLOAD_MIME_TYPES, MAX_FILE_SIZE_BYTES };
