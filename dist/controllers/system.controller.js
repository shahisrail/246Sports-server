"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rootEndpoint = exports.healthCheck = void 0;
const responseHandler_1 = require("../utils/responseHandler");
const database_1 = require("../config/database");
/**
 * Health Check Controller
 * Provides system health status
 */
/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [System]
 *     description: Returns the health status of the API and dependencies
 *     responses:
 *       200:
 *         description: System is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 version:
 *                   type: string
 *                 uptime:
 *                   type: number
 *                 database:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                     responseTime:
 *                       type: number
 */
const healthCheck = async (_req, res) => {
    const startTime = Date.now();
    let dbStatus = 'disconnected';
    let dbResponseTime = 0;
    try {
        // Check database connection
        await (0, database_1.query)('SELECT 1');
        dbStatus = 'healthy';
        dbResponseTime = Date.now() - startTime;
    }
    catch (error) {
        dbStatus = 'error';
        dbResponseTime = Date.now() - startTime;
    }
    const uptime = process.uptime();
    const uptimeFormatted = formatUptime(uptime);
    (0, responseHandler_1.successResponse)(res, {
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        uptime: uptimeFormatted,
        uptimeSeconds: Math.floor(uptime),
        environment: process.env.NODE_ENV || 'development',
        database: {
            status: dbStatus,
            responseTime: `${dbResponseTime}ms`,
        },
        memory: {
            used: formatBytes(process.memoryUsage().heapUsed),
            total: formatBytes(process.memoryUsage().heapTotal),
            rss: formatBytes(process.memoryUsage().rss),
        },
    }, 'System is healthy');
};
exports.healthCheck = healthCheck;
/**
 * @swagger
 * /:
 *   get:
 *     summary: API root endpoint
 *     tags: [System]
 *     description: Returns API information and available endpoints
 *     responses:
 *       200:
 *         description: API information
 */
const rootEndpoint = (_req, res) => {
    res.status(200).json({
        success: true,
        message: 'Welcome to 246Sports API',
        version: '2.0.0',
        documentation: '/api-docs',
        endpoints: {
            health: '/health',
            api_v1: '/api/v1',
            auth: {
                login: '/api/v1/auth/login',
                register: '/api/v1/auth/register',
                refresh: '/api/v1/auth/refresh',
                logout: '/api/v1/auth/logout',
            },
            resources: {
                associations: '/api/v1/associations',
                competitions: '/api/v1/competitions',
                fixtures: '/api/v1/fixtures',
                results: '/api/v1/results',
                standings: '/api/v1/standings',
                clubs: '/api/v1/clubs',
                teams: '/api/v1/teams',
                players: '/api/v1/players',
                venues: '/api/v1/venues',
                news: '/api/v1/news',
                search: '/api/v1/search',
            },
        },
        support: {
            email: 'support@246sports.bb',
            website: 'https://246sports.bb',
            docs: 'https://docs.246sports.bb',
        },
    });
};
exports.rootEndpoint = rootEndpoint;
// Helper functions
function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const parts = [];
    if (days > 0)
        parts.push(`${days}d`);
    if (hours > 0)
        parts.push(`${hours}h`);
    if (minutes > 0)
        parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0)
        parts.push(`${secs}s`);
    return parts.join(' ');
}
function formatBytes(bytes) {
    if (bytes === 0)
        return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
//# sourceMappingURL=system.controller.js.map