// Separate table namespace; migration is additive and never resets player scores.
export const postgresSchema = [
  `CREATE TABLE IF NOT EXISTS sa_runs (
    id TEXT PRIMARY KEY, token_hash TEXT NOT NULL, created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS sa_entries (
    id TEXT PRIMARY KEY,
    run_id TEXT NOT NULL UNIQUE REFERENCES sa_runs(id),
    nickname TEXT NOT NULL,
    score BIGINT NOT NULL CHECK (score >= 0 AND score % 50 = 0 AND score <= 9007199254740991),
    level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 15),
    completed INTEGER NOT NULL CHECK (completed IN (0, 1)),
    submitted_at TEXT NOT NULL,
    CHECK (completed = 0 OR level = 15)
  )`,
  `CREATE INDEX IF NOT EXISTS sa_ranking ON sa_entries
    (score DESC, level DESC, completed DESC, submitted_at ASC, id ASC)`,
  `CREATE TABLE IF NOT EXISTS sa_rate_limits (
    bucket TEXT NOT NULL, key_hash TEXT NOT NULL, hits INTEGER NOT NULL,
    reset_at BIGINT NOT NULL, PRIMARY KEY (bucket, key_hash)
  )`,
];

export async function migratePostgres(database) {
  for (const statement of postgresSchema) await database.query(statement);
}
