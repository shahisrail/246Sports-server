import { Router } from 'express';
import * as standingsController from './standings.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validateUUID } from '../../middleware/validation.middleware';
import { UserRole } from '../../types';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Standings
 *   description: Competition standings and league tables
 */

/**
 * @swagger
 * /api/v1/standings/competition/{competitionId}:
 *   get:
 *     summary: Get standings by competition
 *     tags: [Standings]
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Competition ID
 *       - in: query
 *         name: group
 *         schema:
 *           type: string
 *         description: Filter by group (for group-stage competitions)
 *     responses:
 *       200:
 *         description: Standings table
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
 *                     $ref: '#/components/schemas/Standing'
 *       404:
 *         description: Competition not found
 */
router.get(
  '/competition/:competitionId',
  validateUUID('competitionId'),
  standingsController.getStandingsByCompetition
);

/**
 * @swagger
 * /api/v1/standings/recalculate/{competitionId}:
 *   post:
 *     summary: Recalculate standings for a competition
 *     tags: [Standings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Standings recalculated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Competition not found
 */
router.post(
  '/recalculate/:competitionId',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ASSOCIATION_ADMIN),
  validateUUID('competitionId'),
  standingsController.recalculateStandings
);

export default router;
