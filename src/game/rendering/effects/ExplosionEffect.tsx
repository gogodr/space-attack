import type { Effect } from '../../types';
import { AtlasSprite } from '../sprites/AtlasSprite';

export function ExplosionEffect({ effect }: { effect: Effect }) {
  const duration = effect.kind === 'hit' ? 0.6 : 0.4;
  const cancel = effect.kind === 'cancel';
  return (
    <group position={[effect.x, effect.y, 0.5]}>
      <AtlasSprite
        clip={cancel ? 'cancel' : 'explosion'}
        size={cancel ? [1.3, 1.3] : [2.2, 2.2]}
        getTime={() => 0}
        getProgress={() => 1 - effect.remaining / duration}
      />
    </group>
  );
}
