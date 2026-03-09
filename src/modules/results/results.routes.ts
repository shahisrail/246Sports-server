import { Router } from 'express';
import * as resultsController from './results.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validateUUID } from '../../middleware/validation.middleware';
import { UserRole } from '../../types';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Results
 *   description: Results management endpoints
 */

// Public routes
router.get('/', resultsController.getResults);
router.get('/fixture/:fixtureId', validateUUID('fixtureId'), resultsController.getResultByFixtureId);

// Protected routes
router.post(
  '/',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ASSOCIATION_ADMIN, UserRole.COMPETITION_MANAGER, UserRole.CLUB_ADMIN, UserRole.TEAM_MANAGER),
  resultsController.submitResult
);
router.put(
  '/:id/confirm',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ASSOCIATION_ADMIN, UserRole.COMPETITION_MANAGER),
  validateUUID('id'),
  resultsController.confirmResult
);
router.put(
  '/:id/publish',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ASSOCIATION_ADMIN, UserRole.COMPETITION_MANAGER),
  validateUUID('id'),
  resultsController.publishResult
);

export default router;
