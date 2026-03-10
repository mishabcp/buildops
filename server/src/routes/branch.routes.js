import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { list, create, update } from '../controllers/branch.controller.js';

const router = Router();

router.use(verifyToken);
router.use(requireRole('SUPER_ADMIN'));

router.get('/', list);
router.post('/', create);
router.put('/:id', update);

export default router;
