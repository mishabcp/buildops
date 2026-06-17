import path from 'path';
import { mkdir, writeFile, readFile, unlink } from 'fs/promises';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_DIR = path.resolve(__dirname, '../../../.data/uploads');

async function ensureDir(filePath) {
  await mkdir(path.dirname(filePath), { recursive: true });
}

function resolvePath(storageKey) {
  const normalized = String(storageKey).replace(/\.\./g, '').replace(/^[/\\]+/, '');
  const full = path.resolve(BASE_DIR, normalized);
  if (!full.startsWith(BASE_DIR)) {
    throw new Error('Invalid storage key');
  }
  return full;
}

export async function putObject(storageKey, buffer, _mimeType) {
  const filePath = resolvePath(storageKey);
  await ensureDir(filePath);
  await writeFile(filePath, buffer);
}

export async function getObjectStream(storageKey) {
  const filePath = resolvePath(storageKey);
  const buffer = await readFile(filePath);
  return { body: buffer, contentLength: buffer.length };
}

export async function deleteObject(storageKey) {
  const filePath = resolvePath(storageKey);
  try {
    await unlink(filePath);
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }
}

export async function getSignedDownloadUrl() {
  return null;
}
