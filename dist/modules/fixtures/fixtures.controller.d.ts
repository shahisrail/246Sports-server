import { Response } from 'express';
import { AuthRequest } from '../../types';
/**
 * @swagger
 * /fixtures:
 *   get:
 *     summary: Get all fixtures
 *     tags: [Fixtures]
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
 *         name: venue_id
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [SCHEDULED, LIVE, FINISHED, POSTPONED, CANCELLED]
 *       - in: query
 *         name: date_from
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: date_to
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Fixtures retrieved successfully
 */
export declare const getFixtures: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /fixtures/today:
 *   get:
 *     summary: Get today's fixtures
 *     tags: [Fixtures]
 *     responses:
 *       200:
 *         description: Today's fixtures retrieved successfully
 */
export declare const getTodayFixtures: (_req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /fixtures/{id}:
 *   get:
 *     summary: Get fixture by ID
 *     tags: [Fixtures]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Fixture retrieved successfully
 *       404:
 *         description: Fixture not found
 */
export declare const getFixtureById: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /fixtures:
 *   post:
 *     summary: Create a new fixture
 *     tags: [Fixtures]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - competition_id
 *               - home_team_id
 *               - away_team_id
 *               - venue_id
 *               - date_time
 *             properties:
 *               competition_id:
 *                 type: string
 *                 format: uuid
 *               home_team_id:
 *                 type: string
 *                 format: uuid
 *               away_team_id:
 *                 type: string
 *                 format: uuid
 *               venue_id:
 *                 type: string
 *                 format: uuid
 *               date_time:
 *                 type: string
 *                 format: date-time
 *               round:
 *                 type: string
 *               stream_url:
 *                 type: string
 *                 format: uri
 *     responses:
 *       201:
 *         description: Fixture created successfully
 */
export declare const createFixture: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /fixtures/{id}:
 *   put:
 *     summary: Update a fixture
 *     tags: [Fixtures]
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
 *               date_time:
 *                 type: string
 *                 format: date-time
 *               venue_id:
 *                 type: string
 *                 format: uuid
 *               status:
 *                 type: string
 *                 enum: [SCHEDULED, LIVE, FINISHED, POSTPONED, CANCELLED]
 *               round:
 *                 type: string
 *               stream_url:
 *                 type: string
 *                 format: uri
 *     responses:
 *       200:
 *         description: Fixture updated successfully
 */
export declare const updateFixture: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /fixtures/{id}:
 *   delete:
 *     summary: Delete a fixture (soft delete)
 *     tags: [Fixtures]
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
 *         description: Fixture deleted successfully
 */
export declare const deleteFixture: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /fixtures/{id}/calendar:
 *   get:
 *     summary: Get fixture as ICS calendar file
 *     tags: [Fixtures]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: ICS file generated
 *         content:
 *           text/calendar:
 *             schema:
 *               type: string
 */
export declare const getFixtureAsICS: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /fixtures/{id}/directions:
 *   get:
 *     summary: Get GPS directions links for a fixture
 *     tags: [Fixtures]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Direction links for Google Maps and Apple Maps
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 googleMaps:
 *                   type: string
 *                   example: "https://www.google.com/maps/search/?api=1&query=Kensington+Oval+13.1939,-59.5432"
 *                 appleMaps:
 *                   type: string
 *                   example: "http://maps.apple.com/?daddr=13.1939,-59.5432&dirflg=d"
 *                 venue:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     address:
 *                       type: string
 *                     latitude:
 *                       type: number
 *                     longitude:
 *                       type: number
 *       404:
 *         description: Fixture not found or no GPS coordinates available
 */
export declare const getFixtureDirections: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /fixtures/upcoming:
 *   get:
 *     summary: Get upcoming fixtures (after today)
 *     tags: [Fixtures]
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
 *     responses:
 *       200:
 *         description: Upcoming fixtures retrieved successfully
 */
export declare const getUpcomingFixtures: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /fixtures/finished:
 *   get:
 *     summary: Get finished fixtures
 *     tags: [Fixtures]
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
 *     responses:
 *       200:
 *         description: Finished fixtures retrieved successfully
 */
export declare const getFinishedFixtures: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * Enhanced ICS export using ICSService
 * @swagger
 * /fixtures/{id}/ics:
 *   get:
 *     summary: Export fixture as ICS calendar file (enhanced)
 *     tags: [Fixtures]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: ICS calendar file
 *         content:
 *           text/calendar:
 *             schema:
 *               type: string
 *       404:
 *         description: Fixture not found
 */
export declare const exportFixtureICS: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=fixtures.controller.d.ts.map