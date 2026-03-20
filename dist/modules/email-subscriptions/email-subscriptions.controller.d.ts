import { Response } from 'express';
import { AuthRequest } from '../../types';
/**
 * @swagger
 * /email-subscriptions/subscribe:
 *   post:
 *     summary: Subscribe to association updates
 *     tags: [Email Subscriptions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - association_id
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               association_id:
 *                 type: string
 *                 format: uuid
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               preferences:
 *                 type: object
 *                 properties:
 *                   news:
 *                     type: boolean
 *                     default: true
 *                   fixtures:
 *                     type: boolean
 *                     default: true
 *                   results:
 *                     type: boolean
 *                     default: true
 *     responses:
 *       201:
 *         description: Subscribed successfully
 *       409:
 *         description: Already subscribed
 *       400:
 *         description: Invalid email or missing required fields
 */
export declare const subscribe: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /email-subscriptions/unsubscribe:
 *   post:
 *     summary: Unsubscribe from association updates
 *     tags: [Email Subscriptions]
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
 *                 description: Unsubscribe token received when subscribed
 *     responses:
 *       200:
 *         description: Unsubscribed successfully
 *       404:
 *         description: Invalid or expired unsubscribe token
 */
export declare const unsubscribe: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /email-subscriptions/status:
 *   get:
 *     summary: Get subscription status for an email and association
 *     tags: [Email Subscriptions]
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *       - in: query
 *         name: association_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Subscription status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 subscribed:
 *                   type: boolean
 *                 status:
 *                   type: string
 *                   enum: [ACTIVE, UNSUBSCRIBED, BOUNCED]
 *                 preferences:
 *                   type: object
 *                 subscriptionDate:
 *                   type: string
 *                   format: date-time
 */
export declare const getSubscriptionStatus: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /email-subscriptions/association/{associationId}:
 *   get:
 *     summary: Get all subscribers for an association (admin only)
 *     tags: [Email Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: associationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of subscribers
 *       403:
 *         description: Forbidden - not authorized
 */
export declare const getAssociationSubscribers: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /email-subscriptions:
 *   get:
 *     summary: Get all subscribers across all associations (Super Admin only)
 *     tags: [Email Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all subscribers
 *       403:
 *         description: Forbidden
 */
export declare const getAllSubscribers: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=email-subscriptions.controller.d.ts.map