'use client';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function WorkHero3D() {
  const lineRef = useRef();
  
  // Abstract elegant curve
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-4, -4, 0),
      new THREE.Vector3(-2, 2, 2),
      new THREE.Vector3(0, -1, -2),
      new THREE.Vector3(2, 3, 1),
      new THREE.Vector3(4, -3, 0)
    ], false, 'chordal', 0.8);
  }, []);

  useFrame((state) => {
    if (lineRef.current) {
      lineRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.2;
      lineRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.2) * 0.1;
      
      // Animate draw range for a "drawing itself" effect
      const material = lineRef.current.material;
      if (material.dashOffset !== undefined) {
        material.dashOffset -= 0.005;
      }
    }
  });

  return (
    <group>
      <mesh ref={lineRef}>
        <tubeGeometry args={[curve, 100, 0.015, 8, false]} />
        <meshBasicMaterial color="#C2496B" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}
