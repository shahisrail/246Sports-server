import { Router } from 'express';
import * as mediaController from './media.controller';
import { uploadImage, uploadMultipleImages } from '../../middleware/upload';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Media
 *   description: Media upload and management endpoints
 */

// All media routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/v1/media/upload/image:
 *   post:
 *     summary: Upload a single image
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Image file to upload (max 5MB)
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                       format: uri
 *                     publicId:
 *                       type: string
 *                     width:
 *                       type: integer
 *                     height:
 *                       type: integer
 *       400:
 *         description: Invalid file or file too large
 *       401:
 *         description: Unauthorized
 */
router.post('/upload/image', uploadImage.single('file'), mediaController.uploadSingleImage);

/**
 * @swagger
 * /api/v1/media/upload/images:
 *   post:
 *     summary: Upload multiple images
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - files
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 maxItems: 10
 *                 description: Array of image files (max 10, each max 5MB)
 *     responses:
 *       200:
 *         description: Images uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       url:
 *                         type: string
 *                         format: uri
 *                       publicId:
 *                         type: string
 *       400:
 *         description: Invalid files or too many files
 *       401:
 *         description: Unauthorized
 */
router.post('/upload/images', uploadMultipleImages.array('files', 10), mediaController.uploadMultipleImagesHandler);

/**
 * @swagger
 * /api/v1/media/upload/delete:
 *   post:
 *     summary: Delete an uploaded image
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - publicId
 *             properties:
 *               publicId:
 *                 type: string
 *                 description: Cloudinary public ID of the image to delete
 *                 example: "sports/image_abc123"
 *     responses:
 *       200:
 *         description: Image deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Invalid public ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Image not found
 */
router.post('/upload/delete', mediaController.deleteImage);

export default router;
