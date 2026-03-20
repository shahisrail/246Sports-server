"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePlayer = exports.updatePlayer = exports.createPlayer = exports.getPlayerById = exports.getPlayers = void 0;
const uuid_1 = __importDefault(require("uuid"));
const { v4: uuidv4 } = uuid_1.default;
const database_1 = require("../../config/database");
const responseHandler_1 = require("../../utils/responseHandler");
const types_1 = require("../../types");
/**
 * @swagger
 * /players:
 *   get:
 *     summary: Get all players
 *     tags: [Players]
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
 *         name: team_id
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Players retrieved successfully
 */
const getPlayers = async (req, res) => {
    try {
        const { page = 1, limit = 10, team_id, search } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        let queryText = `
      SELECT p.*, t.name as team_name, c.name as club_name
      FROM players p
      LEFT JOIN teams t ON p.team_id = t.id
      LEFT JOIN clubs c ON t.club_id = c.id
      WHERE p.deleted_at IS NULL
    `;
        let params = [];
        if (team_id) {
            queryText += ` AND p.team_id = $${params.length + 1}`;
            params.push(team_id);
        }
        if (search) {
            queryText += ` AND p.name ILIKE $${params.length + 1}`;
            params.push(`%${search}%`);
        }
        queryText += ` ORDER BY p.name ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(Number(limit), offset);
        const result = await (0, database_1.query)(queryText, params);
        // Get total count
        let countQuery = 'SELECT COUNT(*) FROM players WHERE deleted_at IS NULL';
        let countParams = [];
        if (team_id) {
            countQuery += ` AND team_id = $1`;
            countParams.push(team_id);
        }
        if (search) {
            countQuery += ` AND name ILIKE $1`;
            countParams.push(`%${search}%`);
        }
        const countResult = await (0, database_1.query)(countQuery, countParams);
        const total = parseInt(countResult.rows[0].count);
        (0, responseHandler_1.paginatedResponse)(res, result.rows, Number(page), Number(limit), total, 'Players retrieved successfully');
    }
    catch (error) {
        console.error('Get players error:', error);
        (0, responseHandler_1.errorResponse)(res, 'Failed to get players', 500, 'GET_PLAYERS_FAILED');
    }
};
exports.getPlayers = getPlayers;
/**
 * @swagger
 * /players/{id}:
 *   get:
 *     summary: Get player by ID
 *     tags: [Players]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Player retrieved successfully
 *       404:
 *         description: Player not found
 */
const getPlayerById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await (0, database_1.query)(`SELECT p.*, t.name as team_name, c.name as club_name
       FROM players p
       LEFT JOIN teams t ON p.team_id = t.id
       LEFT JOIN clubs c ON t.club_id = c.id
       WHERE p.id = $1 AND p.deleted_at IS NULL`, [id]);
        if (result.rows.length === 0) {
            (0, responseHandler_1.errorResponse)(res, 'Player not found', 404, 'PLAYER_NOT_FOUND');
            return;
        }
        (0, responseHandler_1.successResponse)(res, result.rows[0], 'Player retrieved successfully');
    }
    catch (error) {
        console.error('Get player error:', error);
        (0, responseHandler_1.errorResponse)(res, 'Failed to get player', 500, 'GET_PLAYER_FAILED');
    }
};
exports.getPlayerById = getPlayerById;
/**
 * @swagger
 * /players:
 *   post:
 *     summary: Create a new player
 *     tags: [Players]
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
 *               - team_id
 *             properties:
 *               name:
 *                 type: string
 *               team_id:
 *                 type: string
 *                 format: uuid
 *               photo:
 *                 type: string
 *                 format: uri
 *               position:
 *                 type: string
 *               squad_number:
 *                 type: integer
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *               nationality:
 *                 type: string
 *               height:
 *                 type: integer
 *               weight:
 *                 type: integer
 *               bio:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Player created successfully
 */
const createPlayer = async (req, res) => {
    try {
        if (!req.user) {
            (0, responseHandler_1.errorResponse)(res, 'Unauthorized', 401, 'UNAUTHORIZED');
            return;
        }
        const { name, first_name, last_name, team_id, photo, position, squad_number, date_of_birth, nationality, height, weight, bio, is_active = true, } = req.body;
        // Combine first_name and last_name into name if name is not provided
        const playerName = name || `${first_name || ''} ${last_name || ''}`.trim();
        if (!playerName) {
            (0, responseHandler_1.errorResponse)(res, 'Name is required', 400, 'NAME_REQUIRED');
            return;
        }
        const playerId = uuidv4();
        const result = await (0, database_1.query)(`INSERT INTO players (id, name, team_id, photo, position, squad_number, date_of_birth, nationality, height, weight, bio, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`, [
            playerId,
            playerName,
            team_id,
            photo || null,
            position || null,
            squad_number || null,
            date_of_birth || null,
            nationality || null,
            height || null,
            weight || null,
            bio || null,
            is_active,
        ]);
        // Log audit
        await (0, database_1.query)(`INSERT INTO audit_logs (id, user_id, action, entity, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`, [uuidv4(), req.user.userId, types_1.AuditAction.CREATE, 'PLAYER', playerId, JSON.stringify({ name: playerName, team_id })]);
        (0, responseHandler_1.successResponse)(res, result.rows[0], 'Player created successfully', 201);
    }
    catch (error) {
        console.error('Create player error:', error);
        (0, responseHandler_1.errorResponse)(res, 'Failed to create player', 500, 'CREATE_PLAYER_FAILED');
    }
};
exports.createPlayer = createPlayer;
/**
 * @swagger
 * /players/{id}:
 *   put:
 *     summary: Update a player
 *     tags: [Players]
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
 *               photo:
 *                 type: string
 *                 format: uri
 *               position:
 *                 type: string
 *               squad_number:
 *                 type: integer
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *               nationality:
 *                 type: string
 *               height:
 *                 type: integer
 *               weight:
 *                 type: integer
 *               bio:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Player updated successfully
 */
const updatePlayer = async (req, res) => {
    try {
        if (!req.user) {
            (0, responseHandler_1.errorResponse)(res, 'Unauthorized', 401, 'UNAUTHORIZED');
            return;
        }
        const { id } = req.params;
        const { name, photo, position, squad_number, date_of_birth, nationality, height, weight, bio, is_active } = req.body;
        const existing = await (0, database_1.query)('SELECT * FROM players WHERE id = $1 AND deleted_at IS NULL', [id]);
        if (existing.rows.length === 0) {
            (0, responseHandler_1.errorResponse)(res, 'Player not found', 404, 'PLAYER_NOT_FOUND');
            return;
        }
        const updates = [];
        const values = [];
        let paramCount = 1;
        if (name !== undefined) {
            updates.push(`name = $${paramCount++}`);
            values.push(name);
        }
        if (photo !== undefined) {
            updates.push(`photo = $${paramCount++}`);
            values.push(photo);
        }
        if (position !== undefined) {
            updates.push(`position = $${paramCount++}`);
            values.push(position);
        }
        if (squad_number !== undefined) {
            updates.push(`squad_number = $${paramCount++}`);
            values.push(squad_number);
        }
        if (date_of_birth !== undefined) {
            updates.push(`date_of_birth = $${paramCount++}`);
            values.push(date_of_birth);
        }
        if (nationality !== undefined) {
            updates.push(`nationality = $${paramCount++}`);
            values.push(nationality);
        }
        if (height !== undefined) {
            updates.push(`height = $${paramCount++}`);
            values.push(height);
        }
        if (weight !== undefined) {
            updates.push(`weight = $${paramCount++}`);
            values.push(weight);
        }
        if (bio !== undefined) {
            updates.push(`bio = $${paramCount++}`);
            values.push(bio);
        }
        if (is_active !== undefined) {
            updates.push(`is_active = $${paramCount++}`);
            values.push(is_active);
        }
        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);
        const result = await (0, database_1.query)(`UPDATE players SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`, values);
        // Log audit
        await (0, database_1.query)(`INSERT INTO audit_logs (id, user_id, action, entity, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`, [uuidv4(), req.user.userId, types_1.AuditAction.UPDATE, 'PLAYER', id, JSON.stringify(req.body)]);
        (0, responseHandler_1.successResponse)(res, result.rows[0], 'Player updated successfully');
    }
    catch (error) {
        console.error('Update player error:', error);
        (0, responseHandler_1.errorResponse)(res, 'Failed to update player', 500, 'UPDATE_PLAYER_FAILED');
    }
};
exports.updatePlayer = updatePlayer;
/**
 * @swagger
 * /players/{id}:
 *   delete:
 *     summary: Delete a player (soft delete)
 *     tags: [Players]
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
 *         description: Player deleted successfully
 */
const deletePlayer = async (req, res) => {
    try {
        if (!req.user) {
            (0, responseHandler_1.errorResponse)(res, 'Unauthorized', 401, 'UNAUTHORIZED');
            return;
        }
        const { id } = req.params;
        const existing = await (0, database_1.query)('SELECT * FROM players WHERE id = $1 AND deleted_at IS NULL', [id]);
        if (existing.rows.length === 0) {
            (0, responseHandler_1.errorResponse)(res, 'Player not found', 404, 'PLAYER_NOT_FOUND');
            return;
        }
        await (0, database_1.query)('UPDATE players SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);
        // Log audit
        await (0, database_1.query)(`INSERT INTO audit_logs (id, user_id, action, entity, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`, [uuidv4(), req.user.userId, types_1.AuditAction.DELETE, 'PLAYER', id, JSON.stringify({ name: existing.rows[0].name })]);
        (0, responseHandler_1.successResponse)(res, null, 'Player deleted successfully');
    }
    catch (error) {
        console.error('Delete player error:', error);
        (0, responseHandler_1.errorResponse)(res, 'Failed to delete player', 500, 'DELETE_PLAYER_FAILED');
    }
};
exports.deletePlayer = deletePlayer;
//# sourceMappingURL=players.controller.js.map