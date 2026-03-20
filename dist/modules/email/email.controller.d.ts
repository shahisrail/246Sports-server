import { Response } from 'express';
import { AuthRequest } from '../../types';
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
export declare const sendInvitation: (req: AuthRequest, res: Response) => Promise<void>;
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
export declare const sendPasswordReset: (req: AuthRequest, res: Response) => Promise<void>;
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
export declare const sendWelcome: (req: AuthRequest, res: Response) => Promise<void>;
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
export declare const verifyEmailConfig: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=email.controller.d.ts.map