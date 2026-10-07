import type { InputState } from '../types';

export function createInputState(): InputState {
  return {
    left: false,
    right: false,
    fireHeld: false,
    firePressed: false,
  };
}

export function clearInput(input: InputState) {
  Object.assign(input, createInputState());
}
