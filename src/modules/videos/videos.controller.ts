import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../../config/database';
import { successResponse, errorResponse, paginatedResponse } from '../../utils/responseHandler';
import { AuthRequest, UserRole } from '../../types';
import { logger, auditLogger } from '../../utils/logger';

/**
 * Videos Controller
 * CRUD operations for video content
 */

/**
 * @swagger
 * /videos:
 *   get:
 *     summary: Get all videos
 *     tags: [Videos]
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
 *         name: sport
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published]
 *     responses:
 *       200:
 *         description: Videos retrieved successfully
 */
export const getVideos = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 12, sport, category, status = 'published' } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let queryText = `
      SELECT
        v.id,
        v.title,
        v.description,
        v.youtube_url as "youtubeUrl",
        v.thumbnail_url as "thumbnailUrl",
        v.sport,
        v.category,
        v.event_date as "eventDate",
        v.view_count as "viewCount",
        v.is_published as "isPublished",
        v.created_at as "createdAt",
        v.updated_at as "updatedAt",
        COUNT(*) OVER() as total_count
      FROM videos v
      WHERE v.deleted_at IS NULL
    `;
    const params: any[] = [];

    // Only show published videos for non-admin users
    if (status === 'published' && (!req.user || req.user.role !== UserRole.SUPER_ADMIN)) {
      queryText += ` AND v.is_published = true`;
    }

    if (sport) {
      queryText += ` AND v.sport = $${params.length + 1}`;
      params.push(sport);
    }

    if (category) {
      queryText += ` AND v.category = $${params.length + 1}`;
      params.push(category);
    }

    queryText += ` ORDER BY v.event_date DESC NULLS LAST, v.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(Number(limit), offset);

    const result = await query(queryText, params);
    const total = result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0;
    const data = result.rows.map(({ total_count, ...rest }) => rest);

    paginatedResponse(
      res,
      data,
      Number(page),
      Number(limit),
      total,
      'Videos retrieved successfully'
    );
  } catch (error) {
    logger.error('Get videos error', { error });
    errorResponse(res, 'Failed to get videos', 500, 'GET_VIDEOS_FAILED');
  }
};

/**
 * @swagger
 * /videos/{id}:
 *   get:
 *     summary: Get video by ID
 *     tags: [Videos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Video retrieved successfully
 *       404:
 *         description: Video not found
 */
export const getVideoById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT
        v.id,
        v.title,
        v.description,
        v.youtube_url as "youtubeUrl",
        v.thumbnail_url as "thumbnailUrl",
        v.sport,
        v.category,
        v.event_date as "eventDate",
        v.view_count as "viewCount",
        v.is_published as "isPublished",
        v.created_at as "createdAt",
        v.updated_at as "updatedAt",
        u.name as created_by_name,
        u.email as created_by_email
       FROM videos v
       LEFT JOIN users u ON v.created_by = u.id
       WHERE v.id = $1 AND v.deleted_at IS NULL`,
      [id]
    );

    if (result.rows.length === 0) {
      errorResponse(res, 'Video not found', 404, 'VIDEO_NOT_FOUND');
      return;
    }

    successResponse(res, result.rows[0], 'Video retrieved successfully');
  } catch (error) {
    logger.error('Get video by ID error', { error, id: req.params.id });
    errorResponse(res, 'Failed to get video', 500, 'GET_VIDEO_FAILED');
  }
};

/**
 * @swagger
 * /videos:
 *   post:
 *     summary: Create a new video
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - youtubeUrl
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               youtubeUrl:
 *                 type: string
 *                 format: uri
 *               thumbnailUrl:
 *                 type: string
 *                 format: uri
 *               sport:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [HIGHLIGHTS, FULL_MATCH, INTERVIEW, DOCUMENTARY]
 *               eventDate:
 *                 type: string
 *                 format: date
 *               isPublished:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Video created successfully
 */
export const createVideo = async (req: AuthRequest, res: Response): Promise<void> => {
  let transactionStarted = false;

  try {
    if (!req.user) {
      errorResponse(res, 'Unauthorized', 401, 'UNAUTHORIZED');
      return;
    }

    const {
      title,
      description,
      youtubeUrl,
      thumbnailUrl,
      sport,
      category = 'HIGHLIGHTS',
      eventDate,
      isPublished = false,
    } = req.body;

    // Validate YouTube URL
    if (!youtubeUrl || !youtubeUrl.match(/(youtube\.com|youtu\.be)/)) {
      errorResponse(res, 'Invalid YouTube URL', 400, 'INVALID_YOUTUBE_URL');
      return;
    }

    await query('BEGIN');
    transactionStarted = true;

    const videoId = uuidv4();

    const result = await query(
      `INSERT INTO videos (id, title, description, youtube_url, thumbnail_url, sport, category, event_date, is_published, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        videoId,
        title,
        description || null,
        youtubeUrl,
        thumbnailUrl || null,
        sport || null,
        category,
        eventDate || null,
        isPublished,
        req.user.userId,
      ]
    );

    auditLogger('CREATE_VIDEO', 'VIDEO', req.user.userId, {
      videoId,
      title,
      category,
    });

    await query('COMMIT');
    transactionStarted = false;

    logger.info('Video created', { videoId, title, userId: req.user.userId });

    successResponse(res, result.rows[0], 'Video created successfully', 201);
  } catch (error) {
    if (transactionStarted) {
      try {
        await query('ROLLBACK');
      } catch (rollbackError) {
        console.error('Rollback error:', rollbackError);
      }
    }
    logger.error('Create video error', { error });
    errorResponse(res, 'Failed to create video', 500, 'CREATE_VIDEO_FAILED');
  }
};

/**
 * @swagger
 * /videos/{id}:
 *   put:
 *     summary: Update a video
 *     tags: [Videos]
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
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               youtubeUrl:
 *                 type: string
 *                 format: uri
 *               thumbnailUrl:
 *                 type: string
 *                 format: uri
 *               sport:
 *                 type: string
 *               category:
 *                 type: string
 *               eventDate:
 *                 type: string
 *                 format: date
 *               isPublished:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Video updated successfully
 */
export const updateVideo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'Unauthorized', 401, 'UNAUTHORIZED');
      return;
    }

    const { id } = req.params;
    const {
      title,
      description,
      youtubeUrl,
      thumbnailUrl,
      sport,
      category,
      eventDate,
      isPublished,
    } = req.body;

    const existing = await query(
      'SELECT * FROM videos WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );

    if (existing.rows.length === 0) {
      errorResponse(res, 'Video not found', 404, 'VIDEO_NOT_FOUND');
      return;
    }

    // Build update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramCount++}`);
      values.push(title);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (youtubeUrl !== undefined) {
      updates.push(`youtube_url = $${paramCount++}`);
      values.push(youtubeUrl);
    }
    if (thumbnailUrl !== undefined) {
      updates.push(`thumbnail_url = $${paramCount++}`);
      values.push(thumbnailUrl);
    }
    if (sport !== undefined) {
      updates.push(`sport = $${paramCount++}`);
      values.push(sport);
    }
    if (category !== undefined) {
      updates.push(`category = $${paramCount++}`);
      values.push(category);
    }
    if (eventDate !== undefined) {
      updates.push(`event_date = $${paramCount++}`);
      values.push(eventDate);
    }
    if (isPublished !== undefined) {
      updates.push(`is_published = $${paramCount++}`);
      values.push(isPublished);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE videos SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    auditLogger('UPDATE_VIDEO', 'VIDEO', req.user.userId, {
      videoId: id,
      changes: req.body,
    });

    logger.info('Video updated', { videoId: id, userId: req.user.userId });

    successResponse(res, result.rows[0], 'Video updated successfully');
  } catch (error) {
    logger.error('Update video error', { error });
    errorResponse(res, 'Failed to update video', 500, 'UPDATE_VIDEO_FAILED');
  }
};

/**
 * @swagger
 * /videos/{id}:
 *   delete:
 *     summary: Delete a video (soft delete)
 *     tags: [Videos]
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
 *         description: Video deleted successfully
 */
export const deleteVideo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'Unauthorized', 401, 'UNAUTHORIZED');
      return;
    }

    const { id } = req.params;

    const existing = await query(
      'SELECT * FROM videos WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );

    if (existing.rows.length === 0) {
      errorResponse(res, 'Video not found', 404, 'VIDEO_NOT_FOUND');
      return;
    }

    await query('UPDATE videos SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);

    auditLogger('DELETE_VIDEO', 'VIDEO', req.user.userId, {
      videoId: id,
      title: existing.rows[0].title,
    });

    logger.info('Video deleted', { videoId: id, userId: req.user.userId });

    successResponse(res, null, 'Video deleted successfully');
  } catch (error) {
    logger.error('Delete video error', { error });
    errorResponse(res, 'Failed to delete video', 500, 'DELETE_VIDEO_FAILED');
  }
};
