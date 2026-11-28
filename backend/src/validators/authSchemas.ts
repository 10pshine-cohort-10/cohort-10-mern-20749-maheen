import { z } from 'zod';

const email = z
  .string({ error: 'Email is required' })
  .trim()
  .toLowerCase()
  .max(255, 'Email is too long')
  .pipe(z.email({ error: 'Please enter a valid email' }));

// bcrypt only looks at the first 72 bytes, so longer passwords would be silently cut
const password = z
  .string({ error: 'Password is required' })
  .min(8, 'Password must be at least 8 characters')
  .refine((value) => Buffer.byteLength(value, 'utf8') <= 72, 'Password is too long');

export const signupSchema = z.object({
  name: z
    .string({ error: 'Name is required' })
    .trim()
    .min(1, 'Name is required')
    .max(100, 'Name is too long'),
  email,
  password,
});

export const loginSchema = z.object({
  email,
  // don't apply the signup rules here, just check something was sent
  password: z.string({ error: 'Password is required' }).min(1, 'Password is required'),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
