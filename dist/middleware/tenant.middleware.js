"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logTenantAction = exports.validateResourceOwnership = exports.buildTenantFilter = exports.validateAssociationAccess = exports.enforceTenantIsolation = exports.setupTenantContext = void 0;
const types_1 = require("../types");
/**
 * Sets up tenant context from authenticated user
 * Should be used after authenticate middleware
 */
const setupTenantContext = (req, _res, next) => {
    console.log('Tenant middleware called for path:', req.path);
    if (!req.user) {
        next();
        return;
    }
    // Set up tenant context based on user role
    req.tenantContext = {
        isSuperAdmin: req.user.role === types_1.UserRole.SUPER_ADMIN,
    };
    // Association Admin context
    if (req.user.role === types_1.UserRole.ASSOCIATION_ADMIN && req.user.associationId) {
        req.tenantContext.associationId = req.user.associationId;
    }
    // Club Admin context
    if (req.user.role === types_1.UserRole.CLUB_ADMIN && req.user.clubId) {
        req.tenantContext.clubId = req.user.clubId;
    }
    next();
};
exports.setupTenantContext = setupTenantContext;
/**
 * Enforces tenant isolation at query level
 * Adds association_id filter to prevent cross-tenant data access
 *
 * Usage: Apply to routes that need tenant isolation
 */
const enforceTenantIsolation = (req, _res, next) => {
    // Super Admins bypass tenant isolation
    if (req.tenantContext?.isSuperAdmin) {
        next();
        return;
    }
    // Ensure tenant context exists
    if (!req.tenantContext?.associationId && !req.tenantContext?.clubId) {
        _res.status(403).json({
            success: false,
            message: 'Tenant context not found',
            error: 'TENANT_CONTEXT_MISSING',
        });
        return;
    }
    next();
};
exports.enforceTenantIsolation = enforceTenantIsolation;
/**
 * Validates association_id in request body matches user's tenant
 */
const validateAssociationAccess = (req, _res, next) => {
    // Super Admins bypass
    if (req.tenantContext?.isSuperAdmin) {
        next();
        return;
    }
    const associationId = req.params.associationId || req.body.association_id;
    // Association Admin can only access their own association
    if (req.user?.role === types_1.UserRole.ASSOCIATION_ADMIN) {
        if (req.user.associationId !== associationId) {
            _res.status(403).json({
                success: false,
                message: 'Access denied to this association',
                error: 'ASSOCIATION_ACCESS_DENIED',
            });
            return;
        }
    }
    // Competition Manager needs association-level validation
    if (req.user?.role === types_1.UserRole.COMPETITION_MANAGER) {
        // Would need to check if competition belongs to their association
        // For now, allow with warning
    }
    next();
};
exports.validateAssociationAccess = validateAssociationAccess;
/**
 * Adds tenant filtering to database queries
 * Helper function for controllers
 */
const buildTenantFilter = (req) => {
    if (req.tenantContext?.isSuperAdmin) {
        return ''; // No filtering for super admin
    }
    if (req.tenantContext?.associationId) {
        return ` AND association_id = '${req.tenantContext.associationId}'`;
    }
    if (req.tenantContext?.clubId) {
        return ` AND club_id = '${req.tenantContext.clubId}'`;
    }
    return '';
};
exports.buildTenantFilter = buildTenantFilter;
/**
 * Validates resource belongs to user's tenant before update/delete
 */
const validateResourceOwnership = (associationIdColumn = 'association_id') => {
    return (req, _res, next) => {
        // Super Admins bypass
        if (req.tenantContext?.isSuperAdmin) {
            next();
            return;
        }
        // Store validation requirement for controller to handle
        req.tenantContext = {
            ...req.tenantContext,
            requiresOwnershipCheck: true,
            ownershipColumn: associationIdColumn,
        };
        next();
    };
};
exports.validateResourceOwnership = validateResourceOwnership;
/**
 * Audit log helper that includes tenant context
 */
const logTenantAction = (req, action, entity, entityId, details) => {
    return {
        action,
        entity,
        entity_id: entityId,
        details: {
            ...details,
            tenant_context: {
                association_id: req.tenantContext?.associationId,
                club_id: req.tenantContext?.clubId,
                user_role: req.user?.role,
            },
        },
        user_id: req.user?.userId,
        ip_address: req.ip,
        user_agent: req.get('user-agent'),
    };
};
exports.logTenantAction = logTenantAction;
//# sourceMappingURL=tenant.middleware.js.map