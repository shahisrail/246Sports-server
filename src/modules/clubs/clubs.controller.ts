import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../../config/database';
import { successResponse, errorResponse, paginatedResponse } from '../../utils/responseHandler';
import { AuthRequest, UserRole } from '../../types';
import { AuditAction } from '../../types';
import { isValidCloudinaryUrl } from '../../utils/validateCloudinary';

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
export const getClubs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // REQUIRES AUTHENTICATION - tenant isolation
    if (!req.user) {
      errorResponse(res, 'Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      return;
    }

    const { page = 1, limit = 10, association_id, search, include_admins = 'false' } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let queryText = `
      SELECT c.*, a.name as association_name
      FROM clubs c
      LEFT JOIN associations a ON c.association_id = a.id
      WHERE c.deleted_at IS NULL
    `;
    let params: any[] = [];

    // TENANT ISOLATION: Filter clubs by user's association
    if (req.user.role !== UserRole.SUPER_ADMIN) {
      if (req.user.role === UserRole.ASSOCIATION_ADMIN && req.user.associationId) {
        queryText += ` AND c.association_id = $${params.length + 1}`;
        params.push(req.user.associationId);
      } else if ((req.user.role === UserRole.CLUB_ADMIN || req.user.role === UserRole.TEAM_MANAGER) && req.user.clubId) {
        // Club admins and team managers can only see their own club
        queryText += ` AND c.id = $${params.length + 1}`;
        params.push(req.user.clubId);
      } else {
        // Other roles get empty result
        queryText += ` AND 1 = 0`;
      }
    }

    if (association_id) {
      // SUPER_ADMIN can filter by association_id
      if (req.user.role === UserRole.SUPER_ADMIN) {
        queryText += ` AND c.association_id = $${params.length + 1}`;
        params.push(association_id);
      }
    }
    if (search) {
      queryText += ` AND c.name ILIKE $${params.length + 1}`;
      params.push(`%${search}%`);
    }

    queryText += ` ORDER BY c.name ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(Number(limit), offset);

    const result = await query(queryText, params);

    // If include_admins is true, fetch admin details for each club
    let clubsWithAdmins = result.rows;
    if (include_admins === 'true' && result.rows.length > 0) {
      clubsWithAdmins = await Promise.all(
        result.rows.map(async (club) => {
          // Get club admin
          const clubAdminResult = await query(
            `SELECT u.id, u.name, u.email, u.role
             FROM users u
             WHERE u.club_id = $1
             AND u.role = 'CLUB_ADMIN'
             AND u.deleted_at IS NULL
             LIMIT 1`,
            [club.id]
          );

          // Get teams count
          const teamCountResult = await query(
            `SELECT COUNT(*) as count
             FROM teams
             WHERE club_id = $1 AND deleted_at IS NULL`,
            [club.id]
          );

          return {
            ...club,
            club_admin: clubAdminResult.rows[0] || null,
            teams_count: parseInt(teamCountResult.rows[0].count),
          };
        })
      );
    }

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM clubs WHERE deleted_at IS NULL';
    let countParams: any[] = [];

    // Apply same tenant filters to count query
    if (req.user.role !== UserRole.SUPER_ADMIN) {
      if (req.user.role === UserRole.ASSOCIATION_ADMIN && req.user.associationId) {
        countQuery += ` AND association_id = $${countParams.length + 1}`;
        countParams.push(req.user.associationId);
      } else if ((req.user.role === UserRole.CLUB_ADMIN || req.user.role === UserRole.TEAM_MANAGER) && req.user.clubId) {
        countQuery += ` AND id = $${countParams.length + 1}`;
        countParams.push(req.user.clubId);
      } else {
        countQuery += ` AND 1 = 0`;
      }
    }

    if (association_id && req.user.role === UserRole.SUPER_ADMIN) {
      countQuery += ` AND association_id = $1`;
      countParams.push(association_id);
    }
    if (search) {
      countQuery += ` AND name ILIKE $1`;
      countParams.push(`%${search}%`);
    }

    const countResult = await query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    paginatedResponse(
      res,
      clubsWithAdmins,
      Number(page),
      Number(limit),
      total,
      'Clubs retrieved successfully'
    );
  } catch (error) {
    console.error('Get clubs error:', error);
    errorResponse(res, 'Failed to get clubs', 500, 'GET_CLUBS_FAILED');
  }
};

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
export const getPublicClubs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const queryText = `
      SELECT c.*, a.name as association_name
      FROM clubs c
      LEFT JOIN associations a ON c.association_id = a.id
      WHERE c.deleted_at IS NULL
      ORDER BY c.name ASC
      LIMIT $1 OFFSET $2
    `;

    const result = await query(queryText, [Number(limit), offset]);

    // Get total count
    const countResult = await query('SELECT COUNT(*) FROM clubs WHERE deleted_at IS NULL', []);
    const total = parseInt(countResult.rows[0].count);

    paginatedResponse(
      res,
      result.rows,
      Number(page),
      Number(limit),
      total,
      'Public clubs retrieved successfully'
    );
  } catch (error) {
    console.error('Get public clubs error:', error);
    errorResponse(res, 'Failed to get public clubs', 500, 'GET_PUBLIC_CLUBS_FAILED');
  }
};

/**
 * Test endpoint to debug request body
 */
export const testEndpoint = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    console.log('========================================');
    console.log('TEST ENDPOINT CALLED');
    console.log('========================================');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Raw body:', req.body);
    console.log('Body type:', typeof req.body);
    console.log('Body keys:', req.body ? Object.keys(req.body) : 'No body');
    console.log('Body as JSON:', JSON.stringify(req.body, null, 2));

    successResponse(res, {
      received: req.body,
      headers: req.headers,
      bodyKeys: req.body ? Object.keys(req.body) : [],
      method: req.method,
      url: req.url,
    }, 'Request received');
  } catch (error) {
    console.error('Test endpoint error:', error);
    errorResponse(res, 'Test endpoint failed', 500, 'TEST_FAILED');
  }
};

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
export const getClubById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Get club with association details
    const clubResult = await query(
      `SELECT c.*, a.name as association_name, a.logo as association_logo
       FROM clubs c
       LEFT JOIN associations a ON c.association_id = a.id
       WHERE c.id = $1 AND c.deleted_at IS NULL`,
      [id]
    );

    if (clubResult.rows.length === 0) {
      errorResponse(res, 'Club not found', 404, 'CLUB_NOT_FOUND');
      return;
    }

    const club = clubResult.rows[0];

    // Get association admin/owner
    const associationAdminResult = await query(
      `SELECT u.id, u.name, u.email, u.role
       FROM users u
       WHERE u.association_id = $1
       AND u.role IN ('ASSOCIATION_ADMIN', 'SUPER_ADMIN')
       AND u.deleted_at IS NULL
       ORDER BY u.role DESC
       LIMIT 1`,
      [club.association_id]
    );

    // Get club admin
    const clubAdminResult = await query(
      `SELECT u.id, u.name, u.email, u.role
       FROM users u
       WHERE u.club_id = $1
       AND u.role = 'CLUB_ADMIN'
       AND u.deleted_at IS NULL
       LIMIT 1`,
      [id]
    );

    // Get team count for this club
    const teamCountResult = await query(
      `SELECT COUNT(*) as count
       FROM teams
       WHERE club_id = $1 AND deleted_at IS NULL`,
      [id]
    );

    // Get players count for this club (through teams)
    const playerCountResult = await query(
      `SELECT COUNT(*) as count
       FROM players p
       JOIN teams t ON p.team_id = t.id
       WHERE t.club_id = $1 AND p.deleted_at IS NULL`,
      [id]
    );

    const response = {
      ...club,
      association_admin: associationAdminResult.rows[0] || null,
      club_admin: clubAdminResult.rows[0] || null,
      stats: {
        teams_count: parseInt(teamCountResult.rows[0].count),
        players_count: parseInt(playerCountResult.rows[0].count),
      },
    };

    successResponse(res, response, 'Club retrieved successfully');
  } catch (error) {
    console.error('Get club error:', error);
    errorResponse(res, 'Failed to get club', 500, 'GET_CLUB_FAILED');
  }
};

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
export const createClub = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    console.log('========================================');
    console.log('CREATE CLUB CONTROLLER CALLED');
    console.log('========================================');
    console.log('Raw req.body:', req.body);
    console.log('Raw req.body JSON:', JSON.stringify(req.body, null, 2));
    console.log('Content-Type:', req.headers['content-type']);

    if (!req.user) {
      errorResponse(res, 'Unauthorized', 401, 'UNAUTHORIZED');
      return;
    }

    // Direct field access instead of destructuring to avoid issues
    const name = req.body.name;
    const associationId = req.body.associationId || req.body.association_id;
    const logo = req.body.logo || req.body.logoUrl;
    const foundedYear = req.body.foundedYear || req.body.founded_year;
    const colors = req.body.colors;
    const address = req.body.address;
    const website = req.body.website || req.body.websiteUrl;
    const contactEmail = req.body.contactEmail || req.body.contact_email;
    const contactPhone = req.body.contactPhone || req.body.contact_phone;

    console.log('Extracted fields:', {
      name,
      associationId,
      logo,
      foundedYear,
      colors,
      address,
      website,
      contactEmail,
      contactPhone,
    });

    // For ASSOCIATION_ADMIN, auto-set associationId from user if not provided
    let effectiveAssociationId = associationId;
    if (req.user?.role === UserRole.ASSOCIATION_ADMIN && !associationId && req.user.associationId) {
      effectiveAssociationId = req.user.associationId;
    }

    // Validate logo URL if provided (allow blob URLs in development)
    if (logo && !logo.startsWith('blob:')) {
      if (!isValidCloudinaryUrl(logo)) {
        errorResponse(res, 'Invalid logo URL. Only Cloudinary URLs are allowed', 400, 'INVALID_LOGO_URL');
        return;
      }
    }

    // TENANT ISOLATION: Validate association access
    console.log('Create Club - Debug Info:', {
      userRole: req.user?.role,
      userAssociationId: req.user?.associationId,
      effectiveAssociationId,
      name,
      foundedYear,
      website,
      contactEmail,
      contactPhone,
      colors,
      address,
    });

    if (req.user.role === UserRole.ASSOCIATION_ADMIN && effectiveAssociationId !== req.user.associationId) {
      console.error('Association mismatch! Expected:', req.user.associationId, 'Got:', effectiveAssociationId);
      errorResponse(res, 'You can only create clubs for your own association', 403, 'ASSOCIATION_MISMATCH');
      return;
    }

    // Club admins and team managers cannot create clubs
    if (req.user.role === UserRole.CLUB_ADMIN || req.user.role === UserRole.TEAM_MANAGER) {
      errorResponse(res, 'You do not have permission to create clubs', 403, 'INSUFFICIENT_PERMISSIONS');
      return;
    }

    const clubId = uuidv4();

    const insertValues = [
      clubId,
      name,
      effectiveAssociationId,
      logo !== undefined ? logo : null,
      foundedYear !== undefined ? foundedYear : null,
      colors !== undefined ? colors : null,
      address !== undefined ? address : null,
      website !== undefined ? website : null,
      contactEmail !== undefined ? contactEmail : null,
      contactPhone !== undefined ? contactPhone : null,
    ];

    console.log('INSERT VALUES:', insertValues);

    const result = await query(
      `INSERT INTO clubs (id, name, association_id, logo, founded_year, colors, address, website, contact_email, contact_phone)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      insertValues
    );

    // Log audit
    await query(
      `INSERT INTO audit_logs (id, user_id, action, entity, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [uuidv4(), req.user.userId, AuditAction.CREATE, 'CLUB', clubId, JSON.stringify({ name, associationId: effectiveAssociationId })]
    );

    successResponse(res, result.rows[0], 'Club created successfully', 201);
  } catch (error) {
    console.error('Create club error:', error);
    errorResponse(res, 'Failed to create club', 500, 'CREATE_CLUB_FAILED');
  }
};

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
export const updateClub = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'Unauthorized', 401, 'UNAUTHORIZED');
      return;
    }

    const { id } = req.params;
    const {
      name,
      logo,
      logoUrl,
      founded_year,
      foundedYear,
      colors,
      address,
      website,
      websiteUrl,
      contact_email,
      contactEmail,
      contact_phone,
      contactPhone
    } = req.body;

    // Support both camelCase and snake_case
    // Validate logo URL if provided
    if (logo || logoUrl) {
      const logoToValidate = logo || logoUrl;
      if (!isValidCloudinaryUrl(logoToValidate)) {
        errorResponse(res, 'Invalid logo URL. Only Cloudinary URLs are allowed', 400, 'INVALID_LOGO_URL');
        return;
      }
    }
    const finalLogo = logo || logoUrl;
    const finalFoundedYear = founded_year || foundedYear;
    const finalWebsite = website || websiteUrl;
    const finalContactEmail = contact_email || contactEmail;
    const finalContactPhone = contact_phone || contactPhone;

    const existing = await query(
      'SELECT * FROM clubs WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );

    if (existing.rows.length === 0) {
      errorResponse(res, 'Club not found', 404, 'CLUB_NOT_FOUND');
      return;
    }

    // TENANT ISOLATION: Check if user can modify this club
    const club = existing.rows[0];
    if (req.user.role === UserRole.ASSOCIATION_ADMIN && club.association_id !== req.user.associationId) {
      errorResponse(res, 'You can only update clubs in your association', 403, 'ASSOCIATION_MISMATCH');
      return;
    }

    if (req.user.role === UserRole.CLUB_ADMIN && req.user.clubId !== id) {
      errorResponse(res, 'You can only update your own club', 403, 'CLUB_MISMATCH');
      return;
    }

    // Team managers cannot update clubs
    if (req.user.role === UserRole.TEAM_MANAGER) {
      errorResponse(res, 'You do not have permission to update clubs', 403, 'INSUFFICIENT_PERMISSIONS');
      return;
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (logo !== undefined || logoUrl !== undefined) {
      updates.push(`logo = $${paramCount++}`);
      values.push(finalLogo);
    }
    if (founded_year !== undefined || foundedYear !== undefined) {
      updates.push(`founded_year = $${paramCount++}`);
      values.push(finalFoundedYear);
    }
    if (colors !== undefined) {
      updates.push(`colors = $${paramCount++}`);
      values.push(colors);
    }
    if (address !== undefined) {
      updates.push(`address = $${paramCount++}`);
      values.push(address);
    }
    if (website !== undefined || websiteUrl !== undefined) {
      updates.push(`website = $${paramCount++}`);
      values.push(finalWebsite);
    }
    if (contact_email !== undefined || contactEmail !== undefined) {
      updates.push(`contact_email = $${paramCount++}`);
      values.push(finalContactEmail);
    }
    if (contact_phone !== undefined || contactPhone !== undefined) {
      updates.push(`contact_phone = $${paramCount++}`);
      values.push(finalContactPhone);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE clubs SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    // Log audit
    await query(
      `INSERT INTO audit_logs (id, user_id, action, entity, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [uuidv4(), req.user.userId, AuditAction.UPDATE, 'CLUB', id, JSON.stringify(req.body)]
    );

    successResponse(res, result.rows[0], 'Club updated successfully');
  } catch (error) {
    console.error('Update club error:', error);
    errorResponse(res, 'Failed to update club', 500, 'UPDATE_CLUB_FAILED');
  }
};

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
export const deleteClub = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'Unauthorized', 401, 'UNAUTHORIZED');
      return;
    }

    const { id } = req.params;

    const existing = await query(
      'SELECT * FROM clubs WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );

    if (existing.rows.length === 0) {
      errorResponse(res, 'Club not found', 404, 'CLUB_NOT_FOUND');
      return;
    }

    // TENANT ISOLATION: Check if user can delete this club
    const club = existing.rows[0];
    if (req.user.role === UserRole.ASSOCIATION_ADMIN && club.association_id !== req.user.associationId) {
      errorResponse(res, 'You can only delete clubs in your association', 403, 'ASSOCIATION_MISMATCH');
      return;
    }

    // Club admins and team managers cannot delete clubs
    if (req.user.role === UserRole.CLUB_ADMIN || req.user.role === UserRole.TEAM_MANAGER) {
      errorResponse(res, 'You do not have permission to delete clubs', 403, 'INSUFFICIENT_PERMISSIONS');
      return;
    }

    await query(
      'UPDATE clubs SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );

    // Log audit
    await query(
      `INSERT INTO audit_logs (id, user_id, action, entity, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [uuidv4(), req.user.userId, AuditAction.DELETE, 'CLUB', id, JSON.stringify({ name: existing.rows[0].name })]
    );

    successResponse(res, null, 'Club deleted successfully');
  } catch (error) {
    console.error('Delete club error:', error);
    errorResponse(res, 'Failed to delete club', 500, 'DELETE_CLUB_FAILED');
  }
};
