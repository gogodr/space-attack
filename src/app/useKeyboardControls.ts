import { useCallback, useEffect, useRef, type RefObject } from 'react';
import type { GameEngine } from '../game/engine';
import type { ArcadeAudio } from '../audio';

/** Keep keyboard state, focus loss, and menu input ownership in one adapter. */
export function useKeyboardControls(
  engine: GameEngine,
  audio: ArcadeAudio,
  arena: RefObject<HTMLDivElement | null>,
) {
  const pressed = useRef(new Set<string>());
  const clearInput = useCallback(() => {
    pressed.current.clear();
    engine.input.left = false;
    engine.input.right = false;
    engine.input.fireHeld = false;
    engine.input.firePressed = false;
  }, [engine]);
  useEffect(() => {
    const updateMovement = () => {
      engine.input.left =
        pressed.current.has('KeyA') || pressed.current.has('ArrowLeft');
      engine.input.right =
        pressed.current.has('KeyD') || pressed.current.has('ArrowRight');
    };
    const typing = (target: EventTarget | null) =>
      target instanceof HTMLElement &&
      (target.matches('input, textarea, select, button, a') ||
        target.isContentEditable);
    const keydown = (event: KeyboardEvent) => {
      if (
        event.code === 'Escape' &&
        ['playing', 'hit-pause', 'level-complete', 'paused'].includes(
          engine.state.phase,
        )
      ) {
        event.preventDefault();
        if (!event.repeat) {
          clearInput();
          audio.unlock();
          engine.togglePause();
          if (engine.state.phase !== 'paused') arena.current?.focus();
        }
        return;
      }
      if (typing(event.target)) return;
      if (engine.state.phase !== 'playing') return;
      if (
        [
          'KeyA',
          'KeyD',
          'ArrowLeft',
          'ArrowRight',
          'ArrowUp',
          'ArrowDown',
          'KeyW',
          'KeyS',
          'Space',
        ].includes(event.code)
      )
        event.preventDefault();
      if (event.repeat) return;
      pressed.current.add(event.code);
      updateMovement();
      if (event.code === 'Space') {
        engine.input.fireHeld = true;
        engine.input.firePressed = true;
      }
    };
    const keyup = (event: KeyboardEvent) => {
      pressed.current.delete(event.code);
      updateMovement();
      if (event.code === 'Space') engine.input.fireHeld = false;
    };
    const blur = () => {
      clearInput();
      if (
        ['playing', 'hit-pause', 'level-complete'].includes(engine.state.phase)
      )
        engine.togglePause();
    };
    const visibility = () => {
      if (document.hidden) blur();
    };
    window.addEventListener('keydown', keydown);
    window.addEventListener('keyup', keyup);
    window.addEventListener('blur', blur);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      window.removeEventListener('keydown', keydown);
      window.removeEventListener('keyup', keyup);
      window.removeEventListener('blur', blur);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [engine, audio, clearInput]);
  return clearInput;
}
