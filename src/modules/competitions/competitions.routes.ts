import { Router } from 'express';
import * as competitionsController from './competitions.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validateUUID } from '../../middleware/validation.middleware';
import { UserRole } from '../../types';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Competitions
 *   description: Competition and tournament management endpoints
 */

/**
 * @swagger
 * /api/v1/competitions:
 *   get:
 *     summary: Get all competitions
 *     tags: [Competitions]
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
 *         name: sport
 *         schema:
 *           type: string
 *         description: Filter by sport type
 *       - in: query
 *         name: association_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by association
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [LEAGUE, CUP, TOURNAMENT]
 *         description: Filter by category
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [UPCOMING, ONGOING, COMPLETED]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of competitions
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
 *                     $ref: '#/components/schemas/Competition'
 *                 pagination:
 *                   type: object
 */
router.get('/', competitionsController.getCompetitions);

/**
 * @swagger
 * /api/v1/competitions/{id}:
 *   get:
 *     summary: Get competition by ID
 *     tags: [Competitions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Competition details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Competition'
 *       404:
 *         description: Competition not found
 */
router.get('/:id', validateUUID('id'), competitionsController.getCompetitionById);

/**
 * @swagger
 * /api/v1/competitions:
 *   post:
 *     summary: Create a new competition
 *     tags: [Competitions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - sport
 *               - association_id
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Premier League"
 *               sport:
 *                 type: string
 *                 example: "Football"
 *               association_id:
 *                 type: string
 *                 format: uuid
 *               category:
 *                 type: string
 *                 enum: [LEAGUE, CUP, TOURNAMENT]
 *                 default: LEAGUE
 *               season_id:
 *                 type: string
 *                 format: uuid
 *               status:
 *                 type: string
 *                 enum: [UPCOMING, ONGOING, COMPLETED]
 *                 default: UPCOMING
 *               rules:
 *                 type: string
 *               points_win:
 *                 type: integer
 *                 default: 3
 *               points_draw:
 *                 type: integer
 *                 default: 1
 *               points_loss:
 *                 type: integer
 *                 default: 0
 *     responses:
 *       201:
 *         description: Competition created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
  '/',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ASSOCIATION_ADMIN, UserRole.COMPETITION_MANAGER),
  competitionsController.createCompetition
);

/**
 * @swagger
 * /api/v1/competitions/{id}:
 *   put:
 *     summary: Update a competition
 *     tags: [Competitions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [UPCOMING, ONGOING, COMPLETED]
 *               rules:
 *                 type: string
 *               points_win:
 *                 type: integer
 *               points_draw:
 *                 type: integer
 *               points_loss:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Competition updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Competition not found
 */
router.put(
  '/:id',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ASSOCIATION_ADMIN, UserRole.COMPETITION_MANAGER),
  validateUUID('id'),
  competitionsController.updateCompetition
);

/**
 * @swagger
 * /api/v1/competitions/{id}:
 *   delete:
 *     summary: Delete a competition
 *     tags: [Competitions]
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
 *         description: Competition deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Competition not found
 */
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ASSOCIATION_ADMIN),
  validateUUID('id'),
  competitionsController.deleteCompetition
);

/**
 * @swagger
 * /api/v1/competitions/{id}/generate-fixtures:
 *   post:
 *     summary: Generate fixtures for a competition
 *     tags: [Competitions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - start_date
 *               - end_date
 *             properties:
 *               start_date:
 *                 type: string
 *                 format: date
 *               end_date:
 *                 type: string
 *                 format: date
 *               match_type:
 *                 type: string
 *                 enum: [HOME_AND_AWAY, SINGLE_ROUND_ROBIN]
 *                 default: HOME_AND_AWAY
 *     responses:
 *       200:
 *         description: Fixtures generated successfully
 *       400:
 *         description: Invalid request or no teams in competition
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Competition not found
 */
router.post(
  '/:id/generate-fixtures',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ASSOCIATION_ADMIN),
  validateUUID('id'),
  competitionsController.generateFixtures as any
);

export default router;
