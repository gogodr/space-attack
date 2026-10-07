import { useGame } from './app/useGame';
import { Masthead } from './ui/Masthead';
import { FlightManual } from './ui/FlightManual';
import { GameCabinet } from './ui/GameCabinet';
import { MissionPanel } from './ui/MissionPanel';
import { Footer } from './ui/Footer';
import { PhaseAnnouncement } from './ui/PhaseAnnouncement';

export default function App() {
  const game = useGame();
  return (
    <main className="app-shell">
      <Masthead game={game} />
      <div className="game-layout">
        <FlightManual />
        <GameCabinet game={game} />
        <MissionPanel state={game.state} />
      </div>
      <Footer active={game.active} pause={game.pause} />
      <PhaseAnnouncement state={game.state} />
    </main>
  );
}
