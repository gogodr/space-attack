import type { Enemy } from '../../types';
import type { SpriteClip } from './atlas';

const ENEMY_CLIPS = { A: 'enemy-a', B: 'enemy-b', C: 'enemy-c' } as const;
export function enemySprite(enemy?: Enemy): SpriteClip {
  // The stored identity survives reserve admission, which may change row numbers.
  const variant =
    enemy?.variant ??
    (['C', 'B', 'A'] as const)[(((enemy?.row ?? 0) % 3) + 3) % 3];
  return ENEMY_CLIPS[variant];
}
