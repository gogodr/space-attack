import { Router } from 'express';

export function createHealthRouter(checkDatabase) {
  const router = Router();
  router.get('/', async (_req, res) => {
    await checkDatabase();
    res.json({ status: 'ok' });
  });
  return router;
}
