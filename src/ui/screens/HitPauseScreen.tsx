import type { GameState } from '../../game/types';

export function HitPauseScreen({
  state,
  pause,
}: {
  state: GameState;
  pause: () => void;
}) {
  return (
    <div className="screen-overlay compact-screen hit-screen">
      <span className="eyebrow">Hull damage sustained</span>
      <h2>REBOOTING</h2>
      <div className="countdown">{Math.ceil(state.hitCountdown)}</div>
      <p>Returning with 3 seconds of shielding.</p>
      <button className="text-button" onClick={pause}>
        Pause countdown
      </button>
    </div>
  );
}
