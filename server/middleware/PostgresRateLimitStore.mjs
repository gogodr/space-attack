import { createHash } from 'node:crypto';

/** Atomic counters shared by all Vercel function instances; no raw IPs stored. */
export class PostgresRateLimitStore {
  localKeys = false;
  constructor(database, bucket) {
    this.database = database;
    this.prefix = bucket;
  }
  init(options) {
    this.windowMs = options.windowMs;
  }
  hash(key) {
    return createHash('sha256').update(key).digest('hex');
  }
  async increment(key) {
    const now = Date.now();
    const [row] = await this.database.query(
      `INSERT INTO sa_rate_limits (bucket, key_hash, hits, reset_at)
      VALUES ($1, $2, 1, $3)
      ON CONFLICT (bucket, key_hash) DO UPDATE SET
        hits = CASE WHEN sa_rate_limits.reset_at <= $4 THEN 1 ELSE sa_rate_limits.hits + 1 END,
        reset_at = CASE WHEN sa_rate_limits.reset_at <= $4 THEN $3 ELSE sa_rate_limits.reset_at END
      RETURNING hits, reset_at`,
      [this.prefix, this.hash(key), now + this.windowMs, now],
    );
    return { totalHits: row.hits, resetTime: new Date(Number(row.reset_at)) };
  }
  async decrement(key) {
    await this.database.query(
      'UPDATE sa_rate_limits SET hits = GREATEST(0, hits - 1) WHERE bucket = $1 AND key_hash = $2',
      [this.prefix, this.hash(key)],
    );
  }
  async resetKey(key) {
    await this.database.query(
      'DELETE FROM sa_rate_limits WHERE bucket = $1 AND key_hash = $2',
      [this.prefix, this.hash(key)],
    );
  }
}
