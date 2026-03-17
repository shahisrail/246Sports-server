import { Router } from 'express';
import {
  getSports,
  getSportsByCategory,
  getSportById,
  getSportPositions,
  createSport,
  updateSport,
  deleteSport,
  createSportPosition,
  updateSportPosition,
  deleteSportPosition,
  getSportsStats,
} from './sports.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// Public routes - Get sports
router.get('/', getSports);
router.get('/categories', getSportsByCategory);
router.get('/stats', getSportsStats);
router.get('/:id', getSportById);
router.get('/:id/positions', getSportPositions);

// Protected routes - Create/Update/Delete (Super Admin only)
router.post('/', authenticate, createSport);
router.put('/:id', authenticate, updateSport);
router.delete('/:id', authenticate, deleteSport);

// Sport Positions routes
router.post('/positions', authenticate, createSportPosition);
router.put('/positions/:id', authenticate, updateSportPosition);
router.delete('/positions/:id', authenticate, deleteSportPosition);

export default router;
