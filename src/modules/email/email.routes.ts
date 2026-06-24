import { Router } from 'express';
import * as emailController from './email.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Email
 *   description: Email management endpoints
 */

// Send password reset email (public, no auth required)
router.post('/send-password-reset', emailController.sendPasswordReset);

// All email management routes below require authentication
router.use(authenticate);

// Send invitation email (ASSOCIATION_ADMIN and SUPER_ADMIN only)
router.post('/send-invitation', emailController.sendInvitation);

// Send welcome email (authenticated users)
router.post('/send-welcome', emailController.sendWelcome);

// Verify email configuration (SUPER_ADMIN only)
router.get('/verify-config', emailController.verifyEmailConfig);

export default router;
