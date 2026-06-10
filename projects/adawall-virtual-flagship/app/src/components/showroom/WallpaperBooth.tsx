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
      <mesh position={[0, 1.55, -1.92]} receiveShadow castShadow>
        <boxGeometry args={[4.45, 2.9, 0.12]} />
        <meshStandardMaterial color={activeVariant.materialColor} roughness={0.64} metalness={0.02} />
      </mesh>
      <mesh position={[0, 1.55, -1.84]} receiveShadow>
        <boxGeometry args={[3.82, 2.22, 0.04]} />
        <meshStandardMaterial color={activeVariant.materialColor} roughness={0.82} metalness={0.01} transparent opacity={0.72} />
      </mesh>
      <mesh position={[0, 0.18, -1.7]} castShadow receiveShadow>
        <boxGeometry args={[3.85, 0.26, 0.58]} />
        <meshStandardMaterial color="#201a16" roughness={0.75} />
      </mesh>
      <mesh position={[-2.05, 1.55, -1.68]} castShadow>
        <boxGeometry args={[0.09, 3.08, 0.26]} />
        <meshStandardMaterial color="#b48a5a" roughness={0.35} metalness={0.35} />
      </mesh>
      <mesh position={[2.05, 1.55, -1.68]} castShadow>
        <boxGeometry args={[0.09, 3.08, 0.26]} />
        <meshStandardMaterial color="#b48a5a" roughness={0.35} metalness={0.35} />
      </mesh>
      <mesh position={[0, 2.98, -1.68]} castShadow>
        <boxGeometry args={[4.2, 0.09, 0.26]} />
        <meshStandardMaterial color="#b48a5a" roughness={0.35} metalness={0.35} />
      </mesh>
      <mesh position={[0, 0.92, -1.58]} castShadow>
        <boxGeometry args={[1.15, 0.1, 0.18]} />
        <meshStandardMaterial color="#f4eee4" roughness={0.6} />
      </mesh>
    </group>
  );
}
