import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { toSqliteSql } from './sqlCompat.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../../..');

export function getSqlitePath() {
  const configured = process.env.SQLITE_PATH || 'data/shifts.db';
  return path.isAbsolute(configured)
    ? configured
    : path.join(PROJECT_ROOT, configured);
}

let db;

export function getDb() {
  if (!db) {
    const dbPath = getSqlitePath();
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    console.log(`Using SQLite database: ${dbPath}`);
  }
  return db;
}

export async function query(text, params = []) {
  const sql = toSqliteSql(text);
  const database = getDb();
  const upper = sql.trim().toUpperCase();

  if (upper.startsWith('SELECT')) {
    const rows = database.prepare(sql).all(...params);
    return { rows, rowCount: rows.length };
  }

  if (upper.startsWith('INSERT') && upper.includes('RETURNING')) {
    const insertSql = sql.replace(/\s+RETURNING\s+\*/i, '');
    const info = database.prepare(insertSql).run(...params);
    const row = database
      .prepare('SELECT * FROM shift_entries WHERE id = ?')
      .get(info.lastInsertRowid);
    return { rows: row ? [row] : [], rowCount: info.changes };
  }

  if (upper.startsWith('UPDATE') && upper.includes('RETURNING')) {
    const id = params[0];
    const updateSql = sql.replace(/\s+RETURNING\s+\*/i, '');
    database.prepare(updateSql).run(...params);
    const row = database.prepare('SELECT * FROM shift_entries WHERE id = ?').get(id);
    return { rows: row ? [row] : [], rowCount: row ? 1 : 0 };
  }

  if (upper.startsWith('DELETE') && upper.includes('RETURNING')) {
    const id = params[0];
    const row = database.prepare('SELECT * FROM shift_entries WHERE id = ?').get(id);
    database.prepare('DELETE FROM shift_entries WHERE id = ?').run(id);
    return { rows: row ? [{ id: row.id }] : [], rowCount: row ? 1 : 0 };
  }

  const info = database.prepare(sql).run(...params);
  return { rows: [], rowCount: info.changes };
}

export async function initDb() {
  const database = getDb();
  database.exec(`
    CREATE TABLE IF NOT EXISTS shift_entries (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      shift_name      TEXT NOT NULL,
      p0_count        INTEGER NOT NULL DEFAULT 0 CHECK (p0_count >= 0),
      p1_count        INTEGER NOT NULL DEFAULT 0 CHECK (p1_count >= 0),
      p2_count        INTEGER NOT NULL DEFAULT 0 CHECK (p2_count >= 0),
      p3_count        INTEGER NOT NULL DEFAULT 0 CHECK (p3_count >= 0),
      p4_count        INTEGER NOT NULL DEFAULT 0 CHECK (p4_count >= 0),
      p5_count        INTEGER NOT NULL DEFAULT 0 CHECK (p5_count >= 0),
      escalated_count INTEGER NOT NULL DEFAULT 0 CHECK (escalated_count >= 0),
      silenced_count  INTEGER NOT NULL DEFAULT 0 CHECK (silenced_count >= 0),
      entry_date      TEXT NOT NULL DEFAULT (date('now')),
      created_at      TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_shift_entries_date ON shift_entries (entry_date DESC);
    CREATE INDEX IF NOT EXISTS idx_shift_entries_name ON shift_entries (shift_name);
  `);
}
