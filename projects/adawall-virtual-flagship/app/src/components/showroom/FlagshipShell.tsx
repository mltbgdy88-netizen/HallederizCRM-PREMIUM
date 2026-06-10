import { Html } from '@react-three/drei';

function ZoneLabel({ position, title, subtitle }: { position: [number, number, number]; title: string; subtitle: string }) {
  return (
    <Html position={position} center distanceFactor={9}>
      <div className="rounded-2xl border border-[#b48a5a]/30 bg-[#171412]/75 px-4 py-2 text-center text-[#f4eee4] shadow-xl backdrop-blur">
        <p className="text-[10px] uppercase tracking-[0.22em] text-[#b48a5a]">{title}</p>
        <p className="mt-1 text-[11px] text-[#d8cdbd]">{subtitle}</p>
      </div>
    </Html>
  );
}

export function FlagshipShell() {
  return (
    <group>
      <mesh receiveShadow position={[0, -0.05, 0]}>
        <boxGeometry args={[13.5, 0.1, 8.2]} />
        <meshStandardMaterial color="#6f6254" roughness={0.72} metalness={0.05} />
      </mesh>

      <mesh position={[0, 1.45, -4.1]} receiveShadow>
        <boxGeometry args={[13.5, 3, 0.12]} />
        <meshStandardMaterial color="#2a211b" roughness={0.8} />
      </mesh>
      <mesh position={[-6.75, 1.45, 0]} receiveShadow>
        <boxGeometry args={[0.12, 3, 8.2]} />
        <meshStandardMaterial color="#241d18" roughness={0.82} />
      </mesh>
      <mesh position={[6.75, 1.45, 0]} receiveShadow>
        <boxGeometry args={[0.12, 3, 8.2]} />
        <meshStandardMaterial color="#241d18" roughness={0.82} />
      </mesh>
      <mesh position={[0, 3.05, 0]}>
        <boxGeometry args={[13.7, 0.12, 8.4]} />
        <meshStandardMaterial color="#1d1713" roughness={0.8} />
      </mesh>

      <mesh position={[0, 0.04, 2.95]} castShadow receiveShadow>
        <boxGeometry args={[5.4, 0.08, 1.15]} />
        <meshStandardMaterial color="#b48a5a" roughness={0.35} metalness={0.25} />
      </mesh>
      <mesh position={[0, 1.85, 4.1]} castShadow receiveShadow>
        <boxGeometry args={[5.3, 2.4, 0.18]} />
        <meshStandardMaterial color="#3a3028" roughness={0.65} />
      </mesh>
      <mesh position={[0, 2.95, 4.02]} castShadow>
        <boxGeometry args={[5.8, 0.14, 0.36]} />
        <meshStandardMaterial color="#b48a5a" roughness={0.32} metalness={0.38} />
      </mesh>

      <mesh position={[-4.4, 0.16, -1.6]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 0.32, 1.2]} />
        <meshStandardMaterial color="#312820" roughness={0.78} />
      </mesh>
      <mesh position={[4.4, 0.16, -1.6]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 0.32, 1.2]} />
        <meshStandardMaterial color="#312820" roughness={0.78} />
      </mesh>
      <mesh position={[-4.8, 1.05, -4.02]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 1.7, 0.1]} />
        <meshStandardMaterial color="#876d58" roughness={0.76} />
      </mesh>
      <mesh position={[4.8, 1.05, -4.02]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 1.7, 0.1]} />
        <meshStandardMaterial color="#4d4a3f" roughness={0.76} />
      </mesh>

      <ZoneLabel position={[0, 2.1, 4.25]} title="Wallpaper Gallery" subtitle="T bağlantı portalı" />
      <ZoneLabel position={[-4.4, 0.75, -1.6]} title="Home Textile" subtitle="AdaHome lounge" />
      <ZoneLabel position={[4.4, 0.75, -1.6]} title="AdaPanel" subtitle="Panel studio" />
    </group>
  );
}
