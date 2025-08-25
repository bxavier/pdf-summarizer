import { Request, Response } from 'express';
import { Logger } from '../utils/logger';

export const healthCheck = (req: Request, res: Response) => {
  Logger.info('Health', 'check', 'Health check requested');

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptime: process.uptime(),
  });
};
