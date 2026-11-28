import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { loginHandler, logoutHandler, meHandler, signupHandler } from '../controllers/authController';
import { requireAuth } from '../middleware/requireAuth';
import { validateBody } from '../middleware/validateBody';
import { AppError } from '../utils/AppError';
import { loginSchema, signupSchema } from '../validators/authSchemas';

// slows down password guessing: 10 attempts per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  handler: (_req, _res, next) => {
    next(new AppError('Too many attempts, please try again in a few minutes', 429));
  },
});

export const authRouter: Router = Router();

authRouter.post('/signup', authLimiter, validateBody(signupSchema), signupHandler);
authRouter.post('/login', authLimiter, validateBody(loginSchema), loginHandler);
authRouter.post('/logout', logoutHandler);
authRouter.get('/me', requireAuth, meHandler);
