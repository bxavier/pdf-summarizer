import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { Logger } from '../utils/logger';

export const errorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
  Logger.error('Error', 'handler', 'Unhandled error', error);

  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large (max 50MB)' });
    }
    return res.status(400).json({ error: 'File upload error' });
  }

  res.status(500).json({ error: 'Internal server error' });
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
};
