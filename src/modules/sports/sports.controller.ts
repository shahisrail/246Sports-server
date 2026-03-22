import { Response } from 'express';
const { v4: uuidv4 } = require("uuid");
import { query } from '../../config/database';
import { successResponse, errorResponse, paginatedResponse } from '../../utils/responseHandler';
import { AuthRequest } from '../../types';
import {
  AuditAction,
} from '../../types';

/**
 * @swagger
 * /sports:
 *   get:
 *     summary: Get all sports
 *     tags: [Sports]
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
 *         name: category
 *         schema:
 *           type: string
 *           enum: [TEAM_SPORTS, RACKET_SPORTS, AQUATICS, ATHLETICS, COMBAT_SPORTS, INDIVIDUAL, MIND_GAMES, MOTOR_SPORTS, OTHER]
 *       - in: query
 *         name: is_popular
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sports retrieved successfully
 */
export const getSports = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 50,
      category,
      is_popular,
      is_active = 'true',
      search,
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    let queryText = `
      SELECT s.*
      FROM sports s
      WHERE s.deleted_at IS NULL
    `;
    let params: any[] = [];

    // Filter by category
    if (category) {
      queryText += ` AND s.category = $${params.length + 1}`;
      params.push(category);
    }

    // Filter by popularity
    if (is_popular !== undefined) {
      queryText += ` AND s.is_popular = $${params.length + 1}`;
      params.push(is_popular === 'true');
    }

    // Filter by active status
    if (is_active !== undefined) {
      queryText += ` AND s.is_active = $${params.length + 1}`;
      params.push(is_active === 'true');
    }

    // Search by name or description
    if (search) {
      queryText += ` AND (s.name ILIKE $${params.length + 1} OR s.description ILIKE $${params.length + 1})`;
      params.push(`%${search}%`);
    }

    queryText += ` ORDER BY s.display_order ASC, s.name ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(Number(limit), offset);

    const result = await query(queryText, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM sports WHERE deleted_at IS NULL';
    let countParams: any[] = [];

    if (category) {
      countQuery += ` AND category = $1`;
      countParams.push(category);
    }
    if (is_popular !== undefined) {
      countQuery += ` AND is_popular = $1`;
      countParams.push(is_popular === 'true');
    }
    if (is_active !== undefined) {
      countQuery += ` AND is_active = $1`;
      countParams.push(is_active === 'true');
    }
    if (search) {
      countQuery += ` AND (name ILIKE $1 OR description ILIKE $1)`;
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
      'Sports retrieved successfully'
    );
  } catch (error) {
    console.error('Get sports error:', error);
    errorResponse(res, 'Failed to get sports', 500, 'GET_SPORTS_FAILED');
  }
};

/**
 * @swagger
 * /sports/categories:
 *   get:
 *     summary: Get sports grouped by category
 *     tags: [Sports]
 *     responses:
 *       200:
 *         description: Sports by category retrieved successfully
 */
export const getSportsByCategory = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const queryText = `
      SELECT
        category,
        COUNT(*) as sport_count,
        json_agg(
          json_build_object(
            'id', id,
            'name', name,
            'slug', slug,
            'description', description,
            'is_popular', is_popular,
            'icon', icon
          ) ORDER BY display_order ASC, name ASC
        ) as sports
      FROM sports
      WHERE deleted_at IS NULL
        AND is_active = true
      GROUP BY category
      ORDER BY category ASC
    `;

    const result = await query(queryText);

    successResponse(res, result.rows, 'Sports by category retrieved successfully');
  } catch (error) {
    console.error('Get sports by category error:', error);
    errorResponse(res, 'Failed to get sports by category', 500, 'GET_SPORTS_BY_CATEGORY_FAILED');
  }
};

/**
 * @swagger
 * /sports/{id}:
 *   get:
 *     summary: Get sport by ID
 *     tags: [Sports]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Sport retrieved successfully
 *       404:
 *         description: Sport not found
 */
export const getSportById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT * FROM sports WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );

    if (result.rows.length === 0) {
      errorResponse(res, 'Sport not found', 404, 'SPORT_NOT_FOUND');
      return;
    }

    successResponse(res, result.rows[0], 'Sport retrieved successfully');
  } catch (error) {
    console.error('Get sport error:', error);
    errorResponse(res, 'Failed to get sport', 500, 'GET_SPORT_FAILED');
  }
};

/**
 * @swagger
 * /sports/{id}/positions:
 *   get:
 *     summary: Get positions for a specific sport
 *     tags: [Sports]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Sport positions retrieved successfully
 */
export const getSportPositions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { is_active = 'true' } = req.query;

    const queryText = `
      SELECT sp.*
      FROM sport_positions sp
      WHERE sp.sport_id = $1
        AND sp.deleted_at IS NULL
        AND sp.is_active = $2
      ORDER BY sp.display_order ASC, sp.name ASC
    `;

    const result = await query(queryText, [id, is_active === 'true']);

    successResponse(res, result.rows, 'Sport positions retrieved successfully');
  } catch (error) {
    console.error('Get sport positions error:', error);
    errorResponse(res, 'Failed to get sport positions', 500, 'GET_SPORT_POSITIONS_FAILED');
  }
};

/**
 * @swagger
 * /sports:
 *   post:
 *     summary: Create a new sport (Super Admin only)
 *     tags: [Sports]
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
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [TEAM_SPORTS, RACKET_SPORTS, AQUATICS, ATHLETICS, COMBAT_SPORTS, INDIVIDUAL, MIND_GAMES, MOTOR_SPORTS, OTHER]
 *               description:
 *                 type: string
 *               icon:
 *                 type: string
 *               is_popular:
 *                 type: boolean
 *               is_active:
 *                 type: boolean
 *               display_order:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Sport created successfully
 *       403:
 *         description: Forbidden - Super Admin only
 */
export const createSport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'Unauthorized', 401, 'UNAUTHORIZED');
      return;
    }

    // Only Super Admin can create sports
    if (req.user.role !== 'SUPER_ADMIN') {
      errorResponse(res, 'Forbidden - Super Admin only', 403, 'FORBIDDEN');
      return;
    }

    const {
      name,
      slug,
      category,
      description,
      icon,
      is_popular = false,
      is_active = true,
      display_order = 0,
      metadata = {},
    } = req.body;

    // Validate required fields
    if (!name || !category) {
      errorResponse(res, 'Name and category are required', 400, 'MISSING_REQUIRED_FIELDS');
      return;
    }

    // Generate slug if not provided
    const sportSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    // Check if sport with same name or slug already exists
    const existing = await query(
      'SELECT id FROM sports WHERE (name = $1 OR slug = $2) AND deleted_at IS NULL',
      [name, sportSlug]
    );

    if (existing.rows.length > 0) {
      errorResponse(res, 'Sport with this name or slug already exists', 409, 'SPORT_ALREADY_EXISTS');
      return;
    }

    const sportId = uuidv4();

    const result = await query(
      `INSERT INTO sports (id, name, slug, category, description, icon, is_popular, is_active, display_order, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [sportId, name, sportSlug, category, description || null, icon || null, is_popular, is_active, display_order, JSON.stringify(metadata)]
    );

    // Log audit
    await query(
      `INSERT INTO audit_logs (id, user_id, action, entity, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [uuidv4(), req.user.userId, AuditAction.CREATE, 'SPORT', sportId, JSON.stringify({ name, category })]
    );

    successResponse(res, result.rows[0], 'Sport created successfully', 201);
  } catch (error) {
    console.error('Create sport error:', error);
    errorResponse(res, 'Failed to create sport', 500, 'CREATE_SPORT_FAILED');
  }
};

/**
 * @swagger
 * /sports/{id}:
 *   put:
 *     summary: Update a sport (Super Admin only)
 *     tags: [Sports]
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
 *               slug:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               icon:
 *                 type: string
 *               is_popular:
 *                 type: boolean
 *               is_active:
 *                 type: boolean
 *               display_order:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Sport updated successfully
 *       403:
 *         description: Forbidden - Super Admin only
 */
export const updateSport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'Unauthorized', 401, 'UNAUTHORIZED');
      return;
    }

    // Only Super Admin can update sports
    if (req.user.role !== 'SUPER_ADMIN') {
      errorResponse(res, 'Forbidden - Super Admin only', 403, 'FORBIDDEN');
      return;
    }

    const { id } = req.params;
    const {
      name,
      slug,
      category,
      description,
      icon,
      is_popular,
      is_active,
      display_order,
      metadata,
    } = req.body;

    const existing = await query(
      'SELECT * FROM sports WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );

    if (existing.rows.length === 0) {
      errorResponse(res, 'Sport not found', 404, 'SPORT_NOT_FOUND');
      return;
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (slug !== undefined) {
      updates.push(`slug = $${paramCount++}`);
      values.push(slug);
    }
    if (category !== undefined) {
      updates.push(`category = $${paramCount++}`);
      values.push(category);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (icon !== undefined) {
      updates.push(`icon = $${paramCount++}`);
      values.push(icon);
    }
    if (is_popular !== undefined) {
      updates.push(`is_popular = $${paramCount++}`);
      values.push(is_popular);
    }
    if (is_active !== undefined) {
      updates.push(`is_active = $${paramCount++}`);
      values.push(is_active);
    }
    if (display_order !== undefined) {
      updates.push(`display_order = $${paramCount++}`);
      values.push(display_order);
    }
    if (metadata !== undefined) {
      updates.push(`metadata = $${paramCount++}`);
      values.push(JSON.stringify(metadata));
    }

    values.push(id);

    const result = await query(
      `UPDATE sports SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    // Log audit
    await query(
      `INSERT INTO audit_logs (id, user_id, action, entity, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [uuidv4(), req.user.userId, AuditAction.UPDATE, 'SPORT', id, JSON.stringify(req.body)]
    );

    successResponse(res, result.rows[0], 'Sport updated successfully');
  } catch (error) {
    console.error('Update sport error:', error);
    errorResponse(res, 'Failed to update sport', 500, 'UPDATE_SPORT_FAILED');
  }
};

/**
 * @swagger
 * /sports/{id}:
 *   delete:
 *     summary: Delete a sport (soft delete, Super Admin only)
 *     tags: [Sports]
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
 *         description: Sport deleted successfully
 *       403:
 *         description: Forbidden - Super Admin only
 */
export const deleteSport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'Unauthorized', 401, 'UNAUTHORIZED');
      return;
    }

    // Only Super Admin can delete sports
    if (req.user.role !== 'SUPER_ADMIN') {
      errorResponse(res, 'Forbidden - Super Admin only', 403, 'FORBIDDEN');
      return;
    }

    const { id } = req.params;

    const existing = await query(
      'SELECT * FROM sports WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );

    if (existing.rows.length === 0) {
      errorResponse(res, 'Sport not found', 404, 'SPORT_NOT_FOUND');
      return;
    }

    // Soft delete
    await query(
      'UPDATE sports SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );

    // Log audit
    await query(
      `INSERT INTO audit_logs (id, user_id, action, entity, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [uuidv4(), req.user.userId, AuditAction.DELETE, 'SPORT', id, JSON.stringify({ name: existing.rows[0].name })]
    );

    successResponse(res, null, 'Sport deleted successfully');
  } catch (error) {
    console.error('Delete sport error:', error);
    errorResponse(res, 'Failed to delete sport', 500, 'DELETE_SPORT_FAILED');
  }
};

/**
 * @swagger
 * /sports/positions:
 *   post:
 *     summary: Create a new sport position (Super Admin only)
 *     tags: [Sports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sport_id
 *               - name
 *             properties:
 *               sport_id:
 *                 type: string
 *                 format: uuid
 *               name:
 *                 type: string
 *               abbreviation:
 *                 type: string
 *               description:
 *                 type: string
 *               display_order:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Sport position created successfully
 *       403:
 *         description: Forbidden - Super Admin only
 */
export const createSportPosition = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'Unauthorized', 401, 'UNAUTHORIZED');
      return;
    }

    // Only Super Admin can create sport positions
    if (req.user.role !== 'SUPER_ADMIN') {
      errorResponse(res, 'Forbidden - Super Admin only', 403, 'FORBIDDEN');
      return;
    }

    const { sport_id, name, abbreviation, description, display_order = 0, is_active = true } = req.body;

    // Validate required fields
    if (!sport_id || !name) {
      errorResponse(res, 'Sport ID and name are required', 400, 'MISSING_REQUIRED_FIELDS');
      return;
    }

    // Verify sport exists
    const sport = await query('SELECT id FROM sports WHERE id = $1 AND deleted_at IS NULL', [sport_id]);
    if (sport.rows.length === 0) {
      errorResponse(res, 'Sport not found', 404, 'SPORT_NOT_FOUND');
      return;
    }

    const positionId = uuidv4();

    const result = await query(
      `INSERT INTO sport_positions (id, sport_id, name, abbreviation, description, display_order, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [positionId, sport_id, name, abbreviation || null, description || null, display_order, is_active]
    );

    // Log audit
    await query(
      `INSERT INTO audit_logs (id, user_id, action, entity, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [uuidv4(), req.user.userId, AuditAction.CREATE, 'SPORT_POSITION', positionId, JSON.stringify({ sport_id, name })]
    );

    successResponse(res, result.rows[0], 'Sport position created successfully', 201);
  } catch (error) {
    console.error('Create sport position error:', error);
    errorResponse(res, 'Failed to create sport position', 500, 'CREATE_SPORT_POSITION_FAILED');
  }
};

/**
 * @swagger
 * /sports/positions/{id}:
 *   put:
 *     summary: Update a sport position (Super Admin only)
 *     tags: [Sports]
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
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               abbreviation:
 *                 type: string
 *               description:
 *                 type: string
 *               display_order:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Sport position updated successfully
 *       403:
 *         description: Forbidden - Super Admin only
 */
export const updateSportPosition = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'Unauthorized', 401, 'UNAUTHORIZED');
      return;
    }

    // Only Super Admin can update sport positions
    if (req.user.role !== 'SUPER_ADMIN') {
      errorResponse(res, 'Forbidden - Super Admin only', 403, 'FORBIDDEN');
      return;
    }

    const { id } = req.params;
    const { name, abbreviation, description, display_order, is_active } = req.body;

    const existing = await query(
      'SELECT * FROM sport_positions WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );

    if (existing.rows.length === 0) {
      errorResponse(res, 'Sport position not found', 404, 'SPORT_POSITION_NOT_FOUND');
      return;
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (abbreviation !== undefined) {
      updates.push(`abbreviation = $${paramCount++}`);
      values.push(abbreviation);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (display_order !== undefined) {
      updates.push(`display_order = $${paramCount++}`);
      values.push(display_order);
    }
    if (is_active !== undefined) {
      updates.push(`is_active = $${paramCount++}`);
      values.push(is_active);
    }

    values.push(id);

    const result = await query(
      `UPDATE sport_positions SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    // Log audit
    await query(
      `INSERT INTO audit_logs (id, user_id, action, entity, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [uuidv4(), req.user.userId, AuditAction.UPDATE, 'SPORT_POSITION', id, JSON.stringify(req.body)]
    );

    successResponse(res, result.rows[0], 'Sport position updated successfully');
  } catch (error) {
    console.error('Update sport position error:', error);
    errorResponse(res, 'Failed to update sport position', 500, 'UPDATE_SPORT_POSITION_FAILED');
  }
};

/**
 * @swagger
 * /sports/positions/{id}:
 *   delete:
 *     summary: Delete a sport position (soft delete, Super Admin only)
 *     tags: [Sports]
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
 *         description: Sport position deleted successfully
 *       403:
 *         description: Forbidden - Super Admin only
 */
export const deleteSportPosition = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'Unauthorized', 401, 'UNAUTHORIZED');
      return;
    }

    // Only Super Admin can delete sport positions
    if (req.user.role !== 'SUPER_ADMIN') {
      errorResponse(res, 'Forbidden - Super Admin only', 403, 'FORBIDDEN');
      return;
    }

    const { id } = req.params;

    const existing = await query(
      'SELECT * FROM sport_positions WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );

    if (existing.rows.length === 0) {
      errorResponse(res, 'Sport position not found', 404, 'SPORT_POSITION_NOT_FOUND');
      return;
    }

    // Soft delete
    await query(
      'UPDATE sport_positions SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );

    // Log audit
    await query(
      `INSERT INTO audit_logs (id, user_id, action, entity, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [uuidv4(), req.user.userId, AuditAction.DELETE, 'SPORT_POSITION', id, JSON.stringify({ name: existing.rows[0].name })]
    );

    successResponse(res, null, 'Sport position deleted successfully');
  } catch (error) {
    console.error('Delete sport position error:', error);
    errorResponse(res, 'Failed to delete sport position', 500, 'DELETE_SPORT_POSITION_FAILED');
  }
};

/**
 * @swagger
 * /sports/stats:
 *   get:
 *     summary: Get sports statistics
 *     tags: [Sports]
 *     responses:
 *       200:
 *         description: Sports statistics retrieved successfully
 */
export const getSportsStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const statsQuery = `
      SELECT
        COUNT(*) as total_sports,
        COUNT(*) FILTER (WHERE is_popular = true) as popular_sports,
        COUNT(*) FILTER (WHERE is_active = true) as active_sports,
        category,
        jsonb_agg(
          jsonb_build_object(
            'name', name,
            'id', id
          ) ORDER BY display_order ASC, name ASC
        ) as sports
      FROM sports
      WHERE deleted_at IS NULL
      GROUP BY category
      ORDER BY category ASC
    `;

    const result = await query(statsQuery);

    successResponse(res, result.rows, 'Sports statistics retrieved successfully');
  } catch (error) {
    console.error('Get sports stats error:', error);
    errorResponse(res, 'Failed to get sports statistics', 500, 'GET_SPORTS_STATS_FAILED');
  }
};
