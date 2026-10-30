import { Router } from 'express';
import { getVisits, scheduleVisit, updateVisitStatus } from '../controllers/visitController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// Schedule can be submitted by visitors or agents
router.post('/', scheduleVisit);

// View and update are protected
router.use(authenticate);
router.get('/', getVisits);
router.patch('/:id/status', updateVisitStatus);

export default router;
