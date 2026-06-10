'use client';

import { Html } from '@react-three/drei';

type HotspotProps = {
  position: [number, number, number];
  label: string;
};

export function Hotspot({ position, label }: HotspotProps) {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.08, 24, 24]} />
        <meshStandardMaterial color="#b48a5a" emissive="#5a3216" emissiveIntensity={0.35} />
      </mesh>
      <Html distanceFactor={8} position={[0, 0.18, 0]} center>
        <div className="rounded-full border border-[#b48a5a]/50 bg-[#171412]/80 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-[#f4eee4] backdrop-blur">
          {label}
        </div>
      </Html>
    </group>
  );
}
