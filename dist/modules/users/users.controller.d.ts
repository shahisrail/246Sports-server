import { Response } from 'express';
import { AuthRequest } from '../../types';
/**
 * @swagger
 * /users/association-admin:
 *   post:
 *     summary: Create an Association Admin
 *     description: Creates a new user with ASSOCIATION_ADMIN role for a specific association. Only SUPER_ADMIN can create association admins.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - association_id
 *               - email
 *               - name
 *               - password
 *             properties:
 *               association_id:
 *                 type: string
 *                 format: uuid
 *                 description: The ID of the association this admin will manage
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Admin's email address (must be unique)
 *               name:
 *                 type: string
 *                 description: Admin's full name
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 description: Admin's password (minimum 8 characters)
 *     responses:
 *       201:
 *         description: Association admin created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Association admin created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                       enum: [ASSOCIATION_ADMIN]
 *                     association_id:
 *                       type: string
 *                       format: uuid
 *       400:
 *         description: Validation error or association does not exist
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only SUPER_ADMIN can create association admins
 *       409:
 *         description: User with this email already exists
 */
export declare const createAssociationAdmin: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /users/club-admin:
 *   post:
 *     summary: Create a Club Admin
 *     description: Creates a new user with CLUB_ADMIN role for a specific club. Only SUPER_ADMIN or ASSOCIATION_ADMIN can create club admins.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - club_id
 *               - email
 *               - name
 *               - password
 *             properties:
 *               club_id:
 *                 type: string
 *                 format: uuid
 *                 description: The ID of the club this admin will manage
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Admin's email address (must be unique)
 *               name:
 *                 type: string
 *                 description: Admin's full name
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 description: Admin's password (minimum 8 characters)
 *     responses:
 *       201:
 *         description: Club admin created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Club admin created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                       enum: [CLUB_ADMIN]
 *                     club_id:
 *                       type: string
 *                       format: uuid
 *       400:
 *         description: Validation error or club does not exist
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Club not found
 *       409:
 *         description: User with this email already exists
 */
export declare const createClubAdmin: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /users/competition-manager:
 *   post:
 *     summary: Create a Competition Manager
 *     description: Creates a new user with COMPETITION_MANAGER role for a specific competition. Only SUPER_ADMIN or ASSOCIATION_ADMIN can create competition managers.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - competition_id
 *               - email
 *               - name
 *               - password
 *             properties:
 *               competition_id:
 *                 type: string
 *                 format: uuid
 *                 description: The ID of the competition this manager will manage
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Manager's email address (must be unique)
 *               name:
 *                 type: string
 *                 description: Manager's full name
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 description: Manager's password (minimum 8 characters)
 *     responses:
 *       201:
 *         description: Competition manager created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Competition manager created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                       enum: [COMPETITION_MANAGER]
 *                     competition_id:
 *                       type: string
 *                       format: uuid
 *       400:
 *         description: Validation error or competition does not exist
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Competition not found
 *       409:
 *         description: User with this email already exists
 */
export declare const createCompetitionManager: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /users/team-manager:
 *   post:
 *     summary: Create a Team Manager
 *     description: Creates a new user with TEAM_MANAGER role and links them to a team. Only SUPER_ADMIN, ASSOCIATION_ADMIN, or CLUB_ADMIN can create team managers.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - team_id
 *               - email
 *               - name
 *               - password
 *             properties:
 *               team_id:
 *                 type: string
 *                 format: uuid
 *               email:
 *                 type: string
 *                 format: email
 *               name:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       201:
 *         description: Team manager created successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Team not found
 *       409:
 *         description: User already exists
 */
export declare const createTeamManager: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /users/coach:
 *   post:
 *     summary: Create a Coach
 *     description: Creates a new user with COACH role and links them to a team.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - team_id
 *               - email
 *               - name
 *               - password
 *             properties:
 *               team_id:
 *                 type: string
 *                 format: uuid
 *               email:
 *                 type: string
 *                 format: email
 *               name:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Coach created successfully
 */
export declare const createCoach: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /users/create-super-admin:
 *   post:
 *     summary: Create a new SUPER_ADMIN (System Admin)
 *     description: Creates a new user with SUPER_ADMIN role from scratch. Only existing SUPER_ADMIN users can perform this action.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - name
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Super Admin's email address
 *               name:
 *                 type: string
 *                 description: Super Admin's full name
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 description: Super Admin's password (minimum 8 characters)
 *     responses:
 *       201:
 *         description: Super Admin created successfully
 *       400:
 *         description: Invalid input or user already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only SUPER_ADMIN can create Super Admins
 */
export declare const createSuperAdmin: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /users/super-admin:
 *   post:
 *     summary: Make a user a SUPER_ADMIN (System Admin)
 *     description: Promotes an existing user to SUPER_ADMIN role. Only existing SUPER_ADMIN users can perform this action.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 description: The ID of the user to promote to SUPER_ADMIN
 *     responses:
 *       200:
 *         description: User promoted to SUPER_ADMIN successfully
 *       400:
 *         description: Invalid user ID or user is already SUPER_ADMIN
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only SUPER_ADMIN can promote users
 *       404:
 *         description: User not found
 */
export declare const makeSuperAdmin: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /users/login-as:
 *   post:
 *     summary: Login as a different user (Admin only)
 *     description: Generates access tokens for a specified user. Only SUPER_ADMIN can use this to login as other users for support/debugging.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 description: The ID of the user to login as
 *     responses:
 *       200:
 *         description: Login successful, tokens generated
 *       400:
 *         description: Invalid user ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only SUPER_ADMIN can login as other users
 *       404:
 *         description: User not found
 */
export declare const loginAsUser: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /users:
 *   get:
 *     summary: List all users
 *     description: Retrieves a list of users with optional filtering. Only SUPER_ADMIN and ASSOCIATION_ADMIN can access this endpoint.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [SUPER_ADMIN, ASSOCIATION_ADMIN, CLUB_ADMIN, COMPETITION_MANAGER, TEAM_MANAGER]
 *         description: Filter users by role
 *       - in: query
 *         name: association_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter users by association
 *       - in: query
 *         name: club_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter users by club
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       role:
 *                         type: string
 *                       association_id:
 *                         type: string
 *                         format: uuid
 *                         nullable: true
 *                       club_id:
 *                         type: string
 *                         format: uuid
 *                         nullable: true
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
export declare const getUsers: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Retrieves a specific user by ID. Users can only view their own profile or users within their scope.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: User not found
 */
export declare const getUserById: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update user
 *     description: Updates a user's information. Users can update their own profile. SUPER_ADMIN can update any user.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               role:
 *                 type: string
 *                 enum: [SUPER_ADMIN, ASSOCIATION_ADMIN, CLUB_ADMIN, COMPETITION_MANAGER, TEAM_MANAGER, COACH]
 *               association_id:
 *                 type: string
 *                 format: uuid
 *               club_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
export declare const updateUser: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete user
 *     description: Soft deletes a user. Only SUPER_ADMIN can delete users.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only SUPER_ADMIN can delete users
 *       404:
 *         description: User not found
 */
export declare const deleteUser: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=users.controller.d.ts.map