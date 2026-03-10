import prisma from '../utils/prisma.js';
import { error } from '../utils/response.js';

/**
 * Require the current user to have one of the given roles.
 * Must be used after verifyToken (req.user.userId set).
 */
export function requireRole(roles) {
  const allowed = new Set(Array.isArray(roles) ? roles : [roles]);
  return async (req, res, next) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
      });
      if (!user || !user.isActive) {
        return error(res, 'User not found or inactive', 403);
      }
      if (!allowed.has(user.role)) {
        return error(res, 'Forbidden', 403);
      }
      req.user.role = user.role;
      req.user.branchId = user.branchId;
      next();
    } catch (err) {
      console.error('requireRole error:', err);
      return error(res, 'Forbidden', 500);
    }
  };
}
