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

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: API v1
 *   description: Version 1 of the 246Sports API
 */

// Mount all routes under /api/v1
router.use('/auth', authRoutes);

// Additional auth endpoints with refresh tokens
router.post('/auth/refresh', refreshToken);
router.post('/auth/logout', logout);
router.post('/auth/login-v2', loginV2);
router.post('/auth/revoke-all', revokeAllTokens);

router.use('/users', usersRoutes);
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

export default router;
