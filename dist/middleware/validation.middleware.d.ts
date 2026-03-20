import { Request, Response, NextFunction } from 'express';
export declare const validateRegister: (req: Request, res: Response, next: NextFunction) => void;
export declare const validateLogin: (req: Request, res: Response, next: NextFunction) => void;
export declare const validateUUID: (paramName: string) => (req: Request, res: Response, next: NextFunction) => void;
export declare const validateCreateClub: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=validation.middleware.d.ts.map