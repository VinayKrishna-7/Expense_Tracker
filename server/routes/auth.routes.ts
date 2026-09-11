import { Router } from 'express';
import { register, login, getProfile, logout, registerSchema, loginSchema } from '../controllers/authController.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.get('/profile', requireAuth, getProfile);
router.post('/logout', requireAuth, logout);

export default router;
