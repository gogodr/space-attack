import type { GameState } from '../../game/types';
import { ShipIcon } from '../ShipIcon';

export function StatusHUD({ state }: { state: GameState }) {
  const remainingHP = state.enemies.length;
  return (
    <div className="hud hud-bottom">
      <div className="hp-hud">
        <div className="hp-caption">
          <span className="hud-label">ENEMY HP</span>
          <span>
            {remainingHP}/{state.initialHP}
          </span>
        </div>
        <progress
          value={remainingHP}
          max={Math.max(1, state.initialHP)}
          aria-label="Remaining enemy HP"
        />
      </div>
      <div className="lives-hud">
        <span className="hud-label">LIVES LEFT</span>
        <div className="life-icons" aria-label={`${state.lives} lives left`}>
          {[0, 1, 2].map((n) => (
            <span
              key={n}
              className={n < state.lives ? 'life-active' : 'life-empty'}
            >
              <ShipIcon />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
