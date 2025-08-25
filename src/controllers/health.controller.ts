import { Request, Response } from 'express';
import { Logger } from '../utils/logger';

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the current health status of the application
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Application is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 *             example:
 *               status: "healthy"
 *               timestamp: "2025-08-25T01:30:00.000Z"
 *               version: "1.0.0"
 *               uptime: 3600
 */
export const healthCheck = (req: Request, res: Response) => {
  Logger.info('Health', 'check', 'Health check requested');

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptime: process.uptime(),
  });
};
