import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../../config/database';
import { successResponse, errorResponse, paginatedResponse } from '../../utils/responseHandler';
import { AuthRequest, TeamCategory, Gender, UserRole } from '../../types';
import { AuditAction } from '../../types';

/**
 * @swagger
 * /teams:
 *   get:
 *     summary: Get all teams (with tenant isolation)
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
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
 *         name: club_id
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: competition_id
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: include_admins
 *         schema:
 *           type: boolean
 *         description: Include admin information
 *     responses:
 *       200:
 *         description: Teams retrieved successfully
 */
export const getTeams = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // REQUIRES AUTHENTICATION - tenant isolation
    if (!req.user) {
      errorResponse(res, 'Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      return;
    }

    const { page = 1, limit = 10, club_id, competition_id, include_admins = 'false' } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let queryText = `
      SELECT t.*, c.name as club_name, c.association_id as club_association_id,
             comp.name as competition_name
      FROM teams t
      LEFT JOIN clubs c ON t.club_id = c.id
      LEFT JOIN competitions comp ON t.competition_id = comp.id
      WHERE t.deleted_at IS NULL
    `;
    let params: any[] = [];

    // TENANT ISOLATION: Filter teams by user's association/club
    if (req.user.role !== UserRole.SUPER_ADMIN) {
      if (req.user.role === UserRole.ASSOCIATION_ADMIN && req.user.associationId) {
        queryText += ` AND c.association_id = $${params.length + 1}`;
        params.push(req.user.associationId);
      } else if ((req.user.role === UserRole.CLUB_ADMIN || req.user.role === UserRole.TEAM_MANAGER) && req.user.clubId) {
        // Club admins and team managers can only see their own club's teams
        queryText += ` AND t.club_id = $${params.length + 1}`;
        params.push(req.user.clubId);
      } else {
        // Other roles get empty result
        queryText += ` AND 1 = 0`;
      }
    }

    if (club_id) {
      // SUPER_ADMIN can filter by club_id
      if (req.user.role === UserRole.SUPER_ADMIN) {
        queryText += ` AND t.club_id = $${params.length + 1}`;
        params.push(club_id);
      }
    }
    if (competition_id) {
      queryText += ` AND t.competition_id = $${params.length + 1}`;
      params.push(competition_id);
    }

    queryText += ` ORDER BY t.name ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(Number(limit), offset);

    const result = await query(queryText, params);

    // If include_admins is true, fetch admin details for each team
    let teamsWithAdmins = result.rows;
    if (include_admins === 'true' && result.rows.length > 0) {
      teamsWithAdmins = await Promise.all(
        result.rows.map(async (team) => {
          // Get team admin
          const teamAdminResult = await query(
            `SELECT u.id, u.name, u.email, u.role
             FROM users u
             WHERE u.id = (
               SELECT user_id FROM team_users
               WHERE team_id = $1 AND role = 'TEAM_ADMIN'
               LIMIT 1
             )
             AND u.deleted_at IS NULL`,
            [team.id]
          );

          // Get coach
          const coachResult = await query(
            `SELECT u.id, u.name, u.email
             FROM users u
             WHERE u.id = (
               SELECT user_id FROM team_users
               WHERE team_id = $1 AND role = 'COACH'
               LIMIT 1
             )
             AND u.deleted_at IS NULL`,
            [team.id]
          );

          // Get players count
          const playerCountResult = await query(
            `SELECT COUNT(*) as count
             FROM players
             WHERE team_id = $1 AND deleted_at IS NULL`,
            [team.id]
          );

          return {
            ...team,
            team_admin: teamAdminResult.rows[0] || null,
            coach: coachResult.rows[0] || null,
            players_count: parseInt(playerCountResult.rows[0].count),
          };
        })
      );
    }

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM teams t WHERE t.deleted_at IS NULL';
    let countParams: any[] = [];

    // Apply same tenant filters to count query
    if (req.user.role !== UserRole.SUPER_ADMIN) {
      if (req.user.role === UserRole.ASSOCIATION_ADMIN && req.user.associationId) {
        countQuery += ` AND EXISTS (
          SELECT 1 FROM clubs c WHERE c.id = t.club_id AND c.association_id = $1
        )`;
        countParams.push(req.user.associationId);
      } else if ((req.user.role === UserRole.CLUB_ADMIN || req.user.role === UserRole.TEAM_MANAGER) && req.user.clubId) {
        countQuery += ` AND t.club_id = $1`;
        countParams.push(req.user.clubId);
      } else {
        countQuery += ` AND 1 = 0`;
      }
    }

    if (club_id && req.user.role === UserRole.SUPER_ADMIN) {
      countQuery += ` AND t.club_id = $1`;
      countParams.push(club_id);
    }
    if (competition_id) {
      countQuery += ` AND t.competition_id = $1`;
      countParams.push(competition_id);
    }

    const countResult = await query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    paginatedResponse(
      res,
      teamsWithAdmins,
      Number(page),
      Number(limit),
      total,
      'Teams retrieved successfully'
    );
  } catch (error) {
    console.error('Get teams error:', error);
    errorResponse(res, 'Failed to get teams', 500, 'GET_TEAMS_FAILED');
  }
};

/**
 * @swagger
 * /teams/public:
 *   get:
 *     summary: Get all teams (public - no auth, for website)
 *     tags: [Teams]
 *     parameters:
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
 *         description: Public teams list
 */
export const getPublicTeams = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const queryText = `
      SELECT t.*, c.name as club_name, comp.name as competition_name
      FROM teams t
      LEFT JOIN clubs c ON t.club_id = c.id
      LEFT JOIN competitions comp ON t.competition_id = comp.id
      WHERE t.deleted_at IS NULL
      ORDER BY t.name ASC
      LIMIT $1 OFFSET $2
    `;

    const result = await query(queryText, [Number(limit), offset]);

    // Get total count
    const countResult = await query('SELECT COUNT(*) FROM teams WHERE deleted_at IS NULL', []);
    const total = parseInt(countResult.rows[0].count);

    paginatedResponse(
      res,
      result.rows,
      Number(page),
      Number(limit),
      total,
      'Public teams retrieved successfully'
    );
  } catch (error) {
    console.error('Get public teams error:', error);
    errorResponse(res, 'Failed to get public teams', 500, 'GET_PUBLIC_TEAMS_FAILED');
  }
};

/**
 * @swagger
 * /teams/{id}:
 *   get:
 *     summary: Get team by ID with admin details
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Team retrieved successfully
 *       404:
 *         description: Team not found
 */
export const getTeamById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Get team with club and competition details
    const teamResult = await query(
      `SELECT t.*,
              c.name as club_name,
              c.logo as club_logo,
              c.association_id as club_association_id,
              comp.name as competition_name,
              a.name as association_name,
              a.logo as association_logo
       FROM teams t
       LEFT JOIN clubs c ON t.club_id = c.id
       LEFT JOIN associations a ON c.association_id = a.id
       LEFT JOIN competitions comp ON t.competition_id = comp.id
       WHERE t.id = $1 AND t.deleted_at IS NULL`,
      [id]
    );

    if (teamResult.rows.length === 0) {
      errorResponse(res, 'Team not found', 404, 'TEAM_NOT_FOUND');
      return;
    }

    const team = teamResult.rows[0];

    // Get team admin
    const teamAdminResult = await query(
      `SELECT u.id, u.name, u.email, u.role
       FROM users u
       WHERE u.id = (
         SELECT user_id FROM team_users
         WHERE team_id = $1 AND role = 'TEAM_ADMIN'
         LIMIT 1
       )
       AND u.deleted_at IS NULL`,
      [id]
    );

    // Get club admin
    const clubAdminResult = await query(
      `SELECT u.id, u.name, u.email, u.role
       FROM users u
       WHERE u.club_id = $1
       AND u.role = 'CLUB_ADMIN'
       AND u.deleted_at IS NULL
       LIMIT 1`,
      [team.club_id]
    );

    // Get association admin
    const associationAdminResult = await query(
      `SELECT u.id, u.name, u.email, u.role
       FROM users u
       WHERE u.association_id = $1
       AND u.role IN ('ASSOCIATION_ADMIN', 'SUPER_ADMIN')
       AND u.deleted_at IS NULL
       ORDER BY u.role DESC
       LIMIT 1`,
      [team.club_association_id]
    );

    // Get players count for this team
    const playerCountResult = await query(
      `SELECT COUNT(*) as count
       FROM players
       WHERE team_id = $1 AND deleted_at IS NULL`,
      [id]
    );

    // Get coach info
    const coachResult = await query(
      `SELECT u.id, u.name, u.email
       FROM users u
       WHERE u.id = (
         SELECT user_id FROM team_users
         WHERE team_id = $1 AND role = 'COACH'
         LIMIT 1
       )
       AND u.deleted_at IS NULL`,
      [id]
    );

    const response = {
      ...team,
      team_admin: teamAdminResult.rows[0] || null,
      club_admin: clubAdminResult.rows[0] || null,
      association_admin: associationAdminResult.rows[0] || null,
      coach: coachResult.rows[0] || null,
      stats: {
        players_count: parseInt(playerCountResult.rows[0].count),
      },
    };

    successResponse(res, response, 'Team retrieved successfully');
  } catch (error) {
    console.error('Get team error:', error);
    errorResponse(res, 'Failed to get team', 500, 'GET_TEAM_FAILED');
  }
};

/**
 * @swagger
 * /teams:
 *   post:
 *     summary: Create a new team
 *     tags: [Teams]
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
 *               - club_id
 *               - competition_id
 *             properties:
 *               name:
 *                 type: string
 *               club_id:
 *                 type: string
 *                 format: uuid
 *               competition_id:
 *                 type: string
 *                 format: uuid
 *               category:
 *                 type: string
 *                 enum: [SENIOR, U23, U20, U18, U15, U13]
 *               gender:
 *                 type: string
 *                 enum: [MALE, FEMALE, MIXED]
 *               logo:
 *                 type: string
 *                 format: uri
 *               coach_name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Team created successfully
 */
export const createTeam = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'Unauthorized', 401, 'UNAUTHORIZED');
      return;
    }

    const {
      name,
      club_id,
      clubId,
      competition_id,
      competitionId,
      category = TeamCategory.SENIOR,
      gender = Gender.MALE,
      logo,
      coach_name,
      coachName,
    } = req.body;

    // Support both camelCase and snake_case
    const finalClubId = clubId || club_id;
    const finalCompetitionId = competitionId || competition_id;
    const finalCoachName = coachName || coach_name;

    const teamId = uuidv4();

    const result = await query(
      `INSERT INTO teams (id, name, club_id, competition_id, category, gender, logo, coach_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [teamId, name, finalClubId, finalCompetitionId, category, gender, logo || null, finalCoachName || null]
    );

    // Log audit
    await query(
      `INSERT INTO audit_logs (id, user_id, action, entity, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [uuidv4(), req.user.userId, AuditAction.CREATE, 'TEAM', teamId, JSON.stringify({ name, clubId: finalClubId })]
    );

    successResponse(res, result.rows[0], 'Team created successfully', 201);
  } catch (error) {
    console.error('Create team error:', error);
    errorResponse(res, 'Failed to create team', 500, 'CREATE_TEAM_FAILED');
  }
};

/**
 * @swagger
 * /teams/{id}:
 *   put:
 *     summary: Update a team
 *     tags: [Teams]
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
 *               category:
 *                 type: string
 *                 enum: [SENIOR, U23, U20, U18, U15, U13]
 *               gender:
 *                 type: string
 *                 enum: [MALE, FEMALE, MIXED]
 *               logo:
 *                 type: string
 *                 format: uri
 *               coach_name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Team updated successfully
 */
export const updateTeam = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'Unauthorized', 401, 'UNAUTHORIZED');
      return;
    }

    const { id } = req.params;
    const { name, category, gender, logo, coach_name } = req.body;

    const existing = await query(
      'SELECT * FROM teams WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );

    if (existing.rows.length === 0) {
      errorResponse(res, 'Team not found', 404, 'TEAM_NOT_FOUND');
      return;
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (category !== undefined) {
      updates.push(`category = $${paramCount++}`);
      values.push(category);
    }
    if (gender !== undefined) {
      updates.push(`gender = $${paramCount++}`);
      values.push(gender);
    }
    if (logo !== undefined) {
      updates.push(`logo = $${paramCount++}`);
      values.push(logo);
    }
    if (coach_name !== undefined) {
      updates.push(`coach_name = $${paramCount++}`);
      values.push(coach_name);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE teams SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    // Log audit
    await query(
      `INSERT INTO audit_logs (id, user_id, action, entity, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [uuidv4(), req.user.userId, AuditAction.UPDATE, 'TEAM', id, JSON.stringify(req.body)]
    );

    successResponse(res, result.rows[0], 'Team updated successfully');
  } catch (error) {
    console.error('Update team error:', error);
    errorResponse(res, 'Failed to update team', 500, 'UPDATE_TEAM_FAILED');
  }
};

/**
 * @swagger
 * /teams/{id}:
 *   delete:
 *     summary: Delete a team (soft delete)
 *     tags: [Teams]
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
 *         description: Team deleted successfully
 */
export const deleteTeam = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'Unauthorized', 401, 'UNAUTHORIZED');
      return;
    }

    const { id } = req.params;

    const existing = await query(
      'SELECT * FROM teams WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );

    if (existing.rows.length === 0) {
      errorResponse(res, 'Team not found', 404, 'TEAM_NOT_FOUND');
      return;
    }

    await query(
      'UPDATE teams SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );

    // Log audit
    await query(
      `INSERT INTO audit_logs (id, user_id, action, entity, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [uuidv4(), req.user.userId, AuditAction.DELETE, 'TEAM', id, JSON.stringify({ name: existing.rows[0].name })]
    );

    successResponse(res, null, 'Team deleted successfully');
  } catch (error) {
    console.error('Delete team error:', error);
    errorResponse(res, 'Failed to delete team', 500, 'DELETE_TEAM_FAILED');
  }
};
