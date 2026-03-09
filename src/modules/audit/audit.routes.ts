import { Router } from 'express';
import * as auditController from './audit.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { UserRole } from '../../types';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Audit
 *   description: Audit log endpoints
 */

// Protected routes - Admin only
router.get(
  '/logs',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ASSOCIATION_ADMIN),
  auditController.getAuditLogs
);
router.get(
  '/stats',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ASSOCIATION_ADMIN),
  auditController.getAuditStats
);

export default router;
