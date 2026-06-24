import { Response } from 'express';
import { AuthRequest } from '../../types';
/**
 * @swagger
 * tags:
 *   name: CMS
 *   description: Public page content and SEO management
 */
/**
 * @swagger
 * /api/v1/cms/pages/public/{pageKey}:
 *   get:
 *     summary: Get a published CMS page by key
 *     tags: [CMS]
 *     parameters:
 *       - in: path
 *         name: pageKey
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: CMS page retrieved successfully
 *       404:
 *         description: CMS page not found
 */
export declare const getPublicPage: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /api/v1/cms/pages:
 *   get:
 *     summary: List CMS pages
 *     tags: [CMS]
 *     security:
 *       - bearerAuth: []
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, PUBLISHED, ARCHIVED]
 *     responses:
 *       200:
 *         description: CMS pages retrieved successfully
 */
export declare const getPages: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /api/v1/cms/pages/{pageKey}:
 *   get:
 *     summary: Get a CMS page by key for admin editing
 *     tags: [CMS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pageKey
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: CMS page retrieved successfully
 *       404:
 *         description: CMS page not found
 */
export declare const getPageByKey: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /api/v1/cms/pages:
 *   post:
 *     summary: Create a CMS page
 *     tags: [CMS]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [pageKey, title]
 *             properties:
 *               pageKey:
 *                 type: string
 *               routePath:
 *                 type: string
 *               title:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [DRAFT, PUBLISHED, ARCHIVED]
 *               content:
 *                 type: object
 *               seo:
 *                 type: object
 *     responses:
 *       201:
 *         description: CMS page created successfully
 */
export declare const createPage: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /api/v1/cms/pages/{pageKey}:
 *   put:
 *     summary: Update a CMS page
 *     tags: [CMS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pageKey
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: CMS page updated successfully
 */
export declare const updatePage: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /api/v1/cms/pages/{pageKey}:
 *   delete:
 *     summary: Archive a CMS page
 *     tags: [CMS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pageKey
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: CMS page archived successfully
 */
export declare const archivePage: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=cms.controller.d.ts.map