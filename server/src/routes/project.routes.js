import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { list, create, getOne, update, remove, getSummary } from '../controllers/project.controller.js';
import { listStages, createStage } from '../controllers/paymentStage.controller.js';
import { listLabour, createLabour } from '../controllers/labour.controller.js';
import { listProjectMaterials, createMaterialItem } from '../controllers/material.controller.js';
import { listProjectAssociates, createProjectAssociate } from '../controllers/associate.controller.js';
import { listByProject as listExpenses, create as createExpense } from '../controllers/expense.controller.js';
import {
  listMedia,
  createMedia,
  getMedia,
  streamMediaFile,
  removeMedia,
} from '../controllers/projectMedia.controller.js';
import { mediaUpload } from '../middleware/upload.middleware.js';

const router = Router();

router.use(verifyToken);
router.use(requireRole(['SUPER_ADMIN', 'BRANCH_MANAGER', 'STAFF']));

router.get('/', list);
router.post('/', create);
router.get('/:id/summary', getSummary);
router.get('/:id/stages', listStages);
router.post('/:id/stages', createStage);
router.get('/:id/labour', listLabour);
router.post('/:id/labour', createLabour);
router.get('/:id/materials', listProjectMaterials);
router.post('/:id/materials', createMaterialItem);
router.get('/:id/associates', listProjectAssociates);
router.post('/:id/associates', createProjectAssociate);
router.get('/:id/expenses', listExpenses);
router.post('/:id/expenses', createExpense);
router.get('/:id/media', listMedia);
router.post('/:id/media', mediaUpload.single('file'), createMedia);
router.get('/:id/media/:mediaId/file', streamMediaFile);
router.get('/:id/media/:mediaId', getMedia);
router.delete('/:id/media/:mediaId', removeMedia);
router.get('/:id', getOne);
router.put('/:id', update);
router.delete('/:id', requireRole('SUPER_ADMIN'), remove);

export default router;
