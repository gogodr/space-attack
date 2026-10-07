export const ARENA = {
  left: -10,
  right: 10,
  bottom: -14,
  top: 14,
  playerY: -12,
} as const;

export const EXTENTS = {
  player: { x: 0.6, y: 0.5 },
  enemy: { x: 0.55, y: 0.45 },
  laser: { x: 0.09, y: 0.35 },
} as const;
