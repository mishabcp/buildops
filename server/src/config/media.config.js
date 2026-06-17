const MB = 1024 * 1024;

export const MEDIA_LIMITS = {
  image: Number(process.env.MEDIA_MAX_IMAGE_BYTES) || 10 * MB,
  pdf: Number(process.env.MEDIA_MAX_PDF_BYTES) || 15 * MB,
  video: Number(process.env.MEDIA_MAX_VIDEO_BYTES) || 100 * MB,
};

export const MAX_UPLOAD_BYTES = Math.max(MEDIA_LIMITS.image, MEDIA_LIMITS.pdf, MEDIA_LIMITS.video);

export const NOTE_MAX_LENGTH = 500;

const IMAGE_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
]);

const PDF_MIMES = new Set(['application/pdf']);

const VIDEO_MIMES = new Set([
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-msvideo',
]);

export function classifyMediaKind(mimeType) {
  const mime = String(mimeType || '').toLowerCase().split(';')[0].trim();
  if (IMAGE_MIMES.has(mime)) return 'IMAGE';
  if (PDF_MIMES.has(mime)) return 'PDF';
  if (VIDEO_MIMES.has(mime)) return 'VIDEO';
  return null;
}

export function maxBytesForKind(kind) {
  if (kind === 'IMAGE') return MEDIA_LIMITS.image;
  if (kind === 'PDF') return MEDIA_LIMITS.pdf;
  if (kind === 'VIDEO') return MEDIA_LIMITS.video;
  return MAX_UPLOAD_BYTES;
}
