import { Response } from 'express';
import { AuthRequest } from '../../types';
/**
 * @swagger
 * /teams:
 *   get:
 *     summary: Get all teams (with tenant isolation)
 *     tags: [Teams]
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
 *         name: club_id
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: competition_id
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: include_admins
 *         schema:
 *           type: boolean
 *         description: Include admin information
 *     responses:
 *       200:
 *         description: Teams retrieved successfully
 */
export declare const getTeams: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /teams/public:
 *   get:
 *     summary: Get all teams (public - no auth, for website)
 *     tags: [Teams]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Public teams list
 */
export declare const getPublicTeams: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /teams/{id}:
 *   get:
 *     summary: Get team by ID with admin details
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
 *         description: Team retrieved successfully
 *       404:
 *         description: Team not found
 */
export declare const getTeamById: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /teams:
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
 *               club_id:
 *                 type: string
 *                 format: uuid
 *               competition_id:
 *                 type: string
 *                 format: uuid
 *               category:
 *                 type: string
 *                 enum: [SENIOR, U23, U20, U18, U15, U13]
 *               gender:
 *                 type: string
 *                 enum: [MALE, FEMALE, MIXED]
 *               logo:
 *                 type: string
 *                 format: uri
 *               coach_name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Team created successfully
 */
export declare const createTeam: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /teams/{id}:
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
 *               category:
 *                 type: string
 *                 enum: [SENIOR, U23, U20, U18, U15, U13]
 *               gender:
 *                 type: string
 *                 enum: [MALE, FEMALE, MIXED]
 *               logo:
 *                 type: string
 *                 format: uri
 *               coach_name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Team updated successfully
 */
export declare const updateTeam: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /teams/{id}:
 *   delete:
 *     summary: Delete a team (soft delete)
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
 */
export declare const deleteTeam: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=teams.controller.d.ts.map