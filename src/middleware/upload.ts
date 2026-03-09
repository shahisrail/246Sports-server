import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { cloudinary } from '../utils/cloudinary';

// Generic image storage configuration
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, _file) => ({
    folder: '246sports/images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    resource_type: 'image',
    transformation: [
      { quality: 'auto:good', fetch_format: 'auto' },
    ],
  }),
});

// Document storage configuration
const documentStorage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, _file) => ({
    folder: '246sports/documents',
    resource_type: 'auto',
  }),
});

// File filter for images
const imageFileFilter = (_req: any, file: any, cb: any) => {
  const allowed = new Set([
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ]);

  if (allowed.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG, and WEBP images are allowed'));
  }
};

// Upload middleware for images
export const uploadImage = multer({
  storage: imageStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// Upload middleware for documents
export const uploadDocument = multer({
  storage: documentStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// Upload middleware for multiple images
export const uploadMultipleImages = multer({
  storage: imageStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 10, // Max 10 images
  },
});
