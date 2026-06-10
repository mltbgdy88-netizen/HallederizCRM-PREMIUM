'use client';

import { Environment } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { LoadingScreen } from '../ui/LoadingScreen';
import { CameraRig } from './CameraRig';
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
        <CameraRig />
      </Canvas>
      <noscript>
        <LoadingScreen />
      </noscript>
    </div>
  );
}
