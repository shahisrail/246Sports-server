"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllSubscribers = exports.getAssociationSubscribers = exports.getSubscriptionStatus = exports.unsubscribe = exports.subscribe = void 0;
const uuid_1 = require("uuid");
const database_1 = require("../../config/database");
const responseHandler_1 = require("../../utils/responseHandler");
const types_1 = require("../../types");
const types_2 = require("../../types");
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
const subscribe = async (req, res) => {
    const client = await database_1.pool.connect();
    let transactionStarted = false;
    try {
        const { email, association_id, preferences } = req.body;
        // Get IP address from request
        const ipAddress = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
            req.headers['x-real-ip'] ||
            req.socket?.remoteAddress ||
            req.ip ||
            null;
        // Validation
        if (!email || !association_id) {
            (0, responseHandler_1.errorResponse)(res, 'Email and association_id are required', 400, 'MISSING_FIELDS');
            return;
        }
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            (0, responseHandler_1.errorResponse)(res, 'Invalid email format', 400, 'INVALID_EMAIL');
            return;
        }
        // Validate association_id is UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(association_id)) {
            (0, responseHandler_1.errorResponse)(res, 'Invalid association_id format', 400, 'INVALID_ASSOCIATION_ID');
            return;
        }
        // Check if association exists
        const associationCheck = await client.query('SELECT id, name FROM associations WHERE id = $1 AND deleted_at IS NULL', [association_id]);
        if (associationCheck.rows.length === 0) {
            (0, responseHandler_1.errorResponse)(res, 'Association not found', 404, 'ASSOCIATION_NOT_FOUND');
            return;
        }
        await client.query('BEGIN');
        transactionStarted = true;
        // Check if already subscribed
        const existing = await client.query(`SELECT id, status FROM email_subscriptions
       WHERE LOWER(email) = LOWER($1) AND association_id = $2 AND deleted_at IS NULL`, [email, association_id]);
        if (existing.rows.length > 0) {
            const subscription = existing.rows[0];
            if (subscription.status === 'ACTIVE') {
                await client.query('ROLLBACK');
                transactionStarted = false;
                (0, responseHandler_1.errorResponse)(res, 'Already subscribed to this association', 409, 'ALREADY_SUBSCRIBED');
                return;
            }
            // Reactivate if unsubscribed
            await client.query(`UPDATE email_subscriptions
         SET status = 'ACTIVE', unsubscribed_at = NULL, ip_address = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`, [ipAddress, subscription.id]);
        }
        else {
            // Create new subscription
            const subscriptionId = (0, uuid_1.v4)();
            const unsubscribeToken = (0, uuid_1.v4)();
            await client.query(`INSERT INTO email_subscriptions (id, email, association_id, unsubscribe_token, preferences, ip_address)
         VALUES ($1, $2, $3, $4, $5, $6)`, [
                subscriptionId,
                email.toLowerCase(),
                association_id,
                unsubscribeToken,
                JSON.stringify(preferences || { news: true, fixtures: true, results: true }),
                ipAddress,
            ]);
            // Log audit if user is authenticated
            if (req.user) {
                await client.query(`INSERT INTO audit_logs (id, user_id, action, entity, entity_id, details)
           VALUES ($1, $2, $3, $4, $5, $6)`, [
                    (0, uuid_1.v4)(),
                    req.user.userId,
                    types_2.AuditAction.CREATE,
                    'EMAIL_SUBSCRIPTION',
                    subscriptionId,
                    JSON.stringify({ email, association_id, ipAddress }),
                ]);
            }
        }
        await client.query('COMMIT');
        transactionStarted = false;
        (0, responseHandler_1.successResponse)(res, {
            message: 'Successfully subscribed',
            association: associationCheck.rows[0].name,
        }, 'Subscribed successfully', 201);
    }
    catch (error) {
        if (transactionStarted) {
            try {
                await client.query('ROLLBACK');
            }
            catch (rollbackError) {
                console.error('Rollback error:', rollbackError);
            }
        }
        console.error('Subscribe error details:', error);
        (0, responseHandler_1.errorResponse)(res, 'Failed to subscribe', 500, 'SUBSCRIBE_FAILED');
    }
    finally {
        client.release();
    }
};
exports.subscribe = subscribe;
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
const unsubscribe = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            (0, responseHandler_1.errorResponse)(res, 'Unsubscribe token is required', 400, 'MISSING_TOKEN');
            return;
        }
        // Use database function for unsubscribe
        const result = await (0, database_1.query)(`SELECT unsubscribe_by_token($1) as success`, [token]);
        const success = result.rows[0].success;
        if (!success) {
            (0, responseHandler_1.errorResponse)(res, 'Invalid or expired unsubscribe token', 404, 'INVALID_TOKEN');
            return;
        }
        (0, responseHandler_1.successResponse)(res, { message: 'Successfully unsubscribed' }, 'Unsubscribed successfully');
    }
    catch (error) {
        console.error('Unsubscribe error:', error);
        (0, responseHandler_1.errorResponse)(res, 'Failed to unsubscribe', 500, 'UNSUBSCRIBE_FAILED');
    }
};
exports.unsubscribe = unsubscribe;
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
const getSubscriptionStatus = async (req, res) => {
    try {
        const { email, association_id } = req.query;
        if (!email || !association_id) {
            (0, responseHandler_1.errorResponse)(res, 'Email and association_id are required', 400, 'MISSING_FIELDS');
            return;
        }
        const associationIdStr = association_id.toString();
        // Validate UUID format for association_id
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(associationIdStr)) {
            (0, responseHandler_1.errorResponse)(res, 'Invalid association_id format', 400, 'INVALID_ASSOCIATION_ID');
            return;
        }
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.toString())) {
            (0, responseHandler_1.errorResponse)(res, 'Invalid email format', 400, 'INVALID_EMAIL');
            return;
        }
        // Use database function to check subscription status
        const isSubscribed = await (0, database_1.query)(`SELECT is_subscribed_to_association($1, $2) as subscribed`, [email, associationIdStr]);
        const subscribed = isSubscribed.rows[0]?.subscribed || false;
        if (!subscribed) {
            (0, responseHandler_1.successResponse)(res, { subscribed: false }, 'Not subscribed');
            return;
        }
        // Get full subscription details
        const result = await (0, database_1.query)(`SELECT status, preferences, subscription_date
       FROM email_subscriptions
       WHERE LOWER(email) = LOWER($1) AND association_id = $2 AND deleted_at IS NULL`, [email, associationIdStr]);
        if (result.rows.length === 0) {
            (0, responseHandler_1.successResponse)(res, { subscribed: false }, 'Not subscribed');
            return;
        }
        const subscription = result.rows[0];
        (0, responseHandler_1.successResponse)(res, {
            subscribed: subscription.status === 'ACTIVE',
            status: subscription.status,
            preferences: typeof subscription.preferences === 'string' ? JSON.parse(subscription.preferences) : subscription.preferences,
            subscriptionDate: subscription.subscription_date,
        }, 'Subscription status retrieved');
    }
    catch (error) {
        console.error('Get subscription status error details:', error);
        (0, responseHandler_1.errorResponse)(res, 'Failed to get subscription status', 500, 'GET_STATUS_FAILED');
    }
};
exports.getSubscriptionStatus = getSubscriptionStatus;
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
const getAssociationSubscribers = async (req, res) => {
    try {
        const { associationId } = req.params;
        // Authorization check
        if (!req.user) {
            (0, responseHandler_1.errorResponse)(res, 'Authentication required', 401, 'UNAUTHORIZED');
            return;
        }
        // Only SUPER_ADMIN and ASSOCIATION_ADMIN can access
        if (req.user.role !== types_1.UserRole.SUPER_ADMIN &&
            (req.user.role !== types_1.UserRole.ASSOCIATION_ADMIN || req.user.associationId !== associationId)) {
            (0, responseHandler_1.errorResponse)(res, 'You do not have permission to view subscribers for this association', 403, 'FORBIDDEN');
            return;
        }
        // Use database function to get subscribers
        const result = await (0, database_1.query)(`SELECT * FROM get_association_subscribers($1)`, [associationId]);
        (0, responseHandler_1.successResponse)(res, {
            associationId,
            subscriberCount: result.rows.length,
            subscribers: result.rows,
        }, 'Subscribers retrieved successfully');
    }
    catch (error) {
        console.error('Get association subscribers error:', error);
        (0, responseHandler_1.errorResponse)(res, 'Failed to get subscribers', 500, 'GET_SUBSCRIBERS_FAILED');
    }
};
exports.getAssociationSubscribers = getAssociationSubscribers;
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
const getAllSubscribers = async (req, res) => {
    try {
        // Only SUPER_ADMIN can access all subscribers
        if (req.user?.role !== types_1.UserRole.SUPER_ADMIN) {
            (0, responseHandler_1.errorResponse)(res, 'You do not have permission to view all subscribers', 403, 'FORBIDDEN');
            return;
        }
        // Fetch from active_subscribers view which includes association_name
        const result = await (0, database_1.query)(`SELECT * FROM active_subscribers ORDER BY created_at DESC`);
        (0, responseHandler_1.successResponse)(res, {
            subscriberCount: result.rows.length,
            subscribers: result.rows,
        }, 'All subscribers retrieved successfully');
    }
    catch (error) {
        console.error('Get all subscribers error:', error);
        (0, responseHandler_1.errorResponse)(res, 'Failed to get all subscribers', 500, 'GET_ALL_SUBSCRIBERS_FAILED');
    }
};
exports.getAllSubscribers = getAllSubscribers;
//# sourceMappingURL=email-subscriptions.controller.js.map