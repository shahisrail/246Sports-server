import { Router } from 'express';
import * as teamsController from './teams.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validateUUID } from '../../middleware/validation.middleware';
import { UserRole } from '../../types';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Teams
 *   description: Team management endpoints
 */

/**
 * @swagger
 * /api/v1teams/public:
 *   get:
 *     summary: Get all public teams
 *     tags: [Teams]
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
 *         name: competition_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by competition
 *       - in: query
 *         name: club_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by club
 *       - in: query
 *         name: sport
 *         schema:
 *           type: string
 *         description: Filter by sport type
 *     responses:
 *       200:
 *         description: List of public teams
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
 *                     $ref: '#/components/schemas/Team'
 */
router.get('/public', teamsController.getPublicTeams);

/**
 * @swagger
 * /api/v1/teams/{id}:
 *   get:
 *     summary: Get team by ID
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Team details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Team'
 *       404:
 *         description: Team not found
 */
router.get('/:id', validateUUID('id'), teamsController.getTeamById);

/**
 * @swagger
 * /api/v1/teams:
 *   get:
 *     summary: Get all teams (authenticated, tenant-filtered)
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
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
 *         name: competition_id
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: club_id
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of teams
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, teamsController.getTeams);

/**
 * @swagger
 * /api/v1/teams:
 *   post:
 *     summary: Create a new team
 *     tags: [Teams]
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
 *               - club_id
 *               - competition_id
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Eagles FC"
 *               club_id:
 *                 type: string
 *                 format: uuid
 *               competition_id:
 *                 type: string
 *                 format: uuid
 *               category:
 *                 type: string
 *                 enum: [SENIOR, U23, U20, U18, U15, U13]
 *                 default: SENIOR
 *               gender:
 *                 type: string
 *                 enum: [MALE, FEMALE, MIXED]
 *                 default: MALE
 *               logo:
 *                 type: string
 *                 format: uri
 *               coach_name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Team created successfully
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
  authorize(UserRole.SUPER_ADMIN, UserRole.ASSOCIATION_ADMIN, UserRole.CLUB_ADMIN),
  teamsController.createTeam
);

/**
 * @swagger
 * /api/v1/teams/{id}:
 *   put:
 *     summary: Update a team
 *     tags: [Teams]
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
 *               logo:
 *                 type: string
 *                 format: uri
 *               coach_name:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [SENIOR, U23, U20, U18, U15, U13]
 *               gender:
 *                 type: string
 *                 enum: [MALE, FEMALE, MIXED]
 *     responses:
 *       200:
 *         description: Team updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Team not found
 */
router.put(
  '/:id',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ASSOCIATION_ADMIN, UserRole.CLUB_ADMIN),
  validateUUID('id'),
  teamsController.updateTeam
);

/**
 * @swagger
 * /api/v1/teams/{id}:
 *   delete:
 *     summary: Delete a team
 *     tags: [Teams]
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
 *         description: Team deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Team not found
 */
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ASSOCIATION_ADMIN, UserRole.CLUB_ADMIN),
  validateUUID('id'),
  teamsController.deleteTeam
);

export default router;
