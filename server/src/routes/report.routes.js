import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import {
  getProjectPl,
  getPaymentCollection,
  getPendingBills,
  getLabourCost,
  getMaterialUsage,
  exportPdf,
  exportExcel,
} from '../controllers/report.controller.js';

const router = Router();

router.use(verifyToken);
router.use(requireRole(['SUPER_ADMIN', 'BRANCH_MANAGER', 'STAFF']));

router.get('/project-pl', getProjectPl);
router.get('/payment-collection', getPaymentCollection);
router.get('/pending-bills', getPendingBills);
router.get('/labour-cost', getLabourCost);
router.get('/material-usage', getMaterialUsage);
router.get('/export/pdf', exportPdf);
router.get('/export/excel', exportExcel);

export default router;
