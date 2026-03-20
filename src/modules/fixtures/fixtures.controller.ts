import { Response } from 'express';
import pkg from 'uuid';
const { v4: uuidv4 } = pkg;
import { query } from '../../config/database';
import { successResponse, errorResponse, paginatedResponse } from '../../utils/responseHandler';
import { AuthRequest, FixtureStatus, UserRole } from '../../types';
import { AuditAction } from '../../types';
import { ICSService } from '../../services/ics.service';

/**
 * @swagger
 * /fixtures:
 *   get:
 *     summary: Get all fixtures
 *     tags: [Fixtures]
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
 *         name: competition_id
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: team_id
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: venue_id
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [SCHEDULED, LIVE, FINISHED, POSTPONED, CANCELLED]
 *       - in: query
 *         name: date_from
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: date_to
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Fixtures retrieved successfully
 */
export const getFixtures = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      competition_id,
      team_id,
      venue_id,
      status,
      date_from,
      date_to,
    } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let queryText = `
      SELECT
        f.*,
        c.name as competition_name,
        c.sport as competition_sport,
        c.id as competition_id,
        c.association_id,
        ht.name as home_team_name,
        ht.logo as home_team_logo,
        at.name as away_team_name,
        at.logo as away_team_logo,
        v.name as venue_name,
        v.address as venue_address,
        v.latitude as venue_latitude,
        v.longitude as venue_longitude
      FROM fixtures f
      LEFT JOIN competitions c ON f.competition_id = c.id
      LEFT JOIN teams ht ON f.home_team_id = ht.id
      LEFT JOIN teams at ON f.away_team_id = at.id
      LEFT JOIN venues v ON f.venue_id = v.id
      WHERE f.deleted_at IS NULL
    `;
    let params: any[] = [];

    // TENANT ISOLATION: Filter fixtures by user's association
    if (req.user && req.user.role !== UserRole.SUPER_ADMIN) {
      if (req.user.role === UserRole.ASSOCIATION_ADMIN && req.user.associationId) {
        queryText += ` AND c.association_id = $${params.length + 1}`;
        params.push(req.user.associationId);
      } else if ((req.user.role === UserRole.CLUB_ADMIN || req.user.role === UserRole.TEAM_MANAGER) && req.user.clubId) {
        // Club admins and team managers can only see fixtures involving their club's teams
        queryText += ` AND (ht.club_id = $${params.length + 1} OR at.club_id = $${params.length + 1})`;
        params.push(req.user.clubId, req.user.clubId);
      }
    }

    if (competition_id) {
      queryText += ` AND f.competition_id = $${params.length + 1}`;
      params.push(competition_id);
    }
    if (team_id) {
      queryText += ` AND (f.home_team_id = $${params.length + 1} OR f.away_team_id = $${params.length + 1})`;
      params.push(team_id);
    }
    if (venue_id) {
      queryText += ` AND f.venue_id = $${params.length + 1}`;
      params.push(venue_id);
    }
    if (status) {
      queryText += ` AND f.status = $${params.length + 1}`;
      params.push(status);
    }
    if (date_from) {
      queryText += ` AND f.date_time >= $${params.length + 1}`;
      params.push(date_from);
    }
    if (date_to) {
      queryText += ` AND f.date_time <= $${params.length + 1}`;
      params.push(date_to);
    }

    queryText += ` ORDER BY f.date_time ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(Number(limit), offset);

    const result = await query(queryText, params);

    // Transform flat data to nested structure for frontend
    const transformedRows = result.rows.map((row: any) => ({
      id: row.id,
      competition_id: row.competition_id,
      home_team_id: row.home_team_id,
      away_team_id: row.away_team_id,
      venue_id: row.venue_id,
      date_time: row.date_time,
      dateTime: row.date_time, // Add both formats for compatibility
      scheduledDate: row.date_time, // For frontend compatibility
      scheduledTime: row.date_time, // For frontend compatibility
      status: row.status,
      round: row.round,
      matchday: row.round, // For frontend compatibility
      stream_url: row.stream_url,
      created_at: row.created_at,
      updated_at: row.updated_at,
      deleted_at: row.deleted_at,
      // Nested objects
      competition: {
        id: row.competition_id,
        name: row.competition_name,
        sport: row.competition_sport,
        association_id: row.association_id,
      },
      homeTeam: {
        id: row.home_team_id,
        name: row.home_team_name,
        logo: row.home_team_logo,
        logoUrl: row.home_team_logo,
      },
      awayTeam: {
        id: row.away_team_id,
        name: row.away_team_name,
        logo: row.away_team_logo,
        logoUrl: row.away_team_logo,
      },
      venue: row.venue_name ? {
        id: row.venue_id,
        name: row.venue_name,
        address: row.venue_address,
        latitude: row.venue_latitude,
        longitude: row.venue_longitude,
      } : null,
    }));

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM fixtures f LEFT JOIN competitions c ON f.competition_id = c.id LEFT JOIN teams ht ON f.home_team_id = ht.id LEFT JOIN teams at ON f.away_team_id = at.id WHERE f.deleted_at IS NULL';
    let countParams: any[] = [];

    // Apply same tenant filters to count query
    if (req.user && req.user.role !== UserRole.SUPER_ADMIN) {
      if (req.user.role === UserRole.ASSOCIATION_ADMIN && req.user.associationId) {
        countQuery += ` AND c.association_id = $${countParams.length + 1}`;
        countParams.push(req.user.associationId);
      } else if ((req.user.role === UserRole.CLUB_ADMIN || req.user.role === UserRole.TEAM_MANAGER) && req.user.clubId) {
        countQuery += ` AND (ht.club_id = $1 OR at.club_id = $1)`;
        countParams.push(req.user.clubId);
      }
    }

    if (competition_id) {
      const paramIdx = countParams.length + 1;
      countQuery += ` AND f.competition_id = $${paramIdx}`;
      countParams.push(competition_id);
    }
    if (team_id) {
      const paramIdx = countParams.length + 1;
      countQuery += ` AND (f.home_team_id = $${paramIdx} OR f.away_team_id = $${paramIdx})`;
      countParams.push(team_id);
    }
    if (venue_id) {
      const paramIdx = countParams.length + 1;
      countQuery += ` AND f.venue_id = $${paramIdx}`;
      countParams.push(venue_id);
    }
    if (status) {
      const paramIdx = countParams.length + 1;
      countQuery += ` AND f.status = $${paramIdx}`;
      countParams.push(status);
    }
    if (date_from) {
      const paramIdx = countParams.length + 1;
      countQuery += ` AND f.date_time >= $${paramIdx}`;
      countParams.push(date_from);
    }
    if (date_to) {
      const paramIdx = countParams.length + 1;
      countQuery += ` AND f.date_time <= $${paramIdx}`;
      countParams.push(date_to);
    }

    const countResult = await query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    paginatedResponse(
      res,
      transformedRows,
      Number(page),
      Number(limit),
      total,
      'Fixtures retrieved successfully'
    );
  } catch (error) {
    console.error('Get fixtures error:', error);
    errorResponse(res, 'Failed to get fixtures', 500, 'GET_FIXTURES_FAILED');
  }
};

/**
 * @swagger
 * /fixtures/today:
 *   get:
 *     summary: Get today's fixtures
 *     tags: [Fixtures]
 *     responses:
 *       200:
 *         description: Today's fixtures retrieved successfully
 */
export const getTodayFixtures = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await query(
      `SELECT
        f.*,
        c.name as competition_name,
        c.sport,
        ht.name as home_team_name,
        at.name as away_team_name,
        v.name as venue_name
       FROM fixtures f
       LEFT JOIN competitions c ON f.competition_id = c.id
       LEFT JOIN teams ht ON f.home_team_id = ht.id
       LEFT JOIN teams at ON f.away_team_id = at.id
       LEFT JOIN venues v ON f.venue_id = v.id
       WHERE DATE(f.date_time) = CURRENT_DATE
       AND f.deleted_at IS NULL
       ORDER BY f.date_time ASC`
    );

    successResponse(res, result.rows, 'Today\'s fixtures retrieved successfully');
  } catch (error) {
    console.error('Get today fixtures error:', error);
    errorResponse(res, 'Failed to get today\'s fixtures', 500, 'GET_TODAY_FIXTURES_FAILED');
  }
};

/**
 * @swagger
 * /fixtures/{id}:
 *   get:
 *     summary: Get fixture by ID
 *     tags: [Fixtures]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Fixture retrieved successfully
 *       404:
 *         description: Fixture not found
 */
export const getFixtureById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT
        f.*,
        c.name as competition_name,
        c.sport as competition_sport,
        c.id as competition_id,
        ht.name as home_team_name,
        ht.logo as home_team_logo,
        ht.id as home_team_id,
        at.name as away_team_name,
        at.logo as away_team_logo,
        at.id as away_team_id,
        v.name as venue_name,
        v.address as venue_address,
        v.latitude as venue_latitude,
        v.longitude as venue_longitude,
        r.home_score,
        r.away_score,
        r.status as result_status
       FROM fixtures f
       LEFT JOIN competitions c ON f.competition_id = c.id
       LEFT JOIN teams ht ON f.home_team_id = ht.id
       LEFT JOIN teams at ON f.away_team_id = at.id
       LEFT JOIN venues v ON f.venue_id = v.id
       LEFT JOIN results r ON f.id = r.fixture_id
       WHERE f.id = $1 AND f.deleted_at IS NULL`,
      [id]
    );

    if (result.rows.length === 0) {
      errorResponse(res, 'Fixture not found', 404, 'FIXTURE_NOT_FOUND');
      return;
    }

    successResponse(res, result.rows[0], 'Fixture retrieved successfully');
  } catch (error) {
    console.error('Get fixture error:', error);
    errorResponse(res, 'Failed to get fixture', 500, 'GET_FIXTURE_FAILED');
  }
};

/**
 * @swagger
 * /fixtures:
 *   post:
 *     summary: Create a new fixture
 *     tags: [Fixtures]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - competition_id
 *               - home_team_id
 *               - away_team_id
 *               - venue_id
 *               - date_time
 *             properties:
 *               competition_id:
 *                 type: string
 *                 format: uuid
 *               home_team_id:
 *                 type: string
 *                 format: uuid
 *               away_team_id:
 *                 type: string
 *                 format: uuid
 *               venue_id:
 *                 type: string
 *                 format: uuid
 *               date_time:
 *                 type: string
 *                 format: date-time
 *               round:
 *                 type: string
 *               stream_url:
 *                 type: string
 *                 format: uri
 *     responses:
 *       201:
 *         description: Fixture created successfully
 */
export const createFixture = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'Unauthorized', 401, 'UNAUTHORIZED');
      return;
    }

    // Extract all fields (support both camelCase and snake_case)
    const {
      competition_id,
      competitionId,
      home_team_id,
      homeTeamId,
      away_team_id,
      awayTeamId,
      venue_id,
      venueId,
      date_time,
      scheduledDate,
      scheduledTime,
      matchday,
      round,
      stream_url,
      streamUrl,
      status,
      homeScore,
      awayScore,
    } = req.body;

    // Support both camelCase and snake_case
    const finalCompetitionId = competitionId || competition_id;
    const finalHomeTeamId = homeTeamId || home_team_id;
    const finalAwayTeamId = awayTeamId || away_team_id;
    const finalVenueId = venueId || venue_id;
    const finalRound = matchday || round;
    const finalStreamUrl = streamUrl || stream_url;

    // Combine date and time if provided separately
    let finalDateTime = date_time;
    if (scheduledDate && scheduledTime) {
      finalDateTime = `${scheduledDate}T${scheduledTime}:00`;
    } else if (scheduledDate) {
      finalDateTime = `${scheduledDate}T00:00:00`;
    }

    console.log('CREATE FIXTURE - Debug:', {
      finalCompetitionId,
      finalHomeTeamId,
      finalAwayTeamId,
      finalVenueId,
      finalDateTime,
      finalRound,
      finalStreamUrl,
      status,
      homeScore,
      awayScore,
    });

    // Validate required fields
    if (!finalCompetitionId || !finalHomeTeamId || !finalAwayTeamId) {
      errorResponse(res, 'Competition, home team, and away team are required', 400, 'VALIDATION_ERROR');
      return;
    }

    // Check if fixture already exists
    if (finalDateTime) {
      const existing = await query(
        `SELECT id FROM fixtures
         WHERE competition_id = $1 AND home_team_id = $2 AND away_team_id = $3 AND date_time = $4
         AND deleted_at IS NULL`,
        [finalCompetitionId, finalHomeTeamId, finalAwayTeamId, finalDateTime]
      );

      if (existing.rows.length > 0) {
        errorResponse(res, 'Fixture already exists', 409, 'FIXTURE_EXISTS');
        return;
      }
    }

    // Start transaction for fixture + optional result creation
    await query('BEGIN');

    try {
      const fixtureId = uuidv4();

      await query(
        `INSERT INTO fixtures (id, competition_id, home_team_id, away_team_id, venue_id, date_time, round, stream_url, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [
          fixtureId,
          finalCompetitionId,
          finalHomeTeamId,
          finalAwayTeamId,
          finalVenueId || null,
          finalDateTime || null,
          finalRound || null,
          finalStreamUrl || null,
          status || FixtureStatus.SCHEDULED,
        ]
      );

      // Handle scores - create result record if scores are provided
      if (homeScore !== undefined && awayScore !== undefined) {
        const resultId = uuidv4();
        await query(
          `INSERT INTO results (id, fixture_id, home_score, away_score, status, created_at, updated_at)
           VALUES ($1, $2, $3, $4, 'SUBMITTED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [resultId, fixtureId, homeScore, awayScore]
        );
      }

      // Log audit
      await query(
        `INSERT INTO audit_logs (id, user_id, action, entity, entity_id, details)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [uuidv4(), req.user.userId, AuditAction.CREATE, 'FIXTURE', fixtureId, JSON.stringify({
          finalCompetitionId,
          finalDateTime,
          homeScore,
          awayScore,
          status
        })]
      );

      await query('COMMIT');

      // Get fixture with result for response
      const fixtureWithResult = await query(
        `SELECT
          f.*,
          c.name as competition_name,
          ht.name as home_team_name,
          at.name as away_team_name,
          v.name as venue_name,
          r.home_score,
          r.away_score
        FROM fixtures f
        LEFT JOIN competitions c ON f.competition_id = c.id
        LEFT JOIN teams ht ON f.home_team_id = ht.id
        LEFT JOIN teams at ON f.away_team_id = at.id
        LEFT JOIN venues v ON f.venue_id = v.id
        LEFT JOIN results r ON f.id = r.fixture_id
        WHERE f.id = $1`,
        [fixtureId]
      );

      successResponse(res, fixtureWithResult.rows[0], 'Fixture created successfully', 201);
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Create fixture error:', error);
    errorResponse(res, 'Failed to create fixture', 500, 'CREATE_FIXTURE_FAILED');
  }
};

/**
 * @swagger
 * /fixtures/{id}:
 *   put:
 *     summary: Update a fixture
 *     tags: [Fixtures]
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
 *               date_time:
 *                 type: string
 *                 format: date-time
 *               venue_id:
 *                 type: string
 *                 format: uuid
 *               status:
 *                 type: string
 *                 enum: [SCHEDULED, LIVE, FINISHED, POSTPONED, CANCELLED]
 *               round:
 *                 type: string
 *               stream_url:
 *                 type: string
 *                 format: uri
 *     responses:
 *       200:
 *         description: Fixture updated successfully
 */
export const updateFixture = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'Unauthorized', 401, 'UNAUTHORIZED');
      return;
    }

    const { id } = req.params;

    // Extract all fields (support both camelCase and snake_case)
    const {
      date_time,
      scheduledDate,
      scheduledTime,
      venue_id,
      venueId,
      status,
      matchday,
      round,
      stream_url,
      streamUrl,
      homeScore,
      awayScore,
      events,
    } = req.body;

    // Map frontend status values to database values
    const statusMap: Record<string, string> = {
      'IN_PROGRESS': 'LIVE',
      'SCHEDULED': 'SCHEDULED',
      'COMPLETED': 'FINISHED',
      'FINISHED': 'FINISHED',
      'POSTPONED': 'POSTPONED',
      'CANCELLED': 'CANCELLED',
      'LIVE': 'LIVE',
    };
    const finalStatus = status ? statusMap[status] || status : undefined;

    // Support both camelCase and snake_case
    const finalVenueId = venueId || venue_id;
    const finalRound = matchday || round;
    const finalStreamUrl = streamUrl || stream_url;

    // Combine date and time if provided separately
    let finalDateTime = date_time;
    if (scheduledDate && scheduledTime) {
      finalDateTime = `${scheduledDate}T${scheduledTime}:00`;
    } else if (scheduledDate) {
      finalDateTime = `${scheduledDate}T00:00:00`;
    }

    const existing = await query(
      'SELECT * FROM fixtures WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );

    if (existing.rows.length === 0) {
      errorResponse(res, 'Fixture not found', 404, 'FIXTURE_NOT_FOUND');
      return;
    }

    // Start transaction for fixture + results update
    await query('BEGIN');

    try {
      const updates: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      if (finalDateTime !== undefined) {
        updates.push(`date_time = $${paramCount++}`);
        values.push(finalDateTime);
      }
      if (finalVenueId !== undefined) {
        updates.push(`venue_id = $${paramCount++}`);
        values.push(finalVenueId);
      }
      if (finalStatus !== undefined) {
        updates.push(`status = $${paramCount++}`);
        values.push(finalStatus);
      }
      if (finalRound !== undefined) {
        updates.push(`round = $${paramCount++}`);
        values.push(finalRound);
      }
      if (finalStreamUrl !== undefined) {
        updates.push(`stream_url = $${paramCount++}`);
        values.push(finalStreamUrl);
      }

      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const result = await query(
        `UPDATE fixtures SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
        values
      );

      // Handle scores - create or update result record
      if (homeScore !== undefined && awayScore !== undefined) {
        // Check if result exists
        const existingResult = await query(
          'SELECT id FROM results WHERE fixture_id = $1',
          [id]
        );

        if (existingResult.rows.length > 0) {
          // Update existing result
          await query(
            `UPDATE results SET home_score = $1, away_score = $2, updated_at = CURRENT_TIMESTAMP WHERE fixture_id = $3`,
            [homeScore, awayScore, id]
          );
        } else {
          // Create new result
          const resultId = uuidv4();
          await query(
            `INSERT INTO results (id, fixture_id, home_score, away_score, status, created_at, updated_at)
             VALUES ($1, $2, $3, $4, 'SUBMITTED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            [resultId, id, homeScore, awayScore]
          );
        }
      }

      // Handle events - store as JSON in fixture (could also create separate events table)
      if (events && Array.isArray(events)) {
        await query(
          `UPDATE fixtures SET updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
          [id]
        );
        // Note: Events could be stored in a separate fixture_events table if needed
        // For now, we acknowledge them but don't store separately
      }

      // Log audit
      await query(
        `INSERT INTO audit_logs (id, user_id, action, entity, entity_id, details)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [uuidv4(), req.user.userId, AuditAction.UPDATE, 'FIXTURE', id, JSON.stringify({
          originalStatus: status,
          finalStatus: finalStatus,
          homeScore,
          awayScore,
          eventsCount: events?.length || 0,
        })]
      );

      await query('COMMIT');

      // Get updated fixture with result
      const updatedFixture = await query(
        `SELECT
          f.*,
          c.name as competition_name,
          ht.name as home_team_name,
          at.name as away_team_name,
          v.name as venue_name,
          r.home_score,
          r.away_score
        FROM fixtures f
        LEFT JOIN competitions c ON f.competition_id = c.id
        LEFT JOIN teams ht ON f.home_team_id = ht.id
        LEFT JOIN teams at ON f.away_team_id = at.id
        LEFT JOIN venues v ON f.venue_id = v.id
        LEFT JOIN results r ON f.id = r.fixture_id
        WHERE f.id = $1`,
        [id]
      );

      successResponse(res, updatedFixture.rows[0] || result.rows[0], 'Fixture updated successfully');
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Update fixture error:', error);
    errorResponse(res, 'Failed to update fixture', 500, 'UPDATE_FIXTURE_FAILED');
  }
};

/**
 * @swagger
 * /fixtures/{id}:
 *   delete:
 *     summary: Delete a fixture (soft delete)
 *     tags: [Fixtures]
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
 *         description: Fixture deleted successfully
 */
export const deleteFixture = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'Unauthorized', 401, 'UNAUTHORIZED');
      return;
    }

    const { id } = req.params;

    const existing = await query(
      'SELECT * FROM fixtures WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );

    if (existing.rows.length === 0) {
      errorResponse(res, 'Fixture not found', 404, 'FIXTURE_NOT_FOUND');
      return;
    }

    await query(
      'UPDATE fixtures SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );

    // Log audit
    await query(
      `INSERT INTO audit_logs (id, user_id, action, entity, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [uuidv4(), req.user.userId, AuditAction.DELETE, 'FIXTURE', id, JSON.stringify({ id })]
    );

    successResponse(res, null, 'Fixture deleted successfully');
  } catch (error) {
    console.error('Delete fixture error:', error);
    errorResponse(res, 'Failed to delete fixture', 500, 'DELETE_FIXTURE_FAILED');
  }
};

/**
 * @swagger
 * /fixtures/{id}/calendar:
 *   get:
 *     summary: Get fixture as ICS calendar file
 *     tags: [Fixtures]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: ICS file generated
 *         content:
 *           text/calendar:
 *             schema:
 *               type: string
 */
export const getFixtureAsICS = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT
        f.*,
        ht.name as home_team_name,
        at.name as away_team_name,
        v.name as venue_name,
        v.address as venue_address
       FROM fixtures f
       LEFT JOIN teams ht ON f.home_team_id = ht.id
       LEFT JOIN teams at ON f.away_team_id = at.id
       LEFT JOIN venues v ON f.venue_id = v.id
       WHERE f.id = $1 AND f.deleted_at IS NULL`,
      [id]
    );

    if (result.rows.length === 0) {
      errorResponse(res, 'Fixture not found', 404, 'FIXTURE_NOT_FOUND');
      return;
    }

    const fixture = result.rows[0];
    const icsContent = generateICS(fixture);

    res.setHeader('Content-Type', 'text/calendar');
    res.setHeader('Content-Disposition', `attachment; filename=fixture-${id}.ics`);
    res.send(icsContent);
  } catch (error) {
    console.error('Generate ICS error:', error);
    errorResponse(res, 'Failed to generate calendar file', 500, 'GENERATE_ICS_FAILED');
  }
};

/**
 * @swagger
 * /fixtures/{id}/directions:
 *   get:
 *     summary: Get GPS directions links for a fixture
 *     tags: [Fixtures]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Direction links for Google Maps and Apple Maps
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 googleMaps:
 *                   type: string
 *                   example: "https://www.google.com/maps/search/?api=1&query=Kensington+Oval+13.1939,-59.5432"
 *                 appleMaps:
 *                   type: string
 *                   example: "http://maps.apple.com/?daddr=13.1939,-59.5432&dirflg=d"
 *                 venue:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     address:
 *                       type: string
 *                     latitude:
 *                       type: number
 *                     longitude:
 *                       type: number
 *       404:
 *         description: Fixture not found or no GPS coordinates available
 */
export const getFixtureDirections = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT
        v.name as venue_name,
        v.address as venue_address,
        v.latitude,
        v.longitude
       FROM fixtures f
       LEFT JOIN venues v ON f.venue_id = v.id
       WHERE f.id = $1 AND f.deleted_at IS NULL`,
      [id]
    );

    if (result.rows.length === 0) {
      errorResponse(res, 'Fixture not found', 404, 'FIXTURE_NOT_FOUND');
      return;
    }

    const venue = result.rows[0];

    // Check if GPS coordinates are available
    if (!venue.latitude || !venue.longitude) {
      errorResponse(
        res,
        'GPS coordinates not available for this venue',
        404,
        'NO_GPS_COORDINATES'
      );
      return;
    }

    // Validate coordinates
    const lat = parseFloat(venue.latitude);
    const lon = parseFloat(venue.longitude);

    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      errorResponse(res, 'Invalid GPS coordinates', 400, 'INVALID_GPS_COORDINATES');
      return;
    }

    // Generate map URLs using database functions
    const urlResult = await query(
      `SELECT
        format_google_maps_url($1, $2, $3) as google_maps_url,
        format_apple_maps_url($1, $2) as apple_maps_url`,
      [lat, lon, venue.venue_name]
    );

    const urls = urlResult.rows[0];

    successResponse(res, {
      googleMaps: urls.google_maps_url,
      appleMaps: urls.apple_maps_url,
      venue: {
        name: venue.venue_name,
        address: venue.venue_address,
        latitude: lat,
        longitude: lon,
      },
    }, 'Direction links retrieved successfully');
  } catch (error) {
    console.error('Get directions error:', error);
    errorResponse(res, 'Failed to get directions', 500, 'GET_DIRECTIONS_FAILED');
  }
};

/**
 * @swagger
 * /fixtures/upcoming:
 *   get:
 *     summary: Get upcoming fixtures (after today)
 *     tags: [Fixtures]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Upcoming fixtures retrieved successfully
 */
export const getUpcomingFixtures = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await query(
      `SELECT
        f.*,
        c.name as competition_name,
        c.sport,
        ht.name as home_team_name,
        ht.logo as home_team_logo,
        at.name as away_team_name,
        at.logo as away_team_logo,
        v.name as venue_name
       FROM fixtures f
       LEFT JOIN competitions c ON f.competition_id = c.id
       LEFT JOIN teams ht ON f.home_team_id = ht.id
       LEFT JOIN teams at ON f.away_team_id = at.id
       LEFT JOIN venues v ON f.venue_id = v.id
       WHERE f.date_time >= $1
       AND f.status IN ('SCHEDULED', 'POSTPONED')
       AND f.deleted_at IS NULL
       ORDER BY f.date_time ASC
       LIMIT $2 OFFSET $3`,
      [today, Number(limit), offset]
    );

    const countResult = await query(
      `SELECT COUNT(*) as total
       FROM fixtures f
       WHERE f.date_time >= $1
       AND f.status IN ('SCHEDULED', 'POSTPONED')
       AND f.deleted_at IS NULL`,
      [today]
    );

    const total = parseInt(countResult.rows[0].total);

    paginatedResponse(
      res,
      result.rows,
      Number(page),
      Number(limit),
      total,
      'Upcoming fixtures retrieved successfully'
    );
  } catch (error) {
    console.error('Get upcoming fixtures error:', error);
    errorResponse(res, 'Failed to get upcoming fixtures', 500, 'GET_UPCOMING_FAILED');
  }
};

/**
 * @swagger
 * /fixtures/finished:
 *   get:
 *     summary: Get finished fixtures
 *     tags: [Fixtures]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Finished fixtures retrieved successfully
 */
export const getFinishedFixtures = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const result = await query(
      `SELECT
        f.*,
        c.name as competition_name,
        c.sport,
        ht.name as home_team_name,
        ht.logo as home_team_logo,
        at.name as away_team_name,
        at.logo as away_team_logo,
        v.name as venue_name
       FROM fixtures f
       LEFT JOIN competitions c ON f.competition_id = c.id
       LEFT JOIN teams ht ON f.home_team_id = ht.id
       LEFT JOIN teams at ON f.away_team_id = at.id
       LEFT JOIN venues v ON f.venue_id = v.id
       WHERE f.status IN ('FINISHED', 'COMPLETED', 'CANCELLED')
       AND f.deleted_at IS NULL
       ORDER BY f.date_time DESC
       LIMIT $1 OFFSET $2`,
      [Number(limit), offset]
    );

    const countResult = await query(
      `SELECT COUNT(*) as total
       FROM fixtures f
       WHERE f.status IN ('FINISHED', 'COMPLETED', 'CANCELLED')
       AND f.deleted_at IS NULL`,
      []
    );

    const total = parseInt(countResult.rows[0].total);

    paginatedResponse(
      res,
      result.rows,
      Number(page),
      Number(limit),
      total,
      'Finished fixtures retrieved successfully'
    );
  } catch (error) {
    console.error('Get finished fixtures error:', error);
    errorResponse(res, 'Failed to get finished fixtures', 500, 'GET_FINISHED_FAILED');
  }
};

/**
 * Enhanced ICS export using ICSService
 * @swagger
 * /fixtures/{id}/ics:
 *   get:
 *     summary: Export fixture as ICS calendar file (enhanced)
 *     tags: [Fixtures]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: ICS calendar file
 *         content:
 *           text/calendar:
 *             schema:
 *               type: string
 *       404:
 *         description: Fixture not found
 */
export const exportFixtureICS = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // Get fixture with full details
    const result = await query(
      `SELECT
        f.*,
        c.name as competition_name,
        ht.name as home_team_name,
        at.name as away_team_name,
        v.name as venue_name,
        v.address as venue_address,
        v.latitude,
        v.longitude
       FROM fixtures f
       LEFT JOIN competitions c ON f.competition_id = c.id
       LEFT JOIN teams ht ON f.home_team_id = ht.id
       LEFT JOIN teams at ON f.away_team_id = at.id
       LEFT JOIN venues v ON f.venue_id = v.id
       WHERE f.id = $1 AND f.deleted_at IS NULL`,
      [id]
    );

    if (result.rows.length === 0) {
      errorResponse(res, 'Fixture not found', 404, 'FIXTURE_NOT_FOUND');
      return;
    }

    const fixture = result.rows[0];

    // Use ICSService to generate ICS
    const icsService = new ICSService();
    const event = icsService.createFixtureEvent(fixture);

    // Validate event
    const validation = icsService.validateEvent(event);
    if (!validation.valid) {
      errorResponse(res, `Invalid fixture data: ${validation.errors.join(', ')}`, 400, 'INVALID_FIXTURE_DATA');
      return;
    }

    // Generate ICS content
    const icsContent = icsService.generateICS(event);

    // Set headers for file download
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="fixture-${id}.ics"`);
    res.send(icsContent);
  } catch (error) {
    console.error('ICS export error:', error);
    errorResponse(res, 'Failed to export fixture', 500, 'ICS_EXPORT_FAILED');
  }
};

// Legacy generateICS function (deprecated, kept for backward compatibility)
const generateICS = (fixture: any): string => {
  const startDate = new Date(fixture.date_time);
  const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // +2 hours

  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//246Sports//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
SUMMARY:${fixture.home_team_name} vs ${fixture.away_team_name}
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
LOCATION:${fixture.venue_name}\\, ${fixture.venue_address}
DESCRIPTION:Fixture in ${fixture.competition_name}
STATUS:CONFIRMED
UID:${fixture.id}@246sports.bb
END:VEVENT
END:VCALENDAR`;
};
