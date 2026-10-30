import { Router } from 'express';
import {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
} from '../controllers/propertyController';
import { authenticate } from '../middleware/authMiddleware';
import { authorize } from '../middleware/roleMiddleware';
import { validateRequest } from '../middleware/validateMiddleware';
import { propertySchema } from '../validators/propertyValidator';

const router = Router();

// Publicly accessible to search and view properties
router.get('/', getProperties);
router.get('/:id', getPropertyById);

// Protected routes for Property Management
router.post(
  '/',
  authenticate,
  authorize('ADMIN', 'PROPERTY_OWNER', 'PROPERTY_MANAGER'),
  validateRequest(propertySchema),
  createProperty
);

router.put(
  '/:id',
  authenticate,
  authorize('ADMIN', 'PROPERTY_OWNER', 'PROPERTY_MANAGER'),
  updateProperty
);

router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN', 'PROPERTY_MANAGER', 'PROPERTY_OWNER'),
  deleteProperty
);

export default router;
