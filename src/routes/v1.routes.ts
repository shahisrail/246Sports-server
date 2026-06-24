import express from 'express';

/**
 * API v1 Routes
 * Versioned API structure for future compatibility
 */

import authRoutes from '../modules/auth/auth.routes';
import { refreshToken, logout, loginV2, revokeAllTokens } from '../modules/auth/auth-v2.controller';
import associationsRoutes from '../modules/associations/associations.routes';
import competitionsRoutes from '../modules/competitions/competitions.routes';
import fixturesRoutes from '../modules/fixtures/fixtures.routes';
import resultsRoutes from '../modules/results/results.routes';
import standingsRoutes from '../modules/standings/standings.routes';
import clubsRoutes from '../modules/clubs/clubs.routes';
import teamsRoutes from '../modules/teams/teams.routes';
import playersRoutes from '../modules/players/players.routes';
import venuesRoutes from '../modules/venues/venues.routes';
import auditRoutes from '../modules/audit/audit.routes';
import searchRoutes from '../modules/search/search.routes';
import newsRoutes from '../modules/news/news.routes';
import usersRoutes from '../modules/users/users.routes';
import mediaRoutes from '../modules/media/media.routes';
import statsRoutes from '../modules/stats/stats.routes';
import sportsRoutes from '../modules/sports/sports.routes';
import emailRoutes from '../modules/email/email.routes';
import invitationsRoutes from '../modules/invitations/invitations.routes';
import emailSubscriptionsRoutes from '../modules/email-subscriptions/email-subscriptions.routes';
import videosRoutes from '../modules/videos/videos.routes';
import cmsRoutes from '../modules/cms/cms.routes';

const router = express.Router();

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
router.post('/auth/refresh', refreshToken);

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
router.post('/auth/logout', logout);

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
router.post('/auth/login-v2', loginV2);

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
router.post('/auth/revoke-all', revokeAllTokens);

// Mount all routes under /api/v1
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/sports', sportsRoutes);
router.use('/associations', associationsRoutes);
router.use('/competitions', competitionsRoutes);
router.use('/fixtures', fixturesRoutes);
router.use('/results', resultsRoutes);
router.use('/standings', standingsRoutes);
router.use('/clubs', clubsRoutes);
router.use('/teams', teamsRoutes);
router.use('/players', playersRoutes);
router.use('/venues', venuesRoutes);
router.use('/audit', auditRoutes);
router.use('/search', searchRoutes);
router.use('/news', newsRoutes);
router.use('/media', mediaRoutes);
router.use('/stats', statsRoutes);
router.use('/email', emailRoutes);
router.use('/email-subscriptions', emailSubscriptionsRoutes);
router.use('/invitations', invitationsRoutes);
router.use('/videos', videosRoutes);
router.use('/cms', cmsRoutes);

export default router;
