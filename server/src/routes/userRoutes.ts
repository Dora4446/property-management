import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
} from '../controllers/userController';
import { authenticate } from '../middleware/authMiddleware';
import { authorize } from '../middleware/roleMiddleware';

const router = Router();

// Routes protected by authentication and authorization
router.use(authenticate);

router.get('/', authorize('ADMIN', 'PROPERTY_MANAGER'), getAllUsers);
router.get('/:id', authorize('ADMIN', 'PROPERTY_MANAGER', 'PROPERTY_OWNER'), getUserById);
router.patch('/:id/status', authorize('ADMIN'), updateUserStatus);
router.delete('/:id', authorize('ADMIN'), deleteUser);

export default router;
