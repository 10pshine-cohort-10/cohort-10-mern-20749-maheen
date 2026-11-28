import { config } from 'dotenv';

config({ quiet: true });

// fail early with a clear message instead of a confusing error later
const required = ['DB_USER', 'DB_PASSWORD', 'DB_NAME', 'JWT_SECRET'];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

// a short secret can be brute forced, which would let someone forge login tokens
if ((process.env.JWT_SECRET ?? '').length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters long');
}
