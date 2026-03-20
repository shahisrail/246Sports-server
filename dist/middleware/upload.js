"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMultipleImages = exports.uploadDocument = exports.uploadImage = void 0;
const multer_1 = __importDefault(require("multer"));
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const cloudinary_1 = require("../utils/cloudinary");
// Generic image storage configuration
const imageStorage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.cloudinary,
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
const documentStorage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.cloudinary,
    params: async (_req, _file) => ({
        folder: '246sports/documents',
        resource_type: 'auto',
    }),
});
// File filter for images
const imageFileFilter = (_req, file, cb) => {
    const allowed = new Set([
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
    ]);
    if (allowed.has(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Only JPG, PNG, and WEBP images are allowed'));
    }
};
// Upload middleware for images
exports.uploadImage = (0, multer_1.default)({
    storage: imageStorage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
});
// Upload middleware for documents
exports.uploadDocument = (0, multer_1.default)({
    storage: documentStorage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
    },
});
// Upload middleware for multiple images
exports.uploadMultipleImages = (0, multer_1.default)({
    storage: imageStorage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 10, // Max 10 images
    },
});
//# sourceMappingURL=upload.js.map