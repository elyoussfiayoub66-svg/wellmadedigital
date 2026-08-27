'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';

export default function FinalAscent({ scrollProgress }) {
  const groupRef = useRef();
  
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.2;
    
    // Collapse to a point based on scroll progress
    const scale = Math.max(0.001, 1 - scrollProgress);
    groupRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
  });

  return (
    <group ref={groupRef}>
      {/* Central energy point */}
      <mesh>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshBasicMaterial color="#C2496B" />
      </mesh>
      
      {/* Complex geometric wireframe */}
      <mesh>
        <icosahedronGeometry args={[3, 2]} />
        <meshBasicMaterial color="#C8A464" wireframe transparent opacity={0.2} />
      </mesh>

      <Sparkles count={500} scale={6} size={2} speed={1} color="#C2496B" />
    </group>
  );
}
