import { Response } from 'express';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../../config/database';
import { successResponse, errorResponse, paginatedResponse } from '../../utils/responseHandler';
import { AuthRequest } from '../../types';
import { AuditAction } from '../../types';

/**
 * @swagger
 * /users/association-admin:
 *   post:
 *     summary: Create an Association Admin
 *     description: Creates a new user with ASSOCIATION_ADMIN role for a specific association. Only SUPER_ADMIN can create association admins.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - association_id
 *               - email
 *               - name
 *               - password
 *             properties:
 *               association_id:
 *                 type: string
 *                 format: uuid
 *                 description: The ID of the association this admin will manage
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Admin's email address (must be unique)
 *               name:
 *                 type: string
 *                 description: Admin's full name
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 description: Admin's password (minimum 8 characters)
 *     responses:
 *       201:
 *         description: Association admin created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Association admin created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                       enum: [ASSOCIATION_ADMIN]
 *                     association_id:
 *                       type: string
 *                       format: uuid
 *       400:
 *         description: Validation error or association does not exist
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only SUPER_ADMIN can create association admins
 *       409:
 *         description: User with this email already exists
 */
export const createAssociationAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { association_id, associationId, email, name, password } = req.body;

    // Support both camelCase and snake_case
    const finalAssociationId = association_id || associationId;

    // Verify association exists
    const associationCheck = await query(
      'SELECT id FROM associations WHERE id = $1',
      [finalAssociationId]
    );

    if (associationCheck.rows.length === 0) {
      errorResponse(res, 'Association not found', 404, 'ASSOCIATION_NOT_FOUND');
      return;
    }

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      errorResponse(res, 'User with this email already exists', 409, 'USER_EXISTS');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with ASSOCIATION_ADMIN role
    const userId = uuidv4();
    const result = await query(
      `INSERT INTO users (id, name, email, password, role, association_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, email, role, association_id, created_at`,
      [userId, name, email, hashedPassword, 'ASSOCIATION_ADMIN', finalAssociationId]
    );

    const user = result.rows[0];

    // Log audit
    await query(
      `INSERT INTO audit_logs (id, user_id, action, entity, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [uuidv4(), req.user?.userId, AuditAction.CREATE, 'USER', userId, JSON.stringify({ email, role: 'ASSOCIATION_ADMIN', association_id: finalAssociationId })]
    );

    successResponse(
      res,
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        association_id: user.association_id,
      },
      'Association admin created successfully',
      201
    );
  } catch (error) {
    console.error('Create association admin error:', error);
    errorResponse(res, 'Failed to create association admin', 500, 'CREATE_ASSOCIATION_ADMIN_FAILED');
  }
};

/**
 * @swagger
 * /users/club-admin:
 *   post:
 *     summary: Create a Club Admin
 *     description: Creates a new user with CLUB_ADMIN role for a specific club. Only SUPER_ADMIN or ASSOCIATION_ADMIN can create club admins.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - club_id
 *               - email
 *               - name
 *               - password
 *             properties:
 *               club_id:
 *                 type: string
 *                 format: uuid
 *                 description: The ID of the club this admin will manage
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Admin's email address (must be unique)
 *               name:
 *                 type: string
 *                 description: Admin's full name
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 description: Admin's password (minimum 8 characters)
 *     responses:
 *       201:
 *         description: Club admin created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Club admin created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                       enum: [CLUB_ADMIN]
 *                     club_id:
 *                       type: string
 *                       format: uuid
 *       400:
 *         description: Validation error or club does not exist
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Club not found
 *       409:
 *         description: User with this email already exists
 */
export const createClubAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { club_id, clubId, email, name, password } = req.body;

    // Support both camelCase and snake_case
    const finalClubId = club_id || clubId;

    // Verify club exists
    const clubCheck = await query(
      'SELECT id, association_id FROM clubs WHERE id = $1',
      [finalClubId]
    );

    if (clubCheck.rows.length === 0) {
      errorResponse(res, 'Club not found', 404, 'CLUB_NOT_FOUND');
      return;
    }

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      errorResponse(res, 'User with this email already exists', 409, 'USER_EXISTS');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with CLUB_ADMIN role
    const userId = uuidv4();
    const result = await query(
      `INSERT INTO users (id, name, email, password, role, club_id, association_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, email, role, club_id, association_id, created_at`,
      [userId, name, email, hashedPassword, 'CLUB_ADMIN', finalClubId, clubCheck.rows[0].association_id]
    );

    const user = result.rows[0];

    // Log audit
    await query(
      `INSERT INTO audit_logs (id, user_id, action, entity, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [uuidv4(), req.user?.userId, AuditAction.CREATE, 'USER', userId, JSON.stringify({ email, role: 'CLUB_ADMIN', club_id: finalClubId })]
    );

    successResponse(
      res,
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        club_id: user.club_id,
        association_id: user.association_id,
      },
      'Club admin created successfully',
      201
    );
  } catch (error) {
    console.error('Create club admin error:', error);
    errorResponse(res, 'Failed to create club admin', 500, 'CREATE_CLUB_ADMIN_FAILED');
  }
};

/**
 * @swagger
 * /users/competition-manager:
 *   post:
 *     summary: Create a Competition Manager
 *     description: Creates a new user with COMPETITION_MANAGER role for a specific competition. Only SUPER_ADMIN or ASSOCIATION_ADMIN can create competition managers.
 *     tags: [Users]
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
 *               - email
 *               - name
 *               - password
 *             properties:
 *               competition_id:
 *                 type: string
 *                 format: uuid
 *                 description: The ID of the competition this manager will manage
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Manager's email address (must be unique)
 *               name:
 *                 type: string
 *                 description: Manager's full name
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 description: Manager's password (minimum 8 characters)
 *     responses:
 *       201:
 *         description: Competition manager created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Competition manager created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                       enum: [COMPETITION_MANAGER]
 *                     competition_id:
 *                       type: string
 *                       format: uuid
 *       400:
 *         description: Validation error or competition does not exist
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Competition not found
 *       409:
 *         description: User with this email already exists
 */
export const createCompetitionManager = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { competition_id, competitionId, email, name, password } = req.body;

    // Support both camelCase and snake_case
    const finalCompetitionId = competition_id || competitionId;

    // Verify competition exists and get association_id
    const competitionCheck = await query(
      'SELECT id, association_id FROM competitions WHERE id = $1',
      [finalCompetitionId]
    );

    if (competitionCheck.rows.length === 0) {
      errorResponse(res, 'Competition not found', 404, 'COMPETITION_NOT_FOUND');
      return;
    }

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      errorResponse(res, 'User with this email already exists', 409, 'USER_EXISTS');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with COMPETITION_MANAGER role
    const userId = uuidv4();
    const result = await query(
      `INSERT INTO users (id, name, email, password, role, association_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, email, role, association_id, created_at`,
      [userId, name, email, hashedPassword, 'COMPETITION_MANAGER', competitionCheck.rows[0].association_id]
    );

    const user = result.rows[0];

    // Store competition_id in audit for tracking (users table doesn't have competition_id column)
    // We'll need to add competition tracking via user_settings or a separate relation table if needed
    // For now, the competition manager can see all competitions in their association

    // Log audit
    await query(
      `INSERT INTO audit_logs (id, user_id, action, entity, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [uuidv4(), req.user?.userId, AuditAction.CREATE, 'USER', userId, JSON.stringify({ email, role: 'COMPETITION_MANAGER', competition_id: finalCompetitionId })]
    );

    successResponse(
      res,
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        association_id: user.association_id,
        competition_id: finalCompetitionId, // Include in response for reference
      },
      'Competition manager created successfully',
      201
    );
  } catch (error) {
    console.error('Create competition manager error:', error);
    errorResponse(res, 'Failed to create competition manager', 500, 'CREATE_COMPETITION_MANAGER_FAILED');
  }
};

/**
 * @swagger
 * /users:
 *   get:
 *     summary: List all users
 *     description: Retrieves a list of users with optional filtering. Only SUPER_ADMIN and ASSOCIATION_ADMIN can access this endpoint.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [SUPER_ADMIN, ASSOCIATION_ADMIN, CLUB_ADMIN, COMPETITION_MANAGER, TEAM_MANAGER]
 *         description: Filter users by role
 *       - in: query
 *         name: association_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter users by association
 *       - in: query
 *         name: club_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter users by club
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       role:
 *                         type: string
 *                       association_id:
 *                         type: string
 *                         format: uuid
 *                         nullable: true
 *                       club_id:
 *                         type: string
 *                         format: uuid
 *                         nullable: true
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, association_id, club_id, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    // Build query with filters
    let queryText = `
      SELECT id, name, email, role, association_id, club_id, created_at
      FROM users
      WHERE deleted_at IS NULL
    `;
    const queryParams: any[] = [];
    let paramCount = 0;

    if (role) {
      paramCount++;
      queryText += ` AND role = $${paramCount}`;
      queryParams.push(role);
    }

    if (association_id) {
      paramCount++;
      queryText += ` AND association_id = $${paramCount}`;
      queryParams.push(association_id);
    }

    if (club_id) {
      paramCount++;
      queryText += ` AND club_id = $${paramCount}`;
      queryParams.push(club_id);
    }

    // If user is ASSOCIATION_ADMIN, only show users from their association
    if (req.user?.role === 'ASSOCIATION_ADMIN') {
      paramCount++;
      queryText += ` AND association_id = $${paramCount}`;
      queryParams.push(req.user.associationId);
    }

    // If user is CLUB_ADMIN, only show users from their club
    if (req.user?.role === 'CLUB_ADMIN') {
      paramCount++;
      queryText += ` AND club_id = $${paramCount}`;
      queryParams.push(req.user.clubId);
    }

    // Get total count
    const countQuery = queryText.replace(
      /SELECT id, name, email, role, association_id, club_id, created_at/,
      'SELECT COUNT(*)'
    );
    const countResult = await query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].count);

    // Add pagination and ordering
    queryText += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    queryParams.push(Number(limit), offset);

    const result = await query(queryText, queryParams);

    paginatedResponse(res, result.rows, Number(page), Number(limit), total, 'Users retrieved successfully');
  } catch (error) {
    console.error('Get users error:', error);
    errorResponse(res, 'Failed to retrieve users', 500, 'GET_USERS_FAILED');
  }
};

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Retrieves a specific user by ID. Users can only view their own profile or users within their scope.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: User not found
 */
export const getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Users can view their own profile
    if (req.user?.userId !== id && req.user?.role !== 'SUPER_ADMIN') {
      // ASSOCIATION_ADMIN can view users in their association
      if (req.user?.role === 'ASSOCIATION_ADMIN') {
        // Check if user is in their association (we'll verify in the query)
      } else {
        errorResponse(res, 'Forbidden - You can only view your own profile', 403, 'FORBIDDEN');
        return;
      }
    }

    const result = await query(
      `SELECT id, name, email, role, association_id, club_id, created_at, updated_at
       FROM users WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );

    if (result.rows.length === 0) {
      errorResponse(res, 'User not found', 404, 'USER_NOT_FOUND');
      return;
    }

    const user = result.rows[0];

    // Check if user has permission to view this user
    if (req.user?.role === 'ASSOCIATION_ADMIN' && user.association_id !== req.user.associationId) {
      errorResponse(res, 'Forbidden - User not in your association', 403, 'FORBIDDEN');
      return;
    }

    successResponse(res, user, 'User retrieved successfully');
  } catch (error) {
    console.error('Get user error:', error);
    errorResponse(res, 'Failed to retrieve user', 500, 'GET_USER_FAILED');
  }
};

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update user
 *     description: Updates a user's information. Users can update their own profile. SUPER_ADMIN can update any user.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               role:
 *                 type: string
 *                 enum: [SUPER_ADMIN, ASSOCIATION_ADMIN, CLUB_ADMIN, COMPETITION_MANAGER, TEAM_MANAGER]
 *               association_id:
 *                 type: string
 *                 format: uuid
 *               club_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, role, association_id, club_id } = req.body;

    // Only SUPER_ADMIN can update roles and associations/clubs
    if (req.user?.role !== 'SUPER_ADMIN' && (role || association_id || club_id)) {
      errorResponse(res, 'Forbidden - Only SUPER_ADMIN can change role, association, or club', 403, 'FORBIDDEN');
      return;
    }

    // Check if user exists
    const existingUser = await query(
      'SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );

    if (existingUser.rows.length === 0) {
      errorResponse(res, 'User not found', 404, 'USER_NOT_FOUND');
      return;
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 0;

    if (name) {
      paramCount++;
      updates.push(`name = $${paramCount}`);
      values.push(name);
    }

    if (email) {
      // Check if email is already taken by another user
      const emailCheck = await query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, id]
      );

      if (emailCheck.rows.length > 0) {
        errorResponse(res, 'Email already in use', 409, 'EMAIL_IN_USE');
        return;
      }

      paramCount++;
      updates.push(`email = $${paramCount}`);
      values.push(email);
    }

    if (role && req.user?.role === 'SUPER_ADMIN') {
      paramCount++;
      updates.push(`role = $${paramCount}`);
      values.push(role);
    }

    if (association_id !== undefined && req.user?.role === 'SUPER_ADMIN') {
      paramCount++;
      updates.push(`association_id = $${paramCount}`);
      values.push(association_id || null);
    }

    if (club_id !== undefined && req.user?.role === 'SUPER_ADMIN') {
      paramCount++;
      updates.push(`club_id = $${paramCount}`);
      values.push(club_id || null);
    }

    if (updates.length === 0) {
      errorResponse(res, 'No valid fields to update', 400, 'NO_UPDATE_FIELDS');
      return;
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    paramCount++;

    const queryText = `
      UPDATE users
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, name, email, role, association_id, club_id, updated_at
    `;

    const result = await query(queryText, values);
    const user = result.rows[0];

    // Log audit
    await query(
      `INSERT INTO audit_logs (id, user_id, action, entity, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [uuidv4(), req.user?.userId, AuditAction.UPDATE, 'USER', id, JSON.stringify({ updates })]
    );

    successResponse(res, user, 'User updated successfully');
  } catch (error) {
    console.error('Update user error:', error);
    errorResponse(res, 'Failed to update user', 500, 'UPDATE_USER_FAILED');
  }
};

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete user
 *     description: Soft deletes a user. Only SUPER_ADMIN can delete users.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only SUPER_ADMIN can delete users
 *       404:
 *         description: User not found
 */
export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Prevent users from deleting themselves
    if (req.user?.userId === id) {
      errorResponse(res, 'Cannot delete your own account', 400, 'CANNOT_DELETE_SELF');
      return;
    }

    // Check if user exists
    const existingUser = await query(
      'SELECT id FROM users WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );

    if (existingUser.rows.length === 0) {
      errorResponse(res, 'User not found', 404, 'USER_NOT_FOUND');
      return;
    }

    // Soft delete
    await query(
      'UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );

    // Revoke all refresh tokens
    await query(
      'UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP WHERE user_id = $1 AND revoked_at IS NULL',
      [id]
    );

    // Log audit
    await query(
      `INSERT INTO audit_logs (id, user_id, action, entity, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [uuidv4(), req.user?.userId, AuditAction.DELETE, 'USER', id, JSON.stringify({ action: 'SOFT_DELETE' })]
    );

    successResponse(res, null, 'User deleted successfully');
  } catch (error) {
    console.error('Delete user error:', error);
    errorResponse(res, 'Failed to delete user', 500, 'DELETE_USER_FAILED');
  }
};
