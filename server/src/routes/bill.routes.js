import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { list, create, getOne, update, createPayment } from '../controllers/bill.controller.js';

const router = Router();

router.use(verifyToken);
router.use(requireRole(['SUPER_ADMIN', 'BRANCH_MANAGER', 'STAFF']));

router.get('/', list);
router.post('/', create);
router.get('/:id', getOne);
router.put('/:id', update);
router.post('/:id/payments', createPayment);

export default router;
