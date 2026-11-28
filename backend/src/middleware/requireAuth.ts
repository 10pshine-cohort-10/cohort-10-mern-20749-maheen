import type { RequestHandler } from 'express';
import { findUserById } from '../repositories/userRepository';
import { AppError } from '../utils/AppError';
import { AUTH_COOKIE, verifyToken } from '../utils/token';
import { toPublicUser } from '../types/user';

// protects a route: only lets the request through if it has a valid login cookie
export const requireAuth: RequestHandler = async (req, _res, next) => {
  try {
    const token: unknown = req.cookies?.[AUTH_COOKIE];
    if (typeof token !== 'string' || token.length === 0) {
      throw new AppError('Please log in to continue', 401);
    }

    const userId = verifyToken(token);

    // the account could have been deleted after the token was issued
    const user = await findUserById(userId);
    if (!user) {
      throw new AppError('Please log in to continue', 401);
    }

    req.user = toPublicUser(user);
    next();
  } catch (err) {
    next(err);
  }
};
