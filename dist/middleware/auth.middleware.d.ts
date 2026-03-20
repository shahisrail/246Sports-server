import { Response, NextFunction } from 'express';
import { UserRole, AuthRequest } from '../types';
export declare const authenticate: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const authorize: (...allowedRoles: UserRole[]) => (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const checkAssociationAccess: (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const checkClubAccess: (req: AuthRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.middleware.d.ts.map