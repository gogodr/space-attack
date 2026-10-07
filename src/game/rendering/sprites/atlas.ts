/** Frames use top-left image coordinates; Three.js UVs start at the bottom. */
export const ATLAS_URL = `${import.meta.env.BASE_URL}assets/sprites/space-attack-atlas.png`;
export const ATLAS = {
  width: 1024,
  height: 512,
  cell: 128,
  columns: 8,
} as const;

export const CLIPS = {
  player: { first: 0, count: 4, fps: 10 },
  'enemy-a': { first: 4, count: 4, fps: 6 },
  'enemy-b': { first: 8, count: 4, fps: 7 },
  'enemy-c': { first: 12, count: 4, fps: 8 },
  explosion: { first: 16, count: 4, fps: 10 },
  cancel: { first: 20, count: 4, fps: 10 },
  'laser-player': { first: 24, count: 2, fps: 12 },
  'laser-enemy': { first: 26, count: 2, fps: 8 },
} as const;
export type SpriteClip = keyof typeof CLIPS;

export function animationFrame(
  clip: SpriteClip,
  seconds: number,
  progress?: number,
) {
  const { first, count, fps } = CLIPS[clip];
  const local =
    progress === undefined
      ? Math.floor(Math.max(0, seconds) * fps) % count
      : Math.min(count - 1, Math.floor(Math.max(0, progress) * count));
  return first + local;
}

export function frameUV(frame: number) {
  const x = (frame % ATLAS.columns) * ATLAS.cell;
  const y = Math.floor(frame / ATLAS.columns) * ATLAS.cell;
  // Half-texel inset and transparent gutters prevent neighboring frame bleed.
  return {
    left: (x + 0.5) / ATLAS.width,
    right: (x + ATLAS.cell - 0.5) / ATLAS.width,
    top: 1 - (y + 0.5) / ATLAS.height,
    bottom: 1 - (y + ATLAS.cell - 0.5) / ATLAS.height,
  };
}
