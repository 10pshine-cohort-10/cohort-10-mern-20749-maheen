import './config/env'; // has to be the first import so the other files see the .env values
import { app } from './app';
import { logger } from './config/logger';

const PORT: number = Number(process.env.PORT) || 5000;

const server = app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
});

// a promise can reject with anything, not only an Error, so reason is unknown
process.on('unhandledRejection', (reason: unknown) => {
  logger.error({ err: reason }, 'Unhandled promise rejection');
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err: Error) => {
  logger.fatal({ err }, 'Uncaught exception');
  process.exit(1);
});
