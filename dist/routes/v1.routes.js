"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
/**
 * API v1 Routes
 * Versioned API structure for future compatibility
 */
const auth_routes_1 = __importDefault(require("../modules/auth/auth.routes"));
const auth_v2_controller_1 = require("../modules/auth/auth-v2.controller");
const associations_routes_1 = __importDefault(require("../modules/associations/associations.routes"));
const competitions_routes_1 = __importDefault(require("../modules/competitions/competitions.routes"));
const fixtures_routes_1 = __importDefault(require("../modules/fixtures/fixtures.routes"));
const results_routes_1 = __importDefault(require("../modules/results/results.routes"));
const standings_routes_1 = __importDefault(require("../modules/standings/standings.routes"));
const clubs_routes_1 = __importDefault(require("../modules/clubs/clubs.routes"));
const teams_routes_1 = __importDefault(require("../modules/teams/teams.routes"));
const players_routes_1 = __importDefault(require("../modules/players/players.routes"));
const venues_routes_1 = __importDefault(require("../modules/venues/venues.routes"));
const audit_routes_1 = __importDefault(require("../modules/audit/audit.routes"));
const search_routes_1 = __importDefault(require("../modules/search/search.routes"));
const news_routes_1 = __importDefault(require("../modules/news/news.routes"));
const users_routes_1 = __importDefault(require("../modules/users/users.routes"));
const media_routes_1 = __importDefault(require("../modules/media/media.routes"));
const stats_routes_1 = __importDefault(require("../modules/stats/stats.routes"));
const sports_routes_1 = __importDefault(require("../modules/sports/sports.routes"));
const email_routes_1 = __importDefault(require("../modules/email/email.routes"));
const invitations_routes_1 = __importDefault(require("../modules/invitations/invitations.routes"));
const email_subscriptions_routes_1 = __importDefault(require("../modules/email-subscriptions/email-subscriptions.routes"));
const videos_routes_1 = __importDefault(require("../modules/videos/videos.routes"));
const cms_routes_1 = __importDefault(require("../modules/cms/cms.routes"));
const bulk_import_routes_1 = __importDefault(require("../modules/bulk-import/bulk-import.routes"));
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   name: API v1
 *   description: Version 1 of the 246Sports API
 */
/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     summary: Refresh access token using refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh token from login
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post('/auth/refresh', auth_v2_controller_1.refreshToken);
/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout user and invalidate tokens
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/auth/logout', auth_v2_controller_1.logout);
/**
 * @swagger
 * /api/v1/auth/login-v2:
 *   post:
 *     summary: Login with enhanced session management (V2)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful with refresh token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     tokens:
 *                       type: object
 *                       properties:
 *                         accessToken:
 *                           type: string
 *                         refreshToken:
 *                           type: string
 *       401:
 *         description: Invalid credentials
 */
router.post('/auth/login-v2', auth_v2_controller_1.loginV2);
/**
 * @swagger
 * /api/v1/auth/revoke-all:
 *   post:
 *     summary: Revoke all refresh tokens for current user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All tokens revoked
 *       401:
 *         description: Unauthorized
 */
router.post('/auth/revoke-all', auth_v2_controller_1.revokeAllTokens);
// Mount all routes under /api/v1
router.use('/auth', auth_routes_1.default);
router.use('/users', users_routes_1.default);
router.use('/sports', sports_routes_1.default);
router.use('/associations', associations_routes_1.default);
router.use('/competitions', competitions_routes_1.default);
router.use('/fixtures', fixtures_routes_1.default);
router.use('/results', results_routes_1.default);
router.use('/standings', standings_routes_1.default);
router.use('/clubs', clubs_routes_1.default);
router.use('/teams', teams_routes_1.default);
router.use('/players', players_routes_1.default);
router.use('/venues', venues_routes_1.default);
router.use('/audit', audit_routes_1.default);
router.use('/search', search_routes_1.default);
router.use('/news', news_routes_1.default);
router.use('/media', media_routes_1.default);
router.use('/stats', stats_routes_1.default);
router.use('/email', email_routes_1.default);
router.use('/email-subscriptions', email_subscriptions_routes_1.default);
router.use('/invitations', invitations_routes_1.default);
router.use('/videos', videos_routes_1.default);
router.use('/cms', cms_routes_1.default);
router.use('/bulk-import', bulk_import_routes_1.default);
exports.default = router;
//# sourceMappingURL=v1.routes.js.map