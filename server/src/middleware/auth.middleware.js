import { error } from '../utils/response.js';
import { verify } from '../utils/jwt.js';

/**
 * Verify JWT and attach decoded payload to req.user (e.g. { userId, email }).
 * Use after signing with same payload shape.
 */
export function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return error(res, 'Unauthorized', 401);
  }
  const token = authHeader.slice(7);
  try {
    const decoded = verify(token);
    req.user = decoded;
    next();
  } catch (err) {
    return error(res, 'Invalid or expired token', 401);
  }
}
