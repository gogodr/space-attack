import type { GameState } from '../game/types';

export function PhaseAnnouncement({ state }: { state: GameState }) {
  return (
    <div className="sr-only" role="status" aria-live="polite">
      {state.phase === 'game-over'
        ? `Game over. Final score ${state.totalScore}.`
        : state.phase === 'victory'
          ? `Congratulations. Campaign complete. Final score ${state.totalScore}.`
          : state.phase === 'paused'
            ? 'Mission paused.'
            : state.phase === 'hit-pause'
              ? 'Hit received. Returning in five seconds with protection.'
              : state.phase === 'level-complete'
                ? `Level ${state.level} complete.`
                : state.phase === 'playing'
                  ? `Playing level ${state.level}.`
                  : 'Space Attack. Ready to start.'}
    </div>
  );
}
