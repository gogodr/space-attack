import { Router } from 'express';

export function createRunsRouter(runs, registerLimits) {
  const router = Router();
  router.post('/', ...registerLimits, (_req, res) => {
    res.status(201).json(runs.register());
  });
  return router;
}
