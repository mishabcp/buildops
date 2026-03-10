import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import {
  updateStage,
  deleteStage,
  listReceipts,
  createReceipt,
} from '../controllers/paymentStage.controller.js';

const router = Router();

router.use(verifyToken);
router.use(requireRole(['SUPER_ADMIN', 'BRANCH_MANAGER', 'STAFF']));

router.get('/:id/receipts', listReceipts);
router.post('/:id/receipts', createReceipt);
router.put('/:id', updateStage);
router.delete('/:id', deleteStage);

export default router;
