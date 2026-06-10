export function FlagshipShell() {
  return (
    <group>
      <mesh receiveShadow position={[0, -0.05, 0]}>
        <boxGeometry args={[12, 0.1, 7]} />
        <meshStandardMaterial color="#6f6254" roughness={0.72} metalness={0.05} />
      </mesh>
      <mesh position={[0, 1.45, -3.55]} receiveShadow>
        <boxGeometry args={[12, 3, 0.12]} />
        <meshStandardMaterial color="#2a211b" roughness={0.8} />
      </mesh>
      <mesh position={[-6.05, 1.45, 0]} receiveShadow>
        <boxGeometry args={[0.12, 3, 7]} />
        <meshStandardMaterial color="#241d18" roughness={0.82} />
      </mesh>
      <mesh position={[6.05, 1.45, 0]} receiveShadow>
        <boxGeometry args={[0.12, 3, 7]} />
        <meshStandardMaterial color="#241d18" roughness={0.82} />
      </mesh>
      <mesh position={[0, 3.05, 0]}>
        <boxGeometry args={[12.2, 0.12, 7.2]} />
        <meshStandardMaterial color="#1d1713" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.04, -1.35]} castShadow receiveShadow>
        <boxGeometry args={[3.2, 0.08, 1.2]} />
        <meshStandardMaterial color="#b48a5a" roughness={0.35} metalness={0.25} />
      </mesh>
      <mesh position={[0, 1.65, -3.45]}>
        <boxGeometry args={[3.8, 1.1, 0.08]} />
        <meshStandardMaterial color="#3a3028" roughness={0.65} />
      </mesh>
    </group>
  );
}
