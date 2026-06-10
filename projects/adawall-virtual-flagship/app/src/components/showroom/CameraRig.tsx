'use client';

import { OrbitControls } from '@react-three/drei';

export function CameraRig() {
  return (
    <OrbitControls
      enablePan={false}
      minDistance={6}
      maxDistance={18}
      maxPolarAngle={Math.PI / 2.15}
      target={[0, 1.2, 4.5]}
    />
  );
}
