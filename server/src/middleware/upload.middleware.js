import multer from 'multer';
import { MAX_UPLOAD_BYTES } from '../config/media.config.js';

export const mediaUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 },
});
