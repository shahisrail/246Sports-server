import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../../config/database';
import { successResponse, errorResponse, paginatedResponse } from '../../utils/responseHandler';
import { AuthRequest, CompetitionStatus, CompetitionCategory, UserRole } from '../../types';
import { AuditAction } from '../../types';

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
export const getCompetitions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, association_id, sport, status } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let queryText = `
      SELECT c.*, a.name as association_name, s.year as season_year
      FROM competitions c
      LEFT JOIN associations a ON c.association_id = a.id
      LEFT JOIN seasons s ON c.season_id = s.id
      WHERE c.deleted_at IS NULL
    `;
    let params: any[] = [];

    // TENANT ISOLATION: Non-super-admins can only see their association's competitions
    if (req.user && req.user.role !== UserRole.SUPER_ADMIN) {
      if (req.user.role === UserRole.ASSOCIATION_ADMIN && req.user.associationId) {
        queryText += ` AND c.association_id = $${params.length + 1}`;
        params.push(req.user.associationId);
      } else if (req.user.role === UserRole.CLUB_ADMIN && req.user.clubId) {
        // Club admins can see competitions their club participates in
        queryText += ` AND c.id IN (
          SELECT DISTINCT competition_id FROM team_competitions
          WHERE team_id IN (SELECT id FROM teams WHERE club_id = $1)
        )`;
        params.push(req.user.clubId);
      } else if (req.user.role === UserRole.TEAM_MANAGER) {
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
    if (sport) {
      queryText += ` AND c.sport = $${params.length + 1}`;
      params.push(sport);
    }
    if (status) {
      queryText += ` AND c.status = $${params.length + 1}`;
      params.push(status);
    }

    queryText += ` ORDER BY c.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(Number(limit), offset);

    const result = await query(queryText, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM competitions WHERE deleted_at IS NULL';
    let countParams: any[] = [];

    // Apply same tenant filters to count query
    if (req.user && req.user.role !== UserRole.SUPER_ADMIN) {
      if (req.user.role === UserRole.ASSOCIATION_ADMIN && req.user.associationId) {
        countQuery += ` AND association_id = $${countParams.length + 1}`;
        countParams.push(req.user.associationId);
      } else if ((req.user.role === UserRole.CLUB_ADMIN || req.user.role === UserRole.TEAM_MANAGER) && req.user.clubId) {
        countQuery += ` AND id IN (
          SELECT DISTINCT competition_id FROM team_competitions
          WHERE team_id IN (SELECT id FROM teams WHERE club_id = $1)
        )`;
        countParams.push(req.user.clubId);
      }
    }

    if (association_id) {
      countQuery += ` AND association_id = $${countParams.length + 1}`;
      countParams.push(association_id);
    }
    if (sport) {
      countQuery += ` AND sport = $${countParams.length + 1}`;
      countParams.push(sport);
    }
    if (status) {
      countQuery += ` AND status = $${countParams.length + 1}`;
      countParams.push(status);
    }

    const countResult = await query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    paginatedResponse(
      res,
      result.rows,
      Number(page),
      Number(limit),
      total,
      'Competitions retrieved successfully'
    );
  } catch (error) {
    console.error('Get competitions error:', error);
    errorResponse(res, 'Failed to get competitions', 500, 'GET_COMPETITIONS_FAILED');
  }
};

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
export const getCompetitionById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT c.*, a.name as association_name, s.year as season_year
       FROM competitions c
       LEFT JOIN associations a ON c.association_id = a.id
       LEFT JOIN seasons s ON c.season_id = s.id
       WHERE c.id = $1 AND c.deleted_at IS NULL`,
      [id]
    );

    if (result.rows.length === 0) {
      errorResponse(res, 'Competition not found', 404, 'COMPETITION_NOT_FOUND');
      return;
    }

    successResponse(res, result.rows[0], 'Competition retrieved successfully');
  } catch (error) {
    console.error('Get competition error:', error);
    errorResponse(res, 'Failed to get competition', 500, 'GET_COMPETITION_FAILED');
  }
};

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
export const createCompetition = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'Unauthorized', 401, 'UNAUTHORIZED');
      return;
    }

    const {
      name,
      sport,
      association_id,
      associationId,
      season_id,
      seasonId,
      category = CompetitionCategory.LEAGUE,
      status = CompetitionStatus.UPCOMING,
      rules,
      points_win = 3,
      pointsWin = 3,
      points_draw = 1,
      pointsDraw = 1,
      points_loss = 0,
      pointsLoss = 0,
    } = req.body;

    // Support both camelCase and snake_case
    const finalAssociationId = associationId || association_id;
    const finalSeasonId = seasonId || season_id;
    const finalPointsWin = pointsWin !== undefined ? pointsWin : points_win;
    const finalPointsDraw = pointsDraw !== undefined ? pointsDraw : points_draw;
    const finalPointsLoss = pointsLoss !== undefined ? pointsLoss : points_loss;

    // TENANT ISOLATION: Validate association access
    if (req.user.role === UserRole.ASSOCIATION_ADMIN && finalAssociationId !== req.user.associationId) {
      errorResponse(res, 'You can only create competitions for your own association', 403, 'ASSOCIATION_MISMATCH');
      return;
    }

    // Club admins and team managers cannot create competitions
    if (req.user.role === UserRole.CLUB_ADMIN || req.user.role === UserRole.TEAM_MANAGER) {
      errorResponse(res, 'You do not have permission to create competitions', 403, 'INSUFFICIENT_PERMISSIONS');
      return;
    }

    const competitionId = uuidv4();

    const result = await query(
      `INSERT INTO competitions (id, name, sport, association_id, season_id, category, status, rules, points_win, points_draw, points_loss)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [competitionId, name, sport, finalAssociationId, finalSeasonId, category, status, rules || null, finalPointsWin, finalPointsDraw, finalPointsLoss]
    );

    // Log audit
    await query(
      `INSERT INTO audit_logs (id, user_id, action, entity, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [uuidv4(), req.user.userId, AuditAction.CREATE, 'COMPETITION', competitionId, JSON.stringify({ name, sport })]
    );

    successResponse(res, result.rows[0], 'Competition created successfully', 201);
  } catch (error) {
    console.error('Create competition error:', error);
    errorResponse(res, 'Failed to create competition', 500, 'CREATE_COMPETITION_FAILED');
  }
};

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
export const updateCompetition = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'Unauthorized', 401, 'UNAUTHORIZED');
      return;
    }

    const { id } = req.params;
    const { name, sport, category, status, rules } = req.body;

    const existing = await query(
      'SELECT * FROM competitions WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );

    if (existing.rows.length === 0) {
      errorResponse(res, 'Competition not found', 404, 'COMPETITION_NOT_FOUND');
      return;
    }

    // TENANT ISOLATION: Check if user can modify this competition
    const competition = existing.rows[0];
    if (req.user.role === UserRole.ASSOCIATION_ADMIN && competition.association_id !== req.user.associationId) {
      errorResponse(res, 'You can only update competitions in your association', 403, 'ASSOCIATION_MISMATCH');
      return;
    }

    // Club admins and team managers cannot update competitions
    if (req.user.role === UserRole.CLUB_ADMIN || req.user.role === UserRole.TEAM_MANAGER) {
      errorResponse(res, 'You do not have permission to update competitions', 403, 'INSUFFICIENT_PERMISSIONS');
      return;
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (sport !== undefined) {
      updates.push(`sport = $${paramCount++}`);
      values.push(sport);
    }
    if (category !== undefined) {
      updates.push(`category = $${paramCount++}`);
      values.push(category);
    }
    if (status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(status);
    }
    if (rules !== undefined) {
      updates.push(`rules = $${paramCount++}`);
      values.push(rules);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE competitions SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    // Log audit
    await query(
      `INSERT INTO audit_logs (id, user_id, action, entity, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [uuidv4(), req.user.userId, AuditAction.UPDATE, 'COMPETITION', id, JSON.stringify(req.body)]
    );

    successResponse(res, result.rows[0], 'Competition updated successfully');
  } catch (error) {
    console.error('Update competition error:', error);
    errorResponse(res, 'Failed to update competition', 500, 'UPDATE_COMPETITION_FAILED');
  }
};

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
export const deleteCompetition = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'Unauthorized', 401, 'UNAUTHORIZED');
      return;
    }

    const { id } = req.params;

    const existing = await query(
      'SELECT * FROM competitions WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );

    if (existing.rows.length === 0) {
      errorResponse(res, 'Competition not found', 404, 'COMPETITION_NOT_FOUND');
      return;
    }

    // TENANT ISOLATION: Check if user can delete this competition
    const competition = existing.rows[0];
    if (req.user.role === UserRole.ASSOCIATION_ADMIN && competition.association_id !== req.user.associationId) {
      errorResponse(res, 'You can only delete competitions in your association', 403, 'ASSOCIATION_MISMATCH');
      return;
    }

    // Club admins and team managers cannot delete competitions
    if (req.user.role === UserRole.CLUB_ADMIN || req.user.role === UserRole.TEAM_MANAGER) {
      errorResponse(res, 'You do not have permission to delete competitions', 403, 'INSUFFICIENT_PERMISSIONS');
      return;
    }

    await query(
      'UPDATE competitions SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );

    // Log audit
    await query(
      `INSERT INTO audit_logs (id, user_id, action, entity, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [uuidv4(), req.user.userId, AuditAction.DELETE, 'COMPETITION', id, JSON.stringify({ name: existing.rows[0].name })]
    );

    successResponse(res, null, 'Competition deleted successfully');
  } catch (error) {
    console.error('Delete competition error:', error);
    errorResponse(res, 'Failed to delete competition', 500, 'DELETE_COMPETITION_FAILED');
  }
};
