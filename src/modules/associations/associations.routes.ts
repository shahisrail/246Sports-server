import { Router } from 'express';
import * as associationsController from './associations.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validateUUID } from '../../middleware/validation.middleware';
import { uploadImage } from '../../middleware/upload';
import { UserRole } from '../../types';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Associations
 *   description: Association management endpoints
 */

// Public routes
router.get('/', associationsController.getAssociations);
router.get('/:id', validateUUID('id'), associationsController.getAssociationById);

// Protected routes - Super Admin only
router.post(
  '/',
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  associationsController.createAssociation
);
router.put(
  '/:id',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ASSOCIATION_ADMIN),
  validateUUID('id'),
  associationsController.updateAssociation
);
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  validateUUID('id'),
  associationsController.deleteAssociation
);

// Dedicated logo upload endpoint
router.post(
  '/:id/logo',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ASSOCIATION_ADMIN),
  validateUUID('id'),
  uploadImage.single('logo'),
  associationsController.uploadLogo
);

export default router;
