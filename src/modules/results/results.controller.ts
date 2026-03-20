import { Response } from 'express';
import pkg from 'uuid';
const { v4: uuidv4 } = pkg;
import { query } from '../../config/database';
import { successResponse, errorResponse } from '../../utils/responseHandler';
import { AuthRequest, ResultStatus } from '../../types';
import { AuditAction } from '../../types';

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
export const submitResult = async (req: AuthRequest, res: Response): Promise<void> => {
  const client = await (await import('../../config/database')).pool.connect();

  try {
    if (!req.user) {
      errorResponse(res, 'Unauthorized', 401, 'UNAUTHORIZED');
      return;
    }

    const { fixture_id, home_score, away_score, goals, stats } = req.body;

    await client.query('BEGIN');

    // Check if fixture exists and get competition info
    const fixtureResult = await client.query(
      `SELECT f.*, c.id as competition_id, c.points_win, c.points_draw, c.points_loss
       FROM fixtures f
       LEFT JOIN competitions c ON f.competition_id = c.id
       WHERE f.id = $1 AND f.deleted_at IS NULL`,
      [fixture_id]
    );

    if (fixtureResult.rows.length === 0) {
      await client.query('ROLLBACK');
      errorResponse(res, 'Fixture not found', 404, 'FIXTURE_NOT_FOUND');
      return;
    }

    // const fixture = fixtureResult.rows[0];

    // Check if result already exists
    const existingResult = await client.query(
      'SELECT id, status FROM results WHERE fixture_id = $1',
      [fixture_id]
    );

    let result;
    if (existingResult.rows.length > 0) {
      // Update existing result
      const existingId = existingResult.rows[0].id;
      result = await client.query(
        `UPDATE results SET home_score = $1, away_score = $2, status = $3, submitted_by = $4, updated_at = CURRENT_TIMESTAMP
         WHERE id = $5
         RETURNING *`,
        [home_score, away_score, ResultStatus.SUBMITTED, req.user.userId, existingId]
      );
    } else {
      // Create new result
      const resultId = uuidv4();
      result = await client.query(
        `INSERT INTO results (id, fixture_id, home_score, away_score, status, submitted_by)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [resultId, fixture_id, home_score, away_score, ResultStatus.SUBMITTED, req.user.userId]
      );
    }

    // Update fixture status to FINISHED
    await client.query(
      `UPDATE fixtures SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      ['FINISHED', fixture_id]
    );

    // Trigger standings recalculation for the competition
    try {
      const fixtureInfo = await client.query(
        'SELECT competition_id FROM fixtures WHERE id = $1',
        [fixture_id]
      );

      if (fixtureInfo.rows.length > 0) {
        const competitionId = fixtureInfo.rows[0].competition_id;

        // Recalculate standings
        await recalculateCompetitionStandings(client, competitionId);
      }
    } catch (standingsError) {
      console.error('Failed to recalculate standings:', standingsError);
      // Don't fail the result submission if standings calculation fails
    }

    // Store goals as JSON if provided
    if (goals && (goals.home || goals.away)) {
      const allGoals = [...(goals.home || []), ...(goals.away || [])];
      if (allGoals.length > 0) {
        await client.query(
          `UPDATE results SET goals = $1 WHERE id = $2`,
          [JSON.stringify(allGoals), result.rows[0].id]
        );
      }
    }

    // Store match stats as JSON if provided
    if (stats) {
      await client.query(
        `UPDATE results SET match_stats = $1 WHERE id = $2`,
        [JSON.stringify(stats), result.rows[0].id]
      );
    }

    // Log audit
    await client.query(
      `INSERT INTO audit_logs (id, user_id, action, entity, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [uuidv4(), req.user.userId, AuditAction.CREATE, 'RESULT', result.rows[0].id, JSON.stringify({ fixture_id, home_score, away_score })]
    );

    await client.query('COMMIT');

    successResponse(res, result.rows[0], 'Result submitted successfully', 201);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Submit result error:', error);
    errorResponse(res, 'Failed to submit result', 500, 'SUBMIT_RESULT_FAILED');
  } finally {
    client.release();
  }
};

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
export const confirmResult = async (req: AuthRequest, res: Response): Promise<void> => {
  const client = await (await import('../../config/database')).pool.connect();

  try {
    if (!req.user) {
      errorResponse(res, 'Unauthorized', 401, 'UNAUTHORIZED');
      return;
    }

    const { id } = req.params;

    await client.query('BEGIN');

    const existing = await client.query(
      'SELECT * FROM results WHERE id = $1',
      [id]
    );

    if (existing.rows.length === 0) {
      await client.query('ROLLBACK');
      errorResponse(res, 'Result not found', 404, 'RESULT_NOT_FOUND');
      return;
    }

    const result = existing.rows[0];

    if (result.status !== ResultStatus.SUBMITTED) {
      await client.query('ROLLBACK');
      errorResponse(res, 'Result can only be confirmed from SUBMITTED status', 400, 'INVALID_STATUS');
      return;
    }

    const updatedResult = await client.query(
      `UPDATE results
       SET status = $1, confirmed_by = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [ResultStatus.CONFIRMED, req.user.userId, id]
    );

    // Log audit
    await client.query(
      `INSERT INTO audit_logs (id, user_id, action, entity, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [uuidv4(), req.user.userId, AuditAction.UPDATE, 'RESULT', id, JSON.stringify({ status: 'CONFIRMED' })]
    );

    await client.query('COMMIT');

    successResponse(res, updatedResult.rows[0], 'Result confirmed successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Confirm result error:', error);
    errorResponse(res, 'Failed to confirm result', 500, 'CONFIRM_RESULT_FAILED');
  } finally {
    client.release();
  }
};

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
export const publishResult = async (req: AuthRequest, res: Response): Promise<void> => {
  const client = await (await import('../../config/database')).pool.connect();

  try {
    if (!req.user) {
      errorResponse(res, 'Unauthorized', 401, 'UNAUTHORIZED');
      return;
    }

    const { id } = req.params;

    await client.query('BEGIN');

    const existing = await client.query(
      `SELECT r.*, f.competition_id, f.home_team_id, f.away_team_id, c.points_win, c.points_draw, c.points_loss
       FROM results r
       LEFT JOIN fixtures f ON r.fixture_id = f.id
       LEFT JOIN competitions c ON f.competition_id = c.id
       WHERE r.id = $1`,
      [id]
    );

    if (existing.rows.length === 0) {
      await client.query('ROLLBACK');
      errorResponse(res, 'Result not found', 404, 'RESULT_NOT_FOUND');
      return;
    }

    const result = existing.rows[0];

    if (result.status !== ResultStatus.CONFIRMED) {
      await client.query('ROLLBACK');
      errorResponse(res, 'Result can only be published from CONFIRMED status', 400, 'INVALID_STATUS');
      return;
    }

    // Update result status
    await client.query(
      `UPDATE results
       SET status = $1, published_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [ResultStatus.PUBLISHED, id]
    );

    // Update standings for both teams
    await updateTeamStandings(client, result.home_team_id, result.competition_id, result, result.points_win, result.points_draw, result.points_loss);
    await updateTeamStandings(client, result.away_team_id, result.competition_id, result, result.points_win, result.points_draw, result.points_loss);

    // Update fixture status to FINISHED
    await client.query(
      `UPDATE fixtures SET status = $1 WHERE id = $2`,
      ['FINISHED', result.fixture_id]
    );

    // Log audit
    await client.query(
      `INSERT INTO audit_logs (id, user_id, action, entity, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [uuidv4(), req.user.userId, AuditAction.PUBLISH, 'RESULT', id, JSON.stringify({ status: 'PUBLISHED', fixture_id: result.fixture_id })]
    );

    await client.query('COMMIT');

    successResponse(res, null, 'Result published and standings updated successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Publish result error:', error);
    errorResponse(res, 'Failed to publish result', 500, 'PUBLISH_RESULT_FAILED');
  } finally {
    client.release();
  }
};

const updateTeamStandings = async (
  client: any,
  teamId: string,
  competitionId: string,
  result: any,
  pointsWin: number,
  pointsDraw: number,
  pointsLoss: number
): Promise<void> => {
  // Check if standing exists
  const existing = await client.query(
    'SELECT * FROM standings WHERE competition_id = $1 AND team_id = $2',
    [competitionId, teamId]
  );

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
  } else if (teamScore === opponentScore) {
    points = pointsDraw;
    drawn = 1;
  } else {
    points = pointsLoss;
    lost = 1;
  }

  if (existing.rows.length > 0) {
    // Update existing standing
    await client.query(
      `UPDATE standings
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
       WHERE id = $7`,
      [won, drawn, lost, teamScore, opponentScore, points, existing.rows[0].id]
    );
  } else {
    // Create new standing
    await client.query(
      `INSERT INTO standings (id, competition_id, team_id, played, won, drawn, lost, goals_for, goals_against, goal_difference, points)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [uuidv4(), competitionId, teamId, 1, won, drawn, lost, teamScore, opponentScore, teamScore - opponentScore, points]
    );
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
export const getResults = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { competition_id, status } = req.query;

    let queryText = `
      SELECT
        r.*,
        f.date_time,
        c.name as competition_name,
        ht.name as home_team_name,
        at.name as away_team_name
      FROM results r
      LEFT JOIN fixtures f ON r.fixture_id = f.id
      LEFT JOIN competitions c ON f.competition_id = c.id
      LEFT JOIN teams ht ON f.home_team_id = ht.id
      LEFT JOIN teams at ON f.away_team_id = at.id
      WHERE 1=1
    `;
    let params: any[] = [];

    if (competition_id) {
      queryText += ` AND f.competition_id = $${params.length + 1}`;
      params.push(competition_id);
    }
    if (status) {
      queryText += ` AND r.status = $${params.length + 1}`;
      params.push(status);
    }

    queryText += ` ORDER BY r.created_at DESC`;

    const result = await query(queryText, params);

    successResponse(res, result.rows, 'Results retrieved successfully');
  } catch (error) {
    console.error('Get results error:', error);
    errorResponse(res, 'Failed to get results', 500, 'GET_RESULTS_FAILED');
  }
};

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
export const getResultByFixtureId = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { fixtureId } = req.params;

    const result = await query(
      `SELECT r.*,
              u_submitter.name as submitted_by_name,
              u_confirmer.name as confirmed_by_name
       FROM results r
       LEFT JOIN users u_submitter ON r.submitted_by = u_submitter.id
       LEFT JOIN users u_confirmer ON r.confirmed_by = u_confirmer.id
       WHERE r.fixture_id = $1`,
      [fixtureId]
    );

    if (result.rows.length === 0) {
      errorResponse(res, 'Result not found', 404, 'RESULT_NOT_FOUND');
      return;
    }

    successResponse(res, result.rows[0], 'Result retrieved successfully');
  } catch (error) {
    console.error('Get result error:', error);
    errorResponse(res, 'Failed to get result', 500, 'GET_RESULT_FAILED');
  }
};

/**
 * Helper function to recalculate standings for a competition
 * Processes all published and confirmed results
 */
async function recalculateCompetitionStandings(client: any, competitionId: string): Promise<void> {
  try {
    // Get competition info
    const competitionResult = await client.query(
      'SELECT points_win, points_draw, points_loss FROM competitions WHERE id = $1',
      [competitionId]
    );

    if (competitionResult.rows.length === 0) {
      console.log('Competition not found for standings calculation');
      return;
    }

    const competition = competitionResult.rows[0];

    // Get all results for this competition (both PUBLISHED and CONFIRMED)
    const resultsResult = await client.query(
      `SELECT r.*, f.home_team_id, f.away_team_id
       FROM results r
       LEFT JOIN fixtures f ON r.fixture_id = f.id
       WHERE f.competition_id = $1 AND r.status IN ('PUBLISHED', 'CONFIRMED')
       ORDER BY r.created_at ASC`,
      [competitionId]
    );

    // Delete existing standings
    await client.query(
      'DELETE FROM standings WHERE competition_id = $1',
      [competitionId]
    );

    // Get all teams in competition
    const teamsResult = await client.query(
      `SELECT DISTINCT t.id
       FROM teams t
       WHERE t.competition_id = $1`,
      [competitionId]
    );

    // Initialize standings for all teams
    for (const team of teamsResult.rows) {
      await client.query(
        `INSERT INTO standings (id, competition_id, team_id, played, won, drawn, lost, goals_for, goals_against, goal_difference, points)
         VALUES ($1, $2, $3, 0, 0, 0, 0, 0, 0, 0, 0)`,
        [require('uuid').v4(), String(competitionId), team.id]
      );
    }

    // Process each result
    for (const result of resultsResult.rows) {
      await updateTeamStandings(
        client,
        result.home_team_id,
        String(competitionId),
        result,
        competition.points_win || 3,
        competition.points_draw || 1,
        competition.points_loss || 0
      );

      await updateTeamStandings(
        client,
        result.away_team_id,
        String(competitionId),
        result,
        competition.points_win || 3,
        competition.points_draw || 1,
        competition.points_loss || 0
      );
    }

    console.log(`Standings recalculated for competition ${competitionId}`);
  } catch (error) {
    console.error('Recalculate standings error:', error);
    throw error;
  }
}
