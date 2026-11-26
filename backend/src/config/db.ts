import type { Socket } from 'node:net';
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

// mysql2's types don't expose the underlying socket, so describe just the part we use
interface RawConnection {
  stream?: Socket;
}

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
    // destroy() only half-closes the socket, so a dead server could keep it open. force it shut
    const raw = connection.connection as unknown as RawConnection;
    raw.stream?.destroy();
    throw err;
  }
}
