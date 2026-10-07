import type { useLeaderboard } from './useLeaderboard';

export function LeaderboardList({
  entries,
  loading,
  loadError,
  refresh,
}: ReturnType<typeof useLeaderboard>) {
  return (
    <div className="rankings">
      {loading ? (
        <p role="status">Connecting to the leaderboard…</p>
      ) : loadError ? (
        <div className="network-message">
          <p role="status">{loadError}</p>
          <button className="text-button" onClick={() => refresh()}>
            Retry connection
          </button>
        </div>
      ) : entries.length === 0 ? (
        <p>No scores yet. Be the first pilot on the board.</p>
      ) : (
        <ol className="ranking-list">
          {entries.map((entry, index) => (
            <li key={entry.id}>
              <span className="rank">{String(index + 1).padStart(2, '0')}</span>
              <div className="rank-person">
                <strong>{entry.nickname}</strong>
                <small>
                  {entry.completed
                    ? 'Campaign complete'
                    : `Level ${entry.level}`}{' '}
                  ·{' '}
                  <time dateTime={entry.submittedAt}>
                    {new Date(entry.submittedAt).toLocaleDateString()}
                  </time>
                </small>
              </div>
              <span className="rank-score">
                {entry.score.toLocaleString('en-US')}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
