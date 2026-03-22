import { Router } from 'express';
import {
  getGrowthTrends,
  getMonthlyActivity,
  getEntityDistribution,
  getCompetitionStatus,
  getDashboardStats,
} from './stats.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/dashboard', getDashboardStats);

// Protected routes
router.use(authenticate);

router.get('/growth', getGrowthTrends);
router.get('/monthly-activity', getMonthlyActivity);
router.get('/entity-distribution', getEntityDistribution);
router.get('/competition-status', getCompetitionStatus);

export default router;
