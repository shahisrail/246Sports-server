"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuditStats = exports.getAuditLogs = void 0;
const database_1 = require("../../config/database");
const responseHandler_1 = require("../../utils/responseHandler");
const types_1 = require("../../types");
/**
 * @swagger
 * /audit/logs:
 *   get:
 *     summary: Get audit logs
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum: [CREATE, UPDATE, DELETE, LOGIN, LOGOUT, PUBLISH]
 *       - in: query
 *         name: entity
 *         schema:
 *           type: string
 *       - in: query
 *         name: date_from
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: date_to
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Audit logs retrieved successfully
 *       403:
 *         description: Forbidden
 */
const getAuditLogs = async (req, res) => {
    try {
        if (!req.user) {
            (0, responseHandler_1.errorResponse)(res, 'Unauthorized', 401, 'UNAUTHORIZED');
            return;
        }
        // Only Super Admin and Association Admin can view audit logs
        if (req.user.role !== types_1.UserRole.SUPER_ADMIN && req.user.role !== types_1.UserRole.ASSOCIATION_ADMIN) {
            (0, responseHandler_1.errorResponse)(res, 'You do not have permission to view audit logs', 403, 'FORBIDDEN');
            return;
        }
        const { page = 1, limit = 10, user_id, action, entity, date_from, date_to } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        let queryText = `
      SELECT al.*, u.name as user_name, u.email as user_email
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE 1=1
    `;
        let params = [];
        // If Association Admin, filter to only their association
        if (req.user.role === types_1.UserRole.ASSOCIATION_ADMIN && req.user.associationId) {
            // This would require joining with the entity tables to check association_id
            // For simplicity, we'll allow Association Admins to see all audit logs for now
        }
        if (user_id) {
            queryText += ` AND al.user_id = $${params.length + 1}`;
            params.push(user_id);
        }
        if (action) {
            queryText += ` AND al.action = $${params.length + 1}`;
            params.push(action);
        }
        if (entity) {
            queryText += ` AND al.entity = $${params.length + 1}`;
            params.push(entity);
        }
        if (date_from) {
            queryText += ` AND DATE(al.created_at) >= $${params.length + 1}`;
            params.push(date_from);
        }
        if (date_to) {
            queryText += ` AND DATE(al.created_at) <= $${params.length + 1}`;
            params.push(date_to);
        }
        queryText += ` ORDER BY al.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(Number(limit), offset);
        const result = await (0, database_1.query)(queryText, params);
        // Get total count
        let countQuery = 'SELECT COUNT(*) FROM audit_logs WHERE 1=1';
        let countParams = [];
        if (user_id) {
            countQuery += ` AND user_id = $1`;
            countParams.push(user_id);
        }
        if (action) {
            countQuery += ` AND action = $1`;
            countParams.push(action);
        }
        if (entity) {
            countQuery += ` AND entity = $1`;
            countParams.push(entity);
        }
        if (date_from) {
            countQuery += ` AND DATE(created_at) >= $1`;
            countParams.push(date_from);
        }
        if (date_to) {
            countQuery += ` AND DATE(created_at) <= $1`;
            countParams.push(date_to);
        }
        const countResult = await (0, database_1.query)(countQuery, countParams);
        const total = parseInt(countResult.rows[0].count);
        (0, responseHandler_1.paginatedResponse)(res, result.rows, Number(page), Number(limit), total, 'Audit logs retrieved successfully');
    }
    catch (error) {
        console.error('Get audit logs error:', error);
        (0, responseHandler_1.errorResponse)(res, 'Failed to get audit logs', 500, 'GET_AUDIT_LOGS_FAILED');
    }
};
exports.getAuditLogs = getAuditLogs;
/**
 * @swagger
 * /audit/stats:
 *   get:
 *     summary: Get audit statistics
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Audit statistics retrieved successfully
 *       403:
 *         description: Forbidden
 */
const getAuditStats = async (req, res) => {
    try {
        if (!req.user) {
            (0, responseHandler_1.errorResponse)(res, 'Unauthorized', 401, 'UNAUTHORIZED');
            return;
        }
        // Only Super Admin and Association Admin can view audit stats
        if (req.user.role !== types_1.UserRole.SUPER_ADMIN && req.user.role !== types_1.UserRole.ASSOCIATION_ADMIN) {
            (0, responseHandler_1.errorResponse)(res, 'You do not have permission to view audit statistics', 403, 'FORBIDDEN');
            return;
        }
        // Get stats by action
        const actionStats = await (0, database_1.query)(`SELECT action, COUNT(*) as count
       FROM audit_logs
       WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
       GROUP BY action
       ORDER BY count DESC`);
        // Get stats by entity
        const entityStats = await (0, database_1.query)(`SELECT entity, COUNT(*) as count
       FROM audit_logs
       WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
       GROUP BY entity
       ORDER BY count DESC`);
        // Get recent activity
        const recentActivity = await (0, database_1.query)(`SELECT al.*, u.name as user_name
       FROM audit_logs al
       LEFT JOIN users u ON al.user_id = u.id
       ORDER BY al.created_at DESC
       LIMIT 10`);
        (0, responseHandler_1.successResponse)(res, {
            actionStats: actionStats.rows,
            entityStats: entityStats.rows,
            recentActivity: recentActivity.rows,
        }, 'Audit statistics retrieved successfully');
    }
    catch (error) {
        console.error('Get audit stats error:', error);
        (0, responseHandler_1.errorResponse)(res, 'Failed to get audit statistics', 500, 'GET_AUDIT_STATS_FAILED');
    }
};
exports.getAuditStats = getAuditStats;
//# sourceMappingURL=audit.controller.js.map