'use client';

import { useMemo } from 'react';
import { activePilotPattern } from '../../data/pilotPatterns';
import { useShowroomStore } from '../../stores/showroomStore';

type WallpaperBoothProps = {
  position?: [number, number, number];
};

export function WallpaperBooth({ position = [0, 0, 0] }: WallpaperBoothProps) {
  const activeVariantId = useShowroomStore((state) => state.activeVariantId);
  const activeVariant = useMemo(
    () => activePilotPattern.variants.find((variant) => variant.id === activeVariantId) ?? activePilotPattern.variants[0],
    [activeVariantId]
  );

  return (
    <group position={position}>
      <mesh position={[0, 1.55, -1.9]} receiveShadow castShadow>
        <boxGeometry args={[4.2, 2.75, 0.12]} />
        <meshStandardMaterial color={activeVariant.materialColor} roughness={0.68} metalness={0.03} />
      </mesh>
      <mesh position={[0, 0.18, -1.74]} castShadow receiveShadow>
        <boxGeometry args={[3.5, 0.26, 0.55]} />
        <meshStandardMaterial color="#201a16" roughness={0.75} />
      </mesh>
      <mesh position={[-1.85, 1.55, -1.7]} castShadow>
        <boxGeometry args={[0.08, 2.9, 0.24]} />
        <meshStandardMaterial color="#b48a5a" roughness={0.35} metalness={0.35} />
      </mesh>
      <mesh position={[1.85, 1.55, -1.7]} castShadow>
        <boxGeometry args={[0.08, 2.9, 0.24]} />
        <meshStandardMaterial color="#b48a5a" roughness={0.35} metalness={0.35} />
      </mesh>
      <mesh position={[0, 2.96, -1.7]} castShadow>
        <boxGeometry args={[3.9, 0.08, 0.24]} />
        <meshStandardMaterial color="#b48a5a" roughness={0.35} metalness={0.35} />
      </mesh>
    </group>
  );
}
