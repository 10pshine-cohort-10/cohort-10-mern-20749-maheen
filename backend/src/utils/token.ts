import jwt from 'jsonwebtoken';
import { AppError } from './AppError';

export const AUTH_COOKIE = 'token';
export const TOKEN_TTL_SECONDS = 60 * 60 * 24; // 1 day

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set');
  }
  return secret;
}

export function signToken(userId: number): string {
  return jwt.sign({}, getSecret(), {
    subject: String(userId),
    expiresIn: TOKEN_TTL_SECONDS,
    algorithm: 'HS256',
  });
}

// returns the user id from a valid token, otherwise throws a 401
export function verifyToken(token: string): number {
  let payload: string | jwt.JwtPayload;
  try {
    // pin the algorithm so a token signed some other way is rejected
    payload = jwt.verify(token, getSecret(), { algorithms: ['HS256'] });
  } catch {
    throw new AppError('Your session has expired, please log in again', 401);
  }

  const userId = typeof payload === 'string' ? NaN : Number(payload.sub);
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new AppError('Your session has expired, please log in again', 401);
  }
  return userId;
}
