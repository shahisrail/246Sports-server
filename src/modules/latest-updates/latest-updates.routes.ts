import { Router } from 'express';
import multer from 'multer';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validateUUID } from '../../middleware/validation.middleware';
import { UserRole } from '../../types';
import * as latestUpdatesController from './latest-updates.controller';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.get('/', latestUpdatesController.getLatestUpdates);
router.get('/:id', validateUUID('id'), latestUpdatesController.getLatestUpdateById);

router.post(
  '/import',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ASSOCIATION_ADMIN),
  upload.single('file'),
  latestUpdatesController.importLatestUpdates
);

router.put(
  '/:id',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ASSOCIATION_ADMIN),
  validateUUID('id'),
  latestUpdatesController.updateLatestUpdate
);

router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ASSOCIATION_ADMIN),
  validateUUID('id'),
  latestUpdatesController.deleteLatestUpdate
);

export default router;
