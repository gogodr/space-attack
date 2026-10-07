import { useEffect, useState } from 'react';
import { ArcadeAudio } from '../audio';
import type { GameEngine } from '../game/engine';
import type { GameState } from '../game/types';

/** Bridge simulation cues and phases to the procedural audio service. */
export function useGameAudio(engine: GameEngine, state: GameState) {
  const [audio] = useState(() => new ArcadeAudio());
  const [music, setMusic] = useState(true);
  const [effects, setEffects] = useState(true);
  useEffect(() => {
    engine.onSound = (cue) => audio.cue(cue);
    return () => {
      engine.onSound = undefined;
    };
  }, [engine, audio]);
  useEffect(() => {
    audio.setMusic(music);
    audio.setEffects(effects);
  }, [audio, music, effects]);
  useEffect(() => {
    audio.setPhase(state.phase);
  }, [audio, state.phase]);
  useEffect(() => {
    if (state.phase === 'hit-pause') audio.tickCountdown(state.hitCountdown);
  }, [audio, state.phase, state.hitCountdown]);
  useEffect(() => () => audio.dispose(), [audio]);
  return { audio, music, effects, setMusic, setEffects };
}
