import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { updateLabour, deleteLabour } from '../controllers/labour.controller.js';

const router = Router();

router.use(verifyToken);
router.use(requireRole(['SUPER_ADMIN', 'BRANCH_MANAGER', 'STAFF']));

router.put('/:id', updateLabour);
router.delete('/:id', deleteLabour);

export default router;
