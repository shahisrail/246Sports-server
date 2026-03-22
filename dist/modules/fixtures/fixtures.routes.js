"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fixturesController = __importStar(require("./fixtures.controller"));
const auth_middleware_1 = require("../../middleware/auth.middleware");
const validation_middleware_1 = require("../../middleware/validation.middleware");
const types_1 = require("../../types");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Fixtures
 *   description: Fixture and match management endpoints
 */
/**
 * @swagger
 * /api/v1/fixtures:
 *   get:
 *     summary: Get all fixtures with filtering and pagination
 *     tags: [Fixtures]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: competition_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by competition ID
 *       - in: query
 *         name: team_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by team ID
 *       - in: query
 *         name: venue_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by venue ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [SCHEDULED, LIVE, FINISHED, POSTPONED, CANCELLED]
 *         description: Filter by status
 *       - in: query
 *         name: sport
 *         schema:
 *           type: string
 *         description: Filter by sport type
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter fixtures from this date
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter fixtures until this date
 *     responses:
 *       200:
 *         description: List of fixtures
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
 *                     $ref: '#/components/schemas/Fixture'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 */
router.get('/', fixturesController.getFixtures);
/**
 * @swagger
 * /api/v1/fixtures/today:
 *   get:
 *     summary: Get today's fixtures
 *     tags: [Fixtures]
 *     responses:
 *       200:
 *         description: List of today's fixtures
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
 *                     $ref: '#/components/schemas/Fixture'
 */
router.get('/today', fixturesController.getTodayFixtures);
/**
 * @swagger
 * /api/v1/fixtures/upcoming:
 *   get:
 *     summary: Get upcoming fixtures
 *     tags: [Fixtures]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of fixtures to return
 *     responses:
 *       200:
 *         description: List of upcoming fixtures
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
 *                     $ref: '#/components/schemas/Fixture'
 */
router.get('/upcoming', fixturesController.getUpcomingFixtures);
/**
 * @swagger
 * /api/v1/fixtures/finished:
 *   get:
 *     summary: Get finished fixtures with results
 *     tags: [Fixtures]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of fixtures to return
 *     responses:
 *       200:
 *         description: List of finished fixtures
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
 *                     $ref: '#/components/schemas/Fixture'
 */
router.get('/finished', fixturesController.getFinishedFixtures);
/**
 * @swagger
 * /api/v1/fixtures/{id}:
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
 *         description: Fixture ID
 *     responses:
 *       200:
 *         description: Fixture details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Fixture'
 *       404:
 *         description: Fixture not found
 */
router.get('/:id', (0, validation_middleware_1.validateUUID)('id'), fixturesController.getFixtureById);
/**
 * @swagger
 * /api/v1/fixtures/{id}/calendar:
 *   get:
 *     summary: Get fixture as calendar event
 *     tags: [Fixtures]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Fixture ID
 *     responses:
 *       200:
 *         description: Calendar event data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Fixture not found
 */
router.get('/:id/calendar', (0, validation_middleware_1.validateUUID)('id'), fixturesController.getFixtureAsICS);
/**
 * @swagger
 * /api/v1/fixtures/{id}/ics:
 *   get:
 *     summary: Export fixture as ICS file
 *     tags: [Fixtures]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Fixture ID
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
router.get('/:id/ics', (0, validation_middleware_1.validateUUID)('id'), fixturesController.exportFixtureICS);
/**
 * @swagger
 * /api/v1/fixtures/{id}/directions:
 *   get:
 *     summary: Get directions to fixture venue
 *     tags: [Fixtures]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Fixture ID
 *     responses:
 *       200:
 *         description: Directions data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Fixture or venue not found
 */
router.get('/:id/directions', (0, validation_middleware_1.validateUUID)('id'), fixturesController.getFixtureDirections);
/**
 * @swagger
 * /api/v1/fixtures:
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
 *               - scheduled_date
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
 *               scheduled_date:
 *                 type: string
 *                 format: date-time
 *               round:
 *                 type: string
 *                 example: "Round 1"
 *               stream_url:
 *                 type: string
 *                 format: uri
 *     responses:
 *       201:
 *         description: Fixture created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 */
router.post('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(types_1.UserRole.SUPER_ADMIN, types_1.UserRole.ASSOCIATION_ADMIN, types_1.UserRole.COMPETITION_MANAGER), fixturesController.createFixture);
/**
 * @swagger
 * /api/v1/fixtures/{id}:
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
 *               scheduled_date:
 *                 type: string
 *                 format: date-time
 *               venue_id:
 *                 type: string
 *                 format: uuid
 *               status:
 *                 type: string
 *                 enum: [SCHEDULED, LIVE, FINISHED, POSTPONED, CANCELLED]
 *               stream_url:
 *                 type: string
 *                 format: uri
 *               round:
 *                 type: string
 *     responses:
 *       200:
 *         description: Fixture updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Fixture not found
 */
router.put('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(types_1.UserRole.SUPER_ADMIN, types_1.UserRole.ASSOCIATION_ADMIN, types_1.UserRole.COMPETITION_MANAGER), (0, validation_middleware_1.validateUUID)('id'), fixturesController.updateFixture);
/**
 * @swagger
 * /api/v1/fixtures/{id}:
 *   delete:
 *     summary: Delete a fixture
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
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Fixture not found
 */
router.delete('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(types_1.UserRole.SUPER_ADMIN, types_1.UserRole.ASSOCIATION_ADMIN, types_1.UserRole.COMPETITION_MANAGER), (0, validation_middleware_1.validateUUID)('id'), fixturesController.deleteFixture);
exports.default = router;
//# sourceMappingURL=fixtures.routes.js.map