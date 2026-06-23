import { Router } from 'express';
import * as newsController from './news.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { writeRateLimit } from '../../middleware/rateLimit.middleware';
import { UserRole } from '../../types';
import { validateUUID } from '../../middleware/validation.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: News
 *   description: News management endpoints
 */

// Public routes
router.get('/', newsController.getNews);
router.get('/id/:id', validateUUID('id'), newsController.getNewsById);
router.get('/:slug', newsController.getNewsBySlug);

// Protected routes - require authentication
router.post(
  '/',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ASSOCIATION_ADMIN),
  writeRateLimit,
  newsController.createNews
);
router.put(
  '/:id',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ASSOCIATION_ADMIN),
  writeRateLimit,
  validateUUID('id'),
  newsController.updateNews
);
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ASSOCIATION_ADMIN),
  validateUUID('id'),
  newsController.deleteNews
);

export default router;
