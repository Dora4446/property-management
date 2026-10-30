import { Router } from 'express';
import {
  getExpenses,
  createExpense,
  deleteExpense,
  getFinancialSummary,
} from '../controllers/expenseController';
import { authenticate } from '../middleware/authMiddleware';
import { authorize } from '../middleware/roleMiddleware';

const router = Router();

router.use(authenticate);

router.get('/summary', getFinancialSummary);
router.get('/', getExpenses);
router.post('/', authorize('ADMIN', 'PROPERTY_MANAGER', 'PROPERTY_OWNER'), createExpense);
router.delete('/:id', authorize('ADMIN', 'PROPERTY_MANAGER', 'PROPERTY_OWNER'), deleteExpense);

export default router;
