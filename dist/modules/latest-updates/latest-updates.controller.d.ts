import { Response } from 'express';
import { AuthRequest } from '../../types';
type ExtractedUpdate = {
    id?: string;
    title: string;
    description?: string;
    sport?: string;
    event_type?: string;
    start_date: string;
    end_date?: string;
    time?: string;
    venue?: string;
    location?: string;
    home_team?: string;
    away_team?: string;
    source_file?: string;
    confidence_score?: number;
};
export declare const getLatestUpdates: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getLatestUpdateById: (req: AuthRequest, res: Response) => Promise<void>;
export declare const importLatestUpdates: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateLatestUpdate: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteLatestUpdate: (req: AuthRequest, res: Response) => Promise<void>;
export declare function parseDatedUpdates(text: string): ExtractedUpdate[];
export {};
//# sourceMappingURL=latest-updates.controller.d.ts.map