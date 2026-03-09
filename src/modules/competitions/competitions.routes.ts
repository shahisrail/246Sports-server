import { Router } from 'express';
import * as competitionsController from './competitions.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validateUUID } from '../../middleware/validation.middleware';
import { UserRole } from '../../types';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Competitions
 *   description: Competition management endpoints
 */

// Public routes
router.get('/', competitionsController.getCompetitions);
router.get('/:id', validateUUID('id'), competitionsController.getCompetitionById);

// Protected routes
router.post(
  '/',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ASSOCIATION_ADMIN, UserRole.COMPETITION_MANAGER),
  competitionsController.createCompetition
);
router.put(
  '/:id',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ASSOCIATION_ADMIN, UserRole.COMPETITION_MANAGER),
  validateUUID('id'),
  competitionsController.updateCompetition
);
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ASSOCIATION_ADMIN),
  validateUUID('id'),
  competitionsController.deleteCompetition
);

export default router;
