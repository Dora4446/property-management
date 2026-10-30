import { Router } from 'express';
import { getDashboardAnalytics, exportReportCsv } from '../controllers/reportController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/dashboard', getDashboardAnalytics);
router.get('/export', exportReportCsv);

export default router;
