"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchVenues = exports.searchTeams = exports.searchClubs = exports.searchAssociations = exports.globalSearch = void 0;
const database_1 = require("../../config/database");
const responseHandler_1 = require("../../utils/responseHandler");
/**
 * Global Search Controller
 * Full-text search across all entities
 */
/**
 * @swagger
 * /search:
 *   get:
 *     summary: Global search across all entities
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: types
 *         schema:
 *           type: string
 *           enum: [ASSOCIATION,CLUB,TEAM,COMPETITION,VENUE,PLAYER,NEWS]
 *         description: Filter by entity types (comma-separated)
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
 *         description: Search results
 */
const globalSearch = async (req, res) => {
    try {
        const { q, types, page = 1, limit = 20 } = req.query;
        if (!q || typeof q !== 'string' || q.trim().length === 0) {
            (0, responseHandler_1.errorResponse)(res, 'Search query is required', 400, 'MISSING_QUERY');
            return;
        }
        // Refresh materialized view (can be done periodically instead)
        // await query('REFRESH MATERIALIZED VIEW CONCURRENTLY search_index', []);
        const offset = (Number(page) - 1) * Number(limit);
        const searchTerm = q.trim();
        // Build type filter
        let typeFilter = '';
        const queryParams = [searchTerm, Number(limit), offset];
        if (types && typeof types === 'string') {
            const typeList = types.split(',').map(t => `'${t.trim().toUpperCase()}'`).join(',');
            typeFilter = ` AND entity_type IN (${typeList})`;
        }
        // Full-text search query
        const searchQuery = `
      SELECT
        entity_type,
        entity_id,
        title,
        content,
        tenant_id,
        parent_id,
        url_path,
        ts_rank(to_tsvector('english', title || ' ' || COALESCE(content, '')), plainto_tsquery('english', $1)) as relevance
      FROM search_index
      WHERE to_tsvector('english', title || ' ' || COALESCE(content, '')) @@ plainto_tsquery('english', $1)
        ${typeFilter}
      ORDER BY relevance DESC, created_at DESC
      LIMIT $2 OFFSET $3
    `;
        const result = await (0, database_1.query)(searchQuery, queryParams);
        // Get total count
        const countQuery = `
      SELECT COUNT(*) as total
      FROM search_index
      WHERE to_tsvector('english', title || ' ' || COALESCE(content, '')) @@ plainto_tsquery('english', $1)
        ${typeFilter}
    `;
        const countResult = await (0, database_1.query)(countQuery, [searchTerm]);
        const total = parseInt(countResult.rows[0].total);
        // Group results by entity type (for potential future use)
        result.rows.reduce((acc, item) => {
            if (!acc[item.entity_type]) {
                acc[item.entity_type] = [];
            }
            acc[item.entity_type].push(item);
            return acc;
        }, {});
        (0, responseHandler_1.paginatedResponse)(res, result.rows, Number(page), Number(limit), total, 'Search completed successfully');
    }
    catch (error) {
        console.error('Search error:', error);
        (0, responseHandler_1.errorResponse)(res, 'Search failed', 500, 'SEARCH_FAILED');
    }
};
exports.globalSearch = globalSearch;
/**
 * @swagger
 * /search/associations:
 *   get:
 *     summary: Search associations
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Association search results
 */
const searchAssociations = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || typeof q !== 'string') {
            (0, responseHandler_1.errorResponse)(res, 'Search query is required', 400, 'MISSING_QUERY');
            return;
        }
        const result = await (0, database_1.query)(`SELECT
        a.*,
        ts_rank(to_tsvector('english', a.name || ' ' || COALESCE(a.description, '')), plainto_tsquery('english', $1)) as relevance
       FROM associations a
       WHERE to_tsvector('english', a.name || ' ' || COALESCE(a.description, '')) @@ plainto_tsquery('english', $1)
       AND a.deleted_at IS NULL
       ORDER BY relevance DESC
       LIMIT 20`, [q]);
        (0, responseHandler_1.successResponse)(res, result.rows, 'Association search completed');
    }
    catch (error) {
        console.error('Association search error:', error);
        (0, responseHandler_1.errorResponse)(res, 'Search failed', 500, 'SEARCH_FAILED');
    }
};
exports.searchAssociations = searchAssociations;
/**
 * @swagger
 * /search/clubs:
 *   get:
 *     summary: Search clubs
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: association_id
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Club search results
 */
const searchClubs = async (req, res) => {
    try {
        const { q, association_id } = req.query;
        if (!q || typeof q !== 'string') {
            (0, responseHandler_1.errorResponse)(res, 'Search query is required', 400, 'MISSING_QUERY');
            return;
        }
        let queryText = `
      SELECT
        c.*,
        a.name as association_name,
        ts_rank(to_tsvector('english', c.name), plainto_tsquery('english', $1)) as relevance
      FROM clubs c
      LEFT JOIN associations a ON c.association_id = a.id
      WHERE to_tsvector('english', c.name) @@ plainto_tsquery('english', $1)
      AND c.deleted_at IS NULL
    `;
        const queryParams = [q];
        if (association_id) {
            queryText += ` AND c.association_id = $2`;
            queryParams.push(association_id);
        }
        queryText += ` ORDER BY relevance DESC LIMIT 20`;
        const result = await (0, database_1.query)(queryText, queryParams);
        (0, responseHandler_1.successResponse)(res, result.rows, 'Club search completed');
    }
    catch (error) {
        console.error('Club search error:', error);
        (0, responseHandler_1.errorResponse)(res, 'Search failed', 500, 'SEARCH_FAILED');
    }
};
exports.searchClubs = searchClubs;
/**
 * @swagger
 * /search/teams:
 *   get:
 *     summary: Search teams
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Team search results
 */
const searchTeams = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || typeof q !== 'string') {
            (0, responseHandler_1.errorResponse)(res, 'Search query is required', 400, 'MISSING_QUERY');
            return;
        }
        const result = await (0, database_1.query)(`SELECT
        t.*,
        c.name as club_name,
        a.name as association_name,
        ts_rank(to_tsvector('english', t.name), plainto_tsquery('english', $1)) as relevance
       FROM teams t
       LEFT JOIN clubs c ON t.club_id = c.id
       LEFT JOIN associations a ON c.association_id = a.id
       WHERE to_tsvector('english', t.name) @@ plainto_tsquery('english', $1)
       AND t.deleted_at IS NULL
       ORDER BY relevance DESC
       LIMIT 20`, [q]);
        (0, responseHandler_1.successResponse)(res, result.rows, 'Team search completed');
    }
    catch (error) {
        console.error('Team search error:', error);
        (0, responseHandler_1.errorResponse)(res, 'Search failed', 500, 'SEARCH_FAILED');
    }
};
exports.searchTeams = searchTeams;
/**
 * @swagger
 * /search/venues:
 *   get:
 *     summary: Search venues
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Venue search results
 */
const searchVenues = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || typeof q !== 'string') {
            (0, responseHandler_1.errorResponse)(res, 'Search query is required', 400, 'MISSING_QUERY');
            return;
        }
        const result = await (0, database_1.query)(`SELECT
        v.*,
        ts_rank(to_tsvector('english', v.name || ' ' || v.address), plainto_tsquery('english', $1)) as relevance
       FROM venues v
       WHERE to_tsvector('english', v.name || ' ' || v.address) @@ plainto_tsquery('english', $1)
       AND v.deleted_at IS NULL
       ORDER BY relevance DESC
       LIMIT 20`, [q]);
        (0, responseHandler_1.successResponse)(res, result.rows, 'Venue search completed');
    }
    catch (error) {
        console.error('Venue search error:', error);
        (0, responseHandler_1.errorResponse)(res, 'Search failed', 500, 'SEARCH_FAILED');
    }
};
exports.searchVenues = searchVenues;
//# sourceMappingURL=search.controller.js.map