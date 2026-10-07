import { Router } from 'express';

export function createHealthRouter(checkDatabase) {
  const router = Router();
  router.get('/', (_req, res) => {
    checkDatabase();
    res.json({ status: 'ok' });
  });
  return router;
}
