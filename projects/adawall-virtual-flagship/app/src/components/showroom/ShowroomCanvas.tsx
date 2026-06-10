'use client';

import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import { Suspense } from 'react';
import { ShowroomScene } from './ShowroomScene';

export function ShowroomCanvas() {
  return (
    <div className="absolute inset-0">
      <Canvas camera={{ position: [8, 5, 10], fov: 45 }} shadows>
        <color attach="background" args={["#171412"]} />
        <ambientLight intensity={0.55} />
        <directionalLight position={[6, 8, 5]} intensity={1.5} castShadow />
        <Suspense fallback={null}>
          <ShowroomScene />
          <Environment preset="city" />
        </Suspense>
        <OrbitControls enablePan={false} minDistance={6} maxDistance={18} maxPolarAngle={Math.PI / 2.15} />
      </Canvas>
    </div>
  );
}
