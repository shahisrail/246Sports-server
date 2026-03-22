import { Router } from 'express';
import {
  getGrowthTrends,
  getMonthlyActivity,
  getEntityDistribution,
  getCompetitionStatus,
  getDashboardStats,
} from './stats.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Stats
 *   description: Statistics and analytics endpoints
 */

/**
 * @swagger
 * /api/v1/stats/dashboard:
 *   get:
 *     summary: Get dashboard statistics (public)
 *     tags: [Stats]
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalAssociations:
 *                       type: integer
 *                     totalCompetitions:
 *                       type: integer
 *                     totalFixtures:
 *                       type: integer
 *                     liveFixtures:
 *                       type: integer
 *                     totalTeams:
 *                       type: integer
 *                     totalPlayers:
 *                       type: integer
 */
router.get('/dashboard', getDashboardStats);

/**
 * @swagger
 * /api/v1/stats/growth:
 *   get:
 *     summary: Get growth trends
 *     tags: [Stats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d, 1y]
 *           default: 30d
 *         description: Time period for growth data
 *     responses:
 *       200:
 *         description: Growth trends retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     dates:
 *                       type: array
 *                       items:
 *                         type: string
 *                         format: date
 *                     associations:
 *                       type: array
 *                       items:
 *                         type: integer
 *                     competitions:
 *                       type: array
 *                       items:
 *                         type: integer
 *                     fixtures:
 *                       type: array
 *                       items:
 *                         type: integer
 *       401:
 *         description: Unauthorized
 */
router.get('/growth', authenticate, getGrowthTrends);

/**
 * @swagger
 * /api/v1/stats/monthly-activity:
 *   get:
 *     summary: Get monthly activity statistics
 *     tags: [Stats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: months
 *         schema:
 *           type: integer
 *           default: 12
 *           minimum: 1
 *           maximum: 24
 *         description: Number of months to retrieve
 *     responses:
 *       200:
 *         description: Monthly activity data retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     months:
 *                       type: array
 *                       items:
 *                         type: string
 *                     fixturesCreated:
 *                       type: array
 *                       items:
 *                         type: integer
 *                     resultsSubmitted:
 *                       type: array
 *                       items:
 *                         type: integer
 *       401:
 *         description: Unauthorized
 */
router.get('/monthly-activity', authenticate, getMonthlyActivity);

/**
 * @swagger
 * /api/v1/stats/entity-distribution:
 *   get:
 *     summary: Get entity distribution by type
 *     tags: [Stats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Entity distribution data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     bySport:
 *                       type: object
 *                       additionalProperties:
 *                         type: integer
 *                     byAssociation:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           count:
 *                             type: integer
 *       401:
 *         description: Unauthorized
 */
router.get('/entity-distribution', authenticate, getEntityDistribution);

/**
 * @swagger
 * /api/v1/stats/competition-status:
 *   get:
 *     summary: Get competition status overview
 *     tags: [Stats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Competition status data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     upcoming:
 *                       type: integer
 *                     ongoing:
 *                       type: integer
 *                     completed:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 */
router.get('/competition-status', authenticate, getCompetitionStatus);

export default router;
