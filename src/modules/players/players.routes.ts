import { Router } from 'express';
import * as playersController from './players.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validateUUID } from '../../middleware/validation.middleware';
import { UserRole } from '../../types';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Players
 *   description: Player management endpoints
 */

// Public routes
router.get('/', playersController.getPlayers);
router.get('/:id', validateUUID('id'), playersController.getPlayerById);

// Protected routes
router.post(
  '/',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ASSOCIATION_ADMIN, UserRole.CLUB_ADMIN, UserRole.TEAM_MANAGER),
  playersController.createPlayer
);
router.put(
  '/:id',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ASSOCIATION_ADMIN, UserRole.CLUB_ADMIN, UserRole.TEAM_MANAGER),
  validateUUID('id'),
  playersController.updatePlayer
);
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ASSOCIATION_ADMIN, UserRole.CLUB_ADMIN, UserRole.TEAM_MANAGER),
  validateUUID('id'),
  playersController.deletePlayer
);

export default router;
