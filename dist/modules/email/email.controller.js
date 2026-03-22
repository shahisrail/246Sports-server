"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmailConfig = exports.sendWelcome = exports.sendPasswordReset = exports.sendInvitation = void 0;
const { v4: uuidv4 } = require("uuid");
const database_1 = require("../../config/database");
const responseHandler_1 = require("../../utils/responseHandler");
const types_1 = require("../../types");
const email_service_1 = require("../../services/email.service");
const logger_1 = require("../../utils/logger");
/**
 * @swagger
 * /email/send-invitation:
 *   post:
 *     summary: Send user invitation email
 *     tags: [Email]
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
 *               - role
 *               - associationId
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               name:
 *                 type: string
 *                 example: John Doe
 *               role:
 *                 type: string
 *                 enum: [ASSOCIATION_ADMIN, CLUB_ADMIN, TEAM_MANAGER, COMPETITION_MANAGER]
 *               associationId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Invitation sent successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 */
const sendInvitation = async (req, res) => {
    try {
        if (!req.user) {
            (0, responseHandler_1.errorResponse)(res, 'Unauthorized', 401, 'UNAUTHORIZED');
            return;
        }
        // Check permissions - only ASSOCIATION_ADMIN and SUPER_ADMIN can send invitations
        if (req.user.role !== types_1.UserRole.SUPER_ADMIN && req.user.role !== types_1.UserRole.ASSOCIATION_ADMIN) {
            (0, responseHandler_1.errorResponse)(res, 'Insufficient permissions', 403, 'INSUFFICIENT_PERMISSIONS');
            return;
        }
        const { email, name, role, associationId } = req.body;
        // Validation
        if (!email || !role) {
            (0, responseHandler_1.errorResponse)(res, 'Email and role are required', 400, 'MISSING_REQUIRED_FIELDS');
            return;
        }
        // Get association details
        const associationResult = await (0, database_1.query)('SELECT name FROM associations WHERE id = $1 AND deleted_at IS NULL', [associationId || req.user.associationId]);
        if (associationResult.rows.length === 0) {
            (0, responseHandler_1.errorResponse)(res, 'Association not found', 404, 'ASSOCIATION_NOT_FOUND');
            return;
        }
        const associationName = associationResult.rows[0].name;
        // Check if user already exists
        const existingUser = await (0, database_1.query)('SELECT id, name FROM users WHERE email = $1 AND deleted_at IS NULL', [email]);
        if (existingUser.rows.length > 0) {
            (0, responseHandler_1.errorResponse)(res, 'User with this email already exists', 400, 'USER_ALREADY_EXISTS');
            return;
        }
        // Create invitation token (valid for 7 days)
        const invitationToken = uuidv4();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        // Store invitation in database
        await (0, database_1.query)(`INSERT INTO user_invitations (id, email, name, role, association_id, invited_by, token, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, [
            uuidv4(),
            email,
            name || email.split('@')[0],
            role,
            associationId || req.user.associationId,
            req.user.userId,
            invitationToken,
            expiresAt,
        ]);
        // Get inviter name
        const inviterResult = await (0, database_1.query)('SELECT name FROM users WHERE id = $1', [req.user.userId]);
        const inviterName = inviterResult.rows[0]?.name || null;
        // Create invite link
        const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/accept-invitation?token=${invitationToken}`;
        // Send invitation email
        const emailSent = await email_service_1.emailService.sendInvitation({
            name: name || email.split('@')[0],
            email,
            association_name: associationName,
            role,
            inviter_name: inviterName,
            invite_link: inviteLink,
            support_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/support`,
        });
        if (!emailSent) {
            (0, responseHandler_1.errorResponse)(res, 'Failed to send invitation email', 500, 'EMAIL_SEND_FAILED');
            return;
        }
        (0, responseHandler_1.successResponse)(res, {
            email,
            role,
            associationId: associationId || req.user.associationId,
            message: 'Invitation sent successfully',
        }, 'Invitation email sent');
    }
    catch (error) {
        logger_1.logger.error('Send invitation error', { error });
        (0, responseHandler_1.errorResponse)(res, 'Failed to send invitation', 500, 'SEND_INVITATION_FAILED');
    }
};
exports.sendInvitation = sendInvitation;
/**
 * @swagger
 * /email/send-password-reset:
 *   post:
 *     summary: Send password reset email
 *     tags: [Email]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Password reset email sent
 *       400:
 *         description: Invalid request
 *       404:
 *         description: User not found
 */
const sendPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        // Validation
        if (!email) {
            (0, responseHandler_1.errorResponse)(res, 'Email is required', 400, 'MISSING_EMAIL');
            return;
        }
        // Check if user exists
        const userResult = await (0, database_1.query)('SELECT id, name FROM users WHERE email = $1 AND deleted_at IS NULL', [email]);
        if (userResult.rows.length === 0) {
            // Don't reveal that user doesn't exist
            (0, responseHandler_1.successResponse)(res, { message: 'If the email exists, a password reset link has been sent' });
            return;
        }
        const user = userResult.rows[0];
        // Create reset token (valid for 1 hour)
        const resetToken = uuidv4();
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        // Store reset token in database
        await (0, database_1.query)(`INSERT INTO password_reset_tokens (id, user_id, token, expires_at)
       VALUES ($1, $2, $3, $4)`, [uuidv4(), user.id, resetToken, expiresAt]);
        // Create reset link
        const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
        // Send password reset email
        const emailSent = await email_service_1.emailService.sendPasswordReset({
            name: user.name,
            email,
            reset_link: resetLink,
            support_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/support`,
        });
        if (!emailSent) {
            (0, responseHandler_1.errorResponse)(res, 'Failed to send password reset email', 500, 'EMAIL_SEND_FAILED');
            return;
        }
        (0, responseHandler_1.successResponse)(res, { message: 'Password reset email sent successfully' });
    }
    catch (error) {
        logger_1.logger.error('Send password reset error', { error });
        (0, responseHandler_1.errorResponse)(res, 'Failed to send password reset email', 500, 'SEND_PASSWORD_RESET_FAILED');
    }
};
exports.sendPasswordReset = sendPasswordReset;
/**
 * @swagger
 * /email/send-welcome:
 *   post:
 *     summary: Send welcome email to new user
 *     tags: [Email]
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
 *     responses:
 *       200:
 *         description: Welcome email sent
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
const sendWelcome = async (req, res) => {
    try {
        if (!req.user) {
            (0, responseHandler_1.errorResponse)(res, 'Unauthorized', 401, 'UNAUTHORIZED');
            return;
        }
        const { userId } = req.body;
        if (!userId) {
            (0, responseHandler_1.errorResponse)(res, 'User ID is required', 400, 'MISSING_USER_ID');
            return;
        }
        // Get user details with association
        const userResult = await (0, database_1.query)(`SELECT u.id, u.name, u.email, u.role, u.association_id, a.name as association_name
       FROM users u
       LEFT JOIN associations a ON u.association_id = a.id
       WHERE u.id = $1 AND u.deleted_at IS NULL`, [userId]);
        if (userResult.rows.length === 0) {
            (0, responseHandler_1.errorResponse)(res, 'User not found', 404, 'USER_NOT_FOUND');
            return;
        }
        const user = userResult.rows[0];
        if (!user.association_id || !user.association_name) {
            (0, responseHandler_1.errorResponse)(res, 'User must be associated with an association', 400, 'NO_ASSOCIATION');
            return;
        }
        // Send welcome email
        const emailSent = await email_service_1.emailService.sendWelcome({
            name: user.name,
            email: user.email,
            association_name: user.association_name,
            role: user.role,
            login_link: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`,
            support_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/support`,
        });
        if (!emailSent) {
            (0, responseHandler_1.errorResponse)(res, 'Failed to send welcome email', 500, 'EMAIL_SEND_FAILED');
            return;
        }
        (0, responseHandler_1.successResponse)(res, { message: 'Welcome email sent successfully' });
    }
    catch (error) {
        logger_1.logger.error('Send welcome error', { error });
        (0, responseHandler_1.errorResponse)(res, 'Failed to send welcome email', 500, 'SEND_WELCOME_FAILED');
    }
};
exports.sendWelcome = sendWelcome;
/**
 * @swagger
 * /email/verify-config:
 *   get:
 *     summary: Verify email configuration
 *     tags: [Email]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Email configuration verified
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - only SUPER_ADMIN
 */
const verifyEmailConfig = async (req, res) => {
    try {
        if (!req.user) {
            (0, responseHandler_1.errorResponse)(res, 'Unauthorized', 401, 'UNAUTHORIZED');
            return;
        }
        // Only SUPER_ADMIN can verify email config
        if (req.user.role !== types_1.UserRole.SUPER_ADMIN) {
            (0, responseHandler_1.errorResponse)(res, 'Insufficient permissions', 403, 'INSUFFICIENT_PERMISSIONS');
            return;
        }
        const { verifyEmailConfig } = await Promise.resolve().then(() => __importStar(require('../../config/email')));
        const isConfigured = await verifyEmailConfig();
        (0, responseHandler_1.successResponse)(res, {
            configured: isConfigured,
            smtp_host: process.env.SMTP_HOST || 'smtp.gmail.com',
            smtp_port: process.env.SMTP_PORT || '587',
            smtp_user: process.env.SMTP_USER ? '***' : 'Not configured',
        }, 'Email configuration verified');
    }
    catch (error) {
        logger_1.logger.error('Verify email config error', { error });
        (0, responseHandler_1.errorResponse)(res, 'Failed to verify email configuration', 500, 'VERIFY_CONFIG_FAILED');
    }
};
exports.verifyEmailConfig = verifyEmailConfig;
//# sourceMappingURL=email.controller.js.map