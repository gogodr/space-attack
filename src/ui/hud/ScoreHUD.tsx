import type { GameState } from '../../game/types';
import { formatScore } from '../formatScore';

export function ScoreHUD({ state }: { state: GameState }) {
  return (
    <div className="hud hud-top">
      <div>
        <span className="hud-label">LEVEL SCORE</span>
        <strong>{formatScore(state.levelScore)}</strong>
      </div>
      <div className="sector-indicator">
        <span className="hud-label">SECTOR</span>
        <strong>
          {String(state.level).padStart(2, '0')}
          <small>/15</small>
        </strong>
      </div>
      <div className="hud-right">
        <span className="hud-label">TOTAL SCORE</span>
        <strong>{formatScore(state.totalScore)}</strong>
      </div>
    </div>
  );
}
