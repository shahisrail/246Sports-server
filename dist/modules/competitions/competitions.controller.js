"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFixtures = exports.deleteCompetition = exports.updateCompetition = exports.createCompetition = exports.getCompetitionById = exports.getCompetitions = void 0;
const uuid_1 = __importDefault(require("uuid"));
const { v4: uuidv4 } = uuid_1.default;
const database_1 = require("../../config/database");
const responseHandler_1 = require("../../utils/responseHandler");
const types_1 = require("../../types");
const types_2 = require("../../types");
/**
 * @swagger
 * /competitions:
 *   get:
 *     summary: Get all competitions
 *     tags: [Competitions]
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
 *           enum: [UPCOMING, ONGOING, COMPLETED]
 *     responses:
 *       200:
 *         description: Competitions retrieved successfully
 */
const getCompetitions = async (req, res) => {
    try {
        const { page = 1, limit = 10, association_id, sport_id, sport, status } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        // Support both sport_id (new) and sport (legacy for backward compatibility)
        const sportFilter = sport_id || sport;
        let queryText = `
      SELECT c.*, a.name as association_name, s.year as season_year, sp.name as sport_name, sp.slug as sport_slug
      FROM competitions c
      LEFT JOIN associations a ON c.association_id = a.id
      LEFT JOIN seasons s ON c.season_id = s.id
      LEFT JOIN sports sp ON c.sport_id = sp.id
      WHERE c.deleted_at IS NULL
    `;
        let params = [];
        // TENANT ISOLATION: Non-super-admins can only see their association's competitions
        if (req.user && req.user.role !== types_1.UserRole.SUPER_ADMIN) {
            if (req.user.role === types_1.UserRole.ASSOCIATION_ADMIN && req.user.associationId) {
                queryText += ` AND c.association_id = $${params.length + 1}`;
                params.push(req.user.associationId);
            }
            else if (req.user.role === types_1.UserRole.CLUB_ADMIN && req.user.clubId) {
                // Club admins can see competitions their club participates in
                queryText += ` AND c.id IN (
          SELECT DISTINCT competition_id FROM team_competitions
          WHERE team_id IN (SELECT id FROM teams WHERE club_id = $1)
        )`;
                params.push(req.user.clubId);
            }
            else if (req.user.role === types_1.UserRole.TEAM_MANAGER) {
                // Team managers can see competitions their team participates in
                // Would need team_id in user token - for now, filter by club if available
                if (req.user.clubId) {
                    queryText += ` AND c.id IN (
            SELECT DISTINCT competition_id FROM team_competitions
            WHERE team_id IN (SELECT id FROM teams WHERE club_id = $1)
          )`;
                    params.push(req.user.clubId);
                }
            }
        }
        if (association_id) {
            queryText += ` AND c.association_id = $${params.length + 1}`;
            params.push(association_id);
        }
        if (sportFilter) {
            // Use sport_id if provided, otherwise try to match by sport name (backward compatibility)
            if (sport_id) {
                queryText += ` AND c.sport_id = $${params.length + 1}`;
                params.push(sportFilter);
            }
            else {
                // Legacy: filter by sport name
                queryText += ` AND sp.slug = $${params.length + 1}`;
                params.push(sportFilter);
            }
        }
        if (status) {
            queryText += ` AND c.status = $${params.length + 1}`;
            params.push(status);
        }
        queryText += ` ORDER BY c.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(Number(limit), offset);
        const result = await (0, database_1.query)(queryText, params);
        // Get total count
        let countQuery = 'SELECT COUNT(*) FROM competitions c WHERE c.deleted_at IS NULL';
        let countParams = [];
        // Apply same tenant filters to count query
        if (req.user && req.user.role !== types_1.UserRole.SUPER_ADMIN) {
            if (req.user.role === types_1.UserRole.ASSOCIATION_ADMIN && req.user.associationId) {
                countQuery += ` AND c.association_id = $${countParams.length + 1}`;
                countParams.push(req.user.associationId);
            }
            else if ((req.user.role === types_1.UserRole.CLUB_ADMIN || req.user.role === types_1.UserRole.TEAM_MANAGER) && req.user.clubId) {
                countQuery += ` AND c.id IN (
          SELECT DISTINCT competition_id FROM team_competitions
          WHERE team_id IN (SELECT id FROM teams WHERE club_id = $1)
        )`;
                countParams.push(req.user.clubId);
            }
        }
        if (association_id) {
            countQuery += ` AND c.association_id = $${countParams.length + 1}`;
            countParams.push(association_id);
        }
        if (sportFilter) {
            if (sport_id) {
                countQuery += ` AND c.sport_id = $${countParams.length + 1}`;
                countParams.push(sportFilter);
            }
            else {
                countQuery += ` AND c.sport_id = (SELECT id FROM sports WHERE slug = $1)`;
                countParams.push(sportFilter);
            }
        }
        if (status) {
            countQuery += ` AND c.status = $${countParams.length + 1}`;
            countParams.push(status);
        }
        const countResult = await (0, database_1.query)(countQuery, countParams);
        const total = parseInt(countResult.rows[0].count);
        (0, responseHandler_1.paginatedResponse)(res, result.rows, Number(page), Number(limit), total, 'Competitions retrieved successfully');
    }
    catch (error) {
        console.error('Get competitions error:', error);
        (0, responseHandler_1.errorResponse)(res, 'Failed to get competitions', 500, 'GET_COMPETITIONS_FAILED');
    }
};
exports.getCompetitions = getCompetitions;
/**
 * @swagger
 * /competitions/{id}:
 *   get:
 *     summary: Get competition by ID
 *     tags: [Competitions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Competition retrieved successfully
 *       404:
 *         description: Competition not found
 */
const getCompetitionById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await (0, database_1.query)(`SELECT c.*, a.name as association_name, s.year as season_year
       FROM competitions c
       LEFT JOIN associations a ON c.association_id = a.id
       LEFT JOIN seasons s ON c.season_id = s.id
       WHERE c.id = $1 AND c.deleted_at IS NULL`, [id]);
        if (result.rows.length === 0) {
            (0, responseHandler_1.errorResponse)(res, 'Competition not found', 404, 'COMPETITION_NOT_FOUND');
            return;
        }
        (0, responseHandler_1.successResponse)(res, result.rows[0], 'Competition retrieved successfully');
    }
    catch (error) {
        console.error('Get competition error:', error);
        (0, responseHandler_1.errorResponse)(res, 'Failed to get competition', 500, 'GET_COMPETITION_FAILED');
    }
};
exports.getCompetitionById = getCompetitionById;
/**
 * @swagger
 * /competitions:
 *   post:
 *     summary: Create a new competition
 *     tags: [Competitions]
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
 *               - sport
 *               - association_id
 *               - season_id
 *             properties:
 *               name:
 *                 type: string
 *               sport:
 *                 type: string
 *               association_id:
 *                 type: string
 *                 format: uuid
 *               season_id:
 *                 type: string
 *                 format: uuid
 *               category:
 *                 type: string
 *                 enum: [LEAGUE, CUP, TOURNAMENT]
 *               status:
 *                 type: string
 *                 enum: [UPCOMING, ONGOING, COMPLETED]
 *               rules:
 *                 type: string
 *               points_win:
 *                 type: integer
 *                 default: 3
 *               points_draw:
 *                 type: integer
 *                 default: 1
 *               points_loss:
 *                 type: integer
 *                 default: 0
 *     responses:
 *       201:
 *         description: Competition created successfully
 */
const createCompetition = async (req, res) => {
    try {
        if (!req.user) {
            (0, responseHandler_1.errorResponse)(res, 'Unauthorized', 401, 'UNAUTHORIZED');
            return;
        }
        const { name, sport_id, sport, association_id, associationId, season_id, seasonId, type, // Frontend sends "type" but backend uses "category"
        category = types_1.CompetitionCategory.LEAGUE, status = types_1.CompetitionStatus.UPCOMING, rules, format, description, startDate, start_date, endDate, end_date, website, websiteUrl, contact_email, contactEmail, contact_phone, contactPhone, points_win = 3, pointsWin = 3, points_draw = 1, pointsDraw = 1, points_loss = 0, pointsLoss = 0, } = req.body;
        // Support both camelCase and snake_case
        const finalAssociationId = associationId || association_id;
        const finalSeasonId = seasonId || season_id;
        const finalSportId = sport_id || sport; // Support both sport_id (new) and sport (legacy)
        const finalCategory = type || category; // type from frontend = category in backend
        const finalStartDate = startDate || start_date;
        const finalEndDate = endDate || end_date;
        const finalWebsite = website || websiteUrl;
        const finalContactEmail = contact_email || contactEmail;
        const finalContactPhone = contact_phone || contactPhone;
        const finalPointsWin = pointsWin !== undefined ? pointsWin : points_win;
        const finalPointsDraw = pointsDraw !== undefined ? pointsDraw : points_draw;
        const finalPointsLoss = pointsLoss !== undefined ? pointsLoss : points_loss;
        // TENANT ISOLATION: Validate association access
        if (req.user.role === types_1.UserRole.ASSOCIATION_ADMIN && finalAssociationId !== req.user.associationId) {
            (0, responseHandler_1.errorResponse)(res, 'You can only create competitions for your own association', 403, 'ASSOCIATION_MISMATCH');
            return;
        }
        // Club admins and team managers cannot create competitions
        if (req.user.role === types_1.UserRole.CLUB_ADMIN || req.user.role === types_1.UserRole.TEAM_MANAGER) {
            (0, responseHandler_1.errorResponse)(res, 'You do not have permission to create competitions', 403, 'INSUFFICIENT_PERMISSIONS');
            return;
        }
        const competitionId = uuidv4();
        console.log('CREATE COMPETITION - Debug:', {
            name,
            type,
            finalCategory,
            format,
            description,
            finalStartDate,
            finalEndDate,
            finalWebsite,
            finalContactEmail,
            finalContactPhone,
        });
        const result = await (0, database_1.query)(`INSERT INTO competitions (
        id, name, sport_id, association_id, season_id, category, status, rules,
        format, description, start_date, end_date, website, contact_email, contact_phone,
        points_win, points_draw, points_loss
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
       RETURNING *`, [
            competitionId,
            name,
            finalSportId || null,
            finalAssociationId,
            finalSeasonId || null,
            finalCategory || types_1.CompetitionCategory.LEAGUE,
            status || types_1.CompetitionStatus.UPCOMING,
            rules || null,
            format || null,
            description || null,
            finalStartDate || null,
            finalEndDate || null,
            finalWebsite || null,
            finalContactEmail || null,
            finalContactPhone || null,
            finalPointsWin,
            finalPointsDraw,
            finalPointsLoss,
        ]);
        // Log audit
        await (0, database_1.query)(`INSERT INTO audit_logs (id, user_id, action, entity, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`, [uuidv4(), req.user.userId, types_2.AuditAction.CREATE, 'COMPETITION', competitionId, JSON.stringify({ name, sport })]);
        (0, responseHandler_1.successResponse)(res, result.rows[0], 'Competition created successfully', 201);
    }
    catch (error) {
        console.error('Create competition error:', error);
        (0, responseHandler_1.errorResponse)(res, 'Failed to create competition', 500, 'CREATE_COMPETITION_FAILED');
    }
};
exports.createCompetition = createCompetition;
/**
 * @swagger
 * /competitions/{id}:
 *   put:
 *     summary: Update a competition
 *     tags: [Competitions]
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
 *               sport:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [LEAGUE, CUP, TOURNAMENT]
 *               status:
 *                 type: string
 *                 enum: [UPCOMING, ONGOING, COMPLETED]
 *               rules:
 *                 type: string
 *     responses:
 *       200:
 *         description: Competition updated successfully
 */
const updateCompetition = async (req, res) => {
    try {
        if (!req.user) {
            (0, responseHandler_1.errorResponse)(res, 'Unauthorized', 401, 'UNAUTHORIZED');
            return;
        }
        const { id } = req.params;
        const { name, sport_id, sport, type, // Frontend sends "type" but backend uses "category"
        category, status, rules, format, description, startDate, start_date, endDate, end_date, website, websiteUrl, contact_email, contactEmail, contact_phone, contactPhone, } = req.body;
        const existing = await (0, database_1.query)('SELECT * FROM competitions WHERE id = $1 AND deleted_at IS NULL', [id]);
        if (existing.rows.length === 0) {
            (0, responseHandler_1.errorResponse)(res, 'Competition not found', 404, 'COMPETITION_NOT_FOUND');
            return;
        }
        // TENANT ISOLATION: Check if user can modify this competition
        const competition = existing.rows[0];
        if (req.user.role === types_1.UserRole.ASSOCIATION_ADMIN && competition.association_id !== req.user.associationId) {
            (0, responseHandler_1.errorResponse)(res, 'You can only update competitions in your association', 403, 'ASSOCIATION_MISMATCH');
            return;
        }
        // Club admins and team managers cannot update competitions
        if (req.user.role === types_1.UserRole.CLUB_ADMIN || req.user.role === types_1.UserRole.TEAM_MANAGER) {
            (0, responseHandler_1.errorResponse)(res, 'You do not have permission to update competitions', 403, 'INSUFFICIENT_PERMISSIONS');
            return;
        }
        // Support both camelCase and snake_case
        const finalSportId = sport_id || sport; // Support both sport_id (new) and sport (legacy)
        const finalCategory = type !== undefined ? type : category;
        const finalStartDate = startDate || start_date;
        const finalEndDate = endDate || end_date;
        const finalWebsite = website || websiteUrl;
        const finalContactEmail = contact_email || contactEmail;
        const finalContactPhone = contact_phone || contactPhone;
        const updates = [];
        const values = [];
        let paramCount = 1;
        if (name !== undefined) {
            updates.push(`name = $${paramCount++}`);
            values.push(name);
        }
        if (finalSportId !== undefined) {
            updates.push(`sport_id = $${paramCount++}`);
            values.push(finalSportId);
        }
        if (finalCategory !== undefined) {
            updates.push(`category = $${paramCount++}`);
            values.push(finalCategory);
        }
        if (status !== undefined) {
            updates.push(`status = $${paramCount++}`);
            values.push(status);
        }
        if (rules !== undefined) {
            updates.push(`rules = $${paramCount++}`);
            values.push(rules);
        }
        if (format !== undefined) {
            updates.push(`format = $${paramCount++}`);
            values.push(format);
        }
        if (description !== undefined) {
            updates.push(`description = $${paramCount++}`);
            values.push(description);
        }
        if (finalStartDate !== undefined) {
            updates.push(`start_date = $${paramCount++}`);
            values.push(finalStartDate);
        }
        if (finalEndDate !== undefined) {
            updates.push(`end_date = $${paramCount++}`);
            values.push(finalEndDate);
        }
        if (finalWebsite !== undefined) {
            updates.push(`website = $${paramCount++}`);
            values.push(finalWebsite);
        }
        if (finalContactEmail !== undefined) {
            updates.push(`contact_email = $${paramCount++}`);
            values.push(finalContactEmail);
        }
        if (finalContactPhone !== undefined) {
            updates.push(`contact_phone = $${paramCount++}`);
            values.push(finalContactPhone);
        }
        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);
        const result = await (0, database_1.query)(`UPDATE competitions SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`, values);
        // Log audit
        await (0, database_1.query)(`INSERT INTO audit_logs (id, user_id, action, entity, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`, [uuidv4(), req.user.userId, types_2.AuditAction.UPDATE, 'COMPETITION', id, JSON.stringify(req.body)]);
        (0, responseHandler_1.successResponse)(res, result.rows[0], 'Competition updated successfully');
    }
    catch (error) {
        console.error('Update competition error:', error);
        (0, responseHandler_1.errorResponse)(res, 'Failed to update competition', 500, 'UPDATE_COMPETITION_FAILED');
    }
};
exports.updateCompetition = updateCompetition;
/**
 * @swagger
 * /competitions/{id}:
 *   delete:
 *     summary: Delete a competition (soft delete)
 *     tags: [Competitions]
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
 *         description: Competition deleted successfully
 */
const deleteCompetition = async (req, res) => {
    try {
        if (!req.user) {
            (0, responseHandler_1.errorResponse)(res, 'Unauthorized', 401, 'UNAUTHORIZED');
            return;
        }
        const { id } = req.params;
        const existing = await (0, database_1.query)('SELECT * FROM competitions WHERE id = $1 AND deleted_at IS NULL', [id]);
        if (existing.rows.length === 0) {
            (0, responseHandler_1.errorResponse)(res, 'Competition not found', 404, 'COMPETITION_NOT_FOUND');
            return;
        }
        // TENANT ISOLATION: Check if user can delete this competition
        const competition = existing.rows[0];
        if (req.user.role === types_1.UserRole.ASSOCIATION_ADMIN && competition.association_id !== req.user.associationId) {
            (0, responseHandler_1.errorResponse)(res, 'You can only delete competitions in your association', 403, 'ASSOCIATION_MISMATCH');
            return;
        }
        // Club admins and team managers cannot delete competitions
        if (req.user.role === types_1.UserRole.CLUB_ADMIN || req.user.role === types_1.UserRole.TEAM_MANAGER) {
            (0, responseHandler_1.errorResponse)(res, 'You do not have permission to delete competitions', 403, 'INSUFFICIENT_PERMISSIONS');
            return;
        }
        await (0, database_1.query)('UPDATE competitions SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);
        // Log audit
        await (0, database_1.query)(`INSERT INTO audit_logs (id, user_id, action, entity, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`, [uuidv4(), req.user.userId, types_2.AuditAction.DELETE, 'COMPETITION', id, JSON.stringify({ name: existing.rows[0].name })]);
        (0, responseHandler_1.successResponse)(res, null, 'Competition deleted successfully');
    }
    catch (error) {
        console.error('Delete competition error:', error);
        (0, responseHandler_1.errorResponse)(res, 'Failed to delete competition', 500, 'DELETE_COMPETITION_FAILED');
    }
};
exports.deleteCompetition = deleteCompetition;
/**
 * @swagger
 * /competitions/{id}/generate-fixtures:
 *   post:
 *     summary: Generate fixtures for a competition
 *     tags: [Competitions]
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
 *             required:
 *               - teamIds
 *               - format
 *               - startDate
 *             properties:
 *               teamIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: Array of team IDs to include in fixtures
 *               format:
 *                 type: string
 *                 enum: [round-robin, double-round-robin]
 *                 description: Fixture format
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Date for first round of fixtures
 *               matchdays:
 *                 type: integer
 *                 description: Number of days between matchdays
 *     responses:
 *       200:
 *         description: Fixtures generated successfully
 */
const generateFixtures = async (req, res) => {
    const client = await (await Promise.resolve().then(() => __importStar(require('../../config/database')))).pool.connect();
    try {
        if (!req.user) {
            (0, responseHandler_1.errorResponse)(res, 'Unauthorized', 401, 'UNAUTHORIZED');
            return;
        }
        const { id } = req.params;
        const { teamIds, format, startDate, matchdays = 7, venueId } = req.body;
        if (!teamIds || teamIds.length < 2) {
            (0, responseHandler_1.errorResponse)(res, 'At least 2 teams are required', 400, 'INSUFFICIENT_TEAMS');
            return;
        }
        await client.query('BEGIN');
        // Check if competition exists and user has permission
        const competitionResult = await client.query('SELECT * FROM competitions WHERE id = $1 AND deleted_at IS NULL', [id]);
        if (competitionResult.rows.length === 0) {
            await client.query('ROLLBACK');
            (0, responseHandler_1.errorResponse)(res, 'Competition not found', 404, 'COMPETITION_NOT_FOUND');
            return;
        }
        const competition = competitionResult.rows[0];
        // TENANT ISOLATION: Check permissions
        if (req.user.role === types_1.UserRole.ASSOCIATION_ADMIN && competition.association_id !== req.user.associationId) {
            await client.query('ROLLBACK');
            (0, responseHandler_1.errorResponse)(res, 'You can only generate fixtures for competitions in your association', 403, 'ASSOCIATION_MISMATCH');
            return;
        }
        if (req.user.role === types_1.UserRole.CLUB_ADMIN || req.user.role === types_1.UserRole.TEAM_MANAGER) {
            await client.query('ROLLBACK');
            (0, responseHandler_1.errorResponse)(res, 'You do not have permission to generate fixtures', 403, 'INSUFFICIENT_PERMISSIONS');
            return;
        }
        // Check if teams exist
        const teamsResult = await client.query(`SELECT id, name FROM teams WHERE id = ANY($1) AND deleted_at IS NULL`, [teamIds]);
        if (teamsResult.rows.length !== teamIds.length) {
            await client.query('ROLLBACK');
            (0, responseHandler_1.errorResponse)(res, 'One or more teams not found', 404, 'TEAMS_NOT_FOUND');
            return;
        }
        const teams = teamsResult.rows;
        // Generate fixtures based on format
        const fixtures = [];
        const matchDays = [];
        if (format === 'round-robin') {
            // Single round-robin: each team plays every other team once
            const n = teams.length;
            // If odd number of teams, add a dummy team (bye)
            const effectiveTeams = n % 2 === 0 ? teams : [...teams, null];
            const effectiveN = effectiveTeams.length;
            const totalRounds = effectiveN - 1;
            for (let round = 0; round < totalRounds; round++) {
                const roundFixtures = [];
                for (let match = 0; match < effectiveN / 2; match++) {
                    const home = (round + match) % effectiveN;
                    const away = (effectiveN - 1 - match + round) % effectiveN;
                    // Only add fixture if not a dummy team (bye)
                    if (effectiveTeams[home] !== null && effectiveTeams[away] !== null) {
                        roundFixtures.push([home, away]);
                    }
                }
                if (roundFixtures.length > 0) {
                    matchDays.push(roundFixtures);
                }
            }
        }
        else if (format === 'double-round-robin') {
            // Double round-robin: each team plays every other team twice (home and away)
            const n = teams.length;
            const effectiveTeams = n % 2 === 0 ? teams : [...teams, null];
            const effectiveN = effectiveTeams.length;
            const totalRounds = 2 * (effectiveN - 1);
            for (let round = 0; round < totalRounds; round++) {
                const roundFixtures = [];
                const isSecondHalf = round >= effectiveN - 1;
                for (let match = 0; match < effectiveN / 2; match++) {
                    const home = (round + match) % effectiveN;
                    const away = (effectiveN - 1 - match + round) % effectiveN;
                    // Only add fixture if not a dummy team (bye)
                    if (effectiveTeams[home] !== null && effectiveTeams[away] !== null) {
                        if (isSecondHalf) {
                            roundFixtures.push([away, home]); // Swap for second leg
                        }
                        else {
                            roundFixtures.push([home, away]);
                        }
                    }
                }
                if (roundFixtures.length > 0) {
                    matchDays.push(roundFixtures);
                }
            }
        }
        // Create fixtures from matchdays
        let matchdayCounter = 1;
        const startDateObj = new Date(startDate);
        const n = teams.length;
        const effectiveTeams = n % 2 === 0 ? teams : [...teams, null];
        for (const roundFixtures of matchDays) {
            for (const [homeIdx, awayIdx] of roundFixtures) {
                const homeTeam = effectiveTeams[homeIdx];
                const awayTeam = effectiveTeams[awayIdx];
                if (!homeTeam || !awayTeam)
                    continue; // Skip dummy teams
                const fixtureId = uuidv4();
                const fixtureDate = new Date(startDateObj);
                fixtureDate.setDate(fixtureDate.getDate() + (matchdayCounter - 1) * matchdays);
                const fixtureDateTime = new Date(fixtureDate);
                fixtureDateTime.setHours(15, 0, 0, 0); // Default to 3:00 PM
                await client.query(`INSERT INTO fixtures (id, competition_id, home_team_id, away_team_id, venue_id, date_time, round, status, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`, [fixtureId, id, homeTeam.id, awayTeam.id, venueId || null, fixtureDateTime.toISOString(), `Matchday ${matchdayCounter}`, 'SCHEDULED']);
                fixtures.push({
                    id: fixtureId,
                    homeTeam: homeTeam.name,
                    awayTeam: awayTeam.name,
                    matchday: matchdayCounter,
                    date: fixtureDate.toISOString().split('T')[0],
                });
            }
            matchdayCounter++;
        }
        // Log audit
        await client.query(`INSERT INTO audit_logs (id, user_id, action, entity, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`, [uuidv4(), req.user.userId, types_2.AuditAction.CREATE, 'FIXTURES', id, JSON.stringify({
                count: fixtures.length,
                format,
                teams: teamIds.length
            })]);
        await client.query('COMMIT');
        (0, responseHandler_1.successResponse)(res, {
            fixturesGenerated: fixtures.length,
            fixtures,
            matchdays: matchdayCounter - 1,
        }, 'Fixtures generated successfully');
    }
    catch (error) {
        await client.query('ROLLBACK');
        console.error('Generate fixtures error:', error);
        (0, responseHandler_1.errorResponse)(res, 'Failed to generate fixtures', 500, 'GENERATE_FIXTURES_FAILED');
    }
    finally {
        client.release();
    }
};
exports.generateFixtures = generateFixtures;
//# sourceMappingURL=competitions.controller.js.map