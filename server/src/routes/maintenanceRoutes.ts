import { Router } from 'express';
import {
  getMaintenanceRequests,
  getMaintenanceRequestById,
  createMaintenanceRequest,
  updateMaintenanceStatus,
} from '../controllers/maintenanceController';
import { authenticate } from '../middleware/authMiddleware';
import { authorize } from '../middleware/roleMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', getMaintenanceRequests);
router.get('/:id', getMaintenanceRequestById);
router.post('/', createMaintenanceRequest);
router.patch(
  '/:id/status',
  authorize('ADMIN', 'PROPERTY_MANAGER', 'PROPERTY_OWNER'),
  updateMaintenanceStatus
);

export default router;
