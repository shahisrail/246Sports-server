import { Response } from 'express';
import { successResponse, errorResponse } from '../../utils/responseHandler';

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
export const uploadSingleImage = async (req: any, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      errorResponse(res, 'No file uploaded', 400, 'NO_FILE');
      return;
    }

    const imageUrl = req.file.path;
    const publicId = req.file.filename;

    successResponse(res, {
      url: imageUrl,
      publicId,
      originalName: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
    }, 'Image uploaded successfully');
  } catch (error) {
    console.error('Upload error:', error);
    errorResponse(res, 'Failed to upload image', 500, 'UPLOAD_FAILED');
  }
};

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
export const uploadMultipleImagesHandler = async (req: any, res: Response): Promise<void> => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      errorResponse(res, 'No files uploaded', 400, 'NO_FILES');
      return;
    }

    const files = req.files.map((file: any) => ({
      url: file.path,
      publicId: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
    }));

    successResponse(res, files, 'Images uploaded successfully');
  } catch (error) {
    console.error('Upload error:', error);
    errorResponse(res, 'Failed to upload images', 500, 'UPLOAD_FAILED');
  }
};

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
export const deleteImage = async (req: any, res: Response): Promise<void> => {
  try {
    const { publicId } = req.body;

    if (!publicId) {
      errorResponse(res, 'Public ID is required', 400, 'MISSING_PUBLIC_ID');
      return;
    }

    // Delete from Cloudinary
    const { cloudinary } = await import('../../utils/cloudinary');
    await cloudinary.uploader.destroy(publicId);

    successResponse(res, { publicId }, 'Image deleted successfully');
  } catch (error) {
    console.error('Delete error:', error);
    errorResponse(res, 'Failed to delete image', 500, 'DELETE_FAILED');
  }
};
