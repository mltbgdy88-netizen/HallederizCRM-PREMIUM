import { Hotspot } from './Hotspot';
import { WallpaperBooth } from './WallpaperBooth';

export function WallpaperCorridor() {
  return (
    <group position={[0, 0, 5.8]}>
      <mesh receiveShadow position={[0, -0.04, 3.8]}>
        <boxGeometry args={[5.2, 0.1, 13]} />
        <meshStandardMaterial color="#766a5c" roughness={0.74} metalness={0.04} />
      </mesh>
      <mesh position={[-2.65, 1.45, 3.8]} receiveShadow>
        <boxGeometry args={[0.12, 3, 13]} />
        <meshStandardMaterial color="#2a211b" roughness={0.82} />
      </mesh>
      <mesh position={[2.65, 1.45, 3.8]} receiveShadow>
        <boxGeometry args={[0.12, 3, 13]} />
        <meshStandardMaterial color="#2a211b" roughness={0.82} />
      </mesh>
      <mesh position={[0, 3.02, 3.8]}>
        <boxGeometry args={[5.4, 0.12, 13.2]} />
        <meshStandardMaterial color="#1d1713" roughness={0.82} />
      </mesh>
      <mesh position={[0, 1.8, -2.8]}>
        <boxGeometry args={[5.4, 3.5, 0.18]} />
        <meshStandardMaterial color="#3b3028" roughness={0.65} />
      </mesh>
      <WallpaperBooth position={[0, 0, 1.4]} />
      <Hotspot position={[0, 1.45, -0.3]} label="Loca 01" />
    </group>
  );
}
