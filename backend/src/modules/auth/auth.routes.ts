import { Router } from 'express';
import { authController } from './auth.controller';
import { authenticate } from '../../middleware/auth';
import { authLimiter } from '../../middleware/rateLimit';

const router = Router();

// Public routes
router.post('/register', authLimiter, authController.register.bind(authController));
router.post('/login', authLimiter, authController.login.bind(authController));
router.post('/guest-session', authController.createGuestSession.bind(authController));

// Protected routes
router.post('/verify-email', authenticate, authController.verifyEmail.bind(authController));
router.post('/verify-phone', authenticate, authController.verifyPhone.bind(authController));
router.get('/me', authenticate, authController.getMe.bind(authController));

export default router;
