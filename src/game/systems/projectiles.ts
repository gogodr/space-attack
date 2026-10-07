import type { GameState } from '../types';
import type { SimulationActions } from '../simulation/contracts';

export function spawnLaser(
  state: GameState,
  actions: SimulationActions,
  side: 'player' | 'enemy',
  x: number,
  y: number,
) {
  const vy =
    side === 'player'
      ? state.config.playerLaserSpeed
      : -state.config.enemyLaserSpeed;
  state.projectiles.push({
    id: actions.id('laser'),
    side,
    x,
    y,
    previous: { x, y },
    vy,
  });
  actions.sound(side === 'player' ? 'shoot' : 'enemy-shot');
}

export function advanceProjectiles(state: GameState, dt: number) {
  for (const projectile of state.projectiles)
    projectile.y += projectile.vy * dt;
}
