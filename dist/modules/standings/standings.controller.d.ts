import { Response } from 'express';
import { AuthRequest } from '../../types';
/**
 * @swagger
 * /standings/competition/{competitionId}:
 *   get:
 *     summary: Get standings for a competition
 *     tags: [Standings]
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Standings retrieved successfully
 */
export declare const getStandingsByCompetition: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /standings/recalculate/{competitionId}:
 *   post:
 *     summary: Recalculate standings for a competition (admin only)
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
 */
export declare const recalculateStandings: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=standings.controller.d.ts.map