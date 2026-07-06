"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getResultByFixtureId = exports.getResults = exports.publishResult = exports.confirmResult = exports.submitResult = void 0;
const uuid_1 = require("uuid");
const database_1 = require("../../config/database");
const responseHandler_1 = require("../../utils/responseHandler");
const types_1 = require("../../types");
const types_2 = require("../../types");
/**
 * @swagger
 * /results:
 *   post:
 *     summary: Submit a match result
 *     tags: [Results]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fixture_id
 *               - home_score
 *               - away_score
 *             properties:
 *               fixture_id:
 *                 type: string
 *                 format: uuid
 *               home_score:
 *                 type: integer
 *               away_score:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Result submitted successfully
 */
const submitResult = async (req, res) => {
    const client = await database_1.pool.connect();
    let transactionStarted = false;
    try {
        if (!req.user) {
            (0, responseHandler_1.errorResponse)(res, 'Unauthorized', 401, 'UNAUTHORIZED');
            return;
        }
        const { fixture_id, home_score, away_score } = req.body;
        const homeScore = Number(home_score);
        const awayScore = Number(away_score);
        if (!fixture_id || !Number.isFinite(homeScore) || !Number.isFinite(awayScore) || homeScore < 0 || awayScore < 0) {
            (0, responseHandler_1.errorResponse)(res, 'Fixture and non-negative scores are required', 400, 'INVALID_RESULT_DATA');
            return;
        }
        // Check if fixture exists and get competition info
        const fixtureResult = await client.query(`SELECT f.*, c.id as competition_id
       FROM fixtures f
       LEFT JOIN competitions c ON f.competition_id = c.id
       WHERE f.id = $1 AND f.deleted_at IS NULL`, [fixture_id]);
        if (fixtureResult.rows.length === 0) {
            (0, responseHandler_1.errorResponse)(res, 'Fixture not found', 404, 'FIXTURE_NOT_FOUND');
            return;
        }
        await client.query('BEGIN');
        transactionStarted = true;
        // Check if result already exists
        const existingResult = await client.query('SELECT id, status FROM results WHERE fixture_id = $1', [fixture_id]);
        let result;
        if (existingResult.rows.length > 0) {
            // Update existing result
            const existingId = existingResult.rows[0].id;
            if (existingResult.rows[0].status === types_1.ResultStatus.PUBLISHED) {
                await client.query('ROLLBACK');
                transactionStarted = false;
                (0, responseHandler_1.errorResponse)(res, 'Published results cannot be overwritten. Create an admin correction workflow instead.', 400, 'RESULT_ALREADY_PUBLISHED');
                return;
            }
            result = await client.query(`UPDATE results
         SET home_score = $1,
             away_score = $2,
             status = $3,
             submitted_by = $4,
             confirmed_by = NULL,
             confirmed_at = NULL,
             published_by = NULL,
             published_at = NULL,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $5
         RETURNING *`, [homeScore, awayScore, types_1.ResultStatus.SUBMITTED, req.user.userId, existingId]);
        }
        else {
            // Create new result
            const resultId = (0, uuid_1.v4)();
            result = await client.query(`INSERT INTO results (id, fixture_id, home_score, away_score, status, submitted_by)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`, [resultId, fixture_id, homeScore, awayScore, types_1.ResultStatus.SUBMITTED, req.user.userId]);
        }
        // Update fixture status to FINISHED
        await client.query(`UPDATE fixtures SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`, ['FINISHED', fixture_id]);
        // Log audit
        await client.query(`INSERT INTO audit_logs (id, user_id, action, entity, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`, [(0, uuid_1.v4)(), req.user.userId, types_2.AuditAction.CREATE, 'RESULT', result.rows[0].id, JSON.stringify({ fixture_id, home_score: homeScore, away_score: awayScore, status: 'SUBMITTED' })]);
        await client.query('COMMIT');
        transactionStarted = false;
        (0, responseHandler_1.successResponse)(res, result.rows[0], 'Result submitted successfully', 201);
    }
    catch (error) {
        if (transactionStarted) {
            try {
                await client.query('ROLLBACK');
            }
            catch (rollbackError) {
                console.error('Rollback error:', rollbackError);
            }
        }
        console.error('Submit result error details:', error);
        (0, responseHandler_1.errorResponse)(res, 'Failed to submit result', 500, 'SUBMIT_RESULT_FAILED');
    }
    finally {
        client.release();
    }
};
exports.submitResult = submitResult;
/**
 * @swagger
 * /results/{id}/confirm:
 *   put:
 *     summary: Confirm a result
 *     tags: [Results]
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
 *         description: Result confirmed successfully
 */
const confirmResult = async (req, res) => {
    const client = await database_1.pool.connect();
    let transactionStarted = false;
    try {
        if (!req.user) {
            (0, responseHandler_1.errorResponse)(res, 'Unauthorized', 401, 'UNAUTHORIZED');
            return;
        }
        const { id } = req.params;
        const existing = await client.query('SELECT * FROM results WHERE id = $1', [id]);
        if (existing.rows.length === 0) {
            (0, responseHandler_1.errorResponse)(res, 'Result not found', 404, 'RESULT_NOT_FOUND');
            return;
        }
        const result = existing.rows[0];
        if (result.status !== types_1.ResultStatus.SUBMITTED) {
            (0, responseHandler_1.errorResponse)(res, 'Result can only be confirmed from SUBMITTED status', 400, 'INVALID_STATUS');
            return;
        }
        await client.query('BEGIN');
        transactionStarted = true;
        const updatedResult = await client.query(`UPDATE results
       SET status = $1, confirmed_by = $2, confirmed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`, [types_1.ResultStatus.CONFIRMED, req.user.userId, id]);
        // Log audit
        await client.query(`INSERT INTO audit_logs (id, user_id, action, entity, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`, [(0, uuid_1.v4)(), req.user.userId, types_2.AuditAction.UPDATE, 'RESULT', id, JSON.stringify({ status: 'CONFIRMED' })]);
        await client.query('COMMIT');
        transactionStarted = false;
        (0, responseHandler_1.successResponse)(res, updatedResult.rows[0], 'Result confirmed successfully');
    }
    catch (error) {
        if (transactionStarted) {
            try {
                await client.query('ROLLBACK');
            }
            catch (rollbackError) {
                console.error('Rollback error:', rollbackError);
            }
        }
        console.error('Confirm result error details:', error);
        (0, responseHandler_1.errorResponse)(res, 'Failed to confirm result', 500, 'CONFIRM_RESULT_FAILED');
    }
    finally {
        client.release();
    }
};
exports.confirmResult = confirmResult;
/**
 * @swagger
 * /results/{id}/publish:
 *   put:
 *     summary: Publish a result (triggers standings update)
 *     tags: [Results]
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
 *         description: Result published and standings updated successfully
 */
const publishResult = async (req, res) => {
    const client = await database_1.pool.connect();
    let transactionStarted = false;
    try {
        if (!req.user) {
            (0, responseHandler_1.errorResponse)(res, 'Unauthorized', 401, 'UNAUTHORIZED');
            return;
        }
        const { id } = req.params;
        const existing = await client.query(`SELECT r.*, f.competition_id, f.home_team_id, f.away_team_id, c.points_win, c.points_draw, c.points_loss
       FROM results r
       LEFT JOIN fixtures f ON r.fixture_id = f.id
       LEFT JOIN competitions c ON f.competition_id = c.id
       WHERE r.id = $1`, [id]);
        if (existing.rows.length === 0) {
            (0, responseHandler_1.errorResponse)(res, 'Result not found', 404, 'RESULT_NOT_FOUND');
            return;
        }
        const result = existing.rows[0];
        if (result.status !== types_1.ResultStatus.CONFIRMED) {
            (0, responseHandler_1.errorResponse)(res, 'Result can only be published from CONFIRMED status', 400, 'INVALID_STATUS');
            return;
        }
        await client.query('BEGIN');
        transactionStarted = true;
        // Update result status
        const updatedResult = await client.query(`UPDATE results
       SET status = $1, published_by = $2, published_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`, [types_1.ResultStatus.PUBLISHED, req.user.userId, id]);
        // Rebuild standings from all published results so edits/re-publishes cannot double-count.
        await recalculateCompetitionStandings(client, result.competition_id);
        // Update fixture status to FINISHED
        await client.query(`UPDATE fixtures SET status = $1 WHERE id = $2`, ['FINISHED', result.fixture_id]);
        // Log audit
        await client.query(`INSERT INTO audit_logs (id, user_id, action, entity, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`, [(0, uuid_1.v4)(), req.user.userId, types_2.AuditAction.PUBLISH, 'RESULT', id, JSON.stringify({ status: 'PUBLISHED', fixture_id: result.fixture_id })]);
        await client.query('COMMIT');
        transactionStarted = false;
        (0, responseHandler_1.successResponse)(res, updatedResult.rows[0], 'Result published and standings updated successfully');
    }
    catch (error) {
        if (transactionStarted) {
            try {
                await client.query('ROLLBACK');
            }
            catch (rollbackError) {
                console.error('Rollback error:', rollbackError);
            }
        }
        console.error('Publish result error details:', error);
        (0, responseHandler_1.errorResponse)(res, 'Failed to publish result', 500, 'PUBLISH_RESULT_FAILED');
    }
    finally {
        client.release();
    }
};
exports.publishResult = publishResult;
const updateTeamStandings = async (client, teamId, competitionId, result, pointsWin, pointsDraw, pointsLoss) => {
    // Check if standing exists
    const existing = await client.query('SELECT * FROM standings WHERE competition_id = $1 AND team_id = $2', [competitionId, teamId]);
    const isHomeTeam = result.home_team_id === teamId;
    const teamScore = isHomeTeam ? result.home_score : result.away_score;
    const opponentScore = isHomeTeam ? result.away_score : result.home_score;
    let points = 0;
    let won = 0;
    let drawn = 0;
    let lost = 0;
    if (teamScore > opponentScore) {
        points = pointsWin;
        won = 1;
    }
    else if (teamScore === opponentScore) {
        points = pointsDraw;
        drawn = 1;
    }
    else {
        points = pointsLoss;
        lost = 1;
    }
    if (existing.rows.length > 0) {
        // Update existing standing
        await client.query(`UPDATE standings
       SET
         played = played + 1,
         won = won + $1,
         drawn = drawn + $2,
         lost = lost + $3,
         goals_for = goals_for + $4,
         goals_against = goals_against + $5,
         goal_difference = goals_for + $4 - (goals_against + $5),
         points = points + $6,
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $7`, [won, drawn, lost, teamScore, opponentScore, points, existing.rows[0].id]);
    }
    else {
        // Create new standing
        await client.query(`INSERT INTO standings (id, competition_id, team_id, played, won, drawn, lost, goals_for, goals_against, goal_difference, points)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`, [(0, uuid_1.v4)(), competitionId, teamId, 1, won, drawn, lost, teamScore, opponentScore, teamScore - opponentScore, points]);
    }
};
/**
 * @swagger
 * /results:
 *   get:
 *     summary: Get all results
 *     tags: [Results]
 *     parameters:
 *       - in: query
 *         name: competition_id
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [SUBMITTED, CONFIRMED, PUBLISHED]
 *     responses:
 *       200:
 *         description: Results retrieved successfully
 */
const getResults = async (req, res) => {
    try {
        const { page = 1, limit = 10, competition_id, competitionId, fixture_id, fixtureId, team_id, teamId, status, } = req.query;
        const pageNumber = Number(page) || 1;
        const pageLimit = Number(limit) || 10;
        const offset = (pageNumber - 1) * pageLimit;
        let queryText = `
      SELECT
        r.*,
        f.date_time,
        f.status as fixture_status,
        f.competition_id,
        f.home_team_id,
        f.away_team_id,
        c.name as competition_name,
        c.sport as competition_sport,
        ht.name as home_team_name,
        ht.logo as home_team_logo,
        at.name as away_team_name,
        at.logo as away_team_logo,
        v.name as venue_name
      FROM results r
      LEFT JOIN fixtures f ON r.fixture_id = f.id
      LEFT JOIN competitions c ON f.competition_id = c.id
      LEFT JOIN teams ht ON f.home_team_id = ht.id
      LEFT JOIN teams at ON f.away_team_id = at.id
      LEFT JOIN venues v ON f.venue_id = v.id
      WHERE 1=1
    `;
        let params = [];
        const resolvedCompetitionId = competition_id || competitionId;
        const resolvedFixtureId = fixture_id || fixtureId;
        const resolvedTeamId = team_id || teamId;
        if (resolvedCompetitionId) {
            queryText += ` AND f.competition_id = $${params.length + 1}`;
            params.push(resolvedCompetitionId);
        }
        if (resolvedFixtureId) {
            queryText += ` AND r.fixture_id = $${params.length + 1}`;
            params.push(resolvedFixtureId);
        }
        if (resolvedTeamId) {
            queryText += ` AND (f.home_team_id = $${params.length + 1} OR f.away_team_id = $${params.length + 1})`;
            params.push(resolvedTeamId);
        }
        if (status) {
            queryText += ` AND r.status = $${params.length + 1}`;
            params.push(status);
        }
        const countQuery = `SELECT COUNT(*) FROM (${queryText}) count_scope`;
        const countResult = await (0, database_1.query)(countQuery, params);
        const total = parseInt(countResult.rows[0].count, 10);
        queryText += ` ORDER BY r.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(pageLimit, offset);
        const result = await (0, database_1.query)(queryText, params);
        (0, responseHandler_1.paginatedResponse)(res, result.rows, pageNumber, pageLimit, total, 'Results retrieved successfully');
    }
    catch (error) {
        console.error('Get results error:', error);
        (0, responseHandler_1.errorResponse)(res, 'Failed to get results', 500, 'GET_RESULTS_FAILED');
    }
};
exports.getResults = getResults;
/**
 * @swagger
 * /results/fixture/{fixtureId}:
 *   get:
 *     summary: Get result for a specific fixture
 *     tags: [Results]
 *     parameters:
 *       - in: path
 *         name: fixtureId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Result retrieved successfully
 */
const getResultByFixtureId = async (req, res) => {
    try {
        const { fixtureId } = req.params;
        const result = await (0, database_1.query)(`SELECT r.*,
              u_submitter.name as submitted_by_name,
              u_confirmer.name as confirmed_by_name
       FROM results r
       LEFT JOIN users u_submitter ON r.submitted_by = u_submitter.id
       LEFT JOIN users u_confirmer ON r.confirmed_by = u_confirmer.id
       WHERE r.fixture_id = $1`, [fixtureId]);
        if (result.rows.length === 0) {
            (0, responseHandler_1.errorResponse)(res, 'Result not found', 404, 'RESULT_NOT_FOUND');
            return;
        }
        (0, responseHandler_1.successResponse)(res, result.rows[0], 'Result retrieved successfully');
    }
    catch (error) {
        console.error('Get result error:', error);
        (0, responseHandler_1.errorResponse)(res, 'Failed to get result', 500, 'GET_RESULT_FAILED');
    }
};
exports.getResultByFixtureId = getResultByFixtureId;
/**
 * Helper function to recalculate standings for a competition
 * Processes all published results
 */
async function recalculateCompetitionStandings(client, competitionId) {
    try {
        // Get competition info
        const competitionResult = await client.query('SELECT points_win, points_draw, points_loss FROM competitions WHERE id = $1', [competitionId]);
        if (competitionResult.rows.length === 0) {
            console.log('Competition not found for standings calculation');
            return;
        }
        const competition = competitionResult.rows[0];
        // Get all public results for this competition. Confirmed results are reviewed
        // but should not affect public standings until explicitly published.
        const resultsResult = await client.query(`SELECT r.*, f.home_team_id, f.away_team_id
       FROM results r
       LEFT JOIN fixtures f ON r.fixture_id = f.id
       WHERE f.competition_id = $1 AND r.status = 'PUBLISHED'
       ORDER BY r.created_at ASC`, [competitionId]);
        // Delete existing standings
        await client.query('DELETE FROM standings WHERE competition_id = $1', [competitionId]);
        // Get all teams that appear in fixtures for this competition. Imported data
        // does not attach teams directly to competitions.
        const teamsResult = await client.query(`SELECT DISTINCT team_id AS id
       FROM (
         SELECT home_team_id AS team_id FROM fixtures WHERE competition_id = $1 AND home_team_id IS NOT NULL
         UNION
         SELECT away_team_id AS team_id FROM fixtures WHERE competition_id = $1 AND away_team_id IS NOT NULL
       ) teams`, [competitionId]);
        // Initialize standings for all teams
        for (const team of teamsResult.rows) {
            await client.query(`INSERT INTO standings (id, competition_id, team_id, played, won, drawn, lost, goals_for, goals_against, goal_difference, points)
         VALUES ($1, $2, $3, 0, 0, 0, 0, 0, 0, 0, 0)`, [(0, uuid_1.v4)(), String(competitionId), team.id]);
        }
        // Process each result
        for (const result of resultsResult.rows) {
            await updateTeamStandings(client, result.home_team_id, String(competitionId), result, competition.points_win || 3, competition.points_draw || 1, competition.points_loss || 0);
            await updateTeamStandings(client, result.away_team_id, String(competitionId), result, competition.points_win || 3, competition.points_draw || 1, competition.points_loss || 0);
        }
        console.log(`Standings recalculated for competition ${competitionId}`);
    }
    catch (error) {
        console.error('Recalculate standings error:', error);
        throw error;
    }
}
//# sourceMappingURL=results.controller.js.map