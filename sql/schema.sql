-- Support Shift Tracker — PostgreSQL schema

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

CREATE INDEX IF NOT EXISTS idx_shift_entries_date ON shift_entries (entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_shift_entries_name ON shift_entries (shift_name);
CREATE INDEX IF NOT EXISTS idx_shift_entries_created ON shift_entries (created_at DESC);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_shift_entries_updated ON shift_entries;
CREATE TRIGGER trg_shift_entries_updated
  BEFORE UPDATE ON shift_entries
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
