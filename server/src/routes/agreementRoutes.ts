import { Router } from 'express';
import {
  getAgreements,
  getAgreementById,
  createAgreement,
  renewAgreement,
  terminateAgreement,
} from '../controllers/agreementController';
import { authenticate } from '../middleware/authMiddleware';
import { authorize } from '../middleware/roleMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', getAgreements);
router.get('/:id', getAgreementById);
router.post('/', authorize('ADMIN', 'PROPERTY_MANAGER', 'PROPERTY_OWNER'), createAgreement);
router.post('/:id/renew', authorize('ADMIN', 'PROPERTY_MANAGER', 'PROPERTY_OWNER'), renewAgreement);
router.post('/:id/terminate', authorize('ADMIN', 'PROPERTY_MANAGER', 'PROPERTY_OWNER'), terminateAgreement);

export default router;
