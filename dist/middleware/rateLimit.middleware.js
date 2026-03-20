"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCustomRateLimit = exports.publicRateLimit = exports.searchRateLimit = exports.writeRateLimit = exports.authRateLimit = exports.apiRateLimit = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const types_1 = require("../types");
const jwt_1 = require("../utils/jwt");
/**
 * Rate Limiting Middleware
 * Protects against brute force attacks and API abuse
 */
// Helper function to check if user is admin
const isAdmin = (req) => {
    // First check if req.user is already set (by auth middleware)
    if (req.user) {
        return [
            types_1.UserRole.SUPER_ADMIN,
            types_1.UserRole.ASSOCIATION_ADMIN,
            types_1.UserRole.CLUB_ADMIN
        ].includes(req.user.role);
    }
    // If no req.user, check the Authorization header directly
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return false;
    }
    try {
        const token = authHeader.substring(7);
        const payload = (0, jwt_1.verifyToken)(token);
        // Check if the user has an admin role
        return [
            types_1.UserRole.SUPER_ADMIN,
            types_1.UserRole.ASSOCIATION_ADMIN,
            types_1.UserRole.CLUB_ADMIN
        ].includes(payload.role);
    }
    catch (error) {
        // Invalid token - don't skip rate limiting
        return false;
    }
};
// General API rate limit
exports.apiRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.',
        error: 'RATE_LIMIT_EXCEEDED',
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    skip: (req) => {
        // Skip rate limiting for admin users
        return isAdmin(req);
    },
    keyGenerator: (req) => {
        // Use IP + user ID for authenticated users
        return req.user?.userId
            ? `user:${req.user.userId}`
            : `ip:${req.socket.remoteAddress}`;
    },
});
// Strict rate limit for authentication endpoints
exports.authRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    skipSuccessfulRequests: true, // Don't count successful requests
    message: {
        success: false,
        message: 'Too many login attempts, please try again later.',
        error: 'AUTH_RATE_LIMIT_EXCEEDED',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
// Moderate rate limit for write operations (POST, PUT, DELETE)
exports.writeRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 30, // 30 write operations per window
    message: {
        success: false,
        message: 'Too many write operations, please slow down.',
        error: 'WRITE_RATE_LIMIT_EXCEEDED',
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Skip rate limiting for admin users
        return isAdmin(req);
    },
});
// Search rate limit
exports.searchRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 20, // 20 searches per minute
    message: {
        success: false,
        message: 'Too many search requests, please slow down.',
        error: 'SEARCH_RATE_LIMIT_EXCEEDED',
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Skip rate limiting for admin users
        return isAdmin(req);
    },
});
// Public API rate limit (for unauthenticated requests)
exports.publicRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // 50 requests per window for public users
    message: {
        success: false,
        message: 'Too many requests, please authenticate for higher limits.',
        error: 'PUBLIC_RATE_LIMIT_EXCEEDED',
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Skip if user is authenticated
        return !!req.user;
    },
});
/**
 * Custom rate limiter for expensive operations
 * @param requests - Number of requests allowed
 * @param windowMs - Time window in milliseconds
 */
const createCustomRateLimit = (requests, windowMs) => {
    return (0, express_rate_limit_1.default)({
        windowMs,
        max: requests,
        message: {
            success: false,
            message: `Rate limit exceeded: ${requests} requests per ${windowMs / 1000} seconds`,
            error: 'CUSTOM_RATE_LIMIT_EXCEEDED',
        },
        standardHeaders: true,
        legacyHeaders: false,
    });
};
exports.createCustomRateLimit = createCustomRateLimit;
//# sourceMappingURL=rateLimit.middleware.js.map