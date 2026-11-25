import mysql, { type ConnectionOptions, type Pool } from 'mysql2/promise';

export const dbConfig: ConnectionOptions = {
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// a pool keeps a few connections open and reuses them instead of connecting on every query
export const pool: Pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
});

export async function pingDatabase(): Promise<void> {
  const connection = await pool.getConnection();
  try {
    await connection.ping();
  } finally {
    connection.release();
  }
}
