import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import { useLoader } from '@react-three/fiber';
import {
  MeshBasicMaterial,
  NearestFilter,
  SRGBColorSpace,
  TextureLoader,
} from 'three';
import { ATLAS_URL } from './atlas';

const AtlasMaterial = createContext<MeshBasicMaterial | null>(null);

/** Every sprite shares one texture and one unlit, transparent material. */
export function SpriteAtlasProvider({ children }: { children: ReactNode }) {
  const texture = useLoader(TextureLoader, ATLAS_URL);
  const material = useMemo(() => {
    texture.magFilter = NearestFilter;
    texture.minFilter = NearestFilter;
    texture.generateMipmaps = false;
    texture.colorSpace = SRGBColorSpace;
    texture.needsUpdate = true;
    return new MeshBasicMaterial({
      map: texture,
      transparent: true,
      alphaTest: 0.05,
      depthWrite: false,
      toneMapped: false,
    });
  }, [texture]);
  useEffect(() => () => material.dispose(), [material]);
  return (
    <AtlasMaterial.Provider value={material}>{children}</AtlasMaterial.Provider>
  );
}

export function useAtlasMaterial() {
  const material = useContext(AtlasMaterial);
  if (!material) throw new Error('AtlasSprite requires SpriteAtlasProvider.');
  return material;
}
