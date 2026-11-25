const logger = require('../config/logger');

// Express treats a middleware as an error handler only when it has exactly 4 parameters
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || err.status || 500;
  const log = req.log || logger; // req.log comes from pino-http and includes the request id

  if (statusCode >= 500) {
    log.error({ err }, 'Unexpected server error');
  } else {
    log.warn({ message: err.message }, 'Request failed');
  }

  res.status(statusCode).json({
    success: false,
    // don't leak internal details for 500s
    message: statusCode >= 500 ? 'Something went wrong, please try again later' : err.message,
  });
}

module.exports = errorHandler;