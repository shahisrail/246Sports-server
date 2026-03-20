"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteImage = exports.uploadMultipleImagesHandler = exports.uploadSingleImage = void 0;
const responseHandler_1 = require("../../utils/responseHandler");
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
const uploadSingleImage = async (req, res) => {
    try {
        if (!req.file) {
            (0, responseHandler_1.errorResponse)(res, 'No file uploaded', 400, 'NO_FILE');
            return;
        }
        const imageUrl = req.file.path;
        const publicId = req.file.filename;
        (0, responseHandler_1.successResponse)(res, {
            url: imageUrl,
            publicId,
            originalName: req.file.originalname,
            size: req.file.size,
            mimeType: req.file.mimetype,
        }, 'Image uploaded successfully');
    }
    catch (error) {
        console.error('Upload error:', error);
        (0, responseHandler_1.errorResponse)(res, 'Failed to upload image', 500, 'UPLOAD_FAILED');
    }
};
exports.uploadSingleImage = uploadSingleImage;
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
const uploadMultipleImagesHandler = async (req, res) => {
    try {
        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
            (0, responseHandler_1.errorResponse)(res, 'No files uploaded', 400, 'NO_FILES');
            return;
        }
        const files = req.files.map((file) => ({
            url: file.path,
            publicId: file.filename,
            originalName: file.originalname,
            size: file.size,
            mimeType: file.mimetype,
        }));
        (0, responseHandler_1.successResponse)(res, files, 'Images uploaded successfully');
    }
    catch (error) {
        console.error('Upload error:', error);
        (0, responseHandler_1.errorResponse)(res, 'Failed to upload images', 500, 'UPLOAD_FAILED');
    }
};
exports.uploadMultipleImagesHandler = uploadMultipleImagesHandler;
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
const deleteImage = async (req, res) => {
    try {
        const { publicId } = req.body;
        if (!publicId) {
            (0, responseHandler_1.errorResponse)(res, 'Public ID is required', 400, 'MISSING_PUBLIC_ID');
            return;
        }
        // Delete from Cloudinary
        const { cloudinary } = await Promise.resolve().then(() => __importStar(require('../../utils/cloudinary')));
        await cloudinary.uploader.destroy(publicId);
        (0, responseHandler_1.successResponse)(res, { publicId }, 'Image deleted successfully');
    }
    catch (error) {
        console.error('Delete error:', error);
        (0, responseHandler_1.errorResponse)(res, 'Failed to delete image', 500, 'DELETE_FAILED');
    }
};
exports.deleteImage = deleteImage;
//# sourceMappingURL=media.controller.js.map