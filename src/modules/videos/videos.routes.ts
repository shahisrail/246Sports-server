import { Router } from 'express';
import * as videosController from './videos.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { writeRateLimit } from '../../middleware/rateLimit.middleware';
import { UserRole } from '../../types';
import { validateUUID } from '../../middleware/validation.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Videos
 *   description: Video management endpoints
 */

// Public routes (anyone can view published videos)
router.get('/', videosController.getVideos);
router.get('/:id', videosController.getVideoById);

// Protected routes - require authentication and admin role
router.post(
  '/',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ASSOCIATION_ADMIN),
  writeRateLimit,
  videosController.createVideo
);
router.put(
  '/:id',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ASSOCIATION_ADMIN),
  writeRateLimit,
  validateUUID('id'),
  videosController.updateVideo
);
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ASSOCIATION_ADMIN),
  validateUUID('id'),
  videosController.deleteVideo
);

export default router;
