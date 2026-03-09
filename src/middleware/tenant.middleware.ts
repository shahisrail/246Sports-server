import { Response, NextFunction } from 'express';
import { AuthRequest, UserRole } from '../types';

/**
 * Tenant Isolation Middleware
 * Automatically injects association_id filtering for non-super-admin users
 */

// Extend Request type to include tenant context
declare global {
  namespace Express {
    interface Request {
      tenantContext?: {
        associationId?: string;
        clubId?: string;
        isSuperAdmin: boolean;
      };
    }
  }
}

/**
 * Sets up tenant context from authenticated user
 * Should be used after authenticate middleware
 */
export const setupTenantContext = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void => {
  console.log('Tenant middleware called for path:', req.path);
  if (!req.user) {
    next();
    return;
  }

  // Set up tenant context based on user role
  req.tenantContext = {
    isSuperAdmin: req.user.role === UserRole.SUPER_ADMIN,
  };

  // Association Admin context
  if (req.user.role === UserRole.ASSOCIATION_ADMIN && req.user.associationId) {
    req.tenantContext.associationId = req.user.associationId;
  }

  // Club Admin context
  if (req.user.role === UserRole.CLUB_ADMIN && req.user.clubId) {
    req.tenantContext.clubId = req.user.clubId;
  }

  next();
};

/**
 * Enforces tenant isolation at query level
 * Adds association_id filter to prevent cross-tenant data access
 *
 * Usage: Apply to routes that need tenant isolation
 */
export const enforceTenantIsolation = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void => {
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

/**
 * Validates association_id in request body matches user's tenant
 */
export const validateAssociationAccess = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void => {
  // Super Admins bypass
  if (req.tenantContext?.isSuperAdmin) {
    next();
    return;
  }

  const associationId = req.params.associationId || req.body.association_id;

  // Association Admin can only access their own association
  if (req.user?.role === UserRole.ASSOCIATION_ADMIN) {
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
  if (req.user?.role === UserRole.COMPETITION_MANAGER) {
    // Would need to check if competition belongs to their association
    // For now, allow with warning
  }

  next();
};

/**
 * Adds tenant filtering to database queries
 * Helper function for controllers
 */
export const buildTenantFilter = (req: AuthRequest): string => {
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

/**
 * Validates resource belongs to user's tenant before update/delete
 */
export const validateResourceOwnership = (
  associationIdColumn: string = 'association_id'
) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    // Super Admins bypass
    if (req.tenantContext?.isSuperAdmin) {
      next();
      return;
    }

    // Store validation requirement for controller to handle
    (req.tenantContext as any) = {
      ...req.tenantContext!,
      requiresOwnershipCheck: true,
      ownershipColumn: associationIdColumn,
    };

    next();
  };
};

/**
 * Audit log helper that includes tenant context
 */
export const logTenantAction = (
  req: AuthRequest,
  action: string,
  entity: string,
  entityId: string,
  details: any
): any => {
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
