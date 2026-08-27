'use client';
import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export default function WellmadeWorld({ scrollProgress }) {
  const pointsRef = useRef();
  const materialRef = useRef();
  const { mouse, camera } = useThree();
  
  const count = 1500;

  // Pre-calculate target positions for all narrative states
  const { 
    rawPos, thinkPos, structurePos, designPos, buildPos, 
    movePos, craftPos, wPos 
  } = useMemo(() => {
    const raw = new Float32Array(count * 3);
    const think = new Float32Array(count * 3);
    const structure = new Float32Array(count * 3);
    const design = new Float32Array(count * 3);
    const build = new Float32Array(count * 3);
    const move = new Float32Array(count * 3);
    const craft = new Float32Array(count * 3);
    const w = new Float32Array(count * 3);

    // Clusters for THINK
    const clusters = Array.from({ length: 5 }, () => new THREE.Vector3(
      (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8
    ));

    const gridSize = Math.ceil(Math.pow(count, 1/3));
    const gridStep = 0.8;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // 1. RAW (Chaos)
      raw[i3] = (Math.random() - 0.5) * 20;
      raw[i3+1] = (Math.random() - 0.5) * 20;
      raw[i3+2] = (Math.random() - 0.5) * 20;

      // 2. THINK (Clustered)
      const cluster = clusters[i % 5];
      think[i3] = cluster.x + (Math.random() - 0.5) * 2;
      think[i3+1] = cluster.y + (Math.random() - 0.5) * 2;
      think[i3+2] = cluster.z + (Math.random() - 0.5) * 2;

      // 3. STRUCTURE (Grid)
      const gx = (i % gridSize) - gridSize/2;
      const gy = (Math.floor(i / gridSize) % gridSize) - gridSize/2;
      const gz = (Math.floor(i / (gridSize * gridSize))) - gridSize/2;
      structure[i3] = gx * gridStep;
      structure[i3+1] = gy * gridStep;
      structure[i3+2] = gz * gridStep;

      // 4. DESIGN (Fluid surfaces / waves)
      const u = Math.random() * Math.PI * 2;
      const v = Math.random() * Math.PI;
      const r = 5 + Math.sin(u * 4) * 1.5;
      design[i3] = r * Math.sin(v) * Math.cos(u);
      design[i3+1] = r * Math.sin(v) * Math.sin(u);
      design[i3+2] = r * Math.cos(v);

      // 5. BUILD (Precise technical bounding box)
      const axis = i % 3;
      build[i3] = axis === 0 ? (Math.random() - 0.5) * 10 : (Math.random() > 0.5 ? 5 : -5);
      build[i3+1] = axis === 1 ? (Math.random() - 0.5) * 10 : (Math.random() > 0.5 ? 5 : -5);
      build[i3+2] = axis === 2 ? (Math.random() - 0.5) * 10 : (Math.random() > 0.5 ? 5 : -5);

      // 6. MOVE (Vortex / Flow)
      const radius = Math.random() * 8;
      const angle = Math.random() * Math.PI * 2;
      move[i3] = Math.cos(angle) * radius;
      move[i3+1] = (Math.random() - 0.5) * 15;
      move[i3+2] = Math.sin(angle) * radius;

      // 7. CRAFT (Microscopic detail plane)
      craft[i3] = (Math.random() - 0.5) * 4;
      craft[i3+1] = (Math.random() - 0.5) * 4;
      craft[i3+2] = (Math.random() - 0.5) * 0.1; // almost flat

      // 8. W (Abstract W form)
      const wProgress = i / count;
      let wx, wy;
      if (wProgress < 0.25) { wx = -4 + wProgress * 8; wy = 4 - wProgress * 16; }
      else if (wProgress < 0.5) { wx = -2 + (wProgress - 0.25) * 8; wy = -0 + (wProgress - 0.25) * 16; }
      else if (wProgress < 0.75) { wx = 0 + (wProgress - 0.5) * 8; wy = 4 - (wProgress - 0.5) * 16; }
      else { wx = 2 + (wProgress - 0.75) * 8; wy = 0 + (wProgress - 0.75) * 16; }
      w[i3] = wx + (Math.random() - 0.5) * 0.5;
      w[i3+1] = wy + (Math.random() - 0.5) * 0.5;
      w[i3+2] = (Math.random() - 0.5) * 0.5;
    }
    
    return { rawPos: raw, thinkPos: think, structurePos: structure, designPos: design, buildPos: build, movePos: move, craftPos: craft, wPos: w };
  }, [count]);

  const getTargetPositions = (progress) => {
    // Map scroll progress (0-1) to the 8 states
    // Hero handles 0.0 - 0.4 (Raw, Think, Struct, Design, Build, Move)
    if (progress < 0.05) return rawPos;
    if (progress < 0.12) return thinkPos;
    if (progress < 0.19) return structurePos;
    if (progress < 0.26) return designPos;
    if (progress < 0.33) return buildPos;
    if (progress < 0.40) return movePos;
    // Craft section is around 0.7
    if (progress > 0.65 && progress < 0.75) return craftPos;
    // Final W is > 0.9
    if (progress > 0.92) return wPos;
    
    return movePos; // Default fallback state
  };

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    
    // Smooth scroll progress from Framer Motion value
    const currentProgress = scrollProgress.get ? scrollProgress.get() : scrollProgress;
    const targetArray = getTargetPositions(currentProgress);
    const currentArray = pointsRef.current.geometry.attributes.position.array;
    
    // Lerp positions
    for (let i = 0; i < count * 3; i++) {
      currentArray[i] = THREE.MathUtils.lerp(currentArray[i], targetArray[i], 0.05);
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;

    // Interactive Force Field (Mouse)
    const mx = (mouse.x * state.viewport.width) / 2;
    const my = (mouse.y * state.viewport.height) / 2;
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const dx = currentArray[i3] - mx;
      const dy = currentArray[i3+1] - my;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 2) {
        currentArray[i3] += dx * 0.05;
        currentArray[i3+1] += dy * 0.05;
      }
    }

    // Camera choreography
    let targetCamZ = 12;
    let targetCamY = 0;
    if (currentProgress > 0.65 && currentProgress < 0.75) {
      targetCamZ = 3; // Zoom in for Craft
    } else if (currentProgress > 0.95) {
      targetCamZ = 15; // Zoom out for Final W
    }
    
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCamZ, 0.03);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCamY, 0.03);
    
    // Global rotation
    pointsRef.current.rotation.y += delta * 0.05;
    if (currentProgress > 0.33 && currentProgress < 0.40) {
      pointsRef.current.rotation.y += delta * 0.5; // Move state accelerates
    }

    // Material logic (Raspberry vs Gold vs Black based on narrative)
    if (materialRef.current) {
      // Craft uses Gold, others use Raspberry
      const isCraft = currentProgress > 0.65 && currentProgress < 0.75;
      const targetColor = new THREE.Color(isCraft ? "#C8A464" : "#C2496B");
      materialRef.current.color.lerp(targetColor, 0.05);
      
      // Final collapse (fade out particles when perfectly 1.0)
      if (currentProgress > 0.98) {
        materialRef.current.opacity = THREE.MathUtils.lerp(materialRef.current.opacity, 0, 0.1);
      } else {
        materialRef.current.opacity = THREE.MathUtils.lerp(materialRef.current.opacity, 0.8, 0.1);
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
            array={rawPos}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial 
          ref={materialRef}
          size={0.05} 
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
