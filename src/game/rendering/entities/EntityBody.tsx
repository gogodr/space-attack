import { useRef, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  CuboidCollider,
  RigidBody,
  type RapierRigidBody,
} from '@react-three/rapier';
import type { Group } from 'three';
import type { Vec } from '../../types';
import { COLLIDER_DEPTH } from '../../physics/collisionGroups';

interface EntityBodyProps {
  position?: Vec;
  getPosition: () => Vec | undefined;
  getVisible?: () => boolean;
  extents: Vec;
  collisionGroups: number;
  children: ReactNode;
}

/** Shared kinematic body binding; presentation never decides damage or scores. */
export function EntityBody({
  position,
  getPosition,
  getVisible,
  extents,
  collisionGroups,
  children,
}: EntityBodyProps) {
  const body = useRef<RapierRigidBody>(null);
  const visual = useRef<Group>(null);
  useFrame(() => {
    const current = getPosition();
    if (current && body.current)
      body.current.setTranslation({ x: current.x, y: current.y, z: 0 }, false);
    if (visual.current && getVisible) visual.current.visible = getVisible();
  });
  return (
    <RigidBody
      ref={body}
      type="kinematicPosition"
      position={[position?.x ?? 0, position?.y ?? 0, 0]}
      colliders={false}
      enabledRotations={[false, false, false]}
      enabledTranslations={[true, true, false]}
    >
      <CuboidCollider
        args={[extents.x, extents.y, COLLIDER_DEPTH]}
        sensor
        collisionGroups={collisionGroups}
      />
      <group ref={visual}>{children}</group>
    </RigidBody>
  );
}
