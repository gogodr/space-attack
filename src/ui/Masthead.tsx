import type { GameController } from '../app/useGame';

export function Masthead({ game }: { game: GameController }) {
  const {
    active,
    clearInput,
    engine,
    audio,
    music,
    effects,
    setMusic,
    setEffects,
    arena,
  } = game;
  return (
    <header className="masthead">
      <a
        href="#"
        onClick={(event) => {
          event.preventDefault();
          if (active) {
            clearInput();
            engine.togglePause();
          }
        }}
        aria-label="Space Attack arcade"
      >
        <span className="brand-mark">✦</span> SPACE ATTACK{' '}
        <span className="brand-edition">ARCADE / 01</span>
      </a>
      <div className="audio-controls">
        <button
          aria-pressed={music}
          onClick={() => {
            audio.unlock();
            setMusic((v) => !v);
            if (engine.state.phase === 'playing') arena.current?.focus();
          }}
        >
          Music <span>{music ? 'ON' : 'OFF'}</span>
        </button>
        <button
          aria-pressed={effects}
          onClick={() => {
            audio.unlock();
            setEffects((v) => !v);
            if (engine.state.phase === 'playing') arena.current?.focus();
          }}
        >
          Sound <span>{effects ? 'ON' : 'OFF'}</span>
        </button>
      </div>
    </header>
  );
}
