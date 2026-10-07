import type { GameState } from '../game/types';

export function MissionPanel({ state }: { state: GameState }) {
  const victory = state.phase === 'victory';
  return (
    <aside className="side-panel mission-panel">
      <span className="eyebrow">Deep space dispatch</span>
      <div className="mission-graphic" aria-hidden="true">
        <span>✦</span>
        <i />
        <i />
        <i />
      </div>
      <h2>
        THE LAST
        <br />
        LINE OF
        <br />
        <em>DEFENSE.</em>
      </h2>
      <p>
        They move together.
        <br />
        They break away.
        <br />
        You make the difference.
      </p>
      <div className="sector-track" aria-label={`Sector ${state.level} of 15`}>
        {Array.from({ length: 15 }, (_, i) => (
          <span
            key={i}
            className={
              i + 1 < state.level || victory
                ? 'cleared'
                : i + 1 === state.level
                  ? 'current'
                  : ''
            }
          />
        ))}
      </div>
      <div className="mission-status">
        <span>MISSION PROGRESS</span>
        <strong>{String(state.level).padStart(2, '0')} / 15</strong>
      </div>
      <p className="manual-note">
        Escaped enemies cost a life.
        <br />
        Clear every sector to complete the mission.
      </p>
    </aside>
  );
}
