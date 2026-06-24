"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const emailController = __importStar(require("./email.controller"));
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Email
 *   description: Email management endpoints
 */
// Send password reset email (public, no auth required)
router.post('/send-password-reset', emailController.sendPasswordReset);
// All email management routes below require authentication
router.use(auth_middleware_1.authenticate);
// Send invitation email (ASSOCIATION_ADMIN and SUPER_ADMIN only)
router.post('/send-invitation', emailController.sendInvitation);
// Send welcome email (authenticated users)
router.post('/send-welcome', emailController.sendWelcome);
// Verify email configuration (SUPER_ADMIN only)
router.get('/verify-config', emailController.verifyEmailConfig);
exports.default = router;
//# sourceMappingURL=email.routes.js.map