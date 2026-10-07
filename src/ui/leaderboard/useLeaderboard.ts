import { useCallback, useEffect, useState } from 'react';
import { getLeaderboard } from '../../services/leaderboard';
import type { LeaderboardEntry } from '../../services/leaderboard';

export function useLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(() => setRevision((n) => n + 1), []);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setLoadError('');
    getLeaderboard(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          setEntries(data.entries);
          setLoading(false);
        }
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setLoadError(
            error instanceof Error ? error.message : 'Could not load rankings.',
          );
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [revision]);
  return { entries, loading, loadError, refresh };
}
