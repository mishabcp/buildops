import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { list, create, update, remove } from '../controllers/user.controller.js';

const router = Router();

router.use(verifyToken);

router.get('/', requireRole('SUPER_ADMIN'), list);
router.post('/', requireRole('SUPER_ADMIN'), create);
router.put('/:id', requireRole(['SUPER_ADMIN', 'BRANCH_MANAGER', 'STAFF']), update);
router.delete('/:id', requireRole('SUPER_ADMIN'), remove);

export default router;
