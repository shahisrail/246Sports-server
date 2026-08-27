import { Router } from 'express';
import { NextFunction, Response } from 'express';
import multer from 'multer';
import { verifyToken } from '../../utils/jwt';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validateUUID } from '../../middleware/validation.middleware';
import { AuthRequest, UserRole } from '../../types';
import * as latestUpdatesController from './latest-updates.controller';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const optionalAuthenticate = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      req.user = verifyToken(authHeader.substring(7));
    } catch {
      req.user = undefined;
    }
  }
  next();
};

router.get('/', optionalAuthenticate, latestUpdatesController.getLatestUpdates);
router.get('/:id', optionalAuthenticate, validateUUID('id'), latestUpdatesController.getLatestUpdateById);

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
