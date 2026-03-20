import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
/**
 * Tenant Isolation Middleware
 * Automatically injects association_id filtering for non-super-admin users
 */
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
export declare const setupTenantContext: (req: AuthRequest, _res: Response, next: NextFunction) => void;
/**
 * Enforces tenant isolation at query level
 * Adds association_id filter to prevent cross-tenant data access
 *
 * Usage: Apply to routes that need tenant isolation
 */
export declare const enforceTenantIsolation: (req: AuthRequest, _res: Response, next: NextFunction) => void;
/**
 * Validates association_id in request body matches user's tenant
 */
export declare const validateAssociationAccess: (req: AuthRequest, _res: Response, next: NextFunction) => void;
/**
 * Adds tenant filtering to database queries
 * Helper function for controllers
 */
export declare const buildTenantFilter: (req: AuthRequest) => string;
/**
 * Validates resource belongs to user's tenant before update/delete
 */
export declare const validateResourceOwnership: (associationIdColumn?: string) => (req: AuthRequest, _res: Response, next: NextFunction) => void;
/**
 * Audit log helper that includes tenant context
 */
export declare const logTenantAction: (req: AuthRequest, action: string, entity: string, entityId: string, details: any) => any;
//# sourceMappingURL=tenant.middleware.d.ts.map