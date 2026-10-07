import type { GameController } from '../app/useGame';
import { GameScene } from '../game/Scene';
import { ScoreHUD } from './hud/ScoreHUD';
import { StatusHUD } from './hud/StatusHUD';
import { ScreenRouter } from './screens/ScreenRouter';
import { ProtectionIndicator } from './ProtectionIndicator';

export function GameCabinet({ game }: { game: GameController }) {
  const { engine, state, arena } = game;
  return (
    <section className="cabinet" aria-label="Space Attack game">
      <ScoreHUD state={state} />
      <div
        className="arena"
        ref={arena}
        tabIndex={-1}
        aria-label="Game arena. Move with A and D or arrow keys. Fire with Space. Pause with Escape."
      >
        <GameScene engine={engine} />
        <div className="scanlines" aria-hidden="true" />
        {state.phase === 'playing' && state.protection > 0 && (
          <ProtectionIndicator seconds={state.protection} />
        )}
        <ScreenRouter game={game} />
      </div>
      <StatusHUD state={state} />
    </section>
  );
}
