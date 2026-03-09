import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../../config/database';
import { successResponse, errorResponse, paginatedResponse } from '../../utils/responseHandler';
import { AuthRequest, FixtureStatus, UserRole } from '../../types';
import { AuditAction } from '../../types';

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
      result.rows,
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

    const {
      competition_id,
      home_team_id,
      away_team_id,
      venue_id,
      date_time,
      round,
      stream_url,
    } = req.body;

    // Check if fixture already exists
    const existing = await query(
      `SELECT id FROM fixtures
       WHERE competition_id = $1 AND home_team_id = $2 AND away_team_id = $3 AND date_time = $4
       AND deleted_at IS NULL`,
      [competition_id, home_team_id, away_team_id, date_time]
    );

    if (existing.rows.length > 0) {
      errorResponse(res, 'Fixture already exists', 409, 'FIXTURE_EXISTS');
      return;
    }

    const fixtureId = uuidv4();

    const result = await query(
      `INSERT INTO fixtures (id, competition_id, home_team_id, away_team_id, venue_id, date_time, round, stream_url, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [fixtureId, competition_id, home_team_id, away_team_id, venue_id, date_time, round || null, stream_url || null, FixtureStatus.SCHEDULED]
    );

    // Log audit
    await query(
      `INSERT INTO audit_logs (id, user_id, action, entity, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [uuidv4(), req.user.userId, AuditAction.CREATE, 'FIXTURE', fixtureId, JSON.stringify({ competition_id, date_time })]
    );

    successResponse(res, result.rows[0], 'Fixture created successfully', 201);
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
    const { date_time, venue_id, status, round, stream_url } = req.body;

    const existing = await query(
      'SELECT * FROM fixtures WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );

    if (existing.rows.length === 0) {
      errorResponse(res, 'Fixture not found', 404, 'FIXTURE_NOT_FOUND');
      return;
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (date_time !== undefined) {
      updates.push(`date_time = $${paramCount++}`);
      values.push(date_time);
    }
    if (venue_id !== undefined) {
      updates.push(`venue_id = $${paramCount++}`);
      values.push(venue_id);
    }
    if (status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(status);
    }
    if (round !== undefined) {
      updates.push(`round = $${paramCount++}`);
      values.push(round);
    }
    if (stream_url !== undefined) {
      updates.push(`stream_url = $${paramCount++}`);
      values.push(stream_url);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE fixtures SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    // Log audit
    await query(
      `INSERT INTO audit_logs (id, user_id, action, entity, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [uuidv4(), req.user.userId, AuditAction.UPDATE, 'FIXTURE', id, JSON.stringify(req.body)]
    );

    successResponse(res, result.rows[0], 'Fixture updated successfully');
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
