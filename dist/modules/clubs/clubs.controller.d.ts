import { Response } from 'express';
import { AuthRequest } from '../../types';
/**
 * @swagger
 * /clubs:
 *   get:
 *     summary: Get all clubs (with tenant isolation)
 *     tags: [Clubs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: association_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by association ID
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by club name
 *       - in: query
 *         name: include_admins
 *         schema:
 *           type: boolean
 *         description: Include admin information
 *     responses:
 *       200:
 *         description: Clubs retrieved successfully
 */
export declare const getClubs: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /clubs/public:
 *   get:
 *     summary: Get all clubs (public - no auth, for website)
 *     tags: [Clubs]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Public clubs list
 */
export declare const getPublicClubs: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * Test endpoint to debug request body
 */
export declare const testEndpoint: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /clubs:
 *   get:
 *     summary: Get all clubs
 *     tags: [Clubs]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: association_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by association ID
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by club name
 *     responses:
 *       200:
 *         description: Clubs retrieved successfully
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
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                       logo:
 *                         type: string
 *                         nullable: true
 *                       founded_year:
 *                         type: integer
 *                         nullable: true
 *                       colors:
 *                         type: array
 *                         items:
 *                           type: string
 *                       address:
 *                         type: string
 *                       website:
 *                         type: string
 *                         nullable: true
 *                       contact_email:
 *                         type: string
 *                         nullable: true
 *                       contact_phone:
 *                         type: string
 *                         nullable: true
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                       association_name:
 *                         type: string
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     total_pages:
 *                       type: integer
 */
/**
 * @swagger
 * /clubs/{id}:
 *   get:
 *     summary: Get club by ID with owner/admin details
 *     tags: [Clubs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Club retrieved successfully
 *       404:
 *         description: Club not found
 */
export declare const getClubById: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /clubs:
 *   post:
 *     summary: Create a new club
 *     tags: [Clubs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - association_id
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the club
 *               association_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the association this club belongs to
 *               logo:
 *                 type: string
 *                 format: uri
 *                 description: URL of the club logo (supports blob URLs during development)
 *               abbreviation:
 *                 type: string
 *                 description: Club abbreviation/short name
 *               founded_year:
 *                 type: integer
 *                 description: Year the club was founded
 *               foundedYear:
 *                 type: integer
 *                 description: Year the club was founded (camelCase alternative)
 *               colors:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Club colors (hex codes)
 *               address:
 *                 type: string
 *                 description: Club address
 *               website:
 *                 type: string
 *                 format: uri
 *                 description: Club website URL
 *               contact_email:
 *                 type: string
 *                 format: email
 *                 description: Contact email address
 *               contact_phone:
 *                 type: string
 *                 description: Contact phone number
 *     responses:
 *       201:
 *         description: Club created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 name:
 *                   type: string
 *                 logo:
 *                   type: string
 *                   nullable: true
 *                 association_id:
 *                   type: string
 *                   format: uuid
 *                 created_at:
 *                   type: string
 *                   format: date-time
 */
export declare const createClub: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /clubs/{id}:
 *   put:
 *     summary: Update a club
 *     tags: [Clubs]
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
 *               name:
 *                 type: string
 *               logo:
 *                 type: string
 *                 format: uri
 *               founded_year:
 *                 type: integer
 *               colors:
 *                 type: array
 *                 items:
 *                   type: string
 *               address:
 *                 type: string
 *               website:
 *                 type: string
 *                 format: uri
 *               contact_email:
 *                 type: string
 *                 format: email
 *               contact_phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Club updated successfully
 */
export declare const updateClub: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /clubs/{id}:
 *   delete:
 *     summary: Delete a club (soft delete)
 *     tags: [Clubs]
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
 *         description: Club deleted successfully
 */
export declare const deleteClub: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /clubs/{id}/logo:
 *   post:
 *     summary: Upload club logo
 *     tags: [Clubs]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - logo
 *             properties:
 *               logo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Logo uploaded successfully
 */
export declare const uploadLogo: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=clubs.controller.d.ts.map