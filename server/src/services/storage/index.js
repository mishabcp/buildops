import * as localStorage from './localStorage.js';
import * as s3Storage from './s3Storage.js';

export function getStorageDriver() {
  const driver = (process.env.STORAGE_DRIVER || 'local').toLowerCase();
  if (driver === 's3') return s3Storage;
  return localStorage;
}

export async function putObject(storageKey, buffer, mimeType) {
  return getStorageDriver().putObject(storageKey, buffer, mimeType);
}

export async function getObjectStream(storageKey) {
  return getStorageDriver().getObjectStream(storageKey);
}

export async function deleteObject(storageKey) {
  return getStorageDriver().deleteObject(storageKey);
}

export async function getSignedDownloadUrl(storageKey, expiresIn) {
  const driver = getStorageDriver();
  if (typeof driver.getSignedDownloadUrl === 'function') {
    return driver.getSignedDownloadUrl(storageKey, expiresIn);
  }
  return null;
}

export async function deleteObjects(storageKeys) {
  await Promise.all(storageKeys.map((key) => deleteObject(key)));
}
