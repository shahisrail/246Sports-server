import { Router } from 'express';
import * as standingsController from './standings.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validateUUID } from '../../middleware/validation.middleware';
import { UserRole } from '../../types';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Standings
 *   description: Standings endpoints
 */

// Public routes
router.get(
  '/competition/:competitionId',
  validateUUID('competitionId'),
  standingsController.getStandingsByCompetition
);

// Protected routes
router.post(
  '/recalculate/:competitionId',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ASSOCIATION_ADMIN),
  validateUUID('competitionId'),
  standingsController.recalculateStandings
);

export default router;
