import type { CookieOptions, NextFunction, Request, Response } from 'express';
import * as authService from '../services/authService';
import { AUTH_COOKIE, signToken, TOKEN_TTL_SECONDS } from '../utils/token';
import type { LoginInput, SignupInput } from '../validators/authSchemas';

// httpOnly: javascript in the browser can't read it, so an XSS bug can't steal the token
// sameSite strict: the browser won't send it on requests coming from other sites (CSRF protection)
const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/',
};

function setAuthCookie(res: Response, userId: number): void {
  res.cookie(AUTH_COOKIE, signToken(userId), { ...cookieOptions, maxAge: TOKEN_TTL_SECONDS * 1000 });
}

export async function signupHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await authService.signup(req.body as SignupInput);
    setAuthCookie(res, user.id);
    req.log.info({ userId: user.id }, 'User signed up');
    res.status(201).json({ success: true, user });
  } catch (err) {
    next(err);
  }
}

export async function loginHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await authService.login(req.body as LoginInput);
    setAuthCookie(res, user.id);
    req.log.info({ userId: user.id }, 'User logged in');
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
}

export function logoutHandler(req: Request, res: Response): void {
  // clearCookie needs the same options the cookie was set with, otherwise the browser keeps it
  res.clearCookie(AUTH_COOKIE, cookieOptions);
  req.log.info('User logged out');
  res.json({ success: true, message: 'Logged out' });
}

export function meHandler(req: Request, res: Response): void {
  res.json({ success: true, user: req.user });
}
