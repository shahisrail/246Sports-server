import { Router } from 'express';
import * as searchController from './search.controller';
import { searchRateLimit } from '../../middleware/rateLimit.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Search
 *   description: Global search endpoints
 */

// Public routes with rate limiting
router.get(
  '/',
  searchRateLimit,
  searchController.globalSearch
);
router.get(
  '/associations',
  searchRateLimit,
  searchController.searchAssociations
);
router.get(
  '/clubs',
  searchRateLimit,
  searchController.searchClubs
);
router.get(
  '/teams',
  searchRateLimit,
  searchController.searchTeams
);
router.get(
  '/venues',
  searchRateLimit,
  searchController.searchVenues
);

export default router;
