import { Response } from 'express';
import { AuthRequest } from '../../types';
import * as statsController from './stats.controller';

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  await statsController.getDashboardStats(req, res);
};
