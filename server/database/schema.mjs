// Keep this additive initialization compatible with existing player data.
export const schema = `
  PRAGMA foreign_keys = ON;
  PRAGMA journal_mode = WAL;
  PRAGMA busy_timeout = 5000;
  CREATE TABLE IF NOT EXISTS runs (
    id TEXT PRIMARY KEY,
    token_hash BLOB NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS entries (
    id TEXT PRIMARY KEY,
    run_id TEXT NOT NULL UNIQUE REFERENCES runs(id),
    nickname TEXT NOT NULL,
    score INTEGER NOT NULL CHECK(score >= 0 AND score % 50 = 0),
    level INTEGER NOT NULL CHECK(level BETWEEN 1 AND 15),
    completed INTEGER NOT NULL CHECK(completed IN (0, 1)),
    submitted_at TEXT NOT NULL,
    CHECK(completed = 0 OR level = 15)
  );
  CREATE INDEX IF NOT EXISTS ranking
    ON entries(score DESC, level DESC, completed DESC, submitted_at ASC, id ASC);
`;
