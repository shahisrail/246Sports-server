"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteVenue = exports.updateVenue = exports.createVenue = exports.getVenueById = exports.getVenues = void 0;
const uuid_1 = __importDefault(require("uuid"));
const { v4: uuidv4 } = uuid_1.default;
const database_1 = require("../../config/database");
const responseHandler_1 = require("../../utils/responseHandler");
const types_1 = require("../../types");
const types_2 = require("../../types");
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
const getVenues = async (req, res) => {
    try {
        const { page = 1, limit = 10, search } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        let queryText = `SELECT * FROM venues WHERE deleted_at IS NULL`;
        let params = [];
        if (search) {
            queryText += ` AND name ILIKE $${params.length + 1}`;
            params.push(`%${search}%`);
        }
        queryText += ` ORDER BY name ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(Number(limit), offset);
        const result = await (0, database_1.query)(queryText, params);
        // Get total count
        let countQuery = 'SELECT COUNT(*) FROM venues WHERE deleted_at IS NULL';
        let countParams = [];
        if (search) {
            countQuery += ` AND name ILIKE $1`;
            countParams.push(`%${search}%`);
        }
        const countResult = await (0, database_1.query)(countQuery, countParams);
        const total = parseInt(countResult.rows[0].count);
        (0, responseHandler_1.paginatedResponse)(res, result.rows, Number(page), Number(limit), total, 'Venues retrieved successfully');
    }
    catch (error) {
        console.error('Get venues error:', error);
        (0, responseHandler_1.errorResponse)(res, 'Failed to get venues', 500, 'GET_VENUES_FAILED');
    }
};
exports.getVenues = getVenues;
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
const getVenueById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await (0, database_1.query)('SELECT * FROM venues WHERE id = $1 AND deleted_at IS NULL', [id]);
        if (result.rows.length === 0) {
            (0, responseHandler_1.errorResponse)(res, 'Venue not found', 404, 'VENUE_NOT_FOUND');
            return;
        }
        (0, responseHandler_1.successResponse)(res, result.rows[0], 'Venue retrieved successfully');
    }
    catch (error) {
        console.error('Get venue error:', error);
        (0, responseHandler_1.errorResponse)(res, 'Failed to get venue', 500, 'GET_VENUE_FAILED');
    }
};
exports.getVenueById = getVenueById;
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
const createVenue = async (req, res) => {
    try {
        if (!req.user) {
            (0, responseHandler_1.errorResponse)(res, 'Unauthorized', 401, 'UNAUTHORIZED');
            return;
        }
        const { name, address, latitude, longitude, capacity, surface = types_1.VenueSurface.GRASS, photo, amenities, } = req.body;
        const venueId = uuidv4();
        const result = await (0, database_1.query)(`INSERT INTO venues (id, name, address, latitude, longitude, capacity, surface, photo, amenities)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`, [
            venueId,
            name,
            address,
            latitude || null,
            longitude || null,
            capacity || null,
            surface,
            photo || null,
            amenities || null,
        ]);
        // Log audit
        await (0, database_1.query)(`INSERT INTO audit_logs (id, user_id, action, entity, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`, [uuidv4(), req.user.userId, types_2.AuditAction.CREATE, 'VENUE', venueId, JSON.stringify({ name, address })]);
        (0, responseHandler_1.successResponse)(res, result.rows[0], 'Venue created successfully', 201);
    }
    catch (error) {
        console.error('Create venue error:', error);
        (0, responseHandler_1.errorResponse)(res, 'Failed to create venue', 500, 'CREATE_VENUE_FAILED');
    }
};
exports.createVenue = createVenue;
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
const updateVenue = async (req, res) => {
    try {
        if (!req.user) {
            (0, responseHandler_1.errorResponse)(res, 'Unauthorized', 401, 'UNAUTHORIZED');
            return;
        }
        const { id } = req.params;
        const { name, address, latitude, longitude, capacity, surface, photo, amenities } = req.body;
        const existing = await (0, database_1.query)('SELECT * FROM venues WHERE id = $1 AND deleted_at IS NULL', [id]);
        if (existing.rows.length === 0) {
            (0, responseHandler_1.errorResponse)(res, 'Venue not found', 404, 'VENUE_NOT_FOUND');
            return;
        }
        const updates = [];
        const values = [];
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
        const result = await (0, database_1.query)(`UPDATE venues SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`, values);
        // Log audit
        await (0, database_1.query)(`INSERT INTO audit_logs (id, user_id, action, entity, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`, [uuidv4(), req.user.userId, types_2.AuditAction.UPDATE, 'VENUE', id, JSON.stringify(req.body)]);
        (0, responseHandler_1.successResponse)(res, result.rows[0], 'Venue updated successfully');
    }
    catch (error) {
        console.error('Update venue error:', error);
        (0, responseHandler_1.errorResponse)(res, 'Failed to update venue', 500, 'UPDATE_VENUE_FAILED');
    }
};
exports.updateVenue = updateVenue;
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
const deleteVenue = async (req, res) => {
    try {
        if (!req.user) {
            (0, responseHandler_1.errorResponse)(res, 'Unauthorized', 401, 'UNAUTHORIZED');
            return;
        }
        const { id } = req.params;
        const existing = await (0, database_1.query)('SELECT * FROM venues WHERE id = $1 AND deleted_at IS NULL', [id]);
        if (existing.rows.length === 0) {
            (0, responseHandler_1.errorResponse)(res, 'Venue not found', 404, 'VENUE_NOT_FOUND');
            return;
        }
        await (0, database_1.query)('UPDATE venues SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);
        // Log audit
        await (0, database_1.query)(`INSERT INTO audit_logs (id, user_id, action, entity, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`, [uuidv4(), req.user.userId, types_2.AuditAction.DELETE, 'VENUE', id, JSON.stringify({ name: existing.rows[0].name })]);
        (0, responseHandler_1.successResponse)(res, null, 'Venue deleted successfully');
    }
    catch (error) {
        console.error('Delete venue error:', error);
        (0, responseHandler_1.errorResponse)(res, 'Failed to delete venue', 500, 'DELETE_VENUE_FAILED');
    }
};
exports.deleteVenue = deleteVenue;
//# sourceMappingURL=venues.controller.js.map