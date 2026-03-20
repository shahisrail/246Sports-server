import { Response } from 'express';
/**
 * @swagger
 * /media/upload/image:
 *   post:
 *     summary: Upload a single image
 *     tags: [Media]
 *     consumes:
 *       - multipart/form-data
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
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 */
export declare const uploadSingleImage: (req: any, res: Response) => Promise<void>;
/**
 * @swagger
 * /media/upload/images:
 *   post:
 *     summary: Upload multiple images
 *     tags: [Media]
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Images uploaded successfully
 */
export declare const uploadMultipleImagesHandler: (req: any, res: Response) => Promise<void>;
/**
 * @swagger
 * /media/upload/delete:
 *   post:
 *     summary: Delete an uploaded image
 *     tags: [Media]
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
 *     responses:
 *       200:
 *         description: Image deleted successfully
 */
export declare const deleteImage: (req: any, res: Response) => Promise<void>;
//# sourceMappingURL=media.controller.d.ts.map