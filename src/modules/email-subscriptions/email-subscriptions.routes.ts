import { Router } from 'express';
import * as emailSubscriptionsController from './email-subscriptions.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { UserRole } from '../../types';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Email Subscriptions
 *   description: Email newsletter subscription management endpoints
 */

// Public routes
router.post('/subscribe', emailSubscriptionsController.subscribe);
router.post('/unsubscribe', emailSubscriptionsController.unsubscribe);
router.get('/status', emailSubscriptionsController.getSubscriptionStatus);

// Protected routes (require authentication)
router.get(
  '/',
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  emailSubscriptionsController.getAllSubscribers
);

router.get(
  '/association/:associationId',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ASSOCIATION_ADMIN),
  emailSubscriptionsController.getAssociationSubscribers
);

export default router;
