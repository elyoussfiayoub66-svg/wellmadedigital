'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Float, Icosahedron, Box, TorusKnot } from '@react-three/drei';
import * as THREE from 'three';

export default function Services3D({ activeIndex }) {
  const groupRef = useRef();

  useFrame((state, delta) => {
    // Smoothly rotate the entire group
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.2;
      groupRef.current.rotation.x += delta * 0.1;
      
      // Scale transitions based on active index
      const targetScale0 = activeIndex === 0 ? 1 : 0;
      const targetScale1 = activeIndex === 1 ? 1 : 0;
      const targetScale2 = activeIndex === 2 ? 1 : 0;
      
      groupRef.current.children[0].scale.lerp(new THREE.Vector3(targetScale0, targetScale0, targetScale0), 0.1);
      groupRef.current.children[1].scale.lerp(new THREE.Vector3(targetScale1, targetScale1, targetScale1), 0.1);
      groupRef.current.children[2].scale.lerp(new THREE.Vector3(targetScale2, targetScale2, targetScale2), 0.1);
    }
  });

  return (
    <group ref={groupRef}>
      {/* 0: Website Design & Creation - Fluid TorusKnot */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <TorusKnot args={[1, 0.3, 128, 32]} scale={0}>
          <MeshDistortMaterial color="#C2496B" speed={2} distort={0.2} radius={1} transparent opacity={0.9} wireframe={true} />
        </TorusKnot>
      </Float>

      {/* 1: CRM Development - Structured Box System */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <Box args={[1.5, 1.5, 1.5]} scale={0}>
          <meshStandardMaterial color="#C8A464" transparent opacity={0.8} wireframe={false} metalness={0.8} roughness={0.2} />
        </Box>
        {/* Inner wireframe box for complexity */}
        <Box args={[1.8, 1.8, 1.8]} scale={0}>
          <meshBasicMaterial color="#C8A464" transparent opacity={0.2} wireframe={true} />
        </Box>
      </Float>

      {/* 2: AI Automation - Complex Neural Node */}
      <Float speed={3} rotationIntensity={1} floatIntensity={2}>
        <Icosahedron args={[1.2, 2]} scale={0}>
          <MeshDistortMaterial color="#F7F5F0" speed={4} distort={0.5} radius={1} transparent opacity={0.6} wireframe={true} />
        </Icosahedron>
      </Float>
    </group>
  );
}
