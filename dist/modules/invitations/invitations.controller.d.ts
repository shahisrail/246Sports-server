import { Response } from 'express';
import { AuthRequest } from '../../types';
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
export declare const acceptInvitation: (req: AuthRequest, res: Response) => Promise<void>;
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
export declare const completeInvitation: (req: AuthRequest, res: Response) => Promise<void>;
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
export declare const getInvitations: (req: AuthRequest, res: Response) => Promise<void>;
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
export declare const cancelInvitation: (req: AuthRequest, res: Response) => Promise<void>;
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
export declare const resendInvitation: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=invitations.controller.d.ts.map