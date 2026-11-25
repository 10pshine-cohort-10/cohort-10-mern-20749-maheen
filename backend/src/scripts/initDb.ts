import '../config/env';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import mysql, { type Connection } from 'mysql2/promise';
import { dbConfig } from '../config/db';
import { logger } from '../config/logger';

// creates the tables from db/schema.sql. run with: npm run db:init
async function initDb(): Promise<void> {
  let connection: Connection | undefined;

  try {
    const schemaPath = path.join(__dirname, '..', '..', 'db', 'schema.sql');
    const sql = await readFile(schemaPath, 'utf8');

    // multipleStatements lets one query() run the whole file. only used here, never in the app pool
    connection = await mysql.createConnection({ ...dbConfig, multipleStatements: true });
    await connection.query(sql);
    logger.info('Database tables are ready');
  } catch (err) {
    logger.error({ err }, 'Failed to create database tables');
    process.exitCode = 1;
  } finally {
    if (connection) {
      await connection.end().catch((err: unknown) => logger.warn({ err }, 'Could not close the connection'));
    }
  }
}

void initDb();
