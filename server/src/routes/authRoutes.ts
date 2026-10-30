import { Router } from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  refreshTokenHandler,
} from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateMiddleware';
import { registerSchema, loginSchema, updateProfileSchema } from '../validators/authValidator';

const router = Router();

router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.post('/refresh-token', refreshTokenHandler);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, validateRequest(updateProfileSchema), updateProfile);

export default router;
