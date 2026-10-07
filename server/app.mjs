import express from 'express';
import { resolveAppConfig } from './config.mjs';
import { createStorage } from './database/storage.mjs';
import { createRunService } from './services/runs.mjs';
import { createLeaderboardService } from './services/leaderboard.mjs';
import { createRateLimits } from './middleware/rateLimits.mjs';
import {
  handleErrors,
  apiNotFound,
  resourceNotFound,
} from './middleware/errors.mjs';
import { mountStaticSpa } from './middleware/staticSpa.mjs';
import { createHealthRouter } from './routes/health.mjs';
import { createRunsRouter } from './routes/runs.mjs';
import { createLeaderboardRouter } from './routes/leaderboard.mjs';

/** Compose HTTP adapters around local SQLite or shared Postgres storage. */
export function createApp(options = {}) {
  const config = resolveAppConfig(options);
  const postgresUrl = options.databaseUrl ?? process.env.DATABASE_URL;
  if (process.env.VERCEL && !postgresUrl)
    throw new Error(
      'Vercel requires DATABASE_URL; local SQLite cannot persist scores there.',
    );
  const storage =
    options.storage ?? createStorage({ ...config, databaseUrl: postgresUrl });
  const { runs, leaderboard } = storage;
  const runService = createRunService(runs);
  const leaderboardService = createLeaderboardService({ runs, leaderboard });
  const limits = createRateLimits(config.rateLimits, storage.rateLimitStores);
  const app = express();

  app.disable('x-powered-by');
  if (process.env.VERCEL) app.set('trust proxy', 1);
  app.use('/api', (_req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });
  app.use(express.json({ limit: '4kb', strict: true }));
  app.use('/api/health', createHealthRouter(storage.health));
  app.use('/api/runs', createRunsRouter(runService, limits.register));
  app.use(
    '/api/leaderboard',
    createLeaderboardRouter(leaderboardService, limits),
  );
  app.use('/api', apiNotFound);
  if (!process.env.VERCEL) mountStaticSpa(app, config.distPath);
  app.use(resourceNotFound);
  app.use(handleErrors);

  return { app, close: storage.close };
}
