import type { GameController } from '../../app/useGame';
import { Leaderboard } from '../leaderboard/Leaderboard';

export function EndScreen({ game }: { game: GameController }) {
  const {
    state,
    victory,
    start,
    home,
    result,
    registration,
    registrationStatus,
    runKey,
  } = game;
  return (
    <div
      className={`screen-overlay end-screen ${victory ? 'victory-screen' : ''}`}
    >
      <span className="eyebrow">
        {victory ? 'All fifteen sectors secured' : 'Mission transmission ended'}
      </span>
      <h2>
        {victory ? (
          <>
            STELLAR
            <br />
            VICTORY
          </>
        ) : (
          <>
            GAME
            <br />
            OVER
          </>
        )}
      </h2>
      {victory && (
        <p className="victory-copy">
          Congratulations, pilot. You saved the stars.
        </p>
      )}
      <div className="end-score">
        <span>FINAL SCORE</span>
        <strong>{state.totalScore.toLocaleString('en-US')}</strong>
        <small>
          {victory
            ? 'CAMPAIGN COMPLETE'
            : `REACHED SECTOR ${String(state.level).padStart(2, '0')}`}
        </small>
      </div>
      <div className="end-actions">
        <button className="primary-button" onClick={start}>
          {victory ? 'Play again' : 'Try again'} <span>↗</span>
        </button>
        <button className="text-button" onClick={home}>
          Return to start
        </button>
      </div>
      {result && (
        <Leaderboard
          key={runKey}
          result={result}
          registration={registration}
          registrationStatus={registrationStatus}
        />
      )}
    </div>
  );
}
