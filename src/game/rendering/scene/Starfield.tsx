import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Points, PointsMaterial } from 'three';
import { createStarPositions } from './starPositions';

export function Starfield() {
  const positions = useMemo(() => createStarPositions(), []);
  const points = useRef<Points>(null);
  useFrame(({ clock }) => {
    if (points.current) {
      (points.current.material as PointsMaterial).opacity =
        0.5 + Math.sin(clock.elapsedTime * 0.5) * 0.1;
    }
  });
  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#b8c8e0"
        size={1.3}
        sizeAttenuation={false}
        transparent
        opacity={0.5}
      />
    </points>
  );
}
