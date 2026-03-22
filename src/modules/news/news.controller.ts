import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import slugify from 'slugify';
import { pool, query } from '../../config/database';
import { successResponse, errorResponse, paginatedResponse } from '../../utils/responseHandler';
import { AuthRequest, UserRole } from '../../types';
import { logger, auditLogger } from '../../utils/logger';

/**
 * News Controller
 * CRUD operations for news articles
 */

/**
 * @swagger
 * /news:
 *   get:
 *     summary: Get all news articles
 *     tags: [News]
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
 *           enum: [DRAFT, PUBLISHED, ARCHIVED]
 *     responses:
 *       200:
 *         description: News articles retrieved successfully
 */
export const getNews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, association_id, sport_id, sport, status = 'PUBLISHED' } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    // Support both sport_id (new) and sport (legacy for backward compatibility)
    const sportFilter = sport_id || sport;

    let queryText = `
      SELECT
        n.id,
        n.association_id,
        n.title,
        n.slug,
        n.excerpt,
        n.content,
        n.featured_image as "featuredImageUrl",
        n.sport_id_new as "sportId",
        s.name as sport_name,
        s.slug as sport_slug,
        n.category,
        n.status,
        n.published_at as "publishedAt",
        n.created_by as author_id,
        n.created_at as "createdAt",
        n.updated_at as "updatedAt",
        n.deleted_at,
        a.name as association_name,
        u.name as author_name,
        u.email as author_email,
        COUNT(*) OVER() as total_count
      FROM news n
      LEFT JOIN associations a ON n.association_id = a.id
      LEFT JOIN users u ON n.created_by = u.id
      LEFT JOIN sports s ON n.sport_id_new = s.id
      WHERE n.deleted_at IS NULL
    `;
    const params: any[] = [];

    // TENANT ISOLATION: Filter news by user's association
    if (req.user && req.user.role !== UserRole.SUPER_ADMIN) {
      if (req.user.role === UserRole.ASSOCIATION_ADMIN && req.user.associationId) {
        queryText += ` AND (n.association_id = $${params.length + 1} OR n.association_id IS NULL)`;
        params.push(req.user.associationId);
      } else if ((req.user.role === UserRole.CLUB_ADMIN || req.user.role === UserRole.TEAM_MANAGER) && req.user.associationId) {
        // Club admins and team managers can only see news from their association
        queryText += ` AND (n.association_id = $${params.length + 1} OR n.association_id IS NULL)`;
        params.push(req.user.associationId);
      }
    }

    if (association_id) {
      queryText += ` AND n.association_id = $${params.length + 1}`;
      params.push(association_id);
    }
    if (sportFilter) {
      // Use sport_id if provided, otherwise try to match by sport name (backward compatibility)
      if (sport_id) {
        queryText += ` AND n.sport_id_new = $${params.length + 1}`;
        params.push(sportFilter);
      } else {
        // Legacy: filter by sport slug
        queryText += ` AND s.slug = $${params.length + 1}`;
        params.push(sportFilter);
      }
    }
    if (status) {
      queryText += ` AND n.status = $${params.length + 1}`;
      params.push(status);
    }

    queryText += ` ORDER BY n.published_at DESC NULLS LAST, n.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(Number(limit), offset);

    const result = await query(queryText, params);

    const total = result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0;

    // Remove total_count from response
    const data = result.rows.map(({ total_count, ...rest }) => rest);

    paginatedResponse(
      res,
      data,
      Number(page),
      Number(limit),
      total,
      'News articles retrieved successfully'
    );
  } catch (error) {
    logger.error('Get news error', { error });
    errorResponse(res, 'Failed to get news', 500, 'GET_NEWS_FAILED');
  }
};

/**
 * @swagger
 * /news/{slug}:
 *   get:
 *     summary: Get news article by slug
 *     tags: [News]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: News article retrieved successfully
 *       404:
 *         description: News article not found
 */
export const getNewsBySlug = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;

    const result = await query(
      `SELECT
        n.id,
        n.association_id,
        n.title,
        n.slug,
        n.excerpt,
        n.content,
        n.featured_image as "featuredImageUrl",
        n.sport,
        n.category,
        n.status,
        n.published_at as "publishedAt",
        n.created_by as author_id,
        n.created_at as "createdAt",
        n.updated_at as "updatedAt",
        a.name as association_name,
        u.name as author_name,
        u.email as author_email
       FROM news n
       LEFT JOIN associations a ON n.association_id = a.id
       LEFT JOIN users u ON n.created_by = u.id
       WHERE n.slug = $1 AND n.deleted_at IS NULL`,
      [slug]
    );

    if (result.rows.length === 0) {
      errorResponse(res, 'News article not found', 404, 'NEWS_NOT_FOUND');
      return;
    }

    // Increment view count (optional)
    await query('UPDATE news SET view_count = COALESCE(view_count, 0) + 1 WHERE slug = $1', [slug]);

    successResponse(res, result.rows[0], 'News article retrieved successfully');
  } catch (error) {
    logger.error('Get news by slug error', { error, slug: req.params.slug });
    errorResponse(res, 'Failed to get news article', 500, 'GET_NEWS_FAILED');
  }
};

/**
 * @swagger
 * /news:
 *   post:
 *     summary: Create a news article
 *     tags: [News]
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
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               association_id:
 *                 type: string
 *                 format: uuid
 *               excerpt:
 *                 type: string
 *               featured_image:
 *                 type: string
 *                 format: uri
 *               sport:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [BULLETIN, UPDATE, FEATURE, ANNOUNCEMENT]
 *               region:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [DRAFT, PUBLISHED, ARCHIVED]
 *     responses:
 *       201:
 *         description: News article created successfully
 */
export const createNews = async (req: AuthRequest, res: Response): Promise<void> => {
  const client = await pool.connect();
  let transactionStarted = false;

  try {
    if (!req.user) {
      errorResponse(res, 'Unauthorized', 401, 'UNAUTHORIZED');
      return;
    }

    const {
      title,
      content,
      association_id,
      excerpt,
      featured_image,
      sport,
      category = 'UPDATE',
      region,
      status = 'DRAFT',
    } = req.body;

    // TENANT ISOLATION: Validate association access
    if (association_id) {
      if (req.user.role === UserRole.ASSOCIATION_ADMIN && association_id !== req.user.associationId) {
        errorResponse(res, 'You can only create news for your own association', 403, 'ASSOCIATION_MISMATCH');
        return;
      }

      // Club admins and team managers cannot create news with specific association
      if (req.user.role === UserRole.CLUB_ADMIN || req.user.role === UserRole.TEAM_MANAGER) {
        errorResponse(res, 'You do not have permission to create news', 403, 'INSUFFICIENT_PERMISSIONS');
        return;
      }
    } else {
      // If no association_id, use user's association for non-super-admins
      if (req.user.role !== UserRole.SUPER_ADMIN && req.user.associationId) {
        // For association admins, default to their association
        // This will be handled below
      }
    }

    await client.query('BEGIN');
    transactionStarted = true;

    // Generate unique slug
    let slug = slugify(title, { lower: true, strict: true });
    let slugSuffix = 1;
    let uniqueSlug = slug;

    // Ensure slug is unique
    while (true) {
      const existing = await client.query('SELECT id FROM news WHERE slug = $1', [uniqueSlug]);
      if (existing.rows.length === 0) break;
      uniqueSlug = `${slug}-${slugSuffix++}`;
    }

    const newsId = uuidv4();
    const publishedAt = status === 'PUBLISHED' ? new Date() : null;

    // For association admins, default to their association if not provided
    const finalAssociationId = association_id || (req.user.role === UserRole.ASSOCIATION_ADMIN ? req.user.associationId : null);

    const result = await client.query(
      `INSERT INTO news (id, title, slug, excerpt, content, association_id, featured_image, sport, category, region, status, published_at, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        newsId,
        title,
        uniqueSlug,
        excerpt || null,
        content,
        finalAssociationId,
        featured_image || null,
        sport || null,
        category,
        region || null,
        status,
        publishedAt,
        req.user.userId,
      ]
    );

    // Log audit
    auditLogger('CREATE_NEWS', 'NEWS', req.user.userId, {
      newsId,
      title,
      slug: uniqueSlug,
      status,
    });

    await client.query('COMMIT');
    transactionStarted = false;

    logger.info('News article created', { newsId, title: result.rows[0].title, userId: req.user.userId });

    successResponse(res, result.rows[0], 'News article created successfully', 201);
  } catch (error) {
    if (transactionStarted) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError) {
        console.error('Rollback error:', rollbackError);
      }
    }
    logger.error('Create news error details', { error });
    errorResponse(res, 'Failed to create news article', 500, 'CREATE_NEWS_FAILED');
  } finally {
    client.release();
  }
};

/**
 * @swagger
 * /news/{id}:
 *   put:
 *     summary: Update a news article
 *     tags: [News]
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
 *               content:
 *                 type: string
 *               excerpt:
 *                 type: string
 *               featured_image:
 *                 type: string
 *                 format: uri
 *               sport:
 *                 type: string
 *               category:
 *                 type: string
 *               region:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [DRAFT, PUBLISHED, ARCHIVED]
 *     responses:
 *       200:
 *         description: News article updated successfully
 */
export const updateNews = async (req: AuthRequest, res: Response): Promise<void> => {
  const client = await pool.connect();
  let transactionStarted = false;

  try {
    if (!req.user) {
      errorResponse(res, 'Unauthorized', 401, 'UNAUTHORIZED');
      return;
    }

    const { id } = req.params;
    const { title, content, excerpt, featured_image, sport, category, region, status } = req.body;

    const existing = await client.query(
      'SELECT * FROM news WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );

    if (existing.rows.length === 0) {
      errorResponse(res, 'News article not found', 404, 'NEWS_NOT_FOUND');
      return;
    }

    // TENANT ISOLATION: Check if user can modify this news
    const article = existing.rows[0];
    if (req.user.role === UserRole.ASSOCIATION_ADMIN && article.association_id !== req.user.associationId) {
      errorResponse(res, 'You can only update news in your association', 403, 'ASSOCIATION_MISMATCH');
      return;
    }

    // Club admins and team managers cannot update news
    if (req.user.role === UserRole.CLUB_ADMIN || req.user.role === UserRole.TEAM_MANAGER) {
      errorResponse(res, 'You do not have permission to update news', 403, 'INSUFFICIENT_PERMISSIONS');
      return;
    }

    await client.query('BEGIN');
    transactionStarted = true;

    // Build update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramCount++}`);
      values.push(title);
    }
    if (content !== undefined) {
      updates.push(`content = $${paramCount++}`);
      values.push(content);
    }
    if (excerpt !== undefined) {
      updates.push(`excerpt = $${paramCount++}`);
      values.push(excerpt);
    }
    if (featured_image !== undefined) {
      updates.push(`featured_image = $${paramCount++}`);
      values.push(featured_image);
    }
    if (sport !== undefined) {
      updates.push(`sport = $${paramCount++}`);
      values.push(sport);
    }
    if (category !== undefined) {
      updates.push(`category = $${paramCount++}`);
      values.push(category);
    }
    if (region !== undefined) {
      updates.push(`region = $${paramCount++}`);
      values.push(region);
    }
    if (status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(status);

      // Update published_at if status changes to PUBLISHED
      if (status === 'PUBLISHED' && existing.rows[0].status !== 'PUBLISHED') {
        updates.push(`published_at = $${paramCount++}`);
        values.push(new Date());
      }
    }

    updates.push(`updated_by = $${paramCount++}`);
    values.push(req.user.userId);
    updates.push(`id = $${paramCount}`); // For WHERE clause
    values.push(id);

    const result = await client.query(
      `UPDATE news SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount} RETURNING *`,
      values
    );

    auditLogger('UPDATE_NEWS', 'NEWS', req.user.userId, {
      newsId: id,
      changes: req.body,
    });

    await client.query('COMMIT');
    transactionStarted = false;

    logger.info('News article updated', { newsId: id, userId: req.user.userId });

    successResponse(res, result.rows[0], 'News article updated successfully');
  } catch (error) {
    if (transactionStarted) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError) {
        console.error('Rollback error:', rollbackError);
      }
    }
    logger.error('Update news error details', { error });
    errorResponse(res, 'Failed to update news article', 500, 'UPDATE_NEWS_FAILED');
  } finally {
    client.release();
  }
};

/**
 * @swagger
 * /news/{id}:
 *   delete:
 *     summary: Delete a news article (soft delete)
 *     tags: [News]
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
 *         description: News article deleted successfully
 */
export const deleteNews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'Unauthorized', 401, 'UNAUTHORIZED');
      return;
    }

    const { id } = req.params;

    const existing = await query(
      'SELECT * FROM news WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );

    if (existing.rows.length === 0) {
      errorResponse(res, 'News article not found', 404, 'NEWS_NOT_FOUND');
      return;
    }

    // TENANT ISOLATION: Check if user can delete this news
    const article = existing.rows[0];
    if (req.user.role === UserRole.ASSOCIATION_ADMIN && article.association_id !== req.user.associationId) {
      errorResponse(res, 'You can only delete news in your association', 403, 'ASSOCIATION_MISMATCH');
      return;
    }

    // Club admins and team managers cannot delete news
    if (req.user.role === UserRole.CLUB_ADMIN || req.user.role === UserRole.TEAM_MANAGER) {
      errorResponse(res, 'You do not have permission to delete news', 403, 'INSUFFICIENT_PERMISSIONS');
      return;
    }

    await query(
      'UPDATE news SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );

    auditLogger('DELETE_NEWS', 'NEWS', req.user.userId, {
      newsId: id,
      title: existing.rows[0].title,
    });

    logger.info('News article deleted', { newsId: id, userId: req.user.userId });

    successResponse(res, null, 'News article deleted successfully');
  } catch (error) {
    logger.error('Delete news error', { error });
    errorResponse(res, 'Failed to delete news article', 500, 'DELETE_NEWS_FAILED');
  }
};
