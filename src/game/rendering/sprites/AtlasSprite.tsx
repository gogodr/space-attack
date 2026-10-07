import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { PlaneGeometry } from 'three';
import { animationFrame, frameUV, type SpriteClip } from './atlas';
import { useAtlasMaterial } from './SpriteAtlasProvider';

interface AtlasSpriteProps {
  clip: SpriteClip;
  size: readonly [number, number];
  getTime: () => number;
  getProgress?: () => number;
  offset?: number;
}

/** A textured quad; only its four UV coordinates change during animation. */
export function AtlasSprite({
  clip,
  size,
  getTime,
  getProgress,
  offset = 0,
}: AtlasSpriteProps) {
  const material = useAtlasMaterial();
  const geometry = useMemo(() => new PlaneGeometry(1, 1), []);
  const previousFrame = useRef(-1);
  const updateFrame = () => {
    const frame = animationFrame(clip, getTime() + offset, getProgress?.());
    if (frame === previousFrame.current) return;
    const { left, right, top, bottom } = frameUV(frame);
    const uv = geometry.getAttribute('uv');
    uv.setXY(0, left, top);
    uv.setXY(1, right, top);
    uv.setXY(2, left, bottom);
    uv.setXY(3, right, bottom);
    uv.needsUpdate = true;
    previousFrame.current = frame;
  };
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame(updateFrame);
  // Initialize before the first paint, rather than briefly showing the whole atlas.
  updateFrame();
  return (
    <mesh
      geometry={geometry}
      material={material}
      scale={[size[0], size[1], 1]}
    />
  );
}
