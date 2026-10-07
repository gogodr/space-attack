import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { GameEngine } from '../game/engine';
import type { RunRegistration, RunResult } from '../game/types';
import { registerRun } from '../services/leaderboard';
import { useGameAudio } from './useGameAudio';
import { useKeyboardControls } from './useKeyboardControls';

/** Own the run lifecycle and the immutable result used for leaderboard retries. */
export function useGame() {
  const [engine] = useState(() => new GameEngine());
  const subscribe = useCallback(
    (listener: () => void) => engine.subscribe(listener),
    [engine],
  );
  const snapshot = useCallback(() => engine.getSnapshot(), [engine]);
  useSyncExternalStore(subscribe, snapshot, snapshot);
  const state = engine.state;
  const sound = useGameAudio(engine, state);
  const { audio } = sound;
  const arena = useRef<HTMLDivElement>(null);
  const clearInput = useKeyboardControls(engine, audio, arena);
  const [registration, setRegistration] = useState<RunRegistration | null>(
    null,
  );
  const [registrationStatus, setRegistrationStatus] = useState('idle');
  const [result, setResult] = useState<RunResult | null>(null);
  const generation = useRef(0);
  const registrationController = useRef<AbortController | null>(null);
  useEffect(() => {
    if (import.meta.env.MODE !== 'test') return;
    const testWindow = window as Window & { __spaceAttack?: GameEngine };
    testWindow.__spaceAttack = engine;
    return () => {
      delete testWindow.__spaceAttack;
    };
  }, [engine]);
  const start = useCallback(() => {
    const runGeneration = ++generation.current;
    registrationController.current?.abort();
    const controller = new AbortController();
    registrationController.current = controller;
    clearInput();
    setRegistration(null);
    setRegistrationStatus('pending');
    setResult(null);
    audio.unlock();
    engine.start();
    arena.current?.focus();
    registerRun(controller.signal)
      .then((data) => {
        if (
          runGeneration === generation.current &&
          !controller.signal.aborted
        ) {
          setRegistration(data);
          setRegistrationStatus('ready');
        }
      })
      .catch(() => {
        if (runGeneration === generation.current && !controller.signal.aborted)
          setRegistrationStatus('failed');
      });
  }, [engine, audio, clearInput]);
  const home = () => {
    ++generation.current;
    registrationController.current?.abort();
    clearInput();
    engine.toStart();
    setResult(null);
  };
  const resume = () => {
    clearInput();
    audio.unlock();
    engine.togglePause();
    arena.current?.focus();
  };
  const pause = () => {
    clearInput();
    engine.togglePause();
  };
  useEffect(() => {
    if (state.phase !== 'playing') clearInput();
    if (state.phase === 'game-over' || state.phase === 'victory') {
      setResult({
        score: state.totalScore,
        level: state.level,
        completed: state.phase === 'victory',
      });
    }
  }, [state.phase, engine, clearInput]);
  useEffect(
    () => () => {
      ++generation.current;
      registrationController.current?.abort();
    },
    [],
  );
  const active = ['playing', 'hit-pause', 'level-complete'].includes(
    state.phase,
  );
  const victory = state.phase === 'victory';
  return {
    engine,
    state,
    arena,
    ...sound,
    registration,
    registrationStatus,
    result,
    runKey: generation.current,
    active,
    victory,
    start,
    home,
    resume,
    pause,
    clearInput,
  };
}
export type GameController = ReturnType<typeof useGame>;
