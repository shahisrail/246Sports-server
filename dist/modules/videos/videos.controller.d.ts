import { Response } from 'express';
import { AuthRequest } from '../../types';
/**
 * Videos Controller
 * CRUD operations for video content
 */
/**
 * @swagger
 * /videos:
 *   get:
 *     summary: Get all videos
 *     tags: [Videos]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: sport
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published]
 *     responses:
 *       200:
 *         description: Videos retrieved successfully
 */
export declare const getVideos: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /videos/{id}:
 *   get:
 *     summary: Get video by ID
 *     tags: [Videos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Video retrieved successfully
 *       404:
 *         description: Video not found
 */
export declare const getVideoById: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /videos:
 *   post:
 *     summary: Create a new video
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - youtubeUrl
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               youtubeUrl:
 *                 type: string
 *                 format: uri
 *               thumbnailUrl:
 *                 type: string
 *                 format: uri
 *               sport:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [HIGHLIGHTS, FULL_MATCH, INTERVIEW, DOCUMENTARY]
 *               eventDate:
 *                 type: string
 *                 format: date
 *               isPublished:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Video created successfully
 */
export declare const createVideo: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /videos/{id}:
 *   put:
 *     summary: Update a video
 *     tags: [Videos]
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
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               youtubeUrl:
 *                 type: string
 *                 format: uri
 *               thumbnailUrl:
 *                 type: string
 *                 format: uri
 *               sport:
 *                 type: string
 *               category:
 *                 type: string
 *               eventDate:
 *                 type: string
 *                 format: date
 *               isPublished:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Video updated successfully
 */
export declare const updateVideo: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /videos/{id}:
 *   delete:
 *     summary: Delete a video (soft delete)
 *     tags: [Videos]
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
 *         description: Video deleted successfully
 */
export declare const deleteVideo: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=videos.controller.d.ts.map