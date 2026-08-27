'use client';
import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { MeshDistortMaterial, Sparkles, PerspectiveCamera, Trail } from '@react-three/drei';
import * as THREE from 'three';

export default function HeroCore({ scrollProgress }) {
  const groupRef = useRef();
  const innerCore = useRef();
  const { mouse, viewport } = useThree();

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    // Complex organic rotation
    groupRef.current.rotation.y += delta * 0.15;
    groupRef.current.rotation.x += delta * 0.1;
    groupRef.current.rotation.z += delta * 0.05;

    // Mouse parallax (Physical interaction)
    const targetX = (mouse.x * viewport.width) / 15;
    const targetY = (mouse.y * viewport.height) / 15;
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.05);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.05);

    // Scroll Transformation
    // Stage 1: Form (0) -> Stage 2: Structure (0.3) -> Stage 3: System (0.6) -> Dissolve (1)
    const scale = 1 + scrollProgress * 2;
    groupRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.05);
    
    if (innerCore.current) {
      innerCore.current.rotation.y -= delta * 0.3;
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={45} />
      <ambientLight intensity={0.1} />
      <directionalLight position={[5, 5, 5]} color="#C2496B" intensity={3} />
      <pointLight position={[-5, -5, -5]} color="#C8A464" intensity={1} />
      
      <group ref={groupRef}>
        {/* Inner Sculptural Core */}
        <mesh ref={innerCore}>
          <icosahedronGeometry args={[1.5, 2]} />
          <meshStandardMaterial color="#0E0E0F" roughness={0.1} metalness={0.9} flatShading />
        </mesh>

        {/* Middle Layer: Raspberry Translucent Geometry */}
        <mesh>
          <sphereGeometry args={[2.2, 32, 32]} />
          <MeshDistortMaterial 
            color="#C2496B" 
            emissive="#C2496B" 
            emissiveIntensity={0.2}
            transparent 
            opacity={0.15} 
            distort={0.3} 
            speed={2} 
            wireframe 
          />
        </mesh>

        {/* Outer Layer: Technical orbital lines */}
        <mesh rotation={[Math.PI/3, 0, 0]}>
          <torusGeometry args={[3.2, 0.005, 16, 100]} />
          <meshBasicMaterial color="#C8A464" transparent opacity={0.3} />
        </mesh>
        <mesh rotation={[-Math.PI/4, Math.PI/4, 0]}>
          <torusGeometry args={[3.5, 0.005, 16, 100]} />
          <meshBasicMaterial color="#C2496B" transparent opacity={0.4} />
        </mesh>

        {/* Orbital Particles */}
        <Sparkles count={400} scale={10} size={1.5} speed={0.4} color="#C2496B" opacity={0.6} />
        <Sparkles count={100} scale={8} size={1} speed={0.2} color="#C8A464" opacity={0.8} />
      </group>
    </>
  );
}
