import { ARENA } from '../../config';

export function createStarPositions(count = 240, initialSeed = 7481) {
  let seed = initialSeed;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = random() * (ARENA.right - ARENA.left) + ARENA.left;
    positions[i * 3 + 1] = random() * (ARENA.top - ARENA.bottom) + ARENA.bottom;
    positions[i * 3 + 2] = -2;
  }
  return positions;
}
