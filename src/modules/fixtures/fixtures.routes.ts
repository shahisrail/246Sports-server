import { Router } from 'express';
import * as fixturesController from './fixtures.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validateUUID } from '../../middleware/validation.middleware';
import { UserRole } from '../../types';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Fixtures
 *   description: Fixture management endpoints
 */

// Public routes
router.get('/', fixturesController.getFixtures);
router.get('/today', fixturesController.getTodayFixtures);
router.get('/:id', validateUUID('id'), fixturesController.getFixtureById);
router.get('/:id/calendar', validateUUID('id'), fixturesController.getFixtureAsICS);

// Protected routes
router.post(
  '/',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ASSOCIATION_ADMIN, UserRole.COMPETITION_MANAGER),
  fixturesController.createFixture
);
router.put(
  '/:id',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ASSOCIATION_ADMIN, UserRole.COMPETITION_MANAGER),
  validateUUID('id'),
  fixturesController.updateFixture
);
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ASSOCIATION_ADMIN, UserRole.COMPETITION_MANAGER),
  validateUUID('id'),
  fixturesController.deleteFixture
);

export default router;
