import { Router } from 'express';
import * as mediaController from './media.controller';
import { uploadImage, uploadMultipleImages } from '../../middleware/upload';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// All media routes require authentication
router.use(authenticate);

// Single image upload
router.post('/upload/image', uploadImage.single('file'), mediaController.uploadSingleImage);

// Multiple images upload
router.post('/upload/images', uploadMultipleImages.array('files', 10), mediaController.uploadMultipleImagesHandler);

// Delete image
router.post('/upload/delete', mediaController.deleteImage);

export default router;
