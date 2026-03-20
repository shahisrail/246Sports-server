"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const types_1 = require("../../types");
const users_controller_1 = require("./users.controller");
const router = (0, express_1.Router)();
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
router.post('/association-admin', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(types_1.UserRole.SUPER_ADMIN), users_controller_1.createAssociationAdmin);
// Create Club Admin
// POST /api/v1/users/club-admin
router.post('/club-admin', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(types_1.UserRole.SUPER_ADMIN, types_1.UserRole.ASSOCIATION_ADMIN), users_controller_1.createClubAdmin);
// Create Competition Manager
// POST /api/v1/users/competition-manager
router.post('/competition-manager', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(types_1.UserRole.SUPER_ADMIN, types_1.UserRole.ASSOCIATION_ADMIN), users_controller_1.createCompetitionManager);
// Create Team Manager
// POST /api/v1/users/team-manager
router.post('/team-manager', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(types_1.UserRole.SUPER_ADMIN, types_1.UserRole.ASSOCIATION_ADMIN, types_1.UserRole.CLUB_ADMIN), users_controller_1.createTeamManager);
// Create Coach
// POST /api/v1/users/coach
router.post('/coach', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(types_1.UserRole.SUPER_ADMIN, types_1.UserRole.ASSOCIATION_ADMIN, types_1.UserRole.CLUB_ADMIN), users_controller_1.createCoach);
// Make SUPER_ADMIN
// POST /api/v1/users/super-admin
router.post('/super-admin', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(types_1.UserRole.SUPER_ADMIN), users_controller_1.makeSuperAdmin);
// Login as User
// POST /api/v1/users/login-as
router.post('/login-as', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(types_1.UserRole.SUPER_ADMIN), users_controller_1.loginAsUser);
// List users (with filters)
// GET /api/v1/users
router.get('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(types_1.UserRole.SUPER_ADMIN, types_1.UserRole.ASSOCIATION_ADMIN, types_1.UserRole.CLUB_ADMIN), users_controller_1.getUsers);
// Get user by ID
// GET /api/v1/users/:id
router.get('/:id', auth_middleware_1.authenticate, users_controller_1.getUserById);
// Update user
// PUT /api/v1/users/:id
router.put('/:id', auth_middleware_1.authenticate, users_controller_1.updateUser);
// Delete user (soft delete)
// DELETE /api/v1/users/:id
router.delete('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(types_1.UserRole.SUPER_ADMIN), users_controller_1.deleteUser);
exports.default = router;
//# sourceMappingURL=users.routes.js.map