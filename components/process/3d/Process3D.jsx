'use client';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Sparkles, MeshTransmissionMaterial, Line } from '@react-three/drei';
import * as THREE from 'three';

const nodes = [
  { pos: [0, 0, 0], type: 'knot', color: '#C2496B' }, // Hero
  { pos: [15, 0, -2], type: 'sphere', color: '#C8A464' }, // 1. Discovery
  { pos: [30, 2, -4], type: 'box', color: '#F7F5F0' }, // 2. Proposal
  { pos: [45, -2, -2], type: 'cylinder', color: '#C2496B' }, // 3. Building
  { pos: [60, 0, -5], type: 'octahedron', color: '#C8A464' }, // 4. Testing
  { pos: [75, 2, -3], type: 'icosahedron', color: '#F7F5F0' }, // 5. Optimization
  { pos: [90, -1, -6], type: 'torus', color: '#C2496B' }, // 6. Review
  { pos: [105, 0, 0], type: 'diamond', color: '#C8A464' }, // 7. Delivery
];

function NodeGeometry({ type }) {
  switch (type) {
    case 'knot': return <torusKnotGeometry args={[1.5, 0.4, 128, 32]} />;
    case 'sphere': return <sphereGeometry args={[1.2, 32, 32]} />;
    case 'box': return <boxGeometry args={[1.5, 1.5, 1.5]} />;
    case 'cylinder': return <cylinderGeometry args={[1, 1, 2, 32]} />;
    case 'octahedron': return <octahedronGeometry args={[1.5, 0]} />;
    case 'icosahedron': return <icosahedronGeometry args={[1.5, 0]} />;
    case 'torus': return <torusGeometry args={[1.2, 0.4, 32, 64]} />;
    case 'diamond': return <coneGeometry args={[1.2, 2.5, 4]} />;
    default: return <sphereGeometry args={[1, 16, 16]} />;
  }
}

export default function Process3D({ scrollYProgress }) {
  const groupRef = useRef();
  
  // Extract line points for the connecting pipeline wire
  const linePoints = useMemo(() => nodes.map(n => new THREE.Vector3(...n.pos)), []);

  useFrame((state, delta) => {
    // Advanced camera motion tied to scroll
    const progress = scrollYProgress.get ? scrollYProgress.get() : 0;
    
    // Total X travel distance should match the last node's X position (105)
    // We lerp the camera's X position from 0 to 105 based on the scroll progress.
    const targetX = THREE.MathUtils.lerp(0, 105, progress);
    
    // Smoothly animate camera to target
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, targetX, delta * 5);
    
    // Look slightly ahead of the camera's current X position to guide the user's eye
    const lookAtX = state.camera.position.x + 10;
    state.camera.lookAt(lookAtX, 0, -10);
  });

  return (
    <group ref={groupRef}>
      {/* The Central Connecting Pipeline */}
      <Line 
        points={linePoints} 
        color="#F7F5F0" 
        lineWidth={1.5}
        dashed={true}
        dashSize={0.5}
        dashScale={0.5}
        gapSize={0.2}
        opacity={0.3}
        transparent
      />

      {/* Floating Nodes */}
      {nodes.map((node, i) => (
        <Float key={i} speed={2} rotationIntensity={1.5} floatIntensity={2}>
          <mesh position={node.pos}>
            <NodeGeometry type={node.type} />
            <MeshTransmissionMaterial 
              backside 
              samples={4} 
              thickness={0.5} 
              chromaticAberration={0.5} 
              anisotropy={0.3} 
              distortion={0.2} 
              distortionScale={0.5} 
              temporalDistortion={0.1} 
              color={node.color}
              transmission={0.9}
              opacity={1}
              transparent
            />
          </mesh>
          
          {/* Inner wireframe core for technical feel */}
          <mesh position={node.pos} scale={0.85}>
             <NodeGeometry type={node.type} />
             <meshBasicMaterial color={node.color} wireframe transparent opacity={0.4} />
          </mesh>
        </Float>
      ))}

      {/* Ambient Particle Dust */}
      <Sparkles count={500} scale={[150, 20, 20]} size={3} speed={0.4} opacity={0.2} color="#C8A464" position={[50, 0, -5]} />
      
      {/* Lighting setup for the glass materials */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={2} color="#F7F5F0" />
      <directionalLight position={[-10, -10, -5]} intensity={1} color="#C2496B" />
    </group>
  );
}
