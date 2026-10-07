import { openDatabase } from './connection.mjs';
import { openPostgres } from './postgres.mjs';
import { createRunRepository } from '../repositories/runs.mjs';
import { createLeaderboardRepository } from '../repositories/leaderboard.mjs';
import { createPostgresRunRepository } from '../repositories/postgresRuns.mjs';
import { createPostgresLeaderboardRepository } from '../repositories/postgresLeaderboard.mjs';
import { PostgresRateLimitStore } from '../middleware/PostgresRateLimitStore.mjs';

export function createPostgresStorage(database) {
  return {
    runs: createPostgresRunRepository(database),
    leaderboard: createPostgresLeaderboardRepository(database),
    rateLimitStores: Object.fromEntries(
      ['register', 'submit', 'read'].map((bucket) => [
        bucket,
        new PostgresRateLimitStore(database, bucket),
      ]),
    ),
    health: () => database.query('SELECT 1'),
    close: () => {},
  };
}

export function createStorage({ databaseUrl, databasePath }) {
  if (databaseUrl) return createPostgresStorage(openPostgres(databaseUrl));
  const database = openDatabase(databasePath);
  return {
    runs: createRunRepository(database),
    leaderboard: createLeaderboardRepository(database),
    rateLimitStores: {},
    health: () => database.prepare('SELECT 1').get(),
    close: () => database.close(),
  };
}
