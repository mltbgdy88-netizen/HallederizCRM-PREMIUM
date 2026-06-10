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
      <Canvas camera={{ position: [9, 5.2, 13], fov: 42 }} dpr={[1, 1.7]} shadows>
        <color attach="background" args={["#171412"]} />
        <fog attach="fog" args={["#171412", 16, 31]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[6, 9, 6]} intensity={1.35} castShadow />
        <pointLight position={[-3.4, 2.8, 1.2]} intensity={2.2} color="#b48a5a" />
        <pointLight position={[3.4, 2.8, 8.8]} intensity={1.7} color="#f4eee4" />
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
