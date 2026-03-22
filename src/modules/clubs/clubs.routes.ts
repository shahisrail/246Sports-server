import { Router } from 'express';
import * as clubsController from './clubs.controller';
import { authenticate, authorize, checkClubAccess } from '../../middleware/auth.middleware';
import { validateUUID, validateCreateClub } from '../../middleware/validation.middleware';
import { uploadImage } from '../../middleware/upload';
import { UserRole } from '../../types';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Clubs
 *   description: Club management endpoints
 */

// Public routes (for public website - NO tenant isolation)
router.get('/public', clubsController.getPublicClubs);
router.post('/test', clubsController.testEndpoint);
router.get('/:id', validateUUID('id'), clubsController.getClubById);

// Protected routes (with tenant isolation)
router.get('/', authenticate, clubsController.getClubs);

// Protected routes
router.post(
  '/',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ASSOCIATION_ADMIN),
  validateCreateClub,
  clubsController.createClub
);
router.put(
  '/:id',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ASSOCIATION_ADMIN, UserRole.CLUB_ADMIN),
  validateUUID('id'),
  checkClubAccess,
  clubsController.updateClub
);
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ASSOCIATION_ADMIN),
  validateUUID('id'),
  clubsController.deleteClub
);

// Dedicated logo upload endpoint
router.post(
  '/:id/logo',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ASSOCIATION_ADMIN, UserRole.CLUB_ADMIN),
  validateUUID('id'),
  checkClubAccess,
  uploadImage.single('logo'),
  clubsController.uploadLogo
);

export default router;
