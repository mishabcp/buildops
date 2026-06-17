import { error } from '../utils/response.js';

export function errorMiddleware(err, _req, res, _next) {
  if (err?.code === 'LIMIT_FILE_SIZE') {
    return error(res, 'File exceeds size limit', 400);
  }
  console.error('Unhandled error:', err);
  return error(res, 'Internal server error', 500);
}
