import mysql, { type ConnectionOptions, type Pool, type PoolConnection } from 'mysql2/promise';

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

const PING_TIMEOUT_MS = 3000;

// rejects if the promise takes longer than ms, so callers never wait forever
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  const timeout = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

export async function pingDatabase(): Promise<void> {
  const pending = pool.getConnection();
  let connection: PoolConnection;

  try {
    connection = await withTimeout(pending, PING_TIMEOUT_MS, 'Getting a database connection');
  } catch (err) {
    // if the connection still shows up after the timeout, hand it back to the pool
    pending.then((late) => late.release()).catch(() => undefined);
    throw err;
  }

  try {
    await withTimeout(connection.ping(), PING_TIMEOUT_MS, 'Database ping');
    connection.release();
  } catch (err) {
    // a connection that failed or hung on ping can't be trusted, so drop it instead of reusing it
    connection.destroy();
    throw err;
  }
}
