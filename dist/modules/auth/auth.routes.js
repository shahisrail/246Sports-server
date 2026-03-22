"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const reset_password_controller_1 = require("./reset-password.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const validation_middleware_1 = require("../../middleware/validation.middleware");
const email_controller_1 = require("../email/email.controller");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */
// Public routes
router.post('/register', validation_middleware_1.validateRegister, auth_controller_1.register);
router.post('/login', validation_middleware_1.validateLogin, auth_controller_1.login);
router.post('/forgot-password', email_controller_1.sendPasswordReset);
// Password reset routes (public)
router.post('/reset-password/validate', reset_password_controller_1.validateResetToken);
router.post('/reset-password/confirm', reset_password_controller_1.confirmResetPassword);
// Protected routes
router.get('/me', auth_middleware_1.authenticate, auth_controller_1.getProfile);
router.put('/profile', auth_middleware_1.authenticate, auth_controller_1.updateProfile);
router.post('/change-password', auth_middleware_1.authenticate, auth_controller_1.changePassword);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map