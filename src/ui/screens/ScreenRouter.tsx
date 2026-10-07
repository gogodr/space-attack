import type { GameController } from '../../app/useGame';
import { StartScreen } from './StartScreen';
import { PauseScreen } from './PauseScreen';
import { HitPauseScreen } from './HitPauseScreen';
import { LevelCompleteScreen } from './LevelCompleteScreen';
import { EndScreen } from './EndScreen';

export function ScreenRouter({ game }: { game: GameController }) {
  switch (game.state.phase) {
    case 'start':
      return <StartScreen start={game.start} />;
    case 'paused':
      return (
        <PauseScreen start={game.start} home={game.home} resume={game.resume} />
      );
    case 'hit-pause':
      return <HitPauseScreen state={game.state} pause={game.pause} />;
    case 'level-complete':
      return <LevelCompleteScreen state={game.state} />;
    case 'game-over':
    case 'victory':
      return <EndScreen game={game} />;
    default:
      return null;
  }
}
