import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { pool } from '../config/db';
import { AppError } from '../utils/AppError';
import type { UserRecord } from '../types/user';

interface UserRow extends RowDataPacket {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  created_at: Date;
}

const USER_COLUMNS = 'id, name, email, password_hash, created_at';

function toUserRecord(row: UserRow): UserRecord {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
  };
}

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  // ? placeholders let mysql2 escape the value, which prevents sql injection
  const [rows] = await pool.execute<UserRow[]>(`SELECT ${USER_COLUMNS} FROM users WHERE email = ? LIMIT 1`, [email]);
  return rows[0] ? toUserRecord(rows[0]) : null;
}

export async function findUserById(id: number): Promise<UserRecord | null> {
  const [rows] = await pool.execute<UserRow[]>(`SELECT ${USER_COLUMNS} FROM users WHERE id = ? LIMIT 1`, [id]);
  return rows[0] ? toUserRecord(rows[0]) : null;
}

export async function createUser(name: string, email: string, passwordHash: string): Promise<number> {
  try {
    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name, email, passwordHash]
    );
    return result.insertId;
  } catch (err) {
    // the unique key on email catches duplicates, even if two signups happen at the same time
    if ((err as { code?: string }).code === 'ER_DUP_ENTRY') {
      throw new AppError('An account with this email already exists', 409);
    }
    throw err;
  }
}
