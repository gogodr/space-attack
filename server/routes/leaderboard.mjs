import { Router } from 'express';

export function createLeaderboardRouter(leaderboard, limits) {
  const router = Router();
  router.get('/', ...limits.read, (_req, res) => {
    res.json({ entries: leaderboard.list() });
  });
  router.post('/', ...limits.submit, (req, res) => {
    const { entry, created } = leaderboard.submit(req.body);
    res.status(created ? 201 : 200).json({ entry });
  });
  return router;
}
