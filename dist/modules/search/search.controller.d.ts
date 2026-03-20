import { Response } from 'express';
import { AuthRequest } from '../../types';
/**
 * Global Search Controller
 * Full-text search across all entities
 */
/**
 * @swagger
 * /search:
 *   get:
 *     summary: Global search across all entities
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: types
 *         schema:
 *           type: string
 *           enum: [ASSOCIATION,CLUB,TEAM,COMPETITION,VENUE,PLAYER,NEWS]
 *         description: Filter by entity types (comma-separated)
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
 *         description: Search results
 */
export declare const globalSearch: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /search/associations:
 *   get:
 *     summary: Search associations
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Association search results
 */
export declare const searchAssociations: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /search/clubs:
 *   get:
 *     summary: Search clubs
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: association_id
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Club search results
 */
export declare const searchClubs: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /search/teams:
 *   get:
 *     summary: Search teams
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Team search results
 */
export declare const searchTeams: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /search/venues:
 *   get:
 *     summary: Search venues
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Venue search results
 */
export declare const searchVenues: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=search.controller.d.ts.map