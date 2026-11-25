import '../config/env';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import mysql from 'mysql2/promise';
import { dbConfig } from '../config/db';
import { logger } from '../config/logger';

// creates the tables from db/schema.sql. run with: npm run db:init
async function initDb(): Promise<void> {
  const schemaPath = path.join(__dirname, '..', '..', 'db', 'schema.sql');
  const sql = await readFile(schemaPath, 'utf8');

  // multipleStatements lets one query() run the whole file. only used here, never in the app pool
  const connection = await mysql.createConnection({ ...dbConfig, multipleStatements: true });
  try {
    await connection.query(sql);
    logger.info('Database tables are ready');
  } finally {
    await connection.end();
  }
}

initDb().catch((err: unknown) => {
  logger.error({ err }, 'Failed to create database tables');
  process.exitCode = 1;
});
