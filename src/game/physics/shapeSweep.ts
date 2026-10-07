import type { Shape } from '@dimforge/rapier3d-compat';
import type { Vec } from '../types';

const rotation = { x: 0, y: 0, z: 0, w: 1 };
const position = (value: Vec) => ({ x: value.x, y: value.y, z: 0 });
const displacement = (previous: Vec, current: Vec) => ({
  x: current.x - previous.x,
  y: current.y - previous.y,
  z: 0,
});

/** Normalized time of impact along both trajectories within one simulation tick. */
export function sweepShapes(
  shapeA: Shape,
  previousA: Vec,
  currentA: Vec,
  shapeB: Shape,
  previousB: Vec,
  currentB: Vec,
) {
  if (
    shapeA.intersectsShape(
      position(previousA),
      rotation,
      shapeB,
      position(previousB),
      rotation,
    )
  )
    return 0;
  const hit = shapeA.castShape(
    position(previousA),
    rotation,
    displacement(previousA, currentA),
    shapeB,
    position(previousB),
    rotation,
    displacement(previousB, currentB),
    0,
    1,
    true,
  );
  return hit?.time_of_impact;
}
