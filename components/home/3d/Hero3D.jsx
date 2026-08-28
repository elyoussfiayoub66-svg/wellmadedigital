'use client';
import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { MeshTransmissionMaterial, Sparkles, Float } from '@react-three/drei';
import * as THREE from 'three';

export default function Hero3D() {
  const groupRef = useRef();
  const innerRef = useRef();
  const { mouse, viewport } = useThree();

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    // Breathing, slow rotation
    groupRef.current.rotation.y += delta * 0.05;
    groupRef.current.rotation.x += delta * 0.02;
    
    if (innerRef.current) {
      innerRef.current.rotation.y -= delta * 0.08;
      innerRef.current.rotation.z += delta * 0.03;
    }

    // Subtle cursor physics (Inertia)
    const targetX = (mouse.x * viewport.width) * 0.05;
    const targetY = (mouse.y * viewport.height) * 0.05;
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.02);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.02);
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={2} color="#C2496B" />
      <spotLight position={[-10, -10, 10]} intensity={1} color="#C8A464" />
      
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
        <group ref={groupRef} scale={1.5}>
          {/* Glass-like fluid outer architecture */}
          <mesh>
            <torusKnotGeometry args={[1.5, 0.4, 128, 64]} />
            <MeshTransmissionMaterial 
              color="#0E0E0F"
              transmission={0.9}
              thickness={1.5}
              roughness={0.1}
              ior={1.5}
              chromaticAberration={0.04}
              resolution={512}
            />
          </mesh>

          {/* Precision inner core (Raspberry & Gold lines) */}
          <mesh ref={innerRef}>
            <icosahedronGeometry args={[1.2, 1]} />
            <meshStandardMaterial color="#0E0E0F" wireframe />
          </mesh>
          
          <mesh rotation={[Math.PI/2, 0, 0]}>
            <torusGeometry args={[2.2, 0.005, 16, 100]} />
            <meshBasicMaterial color="#C8A464" transparent opacity={0.3} />
          </mesh>

          {/* Tiny subtle particles */}
          <Sparkles count={100} scale={5} size={1} speed={0.1} color="#C2496B" opacity={0.5} />
        </group>
      </Float>
    </>
  );
}
