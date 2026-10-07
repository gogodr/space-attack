import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import type { OrthographicCamera } from 'three';
import { ARENA } from '../../config';

export function ArenaCamera() {
  const { camera, size } = useThree();
  useEffect(() => {
    const orthographic = camera as OrthographicCamera;
    orthographic.left = ARENA.left;
    orthographic.right = ARENA.right;
    orthographic.top = ARENA.top;
    orthographic.bottom = ARENA.bottom;
    orthographic.updateProjectionMatrix();
  }, [camera, size]);
  return null;
}
