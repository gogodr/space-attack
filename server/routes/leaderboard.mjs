import { Router } from 'express';

export function createLeaderboardRouter(leaderboard, limits) {
  const router = Router();
  router.get('/', ...limits.read, async (_req, res) => {
    res.json({ entries: await leaderboard.list() });
  });
  router.post('/', ...limits.submit, async (req, res) => {
    const { entry, created } = await leaderboard.submit(req.body);
    res.status(created ? 201 : 200).json({ entry });
  });
  return router;
}
