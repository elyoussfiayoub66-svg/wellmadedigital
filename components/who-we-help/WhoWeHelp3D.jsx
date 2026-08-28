'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Image, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// Individual Image Component to handle its own complex active animation
function IndustryItem({ ind, i, angleStep, radius, scrollYProgress, totalItems }) {
  const meshGroupRef = useRef();

  const angle = i * angleStep;
  const basePathX = Math.sin(angle) * radius;
  const basePathZ = Math.cos(angle) * radius;

  useFrame(() => {
    if (!meshGroupRef.current) return;
    
    // Calculate distance from the active index
    const progress = scrollYProgress.get ? scrollYProgress.get() : 0;
    const activeIndex = progress * (totalItems - 1);
    const dist = Math.abs(activeIndex - i);
    
    // activeFactor is 1 when perfectly active, 0 when 1 or more indices away
    const activeFactor = Math.max(0, 1 - dist);

    // 1. Animate Scale: Inactive images scale down slightly (0.75), active image scales up massively (1.4)
    const targetScale = 0.75 + activeFactor * 0.65; 
    meshGroupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.08);

    // 2. Animate Position: Active image pops significantly forward out of the ring towards the camera
    // Since it's rotated, moving on local Z moves it forward/backward
    const targetZ = activeFactor * 6; 
    meshGroupRef.current.position.z = THREE.MathUtils.lerp(meshGroupRef.current.position.z, targetZ, 0.08);
    
    // 3. Subtle floating up when active
    meshGroupRef.current.position.y = THREE.MathUtils.lerp(meshGroupRef.current.position.y, activeFactor * 0.8, 0.08);
  });

  return (
    <group position={[basePathX, 0, basePathZ]} rotation={[0, angle, 0]}>
      {/* Wrapper group that animates locally */}
      <group ref={meshGroupRef}>
         <Image 
           url={ind.image} 
           scale={[5, 7]} 
           transparent 
           opacity={1} 
           toneMapped={false} 
         />
         
         <mesh position={[0, 0, 0.02]}>
            <planeGeometry args={[5, 7]} />
            <meshBasicMaterial color="#0E0E0F" transparent opacity={0.2} />
         </mesh>
         
         {/* Highlight Frame */}
         <mesh position={[0, 0, 0.01]}>
            <planeGeometry args={[5.2, 7.2]} />
            <meshBasicMaterial color="#C8A464" transparent opacity={0.15} wireframe />
         </mesh>
      </group>
    </group>
  );
}

export default function WhoWeHelp3D({ scrollYProgress, industries }) {
  const groupRef = useRef();

  const radius = 14;
  const totalItems = industries.length;
  const angleStep = (Math.PI * 2) / totalItems;

  useFrame((state, delta) => {
    const progress = scrollYProgress.get ? scrollYProgress.get() : 0;
    const targetRotationY = -(progress * (totalItems - 1) * angleStep);
    
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetRotationY,
      delta * 4
    );
    
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
  });

  return (
    <group position={[10, 0, -10]} ref={groupRef}>
      {industries.map((ind, i) => (
        <IndustryItem 
          key={i} 
          ind={ind} 
          i={i} 
          angleStep={angleStep} 
          radius={radius} 
          scrollYProgress={scrollYProgress} 
          totalItems={totalItems} 
        />
      ))}
      <Sparkles count={300} scale={[30, 20, 30]} size={2} speed={0.2} opacity={0.15} color="#C8A464" />
    </group>
  );
}
