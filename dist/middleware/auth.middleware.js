"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkClubAccess = exports.checkAssociationAccess = exports.authorize = exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
const responseHandler_1 = require("../utils/responseHandler");
const types_1 = require("../types");
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        console.log('Auth middleware called for path:', req.path);
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('No auth header or invalid format');
            (0, responseHandler_1.errorResponse)(res, 'Authentication required', 401);
            return;
        }
        const token = authHeader.substring(7);
        console.log('Token received, verifying...');
        const payload = (0, jwt_1.verifyToken)(token);
        console.log('Auth Middleware - JWT Payload:', payload);
        req.user = payload;
        console.log('User set in request:', req.user);
        next();
    }
    catch (error) {
        console.error('Auth Middleware - Error:', error);
        (0, responseHandler_1.errorResponse)(res, 'Invalid or expired token', 401, 'AUTH_FAILED');
    }
};
exports.authenticate = authenticate;
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            (0, responseHandler_1.errorResponse)(res, 'Authentication required', 401);
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            (0, responseHandler_1.errorResponse)(res, 'You do not have permission to perform this action', 403, 'FORBIDDEN');
            return;
        }
        next();
    };
};
exports.authorize = authorize;
// Check if user has access to specific association
const checkAssociationAccess = (req, res, next) => {
    if (!req.user) {
        (0, responseHandler_1.errorResponse)(res, 'Authentication required', 401);
        return;
    }
    // Super Admin has access to everything
    if (req.user.role === types_1.UserRole.SUPER_ADMIN) {
        next();
        return;
    }
    const requestedAssociationId = req.params.associationId || req.body.association_id;
    // Association Admin can only access their own association
    if (req.user.role === types_1.UserRole.ASSOCIATION_ADMIN) {
        if (req.user.associationId !== requestedAssociationId) {
            (0, responseHandler_1.errorResponse)(res, 'Access denied to this association', 403, 'FORBIDDEN');
            return;
        }
    }
    next();
};
exports.checkAssociationAccess = checkAssociationAccess;
// Check if user has access to specific club
const checkClubAccess = (req, res, next) => {
    if (!req.user) {
        (0, responseHandler_1.errorResponse)(res, 'Authentication required', 401);
        return;
    }
    // Super Admin has access to everything
    if (req.user.role === types_1.UserRole.SUPER_ADMIN) {
        next();
        return;
    }
    const requestedClubId = req.params.clubId || req.body.club_id;
    // Club Admin can only access their own club
    if (req.user.role === types_1.UserRole.CLUB_ADMIN) {
        if (req.user.clubId !== requestedClubId) {
            (0, responseHandler_1.errorResponse)(res, 'Access denied to this club', 403, 'FORBIDDEN');
            return;
        }
    }
    // Association Admin can access clubs in their association
    if (req.user.role === types_1.UserRole.ASSOCIATION_ADMIN) {
        // This would require a database query to verify club belongs to association
        // For now, let it pass and handle in controller
    }
    next();
};
exports.checkClubAccess = checkClubAccess;
//# sourceMappingURL=auth.middleware.js.map