import type { IncomingMessage, ServerResponse } from 'node:http';
import express, { type Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import pinoHttp from 'pino-http';
import type { LevelWithSilent } from 'pino';

import { logger } from './config/logger';
import { healthRouter } from './routes/healthRoutes';
import { notFound } from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';

export const app: Express = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL ?? 'http://localhost:5173' }));

app.use(
  pinoHttp({
    logger,
    customLogLevel: (_req: IncomingMessage, res: ServerResponse, err?: Error): LevelWithSilent => {
      if (err || res.statusCode >= 500) return 'error';
      if (res.statusCode >= 400) return 'warn';
      return 'info';
    },
  })
);

app.use(express.json({ limit: '1mb' }));

app.use('/api/health', healthRouter);

// these two must come last
app.use(notFound);
app.use(errorHandler);
