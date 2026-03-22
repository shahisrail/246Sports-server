"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resendInvitation = exports.cancelInvitation = exports.getInvitations = exports.completeInvitation = exports.acceptInvitation = void 0;
const { v4: uuidv4 } = require("uuid");
const bcrypt_1 = __importDefault(require("bcrypt"));
const database_1 = require("../../config/database");
const responseHandler_1 = require("../../utils/responseHandler");
const email_service_1 = require("../../services/email.service");
const logger_1 = require("../../utils/logger");
/**
 * @swagger
 * /invitations/accept:
 *   post:
 *     summary: Accept user invitation and validate token
 *     tags: [Invitations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 format: uuid
 *                 description: Invitation token
 *     responses:
 *       200:
 *         description: Invitation accepted successfully
 *       400:
 *         description: Invalid or expired token
 *       404:
 *         description: Invitation not found
 */
const acceptInvitation = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            (0, responseHandler_1.errorResponse)(res, 'Invitation token is required', 400, 'MISSING_TOKEN');
            return;
        }
        // Find valid invitation
        const result = await (0, database_1.query)(`SELECT ui.*, a.name as association_name, c.name as club_name
       FROM user_invitations ui
       LEFT JOIN associations a ON ui.association_id = a.id
       LEFT JOIN clubs c ON ui.club_id = c.id
       WHERE ui.token = $1
         AND ui.accepted_at IS NULL
         AND ui.expires_at > CURRENT_TIMESTAMP`, [token]);
        if (result.rows.length === 0) {
            // Check if invitation exists but is invalid
            const existingResult = await (0, database_1.query)('SELECT * FROM user_invitations WHERE token = $1', [token]);
            if (existingResult.rows.length > 0) {
                const invitation = existingResult.rows[0];
                if (invitation.accepted_at) {
                    (0, responseHandler_1.errorResponse)(res, 'This invitation has already been accepted', 400, 'INVITATION_ALREADY_ACCEPTED');
                }
                else if (invitation.expires_at <= new Date()) {
                    (0, responseHandler_1.errorResponse)(res, 'This invitation has expired', 400, 'INVITATION_EXPIRED');
                }
                else {
                    (0, responseHandler_1.errorResponse)(res, 'Invalid invitation token', 400, 'INVALID_TOKEN');
                }
            }
            else {
                (0, responseHandler_1.errorResponse)(res, 'Invitation not found', 404, 'INVITATION_NOT_FOUND');
            }
            return;
        }
        const invitation = result.rows[0];
        // Return invitation details for user to set password
        (0, responseHandler_1.successResponse)(res, {
            email: invitation.email,
            name: invitation.name,
            role: invitation.role,
            association_id: invitation.association_id,
            association_name: invitation.association_name,
            club_id: invitation.club_id,
            club_name: invitation.club_name,
            token: token,
        }, 'Invitation validated successfully');
    }
    catch (error) {
        logger_1.logger.error('Accept invitation error', { error });
        (0, responseHandler_1.errorResponse)(res, 'Failed to accept invitation', 500, 'ACCEPT_INVITATION_FAILED');
    }
};
exports.acceptInvitation = acceptInvitation;
/**
 * @swagger
 * /invitations/complete:
 *   post:
 *     summary: Complete invitation by setting password and creating user
 *     tags: [Invitations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *                 format: uuid
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: User created successfully
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Invitation not found
 */
const completeInvitation = async (req, res) => {
    try {
        const { token, password } = req.body;
        if (!token || !password) {
            (0, responseHandler_1.errorResponse)(res, 'Token and password are required', 400, 'MISSING_REQUIRED_FIELDS');
            return;
        }
        // Validate password strength
        if (password.length < 8) {
            (0, responseHandler_1.errorResponse)(res, 'Password must be at least 8 characters long', 400, 'WEAK_PASSWORD');
            return;
        }
        // Find valid invitation
        const invitationResult = await (0, database_1.query)(`SELECT ui.*, a.name as association_name
       FROM user_invitations ui
       LEFT JOIN associations a ON ui.association_id = a.id
       WHERE ui.token = $1
         AND ui.accepted_at IS NULL
         AND ui.expires_at > CURRENT_TIMESTAMP`, [token]);
        if (invitationResult.rows.length === 0) {
            (0, responseHandler_1.errorResponse)(res, 'Invalid or expired invitation token', 400, 'INVALID_TOKEN');
            return;
        }
        const invitation = invitationResult.rows[0];
        // Check if user already exists with this email
        const existingUser = await (0, database_1.query)('SELECT id FROM users WHERE email = $1 AND deleted_at IS NULL', [invitation.email]);
        if (existingUser.rows.length > 0) {
            (0, responseHandler_1.errorResponse)(res, 'A user with this email already exists', 400, 'USER_ALREADY_EXISTS');
            return;
        }
        // Hash password
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        // Create user
        const userId = uuidv4();
        const userResult = await (0, database_1.query)(`INSERT INTO users (id, email, name, password, role, association_id, club_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, email, name, role, association_id, club_id`, [
            userId,
            invitation.email,
            invitation.name,
            hashedPassword,
            invitation.role,
            invitation.association_id,
            invitation.club_id,
        ]);
        // Mark invitation as accepted
        await (0, database_1.query)('UPDATE user_invitations SET accepted_at = CURRENT_TIMESTAMP WHERE token = $1', [token]);
        // Send welcome email
        try {
            await email_service_1.emailService.sendWelcome({
                name: invitation.name,
                email: invitation.email,
                association_name: invitation.association_name,
                role: invitation.role,
                login_link: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`,
                support_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/support`,
            });
        }
        catch (emailError) {
            logger_1.logger.error('Failed to send welcome email', { error: emailError });
            // Don't fail the request if email fails
        }
        const user = userResult.rows[0];
        // Generate JWT token
        const jwt = require('jsonwebtoken');
        const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
        const token_expires = process.env.JWT_EXPIRES_IN || '7d';
        const jwtToken = jwt.sign({
            userId: user.id,
            email: user.email,
            role: user.role,
            associationId: user.association_id,
            clubId: user.club_id,
        }, jwtSecret, { expiresIn: token_expires });
        (0, responseHandler_1.successResponse)(res, {
            token: jwtToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                associationId: user.association_id,
                clubId: user.club_id,
            },
        }, 'Account created successfully', 201);
    }
    catch (error) {
        logger_1.logger.error('Complete invitation error', { error });
        (0, responseHandler_1.errorResponse)(res, 'Failed to complete invitation', 500, 'COMPLETE_INVITATION_FAILED');
    }
};
exports.completeInvitation = completeInvitation;
/**
 * @swagger
 * /invitations:
 *   get:
 *     summary: Get all invitations for an association
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, accepted, expired, all]
 *           default: all
 *     responses:
 *       200:
 *         description: Invitations retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
const getInvitations = async (req, res) => {
    try {
        if (!req.user) {
            (0, responseHandler_1.errorResponse)(res, 'Unauthorized', 401, 'UNAUTHORIZED');
            return;
        }
        // Only ASSOCIATION_ADMIN and SUPER_ADMIN can view invitations
        if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'ASSOCIATION_ADMIN') {
            (0, responseHandler_1.errorResponse)(res, 'Insufficient permissions', 403, 'INSUFFICIENT_PERMISSIONS');
            return;
        }
        const { status = 'all' } = req.query;
        let queryText = `
      SELECT ui.id, ui.email, ui.name, ui.role, ui.created_at, ui.expires_at, ui.accepted_at,
             a.name as association_name,
             c.name as club_name,
             inviter.name as invited_by_name
      FROM user_invitations ui
      LEFT JOIN associations a ON ui.association_id = a.id
      LEFT JOIN clubs c ON ui.club_id = c.id
      LEFT JOIN users inviter ON ui.invited_by = inviter.id
      WHERE 1=1
    `;
        const params = [];
        // Filter by association
        if (req.user.role === 'ASSOCIATION_ADMIN' && req.user.associationId) {
            queryText += ` AND ui.association_id = $${params.length + 1}`;
            params.push(req.user.associationId);
        }
        // Filter by status
        if (status === 'pending') {
            queryText += ` AND ui.accepted_at IS NULL AND ui.expires_at > CURRENT_TIMESTAMP`;
        }
        else if (status === 'accepted') {
            queryText += ` AND ui.accepted_at IS NOT NULL`;
        }
        else if (status === 'expired') {
            queryText += ` AND ui.accepted_at IS NULL AND ui.expires_at <= CURRENT_TIMESTAMP`;
        }
        queryText += ` ORDER BY ui.created_at DESC`;
        const result = await (0, database_1.query)(queryText, params);
        (0, responseHandler_1.successResponse)(res, result.rows, 'Invitations retrieved successfully');
    }
    catch (error) {
        logger_1.logger.error('Get invitations error', { error });
        (0, responseHandler_1.errorResponse)(res, 'Failed to get invitations', 500, 'GET_INVITATIONS_FAILED');
    }
};
exports.getInvitations = getInvitations;
/**
 * @swagger
 * /invitations/{id}:
 *   delete:
 *     summary: Cancel/delete an invitation
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Invitation cancelled successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Invitation not found
 */
const cancelInvitation = async (req, res) => {
    try {
        if (!req.user) {
            (0, responseHandler_1.errorResponse)(res, 'Unauthorized', 401, 'UNAUTHORIZED');
            return;
        }
        // Only ASSOCIATION_ADMIN and SUPER_ADMIN can cancel invitations
        if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'ASSOCIATION_ADMIN') {
            (0, responseHandler_1.errorResponse)(res, 'Insufficient permissions', 403, 'INSUFFICIENT_PERMISSIONS');
            return;
        }
        const { id } = req.params;
        // Check if invitation exists and belongs to user's association
        const result = await (0, database_1.query)(`SELECT * FROM user_invitations WHERE id = $1`, [id]);
        if (result.rows.length === 0) {
            (0, responseHandler_1.errorResponse)(res, 'Invitation not found', 404, 'INVITATION_NOT_FOUND');
            return;
        }
        const invitation = result.rows[0];
        // Check permissions
        if (req.user.role === 'ASSOCIATION_ADMIN' && invitation.association_id !== req.user.associationId) {
            (0, responseHandler_1.errorResponse)(res, 'Insufficient permissions', 403, 'INSUFFICIENT_PERMISSIONS');
            return;
        }
        // Delete invitation
        await (0, database_1.query)('DELETE FROM user_invitations WHERE id = $1', [id]);
        (0, responseHandler_1.successResponse)(res, null, 'Invitation cancelled successfully');
    }
    catch (error) {
        logger_1.logger.error('Cancel invitation error', { error });
        (0, responseHandler_1.errorResponse)(res, 'Failed to cancel invitation', 500, 'CANCEL_INVITATION_FAILED');
    }
};
exports.cancelInvitation = cancelInvitation;
/**
 * @swagger
 * /invitations/{id}/resend:
 *   post:
 *     summary: Resend an invitation email
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Invitation resent successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Invitation not found
 */
const resendInvitation = async (req, res) => {
    try {
        if (!req.user) {
            (0, responseHandler_1.errorResponse)(res, 'Unauthorized', 401, 'UNAUTHORIZED');
            return;
        }
        // Only ASSOCIATION_ADMIN and SUPER_ADMIN can resend invitations
        if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'ASSOCIATION_ADMIN') {
            (0, responseHandler_1.errorResponse)(res, 'Insufficient permissions', 403, 'INSUFFICIENT_PERMISSIONS');
            return;
        }
        const { id } = req.params;
        // Get invitation details
        const result = await (0, database_1.query)(`SELECT ui.*, a.name as association_name, u.name as inviter_name
       FROM user_invitations ui
       LEFT JOIN associations a ON ui.association_id = a.id
       LEFT JOIN users u ON ui.invited_by = u.id
       WHERE ui.id = $1`, [id]);
        if (result.rows.length === 0) {
            (0, responseHandler_1.errorResponse)(res, 'Invitation not found', 404, 'INVITATION_NOT_FOUND');
            return;
        }
        const invitation = result.rows[0];
        // Check permissions
        if (req.user.role === 'ASSOCIATION_ADMIN' && invitation.association_id !== req.user.associationId) {
            (0, responseHandler_1.errorResponse)(res, 'Insufficient permissions', 403, 'INSUFFICIENT_PERMISSIONS');
            return;
        }
        // Check if invitation is already accepted
        if (invitation.accepted_at) {
            (0, responseHandler_1.errorResponse)(res, 'Cannot resend an already accepted invitation', 400, 'INVITATION_ALREADY_ACCEPTED');
            return;
        }
        // Update token and expiration
        const newToken = uuidv4();
        const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        await (0, database_1.query)(`UPDATE user_invitations
       SET token = $1, expires_at = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`, [newToken, newExpiresAt, id]);
        // Create invite link
        const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/accept-invitation?token=${newToken}`;
        // Resend invitation email
        const emailSent = await email_service_1.emailService.sendInvitation({
            name: invitation.name,
            email: invitation.email,
            association_name: invitation.association_name,
            role: invitation.role,
            inviter_name: req.user.name || invitation.inviter_name,
            invite_link: inviteLink,
            support_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/support`,
        });
        if (!emailSent) {
            (0, responseHandler_1.errorResponse)(res, 'Failed to send invitation email', 500, 'EMAIL_SEND_FAILED');
            return;
        }
        (0, responseHandler_1.successResponse)(res, {
            id,
            email: invitation.email,
            message: 'Invitation resent successfully',
        }, 'Invitation resent successfully');
    }
    catch (error) {
        logger_1.logger.error('Resend invitation error', { error });
        (0, responseHandler_1.errorResponse)(res, 'Failed to resend invitation', 500, 'RESEND_INVITATION_FAILED');
    }
};
exports.resendInvitation = resendInvitation;
//# sourceMappingURL=invitations.controller.js.map