import { Response } from 'express';
import { AuthRequest } from '../../types';
/**
 * News Controller
 * CRUD operations for news articles
 */
/**
 * @swagger
 * /news:
 *   get:
 *     summary: Get all news articles
 *     tags: [News]
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
 *         name: association_id
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: sport
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, PUBLISHED, ARCHIVED]
 *     responses:
 *       200:
 *         description: News articles retrieved successfully
 */
export declare const getNews: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /news/{slug}:
 *   get:
 *     summary: Get news article by slug
 *     tags: [News]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: News article retrieved successfully
 *       404:
 *         description: News article not found
 */
export declare const getNewsBySlug: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /news:
 *   post:
 *     summary: Create a news article
 *     tags: [News]
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
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               association_id:
 *                 type: string
 *                 format: uuid
 *               excerpt:
 *                 type: string
 *               featured_image:
 *                 type: string
 *                 format: uri
 *               sport:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [BULLETIN, UPDATE, FEATURE, ANNOUNCEMENT]
 *               region:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [DRAFT, PUBLISHED, ARCHIVED]
 *     responses:
 *       201:
 *         description: News article created successfully
 */
export declare const createNews: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /news/{id}:
 *   put:
 *     summary: Update a news article
 *     tags: [News]
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
 *               content:
 *                 type: string
 *               excerpt:
 *                 type: string
 *               featured_image:
 *                 type: string
 *                 format: uri
 *               sport:
 *                 type: string
 *               category:
 *                 type: string
 *               region:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [DRAFT, PUBLISHED, ARCHIVED]
 *     responses:
 *       200:
 *         description: News article updated successfully
 */
export declare const updateNews: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /news/{id}:
 *   delete:
 *     summary: Delete a news article (soft delete)
 *     tags: [News]
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
 *         description: News article deleted successfully
 */
export declare const deleteNews: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=news.controller.d.ts.map