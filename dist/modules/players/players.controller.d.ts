import { Response } from 'express';
import { AuthRequest } from '../../types';
/**
 * @swagger
 * /players:
 *   get:
 *     summary: Get all players
 *     tags: [Players]
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
 *         name: team_id
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Players retrieved successfully
 */
export declare const getPlayers: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /players/{id}:
 *   get:
 *     summary: Get player by ID
 *     tags: [Players]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Player retrieved successfully
 *       404:
 *         description: Player not found
 */
export declare const getPlayerById: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /players:
 *   post:
 *     summary: Create a new player
 *     tags: [Players]
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
 *               - team_id
 *             properties:
 *               name:
 *                 type: string
 *               team_id:
 *                 type: string
 *                 format: uuid
 *               photo:
 *                 type: string
 *                 format: uri
 *               position:
 *                 type: string
 *               squad_number:
 *                 type: integer
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *               nationality:
 *                 type: string
 *               height:
 *                 type: integer
 *               weight:
 *                 type: integer
 *               bio:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Player created successfully
 */
export declare const createPlayer: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /players/{id}:
 *   put:
 *     summary: Update a player
 *     tags: [Players]
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
 *               photo:
 *                 type: string
 *                 format: uri
 *               position:
 *                 type: string
 *               squad_number:
 *                 type: integer
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *               nationality:
 *                 type: string
 *               height:
 *                 type: integer
 *               weight:
 *                 type: integer
 *               bio:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Player updated successfully
 */
export declare const updatePlayer: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /players/{id}:
 *   delete:
 *     summary: Delete a player (soft delete)
 *     tags: [Players]
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
 *         description: Player deleted successfully
 */
export declare const deletePlayer: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=players.controller.d.ts.map