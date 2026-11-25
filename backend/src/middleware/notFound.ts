import type { RequestHandler } from 'express';
import { AppError } from '../utils/AppError';

export const notFound: RequestHandler = (req, _res, next) => {
  // req.path has no query string, so things like ?token=... never end up in the message or logs
  next(new AppError(`Route not found: ${req.method} ${req.path}`, 404));
};
