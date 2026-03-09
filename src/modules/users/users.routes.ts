import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { UserRole } from '../../types';
import {
  createAssociationAdmin,
  createClubAdmin,
  createCompetitionManager,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from './users.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management endpoints for creating and managing users with different roles
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

// Create Association Admin
// POST /api/v1/users/association-admin
router.post(
  '/association-admin',
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  createAssociationAdmin
);

// Create Club Admin
// POST /api/v1/users/club-admin
router.post(
  '/club-admin',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ASSOCIATION_ADMIN),
  createClubAdmin
);

// Create Competition Manager
// POST /api/v1/users/competition-manager
router.post(
  '/competition-manager',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ASSOCIATION_ADMIN),
  createCompetitionManager
);

// List users (with filters)
// GET /api/v1/users
router.get(
  '/',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ASSOCIATION_ADMIN, UserRole.CLUB_ADMIN),
  getUsers
);

// Get user by ID
// GET /api/v1/users/:id
router.get(
  '/:id',
  authenticate,
  getUserById
);

// Update user
// PUT /api/v1/users/:id
router.put(
  '/:id',
  authenticate,
  updateUser
);

// Delete user (soft delete)
// DELETE /api/v1/users/:id
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  deleteUser
);

export default router;
