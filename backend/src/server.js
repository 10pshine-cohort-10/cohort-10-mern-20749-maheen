require('dotenv').config({ quiet: true }); // must run first so every file sees the .env values

const app = require('./app');
const logger = require('./config/logger');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
});

// catch errors that escaped everything else, log them, then shut down
process.on('unhandledRejection', (reason) => {
  logger.error({ err: reason }, 'Unhandled promise rejection');
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught exception');
  process.exit(1);
});