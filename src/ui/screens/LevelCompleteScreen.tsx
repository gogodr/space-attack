import type { GameState } from '../../game/types';

export function LevelCompleteScreen({ state }: { state: GameState }) {
  return (
    <div className="screen-overlay compact-screen">
      <span className="eyebrow">Formation neutralized</span>
      <h2>
        SECTOR {String(state.level).padStart(2, '0')}
        <br />
        CLEAR
      </h2>
      <div className="summary-score">
        +{state.levelScore.toLocaleString('en-US')}
      </div>
      <p>Next sector in {Math.ceil(state.levelCountdown)}…</p>
    </div>
  );
}
