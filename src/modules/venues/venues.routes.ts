import { Router } from 'express';
import * as venuesController from './venues.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validateUUID } from '../../middleware/validation.middleware';
import { UserRole } from '../../types';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Venues
 *   description: Venue management endpoints
 */

// Public routes
router.get('/', venuesController.getVenues);
router.get('/:id', validateUUID('id'), venuesController.getVenueById);

// Protected routes
router.post(
  '/',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ASSOCIATION_ADMIN),
  venuesController.createVenue
);
router.put(
  '/:id',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ASSOCIATION_ADMIN),
  validateUUID('id'),
  venuesController.updateVenue
);
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ASSOCIATION_ADMIN),
  validateUUID('id'),
  venuesController.deleteVenue
);

export default router;
