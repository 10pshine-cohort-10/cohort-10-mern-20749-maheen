import './config/env'; // has to be the first import so the other files see the .env values
import type { Server } from 'node:http';
import { app } from './app';
import { logger } from './config/logger';
import { pool, pingDatabase } from './config/db';

const PORT: number = Number(process.env.PORT) || 5000;

let server: Server | undefined;

async function start(): Promise<void> {
  try {
    await pingDatabase();
    logger.info('Connected to MySQL');
  } catch (err) {
    logger.fatal({ err }, 'Could not connect to MySQL, check the DB_ values in .env');
    process.exit(1);
  }

  server = app.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}`);
  });
}

async function shutdown(signal: string): Promise<void> {
  logger.info(`${signal} received, shutting down`);
  server?.close();
  try {
    await pool.end();
  } catch (err) {
    logger.error({ err }, 'Error while closing the MySQL pool');
  }
  process.exit(0);
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));

// a promise can reject with anything, not only an Error, so reason is unknown
process.on('unhandledRejection', (reason: unknown) => {
  logger.error({ err: reason }, 'Unhandled promise rejection');
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

process.on('uncaughtException', (err: Error) => {
  logger.fatal({ err }, 'Uncaught exception');
  process.exit(1);
});

void start();
