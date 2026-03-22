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
 *   description: Sports association management endpoints
 */

/**
 * @swagger
 * /api/v1/associations:
 *   get:
 *     summary: Get all associations
 *     tags: [Associations]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: sport
 *         schema:
 *           type: string
 *         description: Filter by sport type
 *     responses:
 *       200:
 *         description: List of associations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Association'
 */
router.get('/', associationsController.getAssociations);

/**
 * @swagger
 * /api/v1/associations/{id}:
 *   get:
 *     summary: Get association by ID
 *     tags: [Associations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Association details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Association'
 *       404:
 *         description: Association not found
 */
router.get('/:id', validateUUID('id'), associationsController.getAssociationById);

/**
 * @swagger
 * /api/v1/associations:
 *   post:
 *     summary: Create a new association
 *     tags: [Associations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Barbados Football Association"
 *               abbreviation:
 *                 type: string
 *                 example: "BFA"
 *               logo:
 *                 type: string
 *                 format: uri
 *               description:
 *                 type: string
 *               website:
 *                 type: string
 *                 format: uri
 *               contact_email:
 *                 type: string
 *                 format: email
 *               contact_phone:
 *                 type: string
 *               address:
 *                 type: string
 *               founded_year:
 *                 type: integer
 *                 example: 1900
 *               president_name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Association created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Super Admin only
 */
router.post(
  '/',
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  associationsController.createAssociation
);

/**
 * @swagger
 * /api/v1/associations/{id}:
 *   put:
 *     summary: Update an association
 *     tags: [Associations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               abbreviation:
 *                 type: string
 *               logo:
 *                 type: string
 *                 format: uri
 *               description:
 *                 type: string
 *               website:
 *                 type: string
 *                 format: uri
 *               contact_email:
 *                 type: string
 *                 format: email
 *               contact_phone:
 *                 type: string
 *               president_name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Association updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Association not found
 */
router.put(
  '/:id',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ASSOCIATION_ADMIN),
  validateUUID('id'),
  associationsController.updateAssociation
);

/**
 * @swagger
 * /api/v1/associations/{id}:
 *   delete:
 *     summary: Delete an association
 *     tags: [Associations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Association deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Super Admin only
 *       404:
 *         description: Association not found
 */
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  validateUUID('id'),
  associationsController.deleteAssociation
);

/**
 * @swagger
 * /api/v1/associations/{id}/logo:
 *   post:
 *     summary: Upload association logo
 *     tags: [Associations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - logo
 *             properties:
 *               logo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Logo uploaded successfully
 *       400:
 *         description: Invalid file
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
  '/:id/logo',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ASSOCIATION_ADMIN),
  validateUUID('id'),
  uploadImage.single('logo'),
  associationsController.uploadLogo
);

export default router;
