import { Router } from 'express';
import * as resultsController from './results.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validateUUID } from '../../middleware/validation.middleware';
import { UserRole } from '../../types';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Results
 *   description: Match results and score management endpoints
 */

/**
 * @swagger
 * /api/v1/results:
 *   get:
 *     summary: Get all match results
 *     tags: [Results]
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
 *         name: competition_id
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: team_id
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [SUBMITTED, CONFIRMED, PUBLISHED]
 *     responses:
 *       200:
 *         description: List of results
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
 *                     $ref: '#/components/schemas/Result'
 */
router.get('/', resultsController.getResults);

/**
 * @swagger
 * /api/v1/results/fixture/{fixtureId}:
 *   get:
 *     summary: Get result by fixture ID
 *     tags: [Results]
 *     parameters:
 *       - in: path
 *         name: fixtureId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Result details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Result'
 *       404:
 *         description: Result not found
 */
router.get('/fixture/:fixtureId', validateUUID('fixtureId'), resultsController.getResultByFixtureId);

/**
 * @swagger
 * /api/v1/results:
 *   post:
 *     summary: Submit a match result
 *     tags: [Results]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fixture_id
 *               - home_score
 *               - away_score
 *             properties:
 *               fixture_id:
 *                 type: string
 *                 format: uuid
 *               home_score:
 *                 type: integer
 *                 minimum: 0
 *               away_score:
 *                 type: integer
 *                 minimum: 0
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Result submitted
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
  authorize(UserRole.SUPER_ADMIN, UserRole.ASSOCIATION_ADMIN, UserRole.COMPETITION_MANAGER, UserRole.CLUB_ADMIN, UserRole.TEAM_MANAGER),
  resultsController.submitResult
);

/**
 * @swagger
 * /api/v1/results/{id}/confirm:
 *   put:
 *     summary: Confirm a submitted result
 *     tags: [Results]
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
 *         description: Result confirmed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Result not found
 */
router.put(
  '/:id/confirm',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ASSOCIATION_ADMIN, UserRole.COMPETITION_MANAGER),
  validateUUID('id'),
  resultsController.confirmResult
);
router.patch(
  '/:id/confirm',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ASSOCIATION_ADMIN, UserRole.COMPETITION_MANAGER),
  validateUUID('id'),
  resultsController.confirmResult
);

/**
 * @swagger
 * /api/v1/results/{id}/publish:
 *   put:
 *     summary: Publish a confirmed result (public)
 *     tags: [Results]
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
 *         description: Result published
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Result not found
 */
router.put(
  '/:id/publish',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ASSOCIATION_ADMIN, UserRole.COMPETITION_MANAGER),
  validateUUID('id'),
  resultsController.publishResult
);
router.patch(
  '/:id/publish',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ASSOCIATION_ADMIN, UserRole.COMPETITION_MANAGER),
  validateUUID('id'),
  resultsController.publishResult
);

export default router;
