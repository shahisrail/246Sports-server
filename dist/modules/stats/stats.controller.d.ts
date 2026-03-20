import { Response } from 'express';
import { AuthRequest } from '../../types';
/**
 * @swagger
 * /stats/growth:
 *   get:
 *     summary: Get growth trends over time
 *     tags: [Stats]
 *     responses:
 *       200:
 *         description: Growth trends retrieved successfully
 */
export declare const getGrowthTrends: (_req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /stats/monthly-activity:
 *   get:
 *     summary: Get monthly activity data
 *     tags: [Stats]
 *     responses:
 *       200:
 *         description: Monthly activity retrieved successfully
 */
export declare const getMonthlyActivity: (_req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /stats/entity-distribution:
 *   get:
 *     summary: Get entity distribution
 *     tags: [Stats]
 *     responses:
 *       200:
 *         description: Entity distribution retrieved successfully
 */
export declare const getEntityDistribution: (_req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /stats/competition-status:
 *   get:
 *     summary: Get competition status breakdown
 *     tags: [Stats]
 *     responses:
 *       200:
 *         description: Competition status retrieved successfully
 */
export declare const getCompetitionStatus: (_req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /stats/dashboard:
 *   get:
 *     summary: Get dashboard stats (filtered by user role)
 *     tags: [Stats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats retrieved successfully
 *       401:
 *         description: Unauthorized
 */
export declare const getDashboardStats: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=stats.controller.d.ts.map