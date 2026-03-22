import { Router } from 'express';
import * as invitationsController from './invitations.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Invitations
 *   description: User invitation and registration endpoints
 */

/**
 * @swagger
 * /api/v1/invitations/accept:
 *   post:
 *     summary: Accept an invitation and verify email
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
 *                 description: Invitation token from email
 *     responses:
 *       200:
 *         description: Invitation accepted, email verified
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                     associationId:
 *                       type: string
 *                     clubId:
 *                       type: string
 *       400:
 *         description: Invalid or expired token
 *       404:
 *         description: Invitation not found
 */
router.post('/accept', invitationsController.acceptInvitation);

/**
 * @swagger
 * /api/v1/invitations/complete:
 *   post:
 *     summary: Complete invitation by setting password
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
 *               - name
 *             properties:
 *               token:
 *                 type: string
 *                 description: Invitation token
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 description: User's password
 *               name:
 *                 type: string
 *                 description: User's full name
 *     responses:
 *       200:
 *         description: Registration completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     tokens:
 *                       type: object
 *                       properties:
 *                         accessToken:
 *                           type: string
 *                         refreshToken:
 *                           type: string
 *       400:
 *         description: Invalid request or token
 *       404:
 *         description: Invitation not found
 */
router.post('/complete', invitationsController.completeInvitation);

/**
 * @swagger
 * /api/v1/invitations:
 *   get:
 *     summary: Get all invitations (authenticated user's invitations)
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, ACCEPTED, COMPLETED, EXPIRED, CANCELLED]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of invitations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       email:
 *                         type: string
 *                         format: email
 *                       role:
 *                         type: string
 *                       status:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, invitationsController.getInvitations);

/**
 * @swagger
 * /api/v1/invitations/{id}:
 *   delete:
 *     summary: Cancel an invitation
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
 *         description: Invitation ID
 *     responses:
 *       200:
 *         description: Invitation cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not your invitation
 *       404:
 *         description: Invitation not found
 */
router.delete('/:id', authenticate, invitationsController.cancelInvitation);

/**
 * @swagger
 * /api/v1/invitations/{id}/resend:
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
 *         description: Invitation ID
 *     responses:
 *       200:
 *         description: Invitation resent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Invitation not found
 */
router.post('/:id/resend', authenticate, invitationsController.resendInvitation);

export default router;
