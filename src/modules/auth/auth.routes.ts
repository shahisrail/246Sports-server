import { Router } from 'express';
import { register, login, getProfile, changePassword } from './auth.controller';
import { validateResetToken, confirmResetPassword } from './reset-password.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validateRegister, validateLogin } from '../../middleware/validation.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

// Password reset routes (public)
router.post('/reset-password/validate', validateResetToken);
router.post('/reset-password/confirm', confirmResetPassword);

// Protected routes
router.get('/me', authenticate, getProfile);
router.post('/change-password', authenticate, changePassword);

export default router;
