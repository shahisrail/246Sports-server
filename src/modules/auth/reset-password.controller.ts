import { Response } from 'express';
import bcrypt from 'bcrypt';
import { query } from '../../config/database';
import { successResponse, errorResponse } from '../../utils/responseHandler';
import { logger } from '../../utils/logger';

/**
 * @swagger
 * /auth/reset-password/validate:
 *   post:
 *     summary: Validate password reset token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Token is valid
 *       400:
 *         description: Invalid or expired token
 */
export const validateResetToken = async (req: any, res: Response): Promise<void> => {
  try {
    const { token } = req.body;

    if (!token) {
      errorResponse(res, 'Reset token is required', 400, 'MISSING_TOKEN');
      return;
    }

    // Find valid reset token
    const result = await query(
      `SELECT prt.*, u.email, u.name
       FROM password_reset_tokens prt
       INNER JOIN users u ON prt.user_id = u.id
       WHERE prt.token = $1
         AND prt.used_at IS NULL
         AND prt.expires_at > CURRENT_TIMESTAMP`,
      [token]
    );

    if (result.rows.length === 0) {
      // Check if token exists but is invalid
      const existingResult = await query(
        'SELECT * FROM password_reset_tokens WHERE token = $1',
        [token]
      );

      if (existingResult.rows.length > 0) {
        const token = existingResult.rows[0];
        if (token.used_at) {
          errorResponse(res, 'This reset link has already been used', 400, 'TOKEN_ALREADY_USED');
        } else if (token.expires_at <= new Date()) {
          errorResponse(res, 'This reset link has expired', 400, 'TOKEN_EXPIRED');
        } else {
          errorResponse(res, 'Invalid reset token', 400, 'INVALID_TOKEN');
        }
      } else {
        errorResponse(res, 'Reset token not found', 404, 'TOKEN_NOT_FOUND');
      }
      return;
    }

    const resetData = result.rows[0];

    successResponse(res, {
      email: resetData.email,
      name: resetData.name,
      token: token,
    }, 'Reset token validated successfully');
  } catch (error) {
    logger.error('Validate reset token error', { error });
    errorResponse(res, 'Failed to validate reset token', 500, 'VALIDATE_TOKEN_FAILED');
  }
};

/**
 * @swagger
 * /auth/reset-password/confirm:
 *   post:
 *     summary: Confirm password reset and set new password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *                 format: uuid
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Token not found
 */
export const confirmResetPassword = async (req: any, res: Response): Promise<void> => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      errorResponse(res, 'Token and password are required', 400, 'MISSING_REQUIRED_FIELDS');
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      errorResponse(res, 'Password must be at least 8 characters long', 400, 'WEAK_PASSWORD');
      return;
    }

    // Find valid reset token
    const result = await query(
      `SELECT prt.*, u.id as user_id, u.email
       FROM password_reset_tokens prt
       INNER JOIN users u ON prt.user_id = u.id
       WHERE prt.token = $1
         AND prt.used_at IS NULL
         AND prt.expires_at > CURRENT_TIMESTAMP`,
      [token]
    );

    if (result.rows.length === 0) {
      errorResponse(res, 'Invalid or expired reset token', 400, 'INVALID_TOKEN');
      return;
    }

    const resetData = result.rows[0];

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password
    await query(
      'UPDATE users SET password = $1 WHERE id = $2',
      [hashedPassword, resetData.user_id]
    );

    // Mark token as used
    await query(
      'UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE token = $1',
      [token]
    );

    // Revoke all existing refresh tokens for security
    await query(
      'DELETE FROM refresh_tokens WHERE user_id = $1',
      [resetData.user_id]
    );

    successResponse(res, { message: 'Password reset successfully' }, 'Password has been reset');
  } catch (error) {
    logger.error('Confirm reset password error', { error });
    errorResponse(res, 'Failed to reset password', 500, 'RESET_PASSWORD_FAILED');
  }
};
