import { Router } from 'express';
import {
  getAllTenants,
  getTenantById,
  createTenant,
  updateTenant,
  assignTenantProperty,
} from '../controllers/tenantController';
import { authenticate } from '../middleware/authMiddleware';
import { authorize } from '../middleware/roleMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', authorize('ADMIN', 'PROPERTY_MANAGER', 'PROPERTY_OWNER', 'AGENT'), getAllTenants);
router.get('/:id', authorize('ADMIN', 'PROPERTY_MANAGER', 'PROPERTY_OWNER', 'AGENT', 'TENANT'), getTenantById);
router.post('/', authorize('ADMIN', 'PROPERTY_MANAGER'), createTenant);
router.put('/:id', authorize('ADMIN', 'PROPERTY_MANAGER'), updateTenant);
router.post('/assign-property', authorize('ADMIN', 'PROPERTY_MANAGER'), assignTenantProperty);

export default router;
