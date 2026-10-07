import type { Effect, GameState, Vec } from '../types';
import type { SimulationActions } from '../simulation/contracts';
import { copy } from '../utils/math';

export function addEffect(
  state: GameState,
  actions: SimulationActions,
  kind: Effect['kind'],
  position: Vec,
) {
  state.effects.push({
    id: actions.id('effect'),
    kind,
    ...copy(position),
    remaining: kind === 'hit' ? 0.6 : 0.4,
  });
}

export function addScore(state: GameState, points: number) {
  state.levelScore += points;
  state.totalScore += points;
}
