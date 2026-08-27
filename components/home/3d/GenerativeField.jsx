'use client';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function GenerativeField({ scrollProgress }) {
  const pointsRef = useRef();
  const count = 2000;

  // Generate chaotic (random sphere) and structural (grid) positions
  const { randomPos, gridPos } = useMemo(() => {
    const random = new Float32Array(count * 3);
    const grid = new Float32Array(count * 3);
    
    const size = Math.ceil(Math.pow(count, 1/3));
    const step = 0.5;
    let gridIdx = 0;

    for (let i = 0; i < count; i++) {
      // Chaos
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos((Math.random() * 2) - 1);
      const r = 5 + Math.random() * 5;
      random[i*3] = r * Math.sin(phi) * Math.cos(theta);
      random[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
      random[i*3+2] = r * Math.cos(phi);

      // Structure (Grid)
      if (gridIdx < count) {
        const x = (gridIdx % size) - size/2;
        const y = (Math.floor(gridIdx / size) % size) - size/2;
        const z = (Math.floor(gridIdx / (size * size))) - size/2;
        grid[i*3] = x * step;
        grid[i*3+1] = y * step;
        grid[i*3+2] = z * step;
        gridIdx++;
      }
    }
    return { randomPos: random, gridPos: grid };
  }, [count]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y += delta * 0.05;

    // Morph between chaos and structure based on scroll
    // Scroll progress maps 0 -> Chaos, 1 -> Structure
    const positions = pointsRef.current.geometry.attributes.position.array;
    for (let i = 0; i < count * 3; i++) {
      positions[i] = THREE.MathUtils.lerp(
        randomPos[i],
        gridPos[i],
        scrollProgress // Eased interpolation
      );
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={count}
            array={randomPos}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial 
          size={0.03} 
          color="#C2496B" 
          transparent 
          opacity={0.8}
          sizeAttenuation 
        />
      </points>
    </>
  );
}
