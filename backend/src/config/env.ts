import { config } from 'dotenv';

config({ quiet: true });

// fail early with a clear message instead of a confusing mysql error later
const required = ['DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}
