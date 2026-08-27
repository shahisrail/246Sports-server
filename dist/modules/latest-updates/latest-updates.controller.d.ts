import { Response } from 'express';
import { AuthRequest } from '../../types';
export declare const getLatestUpdates: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getLatestUpdateById: (req: AuthRequest, res: Response) => Promise<void>;
export declare const importLatestUpdates: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateLatestUpdate: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteLatestUpdate: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=latest-updates.controller.d.ts.map