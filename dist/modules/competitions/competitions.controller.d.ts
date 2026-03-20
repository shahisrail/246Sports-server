import { Response } from 'express';
import { AuthRequest } from '../../types';
/**
 * @swagger
 * /competitions:
 *   get:
 *     summary: Get all competitions
 *     tags: [Competitions]
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
 *         name: association_id
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: sport
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [UPCOMING, ONGOING, COMPLETED]
 *     responses:
 *       200:
 *         description: Competitions retrieved successfully
 */
export declare const getCompetitions: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /competitions/{id}:
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
 *         description: Competition retrieved successfully
 *       404:
 *         description: Competition not found
 */
export declare const getCompetitionById: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /competitions:
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
 *               - season_id
 *             properties:
 *               name:
 *                 type: string
 *               sport:
 *                 type: string
 *               association_id:
 *                 type: string
 *                 format: uuid
 *               season_id:
 *                 type: string
 *                 format: uuid
 *               category:
 *                 type: string
 *                 enum: [LEAGUE, CUP, TOURNAMENT]
 *               status:
 *                 type: string
 *                 enum: [UPCOMING, ONGOING, COMPLETED]
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
 */
export declare const createCompetition: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /competitions/{id}:
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
 *               sport:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [LEAGUE, CUP, TOURNAMENT]
 *               status:
 *                 type: string
 *                 enum: [UPCOMING, ONGOING, COMPLETED]
 *               rules:
 *                 type: string
 *     responses:
 *       200:
 *         description: Competition updated successfully
 */
export declare const updateCompetition: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /competitions/{id}:
 *   delete:
 *     summary: Delete a competition (soft delete)
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
 */
export declare const deleteCompetition: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /competitions/{id}/generate-fixtures:
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
 *               - teamIds
 *               - format
 *               - startDate
 *             properties:
 *               teamIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: Array of team IDs to include in fixtures
 *               format:
 *                 type: string
 *                 enum: [round-robin, double-round-robin]
 *                 description: Fixture format
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Date for first round of fixtures
 *               matchdays:
 *                 type: integer
 *                 description: Number of days between matchdays
 *     responses:
 *       200:
 *         description: Fixtures generated successfully
 */
export declare const generateFixtures: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=competitions.controller.d.ts.map