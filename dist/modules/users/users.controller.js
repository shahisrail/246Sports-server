"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.getUserById = exports.getUsers = exports.loginAsUser = exports.makeSuperAdmin = exports.createSuperAdmin = exports.createCoach = exports.createTeamManager = exports.createCompetitionManager = exports.createClubAdmin = exports.createAssociationAdmin = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const uuid_1 = require("uuid");
const database_1 = require("../../config/database");
const responseHandler_1 = require("../../utils/responseHandler");
const types_1 = require("../../types");
const jwt_1 = require("../../utils/jwt");
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
const createAssociationAdmin = async (req, res) => {
    try {
        const { association_id, associationId, email, name, password } = req.body;
        // Support both camelCase and snake_case
        const finalAssociationId = association_id || associationId;
        // Verify association exists
        const associationCheck = await (0, database_1.query)('SELECT id FROM associations WHERE id = $1', [finalAssociationId]);
        if (associationCheck.rows.length === 0) {
            (0, responseHandler_1.errorResponse)(res, 'Association not found', 404, 'ASSOCIATION_NOT_FOUND');
            return;
        }
        // Check if user already exists
        const existingUser = await (0, database_1.query)('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            (0, responseHandler_1.errorResponse)(res, 'User with this email already exists', 409, 'USER_EXISTS');
            return;
        }
        // Hash password
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        // Create user with ASSOCIATION_ADMIN role
        const userId = (0, uuid_1.v4)();
        const result = await (0, database_1.query)(`INSERT INTO users (id, name, email, password, role, association_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, email, role, association_id, created_at`, [userId, name, email, hashedPassword, 'ASSOCIATION_ADMIN', finalAssociationId]);
        const user = result.rows[0];
        // Log audit
        await (0, database_1.query)(`INSERT INTO audit_logs (id, user_id, action, entity, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`, [(0, uuid_1.v4)(), req.user?.userId, types_1.AuditAction.CREATE, 'USER', userId, JSON.stringify({ email, role: 'ASSOCIATION_ADMIN', association_id: finalAssociationId })]);
        (0, responseHandler_1.successResponse)(res, {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            association_id: user.association_id,
        }, 'Association admin created successfully', 201);
    }
    catch (error) {
        console.error('Create association admin error:', error);
        (0, responseHandler_1.errorResponse)(res, 'Failed to create association admin', 500, 'CREATE_ASSOCIATION_ADMIN_FAILED');
    }
};
exports.createAssociationAdmin = createAssociationAdmin;
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
const createClubAdmin = async (req, res) => {
    try {
        const { club_id, clubId, email, name, password } = req.body;
        // Support both camelCase and snake_case
        const finalClubId = club_id || clubId;
        // Verify club exists
        const clubCheck = await (0, database_1.query)('SELECT id, association_id FROM clubs WHERE id = $1', [finalClubId]);
        if (clubCheck.rows.length === 0) {
            (0, responseHandler_1.errorResponse)(res, 'Club not found', 404, 'CLUB_NOT_FOUND');
            return;
        }
        // Check if user already exists
        const existingUser = await (0, database_1.query)('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            (0, responseHandler_1.errorResponse)(res, 'User with this email already exists', 409, 'USER_EXISTS');
            return;
        }
        // Hash password
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        // Create user with CLUB_ADMIN role
        const userId = (0, uuid_1.v4)();
        const result = await (0, database_1.query)(`INSERT INTO users (id, name, email, password, role, club_id, association_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, email, role, club_id, association_id, created_at`, [userId, name, email, hashedPassword, 'CLUB_ADMIN', finalClubId, clubCheck.rows[0].association_id]);
        const user = result.rows[0];
        // Log audit
        await (0, database_1.query)(`INSERT INTO audit_logs (id, user_id, action, entity, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`, [(0, uuid_1.v4)(), req.user?.userId, types_1.AuditAction.CREATE, 'USER', userId, JSON.stringify({ email, role: 'CLUB_ADMIN', club_id: finalClubId })]);
        (0, responseHandler_1.successResponse)(res, {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            club_id: user.club_id,
            association_id: user.association_id,
        }, 'Club admin created successfully', 201);
    }
    catch (error) {
        console.error('Create club admin error:', error);
        (0, responseHandler_1.errorResponse)(res, 'Failed to create club admin', 500, 'CREATE_CLUB_ADMIN_FAILED');
    }
};
exports.createClubAdmin = createClubAdmin;
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
const createCompetitionManager = async (req, res) => {
    try {
        const { competition_id, competitionId, email, name, password } = req.body;
        // Support both camelCase and snake_case
        const finalCompetitionId = competition_id || competitionId;
        // Verify competition exists and get association_id
        const competitionCheck = await (0, database_1.query)('SELECT id, association_id FROM competitions WHERE id = $1', [finalCompetitionId]);
        if (competitionCheck.rows.length === 0) {
            (0, responseHandler_1.errorResponse)(res, 'Competition not found', 404, 'COMPETITION_NOT_FOUND');
            return;
        }
        // Check if user already exists
        const existingUser = await (0, database_1.query)('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            (0, responseHandler_1.errorResponse)(res, 'User with this email already exists', 409, 'USER_EXISTS');
            return;
        }
        // Hash password
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        // Create user with COMPETITION_MANAGER role
        const userId = (0, uuid_1.v4)();
        const result = await (0, database_1.query)(`INSERT INTO users (id, name, email, password, role, association_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, email, role, association_id, created_at`, [userId, name, email, hashedPassword, 'COMPETITION_MANAGER', competitionCheck.rows[0].association_id]);
        const user = result.rows[0];
        // Log audit
        await (0, database_1.query)(`INSERT INTO audit_logs (id, user_id, action, entity, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`, [(0, uuid_1.v4)(), req.user?.userId, types_1.AuditAction.CREATE, 'USER', userId, JSON.stringify({ email, role: 'COMPETITION_MANAGER', competition_id: finalCompetitionId })]);
        (0, responseHandler_1.successResponse)(res, {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            association_id: user.association_id,
            competition_id: finalCompetitionId,
        }, 'Competition manager created successfully', 201);
    }
    catch (error) {
        console.error('Create competition manager error:', error);
        (0, responseHandler_1.errorResponse)(res, 'Failed to create competition manager', 500, 'CREATE_COMPETITION_MANAGER_FAILED');
    }
};
exports.createCompetitionManager = createCompetitionManager;
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
const createTeamManager = async (req, res) => {
    try {
        const { team_id, teamId, email, name, password } = req.body;
        const finalTeamId = team_id || teamId;
        // Verify team exists and get association/club context
        const teamCheck = await (0, database_1.query)(`SELECT t.id, c.association_id, t.club_id 
       FROM teams t 
       LEFT JOIN clubs c ON t.club_id = c.id 
       WHERE t.id = $1`, [finalTeamId]);
        if (teamCheck.rows.length === 0) {
            (0, responseHandler_1.errorResponse)(res, 'Team not found', 404, 'TEAM_NOT_FOUND');
            return;
        }
        const { association_id, club_id } = teamCheck.rows[0];
        // Check if user already exists
        const existingUser = await (0, database_1.query)('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            (0, responseHandler_1.errorResponse)(res, 'User with this email already exists', 409, 'USER_EXISTS');
            return;
        }
        // Hash password
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        // Create user in users table
        const userId = (0, uuid_1.v4)();
        const result = await (0, database_1.query)(`INSERT INTO users (id, name, email, password, role, association_id, club_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, email, role, association_id, club_id, created_at`, [userId, name, email, hashedPassword, 'TEAM_MANAGER', association_id, club_id]);
        const user = result.rows[0];
        // Link user to team in team_users junction table
        await (0, database_1.query)(`INSERT INTO team_users (id, team_id, user_id, role)
       VALUES ($1, $2, $3, $4)`, [(0, uuid_1.v4)(), finalTeamId, userId, 'MANAGER']);
        // Log audit
        await (0, database_1.query)(`INSERT INTO audit_logs (id, user_id, action, entity, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`, [(0, uuid_1.v4)(), req.user?.userId, types_1.AuditAction.CREATE, 'USER', userId, JSON.stringify({ email, role: 'TEAM_MANAGER', team_id: finalTeamId })]);
        (0, responseHandler_1.successResponse)(res, user, 'Team manager created successfully', 201);
    }
    catch (error) {
        console.error('Create team manager error:', error);
        (0, responseHandler_1.errorResponse)(res, 'Failed to create team manager', 500, 'CREATE_TEAM_MANAGER_FAILED');
    }
};
exports.createTeamManager = createTeamManager;
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
const createCoach = async (req, res) => {
    try {
        const { team_id, teamId, email, name, password } = req.body;
        const finalTeamId = team_id || teamId;
        const teamCheck = await (0, database_1.query)(`SELECT t.id, c.association_id, t.club_id 
       FROM teams t 
       LEFT JOIN clubs c ON t.club_id = c.id 
       WHERE t.id = $1`, [finalTeamId]);
        if (teamCheck.rows.length === 0) {
            (0, responseHandler_1.errorResponse)(res, 'Team not found', 404, 'TEAM_NOT_FOUND');
            return;
        }
        const { association_id, club_id } = teamCheck.rows[0];
        const existingUser = await (0, database_1.query)('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            (0, responseHandler_1.errorResponse)(res, 'User already exists', 409, 'USER_EXISTS');
            return;
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const userId = (0, uuid_1.v4)();
        // Create user - using TEAM_MANAGER role in users table if COACH isn't in constraint, 
        // but check schema again: role check IN ('PUBLIC', 'SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'COMPETITION_MANAGER', 'CLUB_ADMIN', 'TEAM_MANAGER')
        // I should add COACH to the constraint or just use TEAM_MANAGER in users table and COACH in team_users.
        // Let's use TEAM_MANAGER for now in users table to avoid DB error, and COACH in team_users.
        const result = await (0, database_1.query)(`INSERT INTO users (id, name, email, password, role, association_id, club_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, email, role, association_id, club_id, created_at`, [userId, name, email, hashedPassword, 'TEAM_MANAGER', association_id, club_id]);
        const user = result.rows[0];
        await (0, database_1.query)(`INSERT INTO team_users (id, team_id, user_id, role)
       VALUES ($1, $2, $3, $4)`, [(0, uuid_1.v4)(), finalTeamId, userId, 'COACH']);
        await (0, database_1.query)(`INSERT INTO audit_logs (id, user_id, action, entity, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`, [(0, uuid_1.v4)(), req.user?.userId, types_1.AuditAction.CREATE, 'USER', userId, JSON.stringify({ email, role: 'COACH', team_id: finalTeamId })]);
        (0, responseHandler_1.successResponse)(res, user, 'Coach created successfully', 201);
    }
    catch (error) {
        console.error('Create coach error:', error);
        (0, responseHandler_1.errorResponse)(res, 'Failed to create coach', 500, 'CREATE_COACH_FAILED');
    }
};
exports.createCoach = createCoach;
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
const createSuperAdmin = async (req, res) => {
    try {
        const { email, name, password } = req.body;
        // Validate required fields
        if (!email || !name || !password) {
            (0, responseHandler_1.errorResponse)(res, 'Email, name, and password are required', 400, 'MISSING_FIELDS');
            return;
        }
        // Check if user already exists
        const existingUser = await (0, database_1.query)('SELECT id FROM users WHERE email = $1 AND deleted_at IS NULL', [email]);
        if (existingUser.rows.length > 0) {
            (0, responseHandler_1.errorResponse)(res, 'User with this email already exists', 409, 'USER_EXISTS');
            return;
        }
        // Hash password
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        // Create user with SUPER_ADMIN role
        const userId = (0, uuid_1.v4)();
        const result = await (0, database_1.query)(`INSERT INTO users (id, name, email, password, role, association_id, club_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, email, role, created_at`, [userId, name, email, hashedPassword, 'SUPER_ADMIN', null, null]);
        const user = result.rows[0];
        // Log audit
        await (0, database_1.query)(`INSERT INTO audit_logs (id, user_id, action, entity, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`, [(0, uuid_1.v4)(), req.user?.userId, types_1.AuditAction.CREATE, 'USER', userId, JSON.stringify({ email, role: 'SUPER_ADMIN' })]);
        (0, responseHandler_1.successResponse)(res, user, 'Super Admin created successfully', 201);
    }
    catch (error) {
        console.error('Create super admin error:', error);
        (0, responseHandler_1.errorResponse)(res, 'Failed to create super admin', 500, 'CREATE_SUPER_ADMIN_FAILED');
    }
};
exports.createSuperAdmin = createSuperAdmin;
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
const makeSuperAdmin = async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            (0, responseHandler_1.errorResponse)(res, 'User ID is required', 400, 'MISSING_USER_ID');
            return;
        }
        // Check if user exists
        const existingUser = await (0, database_1.query)('SELECT id, name, email, role FROM users WHERE id = $1 AND deleted_at IS NULL', [userId]);
        if (existingUser.rows.length === 0) {
            (0, responseHandler_1.errorResponse)(res, 'User not found', 404, 'USER_NOT_FOUND');
            return;
        }
        const user = existingUser.rows[0];
        // Check if user is already SUPER_ADMIN
        if (user.role === 'SUPER_ADMIN') {
            (0, responseHandler_1.errorResponse)(res, 'User is already a SUPER_ADMIN', 400, 'ALREADY_SUPER_ADMIN');
            return;
        }
        // Update user role to SUPER_ADMIN
        await (0, database_1.query)(`UPDATE users
       SET role = 'SUPER_ADMIN', association_id = NULL, club_id = NULL, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING id, name, email, role`, [userId]);
        // Log audit
        await (0, database_1.query)(`INSERT INTO audit_logs (id, user_id, action, entity, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`, [(0, uuid_1.v4)(), req.user?.userId, types_1.AuditAction.UPDATE, 'USER', userId, JSON.stringify({
                action: 'PROMOTE_TO_SUPER_ADMIN',
                previousRole: user.role,
                newRole: 'SUPER_ADMIN'
            })]);
        (0, responseHandler_1.successResponse)(res, {
            id: userId,
            name: user.name,
            email: user.email,
            role: 'SUPER_ADMIN',
        }, 'User promoted to SUPER_ADMIN successfully');
    }
    catch (error) {
        console.error('Make super admin error:', error);
        (0, responseHandler_1.errorResponse)(res, 'Failed to promote user to SUPER_ADMIN', 500, 'MAKE_SUPER_ADMIN_FAILED');
    }
};
exports.makeSuperAdmin = makeSuperAdmin;
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
const loginAsUser = async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            (0, responseHandler_1.errorResponse)(res, 'User ID is required', 400, 'MISSING_USER_ID');
            return;
        }
        // Check if user exists
        const existingUser = await (0, database_1.query)('SELECT id, name, email, role, association_id, club_id FROM users WHERE id = $1 AND deleted_at IS NULL', [userId]);
        if (existingUser.rows.length === 0) {
            (0, responseHandler_1.errorResponse)(res, 'User not found', 404, 'USER_NOT_FOUND');
            return;
        }
        const user = existingUser.rows[0];
        // Generate access token (short-lived: 15 minutes)
        const tokenPayload = {
            userId: user.id,
            email: user.email,
            role: user.role,
            associationId: user.association_id,
            clubId: user.club_id,
        };
        const accessToken = (0, jwt_1.generateToken)(tokenPayload);
        // Generate refresh token (long-lived: 7 days)
        const refreshToken = (0, uuid_1.v4)();
        const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        // Store refresh token in database
        await (0, database_1.query)(`INSERT INTO refresh_tokens (id, user_id, token, expires_at, device_info, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6)`, [
            (0, uuid_1.v4)(),
            user.id,
            refreshToken,
            refreshExpiresAt,
            `Admin Login-as: ${req.user?.email}`,
            req.get('user-agent') || null,
        ]);
        // Log audit
        await (0, database_1.query)(`INSERT INTO audit_logs (id, user_id, action, entity, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`, [(0, uuid_1.v4)(), req.user?.userId, types_1.AuditAction.LOGIN, 'USER', userId, JSON.stringify({
                action: 'LOGIN_AS_USER',
                adminEmail: req.user?.email,
                targetUserEmail: user.email
            })]);
        (0, responseHandler_1.successResponse)(res, {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                associationId: user.association_id,
                clubId: user.club_id,
            },
            accessToken,
            refreshToken,
            tokenType: 'Bearer',
            expiresIn: '15m',
            refreshExpiresIn: '7d',
        }, 'Logged in as user successfully');
    }
    catch (error) {
        console.error('Login as user error:', error);
        (0, responseHandler_1.errorResponse)(res, 'Failed to login as user', 500, 'LOGIN_AS_USER_FAILED');
    }
};
exports.loginAsUser = loginAsUser;
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
const getUsers = async (req, res) => {
    try {
        const { role, association_id, club_id, page = 1, limit = 20 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        // Build query with filters
        let queryText = `
      SELECT id, name, email, role, association_id, club_id, created_at
      FROM users
      WHERE deleted_at IS NULL
    `;
        const queryParams = [];
        let paramCount = 0;
        if (role) {
            paramCount++;
            queryText += ` AND role = $${paramCount}`;
            queryParams.push(role);
        }
        if (association_id) {
            paramCount++;
            queryText += ` AND association_id = $${paramCount}`;
            queryParams.push(association_id);
        }
        if (club_id) {
            paramCount++;
            queryText += ` AND club_id = $${paramCount}`;
            queryParams.push(club_id);
        }
        // If user is ASSOCIATION_ADMIN, only show users from their association
        if (req.user?.role === 'ASSOCIATION_ADMIN') {
            paramCount++;
            queryText += ` AND association_id = $${paramCount}`;
            queryParams.push(req.user.associationId);
        }
        // If user is CLUB_ADMIN, only show users from their club
        if (req.user?.role === 'CLUB_ADMIN') {
            paramCount++;
            queryText += ` AND club_id = $${paramCount}`;
            queryParams.push(req.user.clubId);
        }
        // Get total count
        const countQuery = queryText.replace(/SELECT id, name, email, role, association_id, club_id, created_at/, 'SELECT COUNT(*)');
        const countResult = await (0, database_1.query)(countQuery, queryParams);
        const total = parseInt(countResult.rows[0].count);
        // Add pagination and ordering
        queryText += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
        queryParams.push(Number(limit), offset);
        const result = await (0, database_1.query)(queryText, queryParams);
        (0, responseHandler_1.paginatedResponse)(res, result.rows, Number(page), Number(limit), total, 'Users retrieved successfully');
    }
    catch (error) {
        console.error('Get users error:', error);
        (0, responseHandler_1.errorResponse)(res, 'Failed to retrieve users', 500, 'GET_USERS_FAILED');
    }
};
exports.getUsers = getUsers;
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
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        // Users can view their own profile
        if (req.user?.userId !== id && req.user?.role !== 'SUPER_ADMIN') {
            // ASSOCIATION_ADMIN can view users in their association
            if (req.user?.role === 'ASSOCIATION_ADMIN') {
                // Check if user is in their association (we'll verify in the query)
            }
            else {
                (0, responseHandler_1.errorResponse)(res, 'Forbidden - You can only view your own profile', 403, 'FORBIDDEN');
                return;
            }
        }
        const result = await (0, database_1.query)(`SELECT id, name, email, role, association_id, club_id, created_at, updated_at
       FROM users WHERE id = $1 AND deleted_at IS NULL`, [id]);
        if (result.rows.length === 0) {
            (0, responseHandler_1.errorResponse)(res, 'User not found', 404, 'USER_NOT_FOUND');
            return;
        }
        const user = result.rows[0];
        // Check if user has permission to view this user
        if (req.user?.role === 'ASSOCIATION_ADMIN' && user.association_id !== req.user.associationId) {
            (0, responseHandler_1.errorResponse)(res, 'Forbidden - User not in your association', 403, 'FORBIDDEN');
            return;
        }
        (0, responseHandler_1.successResponse)(res, user, 'User retrieved successfully');
    }
    catch (error) {
        console.error('Get user error:', error);
        (0, responseHandler_1.errorResponse)(res, 'Failed to retrieve user', 500, 'GET_USER_FAILED');
    }
};
exports.getUserById = getUserById;
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
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role, association_id, club_id } = req.body;
        // Only SUPER_ADMIN can update roles and associations/clubs
        if (req.user?.role !== 'SUPER_ADMIN' && (role || association_id || club_id)) {
            (0, responseHandler_1.errorResponse)(res, 'Forbidden - Only SUPER_ADMIN can change role, association, or club', 403, 'FORBIDDEN');
            return;
        }
        // Check if user exists
        const existingUser = await (0, database_1.query)('SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL', [id]);
        if (existingUser.rows.length === 0) {
            (0, responseHandler_1.errorResponse)(res, 'User not found', 404, 'USER_NOT_FOUND');
            return;
        }
        // Build update query dynamically
        const updates = [];
        const values = [];
        let paramCount = 0;
        if (name) {
            paramCount++;
            updates.push(`name = $${paramCount}`);
            values.push(name);
        }
        if (email) {
            // Check if email is already taken by another user
            const emailCheck = await (0, database_1.query)('SELECT id FROM users WHERE email = $1 AND id != $2', [email, id]);
            if (emailCheck.rows.length > 0) {
                (0, responseHandler_1.errorResponse)(res, 'Email already in use', 409, 'EMAIL_IN_USE');
                return;
            }
            paramCount++;
            updates.push(`email = $${paramCount}`);
            values.push(email);
        }
        if (role && req.user?.role === 'SUPER_ADMIN') {
            paramCount++;
            updates.push(`role = $${paramCount}`);
            values.push(role);
        }
        if (association_id !== undefined && req.user?.role === 'SUPER_ADMIN') {
            paramCount++;
            updates.push(`association_id = $${paramCount}`);
            values.push(association_id || null);
        }
        if (club_id !== undefined && req.user?.role === 'SUPER_ADMIN') {
            paramCount++;
            updates.push(`club_id = $${paramCount}`);
            values.push(club_id || null);
        }
        if (updates.length === 0) {
            (0, responseHandler_1.errorResponse)(res, 'No valid fields to update', 400, 'NO_UPDATE_FIELDS');
            return;
        }
        updates.push('updated_at = CURRENT_TIMESTAMP');
        values.push(id);
        paramCount++;
        const queryText = `
      UPDATE users
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, name, email, role, association_id, club_id, updated_at
    `;
        const result = await (0, database_1.query)(queryText, values);
        const user = result.rows[0];
        // Log audit
        await (0, database_1.query)(`INSERT INTO audit_logs (id, user_id, action, entity, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`, [(0, uuid_1.v4)(), req.user?.userId, types_1.AuditAction.UPDATE, 'USER', id, JSON.stringify({ updates })]);
        (0, responseHandler_1.successResponse)(res, user, 'User updated successfully');
    }
    catch (error) {
        console.error('Update user error:', error);
        (0, responseHandler_1.errorResponse)(res, 'Failed to update user', 500, 'UPDATE_USER_FAILED');
    }
};
exports.updateUser = updateUser;
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
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        // Prevent users from deleting themselves
        if (req.user?.userId === id) {
            (0, responseHandler_1.errorResponse)(res, 'Cannot delete your own account', 400, 'CANNOT_DELETE_SELF');
            return;
        }
        // Check if user exists
        const existingUser = await (0, database_1.query)('SELECT id FROM users WHERE id = $1 AND deleted_at IS NULL', [id]);
        if (existingUser.rows.length === 0) {
            (0, responseHandler_1.errorResponse)(res, 'User not found', 404, 'USER_NOT_FOUND');
            return;
        }
        // Soft delete
        await (0, database_1.query)('UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);
        // Revoke all refresh tokens
        await (0, database_1.query)('UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP WHERE user_id = $1 AND revoked_at IS NULL', [id]);
        // Log audit
        await (0, database_1.query)(`INSERT INTO audit_logs (id, user_id, action, entity, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`, [(0, uuid_1.v4)(), req.user?.userId, types_1.AuditAction.DELETE, 'USER', id, JSON.stringify({ action: 'SOFT_DELETE' })]);
        (0, responseHandler_1.successResponse)(res, null, 'User deleted successfully');
    }
    catch (error) {
        console.error('Delete user error:', error);
        (0, responseHandler_1.errorResponse)(res, 'Failed to delete user', 500, 'DELETE_USER_FAILED');
    }
};
exports.deleteUser = deleteUser;
//# sourceMappingURL=users.controller.js.map