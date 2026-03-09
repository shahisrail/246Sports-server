import { Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { errorResponse } from '../utils/responseHandler';
import { UserRole, AuthRequest } from '../types';

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    console.log('Auth middleware called for path:', req.path);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No auth header or invalid format');
      errorResponse(res, 'Authentication required', 401);
      return;
    }

    const token = authHeader.substring(7);
    console.log('Token received, verifying...');
    const payload = verifyToken(token);

    console.log('Auth Middleware - JWT Payload:', payload);

    req.user = payload;
    console.log('User set in request:', req.user);
    next();
  } catch (error) {
    console.error('Auth Middleware - Error:', error);
    errorResponse(res, 'Invalid or expired token', 401, 'AUTH_FAILED');
  }
};

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      errorResponse(res, 'Authentication required', 401);
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      errorResponse(
        res,
        'You do not have permission to perform this action',
        403,
        'FORBIDDEN'
      );
      return;
    }

    next();
  };
};

// Check if user has access to specific association
export const checkAssociationAccess = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    errorResponse(res, 'Authentication required', 401);
    return;
  }

  // Super Admin has access to everything
  if (req.user.role === UserRole.SUPER_ADMIN) {
    next();
    return;
  }

  const requestedAssociationId = req.params.associationId || req.body.association_id;

  // Association Admin can only access their own association
  if (req.user.role === UserRole.ASSOCIATION_ADMIN) {
    if (req.user.associationId !== requestedAssociationId) {
      errorResponse(res, 'Access denied to this association', 403, 'FORBIDDEN');
      return;
    }
  }

  next();
};

// Check if user has access to specific club
export const checkClubAccess = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    errorResponse(res, 'Authentication required', 401);
    return;
  }

  // Super Admin has access to everything
  if (req.user.role === UserRole.SUPER_ADMIN) {
    next();
    return;
  }

  const requestedClubId = req.params.clubId || req.body.club_id;

  // Club Admin can only access their own club
  if (req.user.role === UserRole.CLUB_ADMIN) {
    if (req.user.clubId !== requestedClubId) {
      errorResponse(res, 'Access denied to this club', 403, 'FORBIDDEN');
      return;
    }
  }

  // Association Admin can access clubs in their association
  if (req.user.role === UserRole.ASSOCIATION_ADMIN) {
    // This would require a database query to verify club belongs to association
    // For now, let it pass and handle in controller
  }

  next();
};
