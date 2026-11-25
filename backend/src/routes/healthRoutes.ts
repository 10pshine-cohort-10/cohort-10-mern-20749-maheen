import { Router, type Request, type Response } from 'express';
import { pingDatabase } from '../config/db';

export const healthRouter: Router = Router();

healthRouter.get('/', async (req: Request, res: Response) => {
  try {
    await pingDatabase();
    res.json({ status: 'ok', database: 'up', uptime: process.uptime() });
  } catch (err) {
    req.log.error({ err }, 'Health check failed, database is unreachable');
    res.status(503).json({ status: 'degraded', database: 'down', uptime: process.uptime() });
  }
});
