import { Router } from 'express';
import * as teamsController from './teams.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validateUUID } from '../../middleware/validation.middleware';
import { UserRole } from '../../types';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Teams
 *   description: Team management endpoints
 */

// Public routes (for public website)
router.get('/public', teamsController.getPublicTeams);
router.get('/:id', validateUUID('id'), teamsController.getTeamById);

// Protected routes (with tenant isolation)
router.get('/', authenticate, teamsController.getTeams);

// Protected routes
router.post(
  '/',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ASSOCIATION_ADMIN, UserRole.CLUB_ADMIN),
  teamsController.createTeam
);
router.put(
  '/:id',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ASSOCIATION_ADMIN, UserRole.CLUB_ADMIN),
  validateUUID('id'),
  teamsController.updateTeam
);
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ASSOCIATION_ADMIN, UserRole.CLUB_ADMIN),
  validateUUID('id'),
  teamsController.deleteTeam
);

export default router;
