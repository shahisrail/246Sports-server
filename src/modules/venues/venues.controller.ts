import { Response } from 'express';
const { v4: uuidv4 } = require("uuid");
import { query } from '../../config/database';
import { successResponse, errorResponse, paginatedResponse } from '../../utils/responseHandler';
import { AuthRequest, VenueSurface } from '../../types';
import { AuditAction } from '../../types';

/**
 * @swagger
 * /venues:
 *   get:
 *     summary: Get all venues
 *     tags: [Venues]
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
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Venues retrieved successfully
 */
export const getVenues = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let queryText = `SELECT * FROM venues WHERE deleted_at IS NULL`;
    let params: any[] = [];

    if (search) {
      queryText += ` AND name ILIKE $${params.length + 1}`;
      params.push(`%${search}%`);
    }

    queryText += ` ORDER BY name ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(Number(limit), offset);

    const result = await query(queryText, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM venues WHERE deleted_at IS NULL';
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
      'Venues retrieved successfully'
    );
  } catch (error) {
    console.error('Get venues error:', error);
    errorResponse(res, 'Failed to get venues', 500, 'GET_VENUES_FAILED');
  }
};

/**
 * @swagger
 * /venues/{id}:
 *   get:
 *     summary: Get venue by ID
 *     tags: [Venues]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Venue retrieved successfully
 *       404:
 *         description: Venue not found
 */
export const getVenueById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await query(
      'SELECT * FROM venues WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );

    if (result.rows.length === 0) {
      errorResponse(res, 'Venue not found', 404, 'VENUE_NOT_FOUND');
      return;
    }

    successResponse(res, result.rows[0], 'Venue retrieved successfully');
  } catch (error) {
    console.error('Get venue error:', error);
    errorResponse(res, 'Failed to get venue', 500, 'GET_VENUE_FAILED');
  }
};

/**
 * @swagger
 * /venues:
 *   post:
 *     summary: Create a new venue
 *     tags: [Venues]
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
 *               - address
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               capacity:
 *                 type: integer
 *               surface:
 *                 type: string
 *                 enum: [GRASS, ARTIFICIAL, HYBRID, INDOOR]
 *               photo:
 *                 type: string
 *                 format: uri
 *               amenities:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Venue created successfully
 */
export const createVenue = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'Unauthorized', 401, 'UNAUTHORIZED');
      return;
    }

    const {
      name,
      address,
      latitude,
      longitude,
      capacity,
      surface = VenueSurface.GRASS,
      photo,
      amenities,
    } = req.body;

    const venueId = uuidv4();

    const result = await query(
      `INSERT INTO venues (id, name, address, latitude, longitude, capacity, surface, photo, amenities)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        venueId,
        name,
        address,
        latitude || null,
        longitude || null,
        capacity || null,
        surface,
        photo || null,
        amenities || null,
      ]
    );

    // Log audit
    await query(
      `INSERT INTO audit_logs (id, user_id, action, entity, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [uuidv4(), req.user.userId, AuditAction.CREATE, 'VENUE', venueId, JSON.stringify({ name, address })]
    );

    successResponse(res, result.rows[0], 'Venue created successfully', 201);
  } catch (error) {
    console.error('Create venue error:', error);
    errorResponse(res, 'Failed to create venue', 500, 'CREATE_VENUE_FAILED');
  }
};

/**
 * @swagger
 * /venues/{id}:
 *   put:
 *     summary: Update a venue
 *     tags: [Venues]
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
 *               address:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               capacity:
 *                 type: integer
 *               surface:
 *                 type: string
 *                 enum: [GRASS, ARTIFICIAL, HYBRID, INDOOR]
 *               photo:
 *                 type: string
 *                 format: uri
 *               amenities:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Venue updated successfully
 */
export const updateVenue = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'Unauthorized', 401, 'UNAUTHORIZED');
      return;
    }

    const { id } = req.params;
    const { name, address, latitude, longitude, capacity, surface, photo, amenities } = req.body;

    const existing = await query(
      'SELECT * FROM venues WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );

    if (existing.rows.length === 0) {
      errorResponse(res, 'Venue not found', 404, 'VENUE_NOT_FOUND');
      return;
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (address !== undefined) {
      updates.push(`address = $${paramCount++}`);
      values.push(address);
    }
    if (latitude !== undefined) {
      updates.push(`latitude = $${paramCount++}`);
      values.push(latitude);
    }
    if (longitude !== undefined) {
      updates.push(`longitude = $${paramCount++}`);
      values.push(longitude);
    }
    if (capacity !== undefined) {
      updates.push(`capacity = $${paramCount++}`);
      values.push(capacity);
    }
    if (surface !== undefined) {
      updates.push(`surface = $${paramCount++}`);
      values.push(surface);
    }
    if (photo !== undefined) {
      updates.push(`photo = $${paramCount++}`);
      values.push(photo);
    }
    if (amenities !== undefined) {
      updates.push(`amenities = $${paramCount++}`);
      values.push(amenities);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE venues SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    // Log audit
    await query(
      `INSERT INTO audit_logs (id, user_id, action, entity, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [uuidv4(), req.user.userId, AuditAction.UPDATE, 'VENUE', id, JSON.stringify(req.body)]
    );

    successResponse(res, result.rows[0], 'Venue updated successfully');
  } catch (error) {
    console.error('Update venue error:', error);
    errorResponse(res, 'Failed to update venue', 500, 'UPDATE_VENUE_FAILED');
  }
};

/**
 * @swagger
 * /venues/{id}:
 *   delete:
 *     summary: Delete a venue (soft delete)
 *     tags: [Venues]
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
 *         description: Venue deleted successfully
 */
export const deleteVenue = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'Unauthorized', 401, 'UNAUTHORIZED');
      return;
    }

    const { id } = req.params;

    const existing = await query(
      'SELECT * FROM venues WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );

    if (existing.rows.length === 0) {
      errorResponse(res, 'Venue not found', 404, 'VENUE_NOT_FOUND');
      return;
    }

    await query(
      'UPDATE venues SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );

    // Log audit
    await query(
      `INSERT INTO audit_logs (id, user_id, action, entity, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [uuidv4(), req.user.userId, AuditAction.DELETE, 'VENUE', id, JSON.stringify({ name: existing.rows[0].name })]
    );

    successResponse(res, null, 'Venue deleted successfully');
  } catch (error) {
    console.error('Delete venue error:', error);
    errorResponse(res, 'Failed to delete venue', 500, 'DELETE_VENUE_FAILED');
  }
};
