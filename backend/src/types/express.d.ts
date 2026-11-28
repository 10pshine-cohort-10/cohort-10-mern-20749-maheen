import type { PublicUser } from './user';

// lets us use req.user (set by requireAuth) with proper types
declare global {
  namespace Express {
    interface Request {
      user?: PublicUser;
    }
  }
}

export {};
