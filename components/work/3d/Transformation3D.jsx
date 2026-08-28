'use client';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Transformation3D({ scrollYProgress }) {
  const pointsRef = useRef();
  const count = 800;

  // Precompute Chaos vs Order states
  const { chaos, order } = useMemo(() => {
    const c = new Float32Array(count * 3);
    const o = new Float32Array(count * 3);
    
    const size = Math.ceil(Math.pow(count, 1/3));
    const step = 0.5;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Chaos: Random messy sphere
      const r = Math.pow(Math.random(), 0.5) * 4;
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      c[i3] = r * Math.sin(phi) * Math.cos(theta);
      c[i3+1] = r * Math.sin(phi) * Math.sin(theta);
      c[i3+2] = r * Math.cos(phi);

      // Order: Perfect Grid
      const gx = (i % size) - size/2;
      const gy = (Math.floor(i / size) % size) - size/2;
      const gz = (Math.floor(i / (size * size))) - size/2;
      o[i3] = gx * step;
      o[i3+1] = gy * step;
      o[i3+2] = gz * step;
    }
    return { chaos: c, order: o };
  }, [count]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    
    // Smooth progress from scroll
    const p = scrollYProgress.get ? scrollYProgress.get() : 0;
    const current = pointsRef.current.geometry.attributes.position.array;
    
    for (let i = 0; i < count * 3; i++) {
      // Linearly interpolate between chaos and order based on scroll progress p
      const targetVal = THREE.MathUtils.lerp(chaos[i], order[i], p);
      // Smoothly move current position to target value
      current[i] = THREE.MathUtils.lerp(current[i], targetVal, 0.1);
    }
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.rotation.y += delta * 0.2;
    pointsRef.current.rotation.x += delta * 0.1;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={chaos} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#C2496B" transparent opacity={0.8} />
    </points>
  );
}
