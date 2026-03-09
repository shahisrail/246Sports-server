import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../../config/database';
import { successResponse, errorResponse, paginatedResponse } from '../../utils/responseHandler';
import { AuthRequest } from '../../types';
import { AuditAction } from '../../types';

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
export const getAssociations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let queryText = `
      SELECT * FROM associations
      WHERE deleted_at IS NULL
    `;
    let params: any[] = [];

    if (search) {
      queryText += ` AND name ILIKE $${params.length + 1}`;
      params.push(`%${search}%`);
    }

    queryText += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(Number(limit), offset);

    const result = await query(queryText, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM associations WHERE deleted_at IS NULL';
    let countParams: any[] = [];

    if (search) {
      countQuery += ` AND name ILIKE $1`;
      countParams.push(`%${search}%`);
    }

    const countResult = await query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    paginatedResponse(
      res,
      result.rows,
      Number(page),
      Number(limit),
      total,
      'Associations retrieved successfully'
    );
  } catch (error) {
    console.error('Get associations error:', error);
    errorResponse(res, 'Failed to get associations', 500, 'GET_ASSOCIATIONS_FAILED');
  }
};

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
export const getAssociationById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT * FROM associations WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );

    if (result.rows.length === 0) {
      errorResponse(res, 'Association not found', 404, 'ASSOCIATION_NOT_FOUND');
      return;
    }

    successResponse(res, result.rows[0], 'Association retrieved successfully');
  } catch (error) {
    console.error('Get association error:', error);
    errorResponse(res, 'Failed to get association', 500, 'GET_ASSOCIATION_FAILED');
  }
};

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
export const createAssociation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'Unauthorized', 401, 'UNAUTHORIZED');
      return;
    }

    const {
      name,
      logo,
      abbreviation,
      foundedYear,
      description,
      website,
      websiteUrl,
      contact_email,
      contactEmail,
      contact_phone,
      contactPhone,
      address
    } = req.body;

    const associationId = uuidv4();

    const result = await query(
      `INSERT INTO associations (id, name, logo, abbreviation, founded_year, description, website, contact_email, contact_phone, address)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        associationId,
        name,
        logo || null,
        abbreviation || null,
        foundedYear || null,
        description || null,
        website || websiteUrl || null,
        contact_email || contactEmail || null,
        contact_phone || contactPhone || null,
        address || null
      ]
    );

    // Log audit
    await query(
      `INSERT INTO audit_logs (id, user_id, action, entity, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [uuidv4(), req.user.userId, AuditAction.CREATE, 'ASSOCIATION', associationId, JSON.stringify({ name, abbreviation })]
    );

    successResponse(res, result.rows[0], 'Association created successfully', 201);
  } catch (error) {
    console.error('Create association error:', error);
    errorResponse(res, 'Failed to create association', 500, 'CREATE_ASSOCIATION_FAILED');
  }
};

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
export const updateAssociation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'Unauthorized', 401, 'UNAUTHORIZED');
      return;
    }

    const { id } = req.params;
    const {
      name,
      logo,
      abbreviation,
      foundedYear,
      description,
      website,
      websiteUrl,
      contact_email,
      contactEmail,
      contact_phone,
      contactPhone,
      address
    } = req.body;

    // Check if association exists
    const existing = await query(
      'SELECT * FROM associations WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );

    if (existing.rows.length === 0) {
      errorResponse(res, 'Association not found', 404, 'ASSOCIATION_NOT_FOUND');
      return;
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (logo !== undefined) {
      updates.push(`logo = $${paramCount++}`);
      values.push(logo);
    }
    if (abbreviation !== undefined) {
      updates.push(`abbreviation = $${paramCount++}`);
      values.push(abbreviation);
    }
    if (foundedYear !== undefined) {
      updates.push(`founded_year = $${paramCount++}`);
      values.push(foundedYear);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (website !== undefined || websiteUrl !== undefined) {
      updates.push(`website = $${paramCount++}`);
      values.push(website || websiteUrl);
    }
    if (contact_email !== undefined || contactEmail !== undefined) {
      updates.push(`contact_email = $${paramCount++}`);
      values.push(contact_email || contactEmail);
    }
    if (contact_phone !== undefined || contactPhone !== undefined) {
      updates.push(`contact_phone = $${paramCount++}`);
      values.push(contact_phone || contactPhone);
    }
    if (address !== undefined) {
      updates.push(`address = $${paramCount++}`);
      values.push(address);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE associations SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    // Log audit
    await query(
      `INSERT INTO audit_logs (id, user_id, action, entity, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [uuidv4(), req.user.userId, AuditAction.UPDATE, 'ASSOCIATION', id, JSON.stringify(req.body)]
    );

    successResponse(res, result.rows[0], 'Association updated successfully');
  } catch (error) {
    console.error('Update association error:', error);
    errorResponse(res, 'Failed to update association', 500, 'UPDATE_ASSOCIATION_FAILED');
  }
};

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
export const deleteAssociation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'Unauthorized', 401, 'UNAUTHORIZED');
      return;
    }

    const { id } = req.params;

    // Check if association exists
    const existing = await query(
      'SELECT * FROM associations WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );

    if (existing.rows.length === 0) {
      errorResponse(res, 'Association not found', 404, 'ASSOCIATION_NOT_FOUND');
      return;
    }

    // Soft delete
    await query(
      'UPDATE associations SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );

    // Log audit
    await query(
      `INSERT INTO audit_logs (id, user_id, action, entity, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [uuidv4(), req.user.userId, AuditAction.DELETE, 'ASSOCIATION', id, JSON.stringify({ name: existing.rows[0].name })]
    );

    successResponse(res, null, 'Association deleted successfully');
  } catch (error) {
    console.error('Delete association error:', error);
    errorResponse(res, 'Failed to delete association', 500, 'DELETE_ASSOCIATION_FAILED');
  }
};
