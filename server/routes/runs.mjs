import { Router } from 'express';

export function createRunsRouter(runs, registerLimits) {
  const router = Router();
  router.post('/', ...registerLimits, async (_req, res) => {
    res.status(201).json(await runs.register());
  });
  return router;
}
