import './config/env'; // has to be the first import so the other files see the .env values
import type { Server } from 'node:http';
import { app } from './app';
import { logger } from './config/logger';
import { pool, pingDatabase } from './config/db';

const PORT: number = Number(process.env.PORT) || 5000;
const SHUTDOWN_TIMEOUT_MS = 10_000;

let server: Server | undefined;
let shuttingDown = false;

// server.close() only stops new connections. its callback runs once the open requests are done
function closeServer(): Promise<void> {
  return new Promise((resolve) => {
    if (!server) {
      resolve();
      return;
    }
    server.close(() => resolve());
  });
}

async function shutdown(reason: string, exitCode: number = 0): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info(`${reason}, shutting down`);

  // if a request never finishes, don't hang forever
  const forceExit = setTimeout(() => {
    logger.error('Shutdown took too long, forcing exit');
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);
  forceExit.unref();

  try {
    await closeServer();
    await pool.end();
  } catch (err) {
    logger.error({ err }, 'Error during shutdown');
    exitCode = 1;
  }
  process.exit(exitCode);
}

async function start(): Promise<void> {
  try {
    await pingDatabase();
    logger.info('Connected to MySQL');
  } catch (err) {
    logger.fatal({ err }, 'Could not connect to MySQL, check the DB_ values in .env');
    process.exit(1);
  }

  // express 5 passes listen errors (like port already in use) to this callback
  server = app.listen(PORT, (error?: Error) => {
    if (error) {
      logger.fatal({ err: error }, `Could not start the server on port ${PORT}`);
      void shutdown('Server failed to start', 1);
      return;
    }
    logger.info(`Server running on http://localhost:${PORT}`);
  });
}

process.on('SIGINT', () => void shutdown('SIGINT received'));
process.on('SIGTERM', () => void shutdown('SIGTERM received'));

// a promise can reject with anything, not only an Error, so reason is unknown
process.on('unhandledRejection', (reason: unknown) => {
  logger.error({ err: reason }, 'Unhandled promise rejection');
  void shutdown('Unhandled promise rejection', 1);
});

process.on('uncaughtException', (err: Error) => {
  logger.fatal({ err }, 'Uncaught exception');
  process.exit(1);
});

void start();
