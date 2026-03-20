"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.getProfile = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const uuid_1 = require("uuid");
const database_1 = require("../../config/database");
const jwt_1 = require("../../utils/jwt");
const responseHandler_1 = require("../../utils/responseHandler");
const types_1 = require("../../types");
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               role:
 *                 type: string
 *                 enum: [SUPER_ADMIN, ASSOCIATION_ADMIN, COMPETITION_MANAGER, CLUB_ADMIN, TEAM_MANAGER]
 *               association_id:
 *                 type: string
 *                 format: uuid
 *               club_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: User already exists
 */
const register = async (req, res) => {
    try {
        const { name, email, password, role, association_id, club_id } = req.body;
        // Check if user already exists
        const existingUser = await (0, database_1.query)('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            (0, responseHandler_1.errorResponse)(res, 'User with this email already exists', 409, 'USER_EXISTS');
            return;
        }
        // Hash password
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        // Create user
        const userId = (0, uuid_1.v4)();
        const result = await (0, database_1.query)(`INSERT INTO users (id, name, email, password, role, association_id, club_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, email, role, association_id, club_id, created_at`, [userId, name, email, hashedPassword, role, association_id || null, club_id || null]);
        const user = result.rows[0];
        // Generate token
        const token = (0, jwt_1.generateToken)({
            userId: user.id,
            email: user.email,
            role: user.role,
            associationId: user.association_id,
            clubId: user.club_id,
        });
        // Log audit
        await (0, database_1.query)(`INSERT INTO audit_logs (id, user_id, action, entity, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`, [(0, uuid_1.v4)(), userId, types_1.AuditAction.CREATE, 'USER', userId, JSON.stringify({ email, role })]);
        (0, responseHandler_1.successResponse)(res, {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                association_id: user.association_id,
                club_id: user.club_id,
            },
            token,
        }, 'User registered successfully', 201);
    }
    catch (error) {
        console.error('Register error:', error);
        (0, responseHandler_1.errorResponse)(res, 'Failed to register user', 500, 'REGISTER_FAILED');
    }
};
exports.register = register;
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Find user
        const result = await (0, database_1.query)('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            (0, responseHandler_1.errorResponse)(res, 'Invalid email or password', 401, 'INVALID_CREDENTIALS');
            return;
        }
        const user = result.rows[0];
        // Verify password
        const isValidPassword = await bcrypt_1.default.compare(password, user.password);
        if (!isValidPassword) {
            (0, responseHandler_1.errorResponse)(res, 'Invalid email or password', 401, 'INVALID_CREDENTIALS');
            return;
        }
        // Generate token
        const token = (0, jwt_1.generateToken)({
            userId: user.id,
            email: user.email,
            role: user.role,
            associationId: user.association_id,
            clubId: user.club_id,
        });
        // Log audit
        await (0, database_1.query)(`INSERT INTO audit_logs (id, user_id, action, entity, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`, [(0, uuid_1.v4)(), user.id, types_1.AuditAction.LOGIN, 'USER', user.id, JSON.stringify({ email })]);
        (0, responseHandler_1.successResponse)(res, {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                association_id: user.association_id,
                club_id: user.club_id,
            },
            token,
        }, 'Login successful');
    }
    catch (error) {
        console.error('Login error:', error);
        (0, responseHandler_1.errorResponse)(res, 'Failed to login', 500, 'LOGIN_FAILED');
    }
};
exports.login = login;
/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved
 *       401:
 *         description: Unauthorized
 */
const getProfile = async (req, res) => {
    try {
        if (!req.user) {
            (0, responseHandler_1.errorResponse)(res, 'Unauthorized', 401, 'UNAUTHORIZED');
            return;
        }
        const result = await (0, database_1.query)(`SELECT id, name, email, role, association_id, club_id, created_at, updated_at
       FROM users WHERE id = $1`, [req.user.userId]);
        if (result.rows.length === 0) {
            (0, responseHandler_1.errorResponse)(res, 'User not found', 404, 'USER_NOT_FOUND');
            return;
        }
        (0, responseHandler_1.successResponse)(res, result.rows[0], 'Profile retrieved successfully');
    }
    catch (error) {
        console.error('Get profile error:', error);
        (0, responseHandler_1.errorResponse)(res, 'Failed to get profile', 500, 'GET_PROFILE_FAILED');
    }
};
exports.getProfile = getProfile;
/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     summary: Change user password
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       401:
 *         description: Unauthorized or invalid current password
 */
const changePassword = async (req, res) => {
    try {
        if (!req.user) {
            (0, responseHandler_1.errorResponse)(res, 'Unauthorized', 401, 'UNAUTHORIZED');
            return;
        }
        const { currentPassword, newPassword } = req.body;
        // Get user with password
        const result = await (0, database_1.query)('SELECT * FROM users WHERE id = $1', [req.user.userId]);
        if (result.rows.length === 0) {
            (0, responseHandler_1.errorResponse)(res, 'User not found', 404, 'USER_NOT_FOUND');
            return;
        }
        const user = result.rows[0];
        // Verify current password
        const isValidPassword = await bcrypt_1.default.compare(currentPassword, user.password);
        if (!isValidPassword) {
            (0, responseHandler_1.errorResponse)(res, 'Current password is incorrect', 401, 'INVALID_PASSWORD');
            return;
        }
        // Hash new password
        const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
        // Update password
        await (0, database_1.query)('UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [hashedPassword, req.user.userId]);
        // Log audit
        await (0, database_1.query)(`INSERT INTO audit_logs (id, user_id, action, entity, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`, [(0, uuid_1.v4)(), req.user.userId, types_1.AuditAction.UPDATE, 'USER', req.user.userId, JSON.stringify({ action: 'PASSWORD_CHANGE' })]);
        (0, responseHandler_1.successResponse)(res, null, 'Password changed successfully');
    }
    catch (error) {
        console.error('Change password error:', error);
        (0, responseHandler_1.errorResponse)(res, 'Failed to change password', 500, 'CHANGE_PASSWORD_FAILED');
    }
};
exports.changePassword = changePassword;
//# sourceMappingURL=auth.controller.js.map