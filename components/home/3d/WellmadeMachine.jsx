'use client';
import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export default function WellmadeMachine({ scrollProgress }) {
  const pointsRef = useRef();
  const materialRef = useRef();
  const { mouse, camera, size } = useThree();
  
  const count = 2000;

  // Pre-calculate target positions for all narrative states
  const states = useMemo(() => {
    const s = {
      hero: new Float32Array(count * 3),
      idea: new Float32Array(count * 3),
      strategy: new Float32Array(count * 3),
      structure: new Float32Array(count * 3),
      design: new Float32Array(count * 3),
      build: new Float32Array(count * 3),
      move: new Float32Array(count * 3),
      craft: new Float32Array(count * 3),
      finalW: new Float32Array(count * 3)
    };

    const gridSize = Math.ceil(Math.pow(count, 1/3));
    const gridStep = 0.6;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const normalized = i / count;

      // 0. HERO (Single point exploding into a thin network)
      const heroR = Math.pow(Math.random(), 3) * 15;
      const heroTheta = Math.random() * 2 * Math.PI;
      const heroPhi = Math.acos(2 * Math.random() - 1);
      s.hero[i3] = heroR * Math.sin(heroPhi) * Math.cos(heroTheta);
      s.hero[i3+1] = heroR * Math.sin(heroPhi) * Math.sin(heroTheta);
      s.hero[i3+2] = heroR * Math.cos(heroPhi);

      // 1. IDEA (A single path/cluster moving forward)
      s.idea[i3] = (Math.random() - 0.5) * 1;
      s.idea[i3+1] = (Math.random() - 0.5) * 1;
      s.idea[i3+2] = -5 + (normalized * 20); // Deep path

      // 2. STRATEGY (Distinct clustered nodes)
      const cluster = Math.floor(Math.random() * 5);
      const cx = Math.sin(cluster * 1.2) * 5;
      const cy = Math.cos(cluster * 1.2) * 5;
      const cz = (cluster - 2) * 2;
      s.strategy[i3] = cx + (Math.random() - 0.5) * 2;
      s.strategy[i3+1] = cy + (Math.random() - 0.5) * 2;
      s.strategy[i3+2] = cz + (Math.random() - 0.5) * 2;

      // 3. STRUCTURE (Precise 3D Grid)
      const gx = (i % gridSize) - gridSize/2;
      const gy = (Math.floor(i / gridSize) % gridSize) - gridSize/2;
      const gz = (Math.floor(i / (gridSize * gridSize))) - gridSize/2;
      s.structure[i3] = gx * gridStep;
      s.structure[i3+1] = gy * gridStep;
      s.structure[i3+2] = gz * gridStep;

      // 4. DESIGN (Fluid surfaces / parametric waves)
      const u = Math.random() * Math.PI * 2;
      const v = Math.random() * Math.PI;
      const r = 4 + Math.sin(u * 5) * 2 + Math.cos(v * 3) * 1;
      s.design[i3] = r * Math.sin(v) * Math.cos(u);
      s.design[i3+1] = r * Math.sin(v) * Math.sin(u);
      s.design[i3+2] = r * Math.cos(v);

      // 5. BUILD (Technical coordinate systems)
      const axis = i % 3;
      s.build[i3] = axis === 0 ? (Math.random() - 0.5) * 12 : (Math.random() > 0.5 ? 4 : -4);
      s.build[i3+1] = axis === 1 ? (Math.random() - 0.5) * 12 : (Math.random() > 0.5 ? 4 : -4);
      s.build[i3+2] = axis === 2 ? (Math.random() - 0.5) * 12 : (Math.random() > 0.5 ? 4 : -4);

      // 6. MOVE (Vortex / Flow)
      const radius = Math.random() * 10;
      const angle = Math.random() * Math.PI * 2 + (radius * 0.5);
      s.move[i3] = Math.cos(angle) * radius;
      s.move[i3+1] = (Math.random() - 0.5) * 20;
      s.move[i3+2] = Math.sin(angle) * radius;

      // 7. CRAFT (Microscopic detail plane)
      s.craft[i3] = (Math.random() - 0.5) * 8;
      s.craft[i3+1] = (Math.random() - 0.5) * 8;
      s.craft[i3+2] = (Math.random() - 0.5) * 0.05;

      // 8. FINAL W (Abstract W form)
      let wx, wy;
      if (normalized < 0.25) { wx = -6 + normalized * 16; wy = 4 - normalized * 32; }
      else if (normalized < 0.5) { wx = -2 + (normalized - 0.25) * 16; wy = -4 + (normalized - 0.25) * 32; }
      else if (normalized < 0.75) { wx = 2 + (normalized - 0.5) * 16; wy = 4 - (normalized - 0.5) * 32; }
      else { wx = 6 + (normalized - 0.75) * 16; wy = -4 + (normalized - 0.75) * 32; }
      s.finalW[i3] = wx + (Math.random() - 0.5) * 0.5;
      s.finalW[i3+1] = wy + (Math.random() - 0.5) * 0.5;
      s.finalW[i3+2] = (Math.random() - 0.5) * 0.5;
    }
    
    return s;
  }, [count]);

  const getTargetPositions = (progress) => {
    if (progress < 0.05) return states.hero;
    if (progress < 0.15) return states.idea;
    if (progress < 0.25) return states.strategy;
    if (progress < 0.35) return states.structure;
    if (progress < 0.45) return states.design;
    if (progress < 0.55) return states.build;
    if (progress < 0.65) return states.move;
    if (progress > 0.75 && progress < 0.85) return states.craft;
    if (progress > 0.90) return states.finalW;
    return states.move;
  };

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    
    const p = scrollProgress.get ? scrollProgress.get() : 0;
    const targetArray = getTargetPositions(p);
    const currentArray = pointsRef.current.geometry.attributes.position.array;
    
    // Physics and Lerping
    for (let i = 0; i < count * 3; i++) {
      // Lerp tightly to target
      currentArray[i] = THREE.MathUtils.lerp(currentArray[i], targetArray[i], 0.08);
    }

    // Cursor interaction (Repulsion / Attraction)
    const mx = (mouse.x * state.viewport.width) / 2;
    const my = (mouse.y * state.viewport.height) / 2;
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const dx = currentArray[i3] - mx;
      const dy = currentArray[i3+1] - my;
      const dist = Math.sqrt(dx*dx + dy*dy);
      
      // Cursor behaves as a physical force
      if (dist < 3) {
        currentArray[i3] += dx * 0.1;
        currentArray[i3+1] += dy * 0.1;
      }
    }
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true;

    // Camera choreography tied to scroll narrative
    let targetCamZ = 15;
    let targetCamY = 0;
    
    if (p < 0.05) { targetCamZ = 20 - (p * 100); } // Camera zooms INTO the hero machine
    else if (p > 0.75 && p < 0.85) { targetCamZ = 4; } // Microscopic zoom for CRAFT
    else if (p > 0.90) { targetCamZ = 25; } // Zoom out to see the huge W
    
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCamZ, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCamY, 0.05);
    
    // Rotation & Momentum
    const baseRotation = delta * 0.1;
    let velocityMultiplier = 1;
    if (p > 0.55 && p < 0.65) velocityMultiplier = 8; // MOVE section is high velocity
    
    pointsRef.current.rotation.y += baseRotation * velocityMultiplier;
    pointsRef.current.rotation.x += baseRotation * velocityMultiplier * 0.5;

    // Color shifting
    if (materialRef.current) {
      const isCraft = p > 0.75 && p < 0.85;
      const isBuild = p > 0.45 && p < 0.55;
      let hex = "#C2496B"; // Default Raspberry
      if (isCraft || isBuild) hex = "#C8A464"; // Gold for technical sections
      materialRef.current.color.lerp(new THREE.Color(hex), 0.05);
      
      // Final Collapse (Fade to 0 at the very end)
      if (p > 0.98) {
        materialRef.current.opacity = THREE.MathUtils.lerp(materialRef.current.opacity, 0, 0.1);
        const s = THREE.MathUtils.lerp(pointsRef.current.scale.x, 0.001, 0.1);
        pointsRef.current.scale.set(s,s,s);
      } else {
        materialRef.current.opacity = THREE.MathUtils.lerp(materialRef.current.opacity, 0.8, 0.1);
        const s = THREE.MathUtils.lerp(pointsRef.current.scale.x, 1, 0.1);
        pointsRef.current.scale.set(s,s,s);
      }
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={count}
            array={states.hero}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial 
          ref={materialRef}
          size={0.06} 
          color="#C2496B" 
          transparent 
          opacity={0.8} 
          sizeAttenuation 
          blending={THREE.AdditiveBlending}
        />
      </points>
    </>
  );
}
