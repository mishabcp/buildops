import { error } from '../utils/response.js';

export function errorMiddleware(err, _req, res, _next) {
  console.error('Unhandled error:', err);
  return error(res, 'Internal server error', 500);
}
