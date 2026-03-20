import { Response, Request } from 'express';
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
export declare const healthCheck: (_req: Request, res: Response) => Promise<void>;
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
export declare const rootEndpoint: (_req: Request, res: Response) => void;
//# sourceMappingURL=system.controller.d.ts.map