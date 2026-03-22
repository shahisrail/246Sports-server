"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.revokeAllTokens = exports.loginV2 = exports.logout = exports.refreshToken = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const { v4: uuidv4 } = require("uuid");
const database_1 = require("../../config/database");
const jwt_1 = require("../../utils/jwt");
const responseHandler_1 = require("../../utils/responseHandler");
const logger_1 = require("../../utils/logger");
/**
 * Refresh Token System
 * Implements secure refresh token rotation
 */
/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token using refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh token obtained from login
 *     responses:
 *       200:
 *         description: Token refreshed successfully
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
 *                   example: Token refreshed successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *                     tokenType:
 *                       type: string
 *                       example: Bearer
 *                     expiresIn:
 *                       type: string
 *                       example: 15m
 *       401:
 *         description: Invalid or expired refresh token
 */
const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            (0, responseHandler_1.errorResponse)(res, 'Refresh token is required', 400, 'MISSING_REFRESH_TOKEN');
            return;
        }
        // Find refresh token in database
        const tokenResult = await (0, database_1.query)(`SELECT rt.*, u.id as user_id, u.email, u.role, u.association_id, u.club_id
       FROM refresh_tokens rt
       JOIN users u ON rt.user_id = u.id
       WHERE rt.token = $1
       AND rt.revoked_at IS NULL
       AND rt.expires_at > CURRENT_TIMESTAMP`, [refreshToken]);
        if (tokenResult.rows.length === 0) {
            (0, responseHandler_1.errorResponse)(res, 'Invalid or expired refresh token', 401, 'INVALID_REFRESH_TOKEN');
            return;
        }
        const tokenRecord = tokenResult.rows[0];
        const user = {
            userId: tokenRecord.user_id,
            email: tokenRecord.email,
            role: tokenRecord.role,
            associationId: tokenRecord.association_id,
            clubId: tokenRecord.club_id,
        };
        // Generate new access token
        const newAccessToken = (0, jwt_1.generateToken)(user);
        // Rotate refresh token (revoke old, create new)
        await (0, database_1.query)('UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP WHERE token = $1', [refreshToken]);
        const newRefreshToken = uuidv4();
        const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        await (0, database_1.query)(`INSERT INTO refresh_tokens (id, user_id, token, expires_at, device_info, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6)`, [
            uuidv4(),
            user.userId,
            newRefreshToken,
            newExpiresAt,
            req.headers['user-agent'] || null,
            req.get('user-agent') || null,
        ]);
        (0, logger_1.auditLogger)('TOKEN_REFRESH', 'USER', user.userId, {
            ip: req.ip,
            userAgent: req.get('user-agent'),
        });
        logger_1.logger.info('Token refreshed', { userId: user.userId });
        (0, responseHandler_1.successResponse)(res, {
            user,
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            tokenType: 'Bearer',
            expiresIn: '15m', // Access token expires in 15 minutes
        }, 'Token refreshed successfully');
    }
    catch (error) {
        logger_1.logger.error('Refresh token error', { error });
        (0, responseHandler_1.errorResponse)(res, 'Failed to refresh token', 500, 'REFRESH_FAILED');
    }
};
exports.refreshToken = refreshToken;
/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user (revoke refresh token)
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
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh token to revoke
 *     responses:
 *       200:
 *         description: Logged out successfully
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
 *                   example: Logged out successfully
 */
const logout = async (req, res) => {
    try {
        if (!req.user) {
            (0, responseHandler_1.errorResponse)(res, 'Unauthorized', 401, 'UNAUTHORIZED');
            return;
        }
        const { refreshToken } = req.body;
        const { ip } = req;
        // Revoke refresh token if provided
        if (refreshToken) {
            await (0, database_1.query)(`UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP, revoked_by = $1 WHERE token = $2`, [ip, refreshToken]);
        }
        (0, logger_1.auditLogger)('LOGOUT', 'USER', req.user.userId, {
            ip,
            userAgent: req.get('user-agent'),
        });
        logger_1.logger.info('User logged out', { userId: req.user.userId });
        (0, responseHandler_1.successResponse)(res, null, 'Logged out successfully');
    }
    catch (error) {
        logger_1.logger.error('Logout error', { error });
        (0, responseHandler_1.errorResponse)(res, 'Failed to logout', 500, 'LOGOUT_FAILED');
    }
};
exports.logout = logout;
/**
 * @swagger
 * /auth/login-v2:
 *   post:
 *     summary: Login user with refresh token support (V2)
 *     description: Returns both access token (15min) and refresh token (7 days). Use the refresh token to get new access tokens without re-authenticating.
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
 *                 example: admin@246sports.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: SecurePass123!
 *     responses:
 *       200:
 *         description: Login successful with access and refresh tokens
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
 *                   example: Login successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     accessToken:
 *                       type: string
 *                       description: JWT access token (expires in 15 minutes)
 *                     refreshToken:
 *                       type: string
 *                       description: Refresh token (expires in 7 days)
 *                     tokenType:
 *                       type: string
 *                       example: Bearer
 *                     expiresIn:
 *                       type: string
 *                       example: 15m
 *                     refreshExpiresIn:
 *                       type: string
 *                       example: 7d
 *       401:
 *         description: Invalid credentials
 */
const loginV2 = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Find user
        const result = await (0, database_1.query)('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            (0, responseHandler_1.errorResponse)(res, 'Invalid email or password', 401, 'INVALID_CREDENTIALS');
            return;
        }
        const user = result.rows[0];
        console.log('Login - User from DB:', {
            id: user.id,
            email: user.email,
            role: user.role,
            association_id: user.association_id,
            club_id: user.club_id,
            name: user.name,
        });
        // Verify password
        const isValidPassword = await bcrypt_1.default.compare(password, user.password);
        if (!isValidPassword) {
            (0, responseHandler_1.errorResponse)(res, 'Invalid email or password', 401, 'INVALID_CREDENTIALS');
            return;
        }
        // Generate access token (short-lived: 15 minutes)
        const tokenPayload = {
            userId: user.id,
            email: user.email,
            role: user.role,
            associationId: user.association_id,
            clubId: user.club_id,
        };
        console.log('Login - Token payload being signed:', tokenPayload);
        const accessToken = (0, jwt_1.generateToken)(tokenPayload);
        // Generate refresh token (long-lived: 7 days)
        const refreshToken = uuidv4();
        const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        // Store refresh token in database
        await (0, database_1.query)(`INSERT INTO refresh_tokens (id, user_id, token, expires_at, device_info, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6)`, [
            uuidv4(),
            user.id,
            refreshToken,
            refreshExpiresAt,
            req.headers['user-agent'] || null,
            req.get('user-agent') || null,
        ]);
        (0, logger_1.auditLogger)('LOGIN_V2', 'USER', user.id, {
            email: user.email,
            role: user.role,
            ip: req.ip,
            userAgent: req.get('user-agent'),
        });
        logger_1.logger.info('User logged in (v2)', { userId: user.id, email: user.email });
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
        }, 'Login successful');
    }
    catch (error) {
        logger_1.logger.error('Login v2 error', { error });
        (0, responseHandler_1.errorResponse)(res, 'Failed to login', 500, 'LOGIN_FAILED');
    }
};
exports.loginV2 = loginV2;
/**
 * @swagger
 * /auth/revoke-all:
 *   post:
 *     summary: Revoke all refresh tokens for current user
 *     description: Revokes all refresh tokens across all devices for the current user. Requires re-authentication on all devices.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All tokens revoked successfully
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
 *                   example: All tokens revoked successfully
 */
const revokeAllTokens = async (req, res) => {
    try {
        if (!req.user) {
            (0, responseHandler_1.errorResponse)(res, 'Unauthorized', 401, 'UNAUTHORIZED');
            return;
        }
        // Revoke all tokens for this user
        await (0, database_1.query)('UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP WHERE user_id = $1 AND revoked_at IS NULL', [req.user.userId]);
        (0, logger_1.auditLogger)('REVOKE_ALL_TOKENS', 'USER', req.user.userId, {
            ip: req.ip,
            userAgent: req.get('user-agent'),
        });
        logger_1.logger.info('All tokens revoked for user', { userId: req.user.userId });
        (0, responseHandler_1.successResponse)(res, null, 'All tokens revoked successfully');
    }
    catch (error) {
        logger_1.logger.error('Revoke all tokens error', { error });
        (0, responseHandler_1.errorResponse)(res, 'Failed to revoke tokens', 500, 'REVOKE_FAILED');
    }
};
exports.revokeAllTokens = revokeAllTokens;
//# sourceMappingURL=auth-v2.controller.js.map