import { Hotspot } from './Hotspot';
import { WallpaperBooth } from './WallpaperBooth';

function CorridorRib({ z }: { z: number }) {
  return (
    <group position={[0, 0, z]}>
      <mesh position={[-2.75, 1.55, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.16, 3.1, 0.2]} />
        <meshStandardMaterial color="#b48a5a" roughness={0.34} metalness={0.3} />
      </mesh>
      <mesh position={[2.75, 1.55, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.16, 3.1, 0.2]} />
        <meshStandardMaterial color="#b48a5a" roughness={0.34} metalness={0.3} />
      </mesh>
      <mesh position={[0, 3.05, 0]} castShadow receiveShadow>
        <boxGeometry args={[5.7, 0.12, 0.2]} />
        <meshStandardMaterial color="#b48a5a" roughness={0.34} metalness={0.3} />
      </mesh>
    </group>
  );
}

export function WallpaperCorridor() {
  return (
    <group position={[0, 0, 5.8]}>
      <mesh receiveShadow position={[0, -0.04, 3.8]}>
        <boxGeometry args={[5.6, 0.1, 13.6]} />
        <meshStandardMaterial color="#766a5c" roughness={0.74} metalness={0.04} />
      </mesh>
      <mesh position={[-2.85, 1.45, 3.8]} receiveShadow>
        <boxGeometry args={[0.12, 3, 13.6]} />
        <meshStandardMaterial color="#2a211b" roughness={0.82} />
      </mesh>
      <mesh position={[2.85, 1.45, 3.8]} receiveShadow>
        <boxGeometry args={[0.12, 3, 13.6]} />
        <meshStandardMaterial color="#2a211b" roughness={0.82} />
      </mesh>
      <mesh position={[0, 3.02, 3.8]}>
        <boxGeometry args={[5.8, 0.12, 13.8]} />
        <meshStandardMaterial color="#1d1713" roughness={0.82} />
      </mesh>
      <mesh position={[0, 1.8, -2.95]}>
        <boxGeometry args={[5.8, 3.5, 0.18]} />
        <meshStandardMaterial color="#3b3028" roughness={0.65} />
      </mesh>

      <CorridorRib z={-1.8} />
      <CorridorRib z={1.4} />
      <CorridorRib z={4.6} />
      <CorridorRib z={7.8} />

      <mesh position={[0, 0.06, 3.8]} receiveShadow>
        <boxGeometry args={[1.2, 0.04, 12.4]} />
        <meshStandardMaterial color="#b48a5a" roughness={0.48} metalness={0.22} />
      </mesh>

      <WallpaperBooth position={[0, 0, 1.4]} />
      <Hotspot position={[0, 1.55, -0.3]} label="Loca 01" />
      <Hotspot position={[0, 1.5, 6.9]} label="Yeni sezon" />
    </group>
  );
}
