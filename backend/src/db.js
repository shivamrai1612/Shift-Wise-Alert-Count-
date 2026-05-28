import pg from 'pg';
import { newDb } from 'pg-mem';

const { Pool } = pg;

function resolveDbMode() {
  if (process.env.VERCEL === '1') return 'postgres';
  if (process.env.DATABASE_URL && process.env.DATABASE_URL !== 'memory') {
    return 'postgres';
  }
  if (process.env.USE_MEMORY_DB === 'true') return 'memory';
  if (process.env.USE_SQLITE === 'false') return 'postgres';
  return 'sqlite';
}

export const dbMode = resolveDbMode();
export const useMemoryDb = dbMode === 'memory';
export const useSqlite = dbMode === 'sqlite';
export const usePostgres = dbMode === 'postgres';

let pool;
let sqliteModule;

if (useMemoryDb) {
  const mem = newDb();
  const adapter = mem.adapters.createPg();
  pool = new adapter.Pool();
  console.log('Using in-memory database (data will NOT persist on restart)');
} else if (useSqlite) {
  sqliteModule = await import('./db/sqlite.js');
} else {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL is required. For local dev, use SQLite (default) or set DATABASE_URL.'
    );
  }
  const needsSsl =
    process.env.DB_SSL === 'true' ||
    process.env.VERCEL === '1' ||
    /neon\.tech|supabase|render\.com|amazonaws\.com/i.test(
      process.env.DATABASE_URL
    );
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: needsSsl ? { rejectUnauthorized: false } : false,
  });
  pool.on('error', (err) => {
    console.error('Unexpected database error', err);
  });
  console.log('Using PostgreSQL database');
}

export async function query(text, params) {
  if (useSqlite) {
    return sqliteModule.query(text, params);
  }
  return pool.query(text, params);
}

export async function initDb() {
  if (useSqlite) {
    return sqliteModule.initDb();
  }
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS shift_entries (
        id              SERIAL PRIMARY KEY,
        shift_name      VARCHAR(100) NOT NULL,
        p0_count        INTEGER NOT NULL DEFAULT 0 CHECK (p0_count >= 0),
        p1_count        INTEGER NOT NULL DEFAULT 0 CHECK (p1_count >= 0),
        p2_count        INTEGER NOT NULL DEFAULT 0 CHECK (p2_count >= 0),
        p3_count        INTEGER NOT NULL DEFAULT 0 CHECK (p3_count >= 0),
        p4_count        INTEGER NOT NULL DEFAULT 0 CHECK (p4_count >= 0),
        p5_count        INTEGER NOT NULL DEFAULT 0 CHECK (p5_count >= 0),
        escalated_count INTEGER NOT NULL DEFAULT 0 CHECK (escalated_count >= 0),
        silenced_count  INTEGER NOT NULL DEFAULT 0 CHECK (silenced_count >= 0),
        entry_date      DATE NOT NULL DEFAULT CURRENT_DATE,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_shift_entries_date ON shift_entries (entry_date DESC);
      CREATE INDEX IF NOT EXISTS idx_shift_entries_name ON shift_entries (shift_name);
    `);
  } finally {
    client.release();
  }
}

export default pool;
