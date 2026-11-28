import type { ErrorRequestHandler } from 'express';
import { logger } from '../config/logger';

// extra fields that errors from our code or from express may carry
interface HttpError extends Error {
  statusCode?: number;
  status?: number;
  type?: string;
}

// express only treats this as an error handler because it has 4 params, so keep _next
export const errorHandler: ErrorRequestHandler = (err: HttpError, req, res, _next) => {
  const statusCode = err.statusCode ?? err.status ?? 500;
  const log = req.log ?? logger;

  // body parser errors can quote the raw request body (passwords too), so don't log them as is
  const message = err.type === 'entity.parse.failed' ? 'Malformed JSON in request body' : err.message;

  if (statusCode >= 500) {
    log.error({ err }, 'Unexpected server error');
  } else {
    log.warn({ statusCode, message }, 'Request failed');
  }

  res.status(statusCode).json({
    success: false,
    message: statusCode >= 500 ? 'Something went wrong, please try again later' : message,
  });
};
