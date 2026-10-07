import type { LevelConfig } from '../types';
import { TUNING } from './tuning';

export function getLevelConfig(level: number): LevelConfig {
  if (!Number.isInteger(level) || level < 1 || level > TUNING.maxLevel)
    throw new RangeError('Level must be 1–15');
  const n = level - 1;
  const enemyLaserSpeed = Math.min(10, 5 * 1.04 ** n);
  return {
    level,
    count: 18 + 2 * n,
    formationInterval: Math.max(0.22, 0.8 * 0.94 ** n),
    launchInterval: Math.max(0.65, 2.5 * 0.93 ** n),
    descentSpeed: Math.min(6, 2 * 1.07 ** n),
    horizontalSpeed: Math.min(8, 3 * 1.06 ** n),
    enemyLaserSpeed,
    playerLaserSpeed: 3 * enemyLaserSpeed,
    fireInterval: Math.max(0.65, 1.8 * 0.95 ** n),
    launchedCap: Math.min(6, 2 + Math.floor(n / 3)),
  };
}
