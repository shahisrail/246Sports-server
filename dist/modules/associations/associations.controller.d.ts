import { Response } from 'express';
import { AuthRequest } from '../../types';
/**
 * @swagger
 * /associations:
 *   get:
 *     summary: Get all associations
 *     tags: [Associations]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name
 *     responses:
 *       200:
 *         description: Associations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Associations retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                         example: 123e4567-e89b-12d3-a456-426614174000
 *                       name:
 *                         type: string
 *                         example: Barbados Football Association
 *                       abbreviation:
 *                         type: string
 *                         example: BFA
 *                       founded_year:
 *                         type: integer
 *                         example: 1950
 *                       logo:
 *                         type: string
 *                         format: uri
 *                         example: https://example.com/logo.png
 *                       description:
 *                         type: string
 *                         example: Governing body for football in Barbados
 *                       website:
 *                         type: string
 *                         format: uri
 *                         example: https://barbadosfa.com
 *                       contact_email:
 *                         type: string
 *                         format: email
 *                         example: info@barbadosfa.com
 *                       contact_phone:
 *                         type: string
 *                         example: +1 246 426-7353
 *                       address:
 *                         type: string
 *                         example: Fairy Valley, Christ Church, Barbados
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: 2024-01-01T00:00:00Z
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                         example: 2024-01-01T00:00:00Z
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     total:
 *                       type: integer
 *                       example: 25
 *                     totalPages:
 *                       type: integer
 *                       example: 3
 */
export declare const getAssociations: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /associations/{id}:
 *   get:
 *     summary: Get association by ID
 *     tags: [Associations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Association ID
 *     responses:
 *       200:
 *         description: Association retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Association retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                     abbreviation:
 *                       type: string
 *                     founded_year:
 *                       type: integer
 *                     logo:
 *                       type: string
 *                     description:
 *                       type: string
 *                     website:
 *                       type: string
 *                     contact_email:
 *                       type: string
 *                     contact_phone:
 *                       type: string
 *                     address:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: Association not found
 */
export declare const getAssociationById: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /associations:
 *   post:
 *     summary: Create a new association
 *     tags: [Associations]
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
 *             properties:
 *               name:
 *                 type: string
 *                 description: Association name
 *                 example: Barbados Football Association
 *               abbreviation:
 *                 type: string
 *                 maxLength: 20
 *                 description: Association abbreviation (max 20 characters)
 *                 example: BFA
 *               foundedYear:
 *                 type: integer
 *                 minimum: 1800
 *                 maximum: 2100
 *                 description: Year the association was founded
 *                 example: 1950
 *               logo:
 *                 type: string
 *                 format: uri
 *                 description: URL to association logo
 *                 example: https://example.com/logo.png
 *               description:
 *                 type: string
 *                 description: Association description
 *                 example: Governing body for football in Barbados
 *               website:
 *                 type: string
 *                 format: uri
 *                 description: Association website URL
 *                 example: https://barbadosfa.com
 *               websiteUrl:
 *                 type: string
 *                 format: uri
 *                 description: Alternative field name for website URL
 *                 example: https://barbadosfa.com
 *               contact_email:
 *                 type: string
 *                 format: email
 *                 description: Contact email address
 *                 example: info@barbadosfa.com
 *               contactEmail:
 *                 type: string
 *                 format: email
 *                 description: Alternative field name for contact email
 *                 example: info@barbadosfa.com
 *               contact_phone:
 *                 type: string
 *                 description: Contact phone number
 *                 example: +1 246 426-7353
 *               contactPhone:
 *                 type: string
 *                 description: Alternative field name for contact phone
 *                 example: +1 246 426-7353
 *               address:
 *                 type: string
 *                 description: Physical address
 *                 example: Fairy Valley, Christ Church, Barbados
 *     responses:
 *       201:
 *         description: Association created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Association created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                     abbreviation:
 *                       type: string
 *                     founded_year:
 *                       type: integer
 *                     logo:
 *                       type: string
 *                     description:
 *                       type: string
 *                     website:
 *                       type: string
 *                     contact_email:
 *                       type: string
 *                     contact_phone:
 *                       type: string
 *                     address:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
export declare const createAssociation: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /associations/{id}:
 *   put:
 *     summary: Update an association
 *     tags: [Associations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Association ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Updated Association Name
 *               abbreviation:
 *                 type: string
 *                 maxLength: 20
 *                 example: BFA
 *               foundedYear:
 *                 type: integer
 *                 minimum: 1800
 *                 maximum: 2100
 *                 example: 1950
 *               logo:
 *                 type: string
 *                 format: uri
 *                 example: https://example.com/logo.png
 *               description:
 *                 type: string
 *                 example: Updated description
 *               website:
 *                 type: string
 *                 format: uri
 *                 example: https://barbadosfa.com
 *               websiteUrl:
 *                 type: string
 *                 format: uri
 *                 example: https://barbadosfa.com
 *               contact_email:
 *                 type: string
 *                 format: email
 *                 example: info@barbadosfa.com
 *               contactEmail:
 *                 type: string
 *                 format: email
 *                 example: info@barbadosfa.com
 *               contact_phone:
 *                 type: string
 *                 example: +1 246 426-7353
 *               contactPhone:
 *                 type: string
 *                 example: +1 246 426-7353
 *               address:
 *                 type: string
 *                 example: Updated address
 *     responses:
 *       200:
 *         description: Association updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Association updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                     abbreviation:
 *                       type: string
 *                     founded_year:
 *                       type: integer
 *                     logo:
 *                       type: string
 *                     description:
 *                       type: string
 *                     website:
 *                       type: string
 *                     contact_email:
 *                       type: string
 *                     contact_phone:
 *                       type: string
 *                     address:
 *                       type: string
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Association not found
 */
export declare const updateAssociation: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /associations/{id}:
 *   delete:
 *     summary: Delete an association (soft delete)
 *     tags: [Associations]
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
 *         description: Association deleted successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Association not found
 */
export declare const deleteAssociation: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /associations/{id}/logo:
 *   post:
 *     summary: Upload association logo
 *     tags: [Associations]
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
//# sourceMappingURL=associations.controller.d.ts.map