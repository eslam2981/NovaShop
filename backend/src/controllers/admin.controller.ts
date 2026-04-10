import { Request, Response, NextFunction } from 'express';
import { getAdminStats } from '../services/admin.service';

export const getStats = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await getAdminStats();
    res.status(200).json({
      status: 'success',
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};
