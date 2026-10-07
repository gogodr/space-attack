import express from 'express';
import { resolveAppConfig } from './config.mjs';
import { openDatabase } from './database/connection.mjs';
import { createRunRepository } from './repositories/runs.mjs';
import { createLeaderboardRepository } from './repositories/leaderboard.mjs';
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

/** Compose one application and its owned SQLite connection. */
export function createApp(options = {}) {
  const config = resolveAppConfig(options);
  const db = openDatabase(config.databasePath);
  const runs = createRunRepository(db);
  const leaderboard = createLeaderboardRepository(db);
  const runService = createRunService(runs);
  const leaderboardService = createLeaderboardService({ runs, leaderboard });
  const limits = createRateLimits(config.rateLimits);
  const app = express();

  app.disable('x-powered-by');
  app.use('/api', (_req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });
  app.use(express.json({ limit: '4kb', strict: true }));
  app.use(
    '/api/health',
    createHealthRouter(() => db.prepare('SELECT 1').get()),
  );
  app.use('/api/runs', createRunsRouter(runService, limits.register));
  app.use(
    '/api/leaderboard',
    createLeaderboardRouter(leaderboardService, limits),
  );
  app.use('/api', apiNotFound);
  mountStaticSpa(app, config.distPath);
  app.use(resourceNotFound);
  app.use(handleErrors);

  return { app, close: () => db.close() };
}
