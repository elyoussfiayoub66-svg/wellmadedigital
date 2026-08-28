'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Final3D() {
  const lineRef = useRef();
  
  // Abstract W curve
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-3, 2, 0),
    new THREE.Vector3(-1.5, -2, 0),
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(1.5, -2, 0),
    new THREE.Vector3(3, 2, 0)
  ]);

  useFrame((state) => {
    if(lineRef.current) {
      lineRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  return (
    <group ref={lineRef}>
      <ambientLight intensity={1} />
      <mesh>
        <tubeGeometry args={[curve, 64, 0.02, 8, false]} />
        <meshBasicMaterial color="#C2496B" />
      </mesh>
    </group>
  );
}
