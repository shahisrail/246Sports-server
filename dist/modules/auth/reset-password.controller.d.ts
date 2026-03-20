import { Response } from 'express';
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
export declare const validateResetToken: (req: any, res: Response) => Promise<void>;
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
export declare const confirmResetPassword: (req: any, res: Response) => Promise<void>;
//# sourceMappingURL=reset-password.controller.d.ts.map