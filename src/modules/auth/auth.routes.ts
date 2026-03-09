import { Router } from 'express';
import { register, login, getProfile, changePassword } from './auth.controller';
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

// Protected routes
router.get('/me', authenticate, getProfile);
router.post('/change-password', authenticate, changePassword);

export default router;
