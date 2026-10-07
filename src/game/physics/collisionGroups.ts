// Rapier interaction bitmasks: high bits are membership; low bits are filters.
export const COLLISION_GROUPS = {
  player: 0x0001000a,
  enemy: 0x00020005,
  playerLaser: 0x0004000a,
  enemyLaser: 0x00080005,
} as const;
export const COLLIDER_DEPTH = 0.2;
