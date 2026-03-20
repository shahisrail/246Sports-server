import { Response } from 'express';
import { AuthRequest } from '../../types';
/**
 * @swagger
 * /sports:
 *   get:
 *     summary: Get all sports
 *     tags: [Sports]
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
 *         name: category
 *         schema:
 *           type: string
 *           enum: [TEAM_SPORTS, RACKET_SPORTS, AQUATICS, ATHLETICS, COMBAT_SPORTS, INDIVIDUAL, MIND_GAMES, MOTOR_SPORTS, OTHER]
 *       - in: query
 *         name: is_popular
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sports retrieved successfully
 */
export declare const getSports: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /sports/categories:
 *   get:
 *     summary: Get sports grouped by category
 *     tags: [Sports]
 *     responses:
 *       200:
 *         description: Sports by category retrieved successfully
 */
export declare const getSportsByCategory: (_req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /sports/{id}:
 *   get:
 *     summary: Get sport by ID
 *     tags: [Sports]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Sport retrieved successfully
 *       404:
 *         description: Sport not found
 */
export declare const getSportById: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /sports/{id}/positions:
 *   get:
 *     summary: Get positions for a specific sport
 *     tags: [Sports]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Sport positions retrieved successfully
 */
export declare const getSportPositions: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /sports:
 *   post:
 *     summary: Create a new sport (Super Admin only)
 *     tags: [Sports]
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
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [TEAM_SPORTS, RACKET_SPORTS, AQUATICS, ATHLETICS, COMBAT_SPORTS, INDIVIDUAL, MIND_GAMES, MOTOR_SPORTS, OTHER]
 *               description:
 *                 type: string
 *               icon:
 *                 type: string
 *               is_popular:
 *                 type: boolean
 *               is_active:
 *                 type: boolean
 *               display_order:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Sport created successfully
 *       403:
 *         description: Forbidden - Super Admin only
 */
export declare const createSport: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /sports/{id}:
 *   put:
 *     summary: Update a sport (Super Admin only)
 *     tags: [Sports]
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
 *               slug:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               icon:
 *                 type: string
 *               is_popular:
 *                 type: boolean
 *               is_active:
 *                 type: boolean
 *               display_order:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Sport updated successfully
 *       403:
 *         description: Forbidden - Super Admin only
 */
export declare const updateSport: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /sports/{id}:
 *   delete:
 *     summary: Delete a sport (soft delete, Super Admin only)
 *     tags: [Sports]
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
 *         description: Sport deleted successfully
 *       403:
 *         description: Forbidden - Super Admin only
 */
export declare const deleteSport: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /sports/positions:
 *   post:
 *     summary: Create a new sport position (Super Admin only)
 *     tags: [Sports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sport_id
 *               - name
 *             properties:
 *               sport_id:
 *                 type: string
 *                 format: uuid
 *               name:
 *                 type: string
 *               abbreviation:
 *                 type: string
 *               description:
 *                 type: string
 *               display_order:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Sport position created successfully
 *       403:
 *         description: Forbidden - Super Admin only
 */
export declare const createSportPosition: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /sports/positions/{id}:
 *   put:
 *     summary: Update a sport position (Super Admin only)
 *     tags: [Sports]
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
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               abbreviation:
 *                 type: string
 *               description:
 *                 type: string
 *               display_order:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Sport position updated successfully
 *       403:
 *         description: Forbidden - Super Admin only
 */
export declare const updateSportPosition: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /sports/positions/{id}:
 *   delete:
 *     summary: Delete a sport position (soft delete, Super Admin only)
 *     tags: [Sports]
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
 *         description: Sport position deleted successfully
 *       403:
 *         description: Forbidden - Super Admin only
 */
export declare const deleteSportPosition: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /sports/stats:
 *   get:
 *     summary: Get sports statistics
 *     tags: [Sports]
 *     responses:
 *       200:
 *         description: Sports statistics retrieved successfully
 */
export declare const getSportsStats: (_req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=sports.controller.d.ts.map