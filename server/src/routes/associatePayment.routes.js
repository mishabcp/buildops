import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { createTransaction } from '../controllers/associate.controller.js';

const router = Router();

router.use(verifyToken);
router.use(requireRole(['SUPER_ADMIN', 'BRANCH_MANAGER', 'STAFF']));

router.post('/:id/transactions', createTransaction);

export default router;
