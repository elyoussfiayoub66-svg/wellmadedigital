import os

DIR = r"C:\Users\AYOUB\Desktop\webgobuilder\components\home"
THREE_DIR = os.path.join(DIR, "3d")
os.makedirs(DIR, exist_ok=True)
os.makedirs(THREE_DIR, exist_ok=True)

files = {}

# =================================================================
# THE WELLMADE MACHINE (3D ENGINE)
# =================================================================

files['3d/WellmadeMachine.jsx'] = """'use client';
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
"""

# =================================================================
# DOM OVERLAYS & NARRATIVE SECTIONS
# =================================================================

files['MasterTimeline.jsx'] = """'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';

export default function MasterTimeline() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });

  // Map scroll progress to opacity of chapters (fade in and out precisely)
  const mapOpacity = (start, peak1, peak2, end) => useTransform(scrollYProgress, [start, peak1, peak2, end], [0, 1, 1, 0]);
  
  const opHero = mapOpacity(0.00, 0.02, 0.05, 0.08);
  const opIdea = mapOpacity(0.09, 0.11, 0.14, 0.16);
  const opStrat = mapOpacity(0.18, 0.21, 0.24, 0.27);
  const opStruct = mapOpacity(0.28, 0.31, 0.34, 0.37);
  const opDesign = mapOpacity(0.38, 0.41, 0.44, 0.47);
  const opBuild = mapOpacity(0.48, 0.51, 0.54, 0.57);
  const opMove = mapOpacity(0.58, 0.61, 0.64, 0.67);
  
  // Quiet Section (0.7 to 0.75) uses background color change, covered below
  const opCraft = mapOpacity(0.77, 0.80, 0.83, 0.86);
  const opFinal = mapOpacity(0.88, 0.92, 1.0, 1.0);

  return (
    <div ref={containerRef} className="relative h-[1200vh] w-full pointer-events-none">
      
      {/* Fixed Sticky Wrapper for perfectly centered content overlay */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center text-center px-6">
        
        {/* HERO */}
        <motion.div style={{ opacity: opHero }} className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto">
          <h1 className="text-6xl md:text-[8rem] font-medium tracking-tighter text-[#F7F5F0] leading-[1.0] mb-8 mix-blend-difference">
            WE MAKE<br/> DIGITAL<br/> EXPERIENCES<br/> <span className="text-[#C2496B]">MOVE.</span>
          </h1>
        </motion.div>

        {/* 01 IDEA */}
        <motion.div style={{ opacity: opIdea }} className="absolute inset-0 flex flex-col items-center justify-center mix-blend-difference">
          <div className="text-xs font-bold tracking-[0.3em] uppercase text-[#C2496B] mb-8">01 / RAW</div>
          <h2 className="text-5xl md:text-8xl font-medium tracking-tighter text-[#F7F5F0]">EVERYTHING STARTS WITH AN IDEA.</h2>
        </motion.div>

        {/* 02 STRATEGY */}
        <motion.div style={{ opacity: opStrat }} className="absolute inset-0 flex flex-col items-center justify-center mix-blend-difference">
          <div className="text-xs font-bold tracking-[0.3em] uppercase text-[#C2496B] mb-8">02 / STRATEGY</div>
          <h2 className="text-5xl md:text-8xl font-medium tracking-tighter text-[#F7F5F0]">CLARITY BEFORE CREATION.</h2>
        </motion.div>

        {/* 03 STRUCTURE */}
        <motion.div style={{ opacity: opStruct }} className="absolute inset-0 flex flex-col items-center justify-center mix-blend-difference">
          <div className="text-xs font-bold tracking-[0.3em] uppercase text-[#C2496B] mb-8">03 / STRUCTURE</div>
          <h2 className="text-5xl md:text-8xl font-medium tracking-tighter text-[#F7F5F0]">IDEAS NEED STRUCTURE.</h2>
        </motion.div>

        {/* 04 DESIGN */}
        <motion.div style={{ opacity: opDesign }} className="absolute inset-0 flex flex-col items-center justify-center mix-blend-difference">
          <div className="text-xs font-bold tracking-[0.3em] uppercase text-[#C2496B] mb-8">04 / DESIGN</div>
          <h2 className="text-5xl md:text-8xl font-medium tracking-tighter text-[#F7F5F0]">STRUCTURE BECOMES EXPERIENCE.</h2>
        </motion.div>

        {/* 05 BUILD */}
        <motion.div style={{ opacity: opBuild }} className="absolute inset-0 flex flex-col items-center justify-center mix-blend-difference">
          <div className="text-xs font-bold tracking-[0.3em] uppercase text-[#C8A464] mb-8">05 / TECHNOLOGY</div>
          <h2 className="text-5xl md:text-8xl font-medium tracking-tighter text-[#F7F5F0]">MAKE IT REAL.</h2>
        </motion.div>

        {/* 06 MOVE */}
        <motion.div style={{ opacity: opMove }} className="absolute inset-0 flex flex-col items-center justify-center mix-blend-difference">
          <div className="text-xs font-bold tracking-[0.3em] uppercase text-[#C2496B] mb-8">06 / EXPERIENCE</div>
          <h2 className="text-5xl md:text-8xl font-medium tracking-tighter text-[#F7F5F0] leading-[1.05]">
            A DIGITAL EXPERIENCE SHOULD <span className="text-[#C2496B]">MOVE</span> PEOPLE.
          </h2>
        </motion.div>

        {/* THE QUIET SECTION (0.7 - 0.75) */}
        {/* We use a solid Ivory overlay to block out the 3D completely */}
        <motion.div 
          style={{ opacity: mapOpacity(0.69, 0.71, 0.74, 0.76) }} 
          className="absolute inset-0 flex flex-col items-center justify-center bg-[#F7F5F0] text-[#0E0E0F] pointer-events-auto"
        >
          <div className="max-w-6xl mx-auto text-left w-full px-6">
            <h2 className="text-6xl md:text-[9rem] font-medium tracking-tighter leading-[1.0] mb-8">WE DON'T ADD MORE.</h2>
            <h2 className="text-6xl md:text-[9rem] font-medium tracking-tighter leading-[1.0] text-[#0E0E0F]/40">WE MAKE WHAT MATTERS <span className="text-[#C2496B]">BETTER.</span></h2>
          </div>
        </motion.div>

        {/* CRAFT */}
        <motion.div style={{ opacity: opCraft }} className="absolute inset-0 flex flex-col items-center justify-center mix-blend-difference">
          <div className="text-xs font-bold tracking-[0.3em] uppercase text-[#C8A464] mb-8">07 / CRAFT</div>
          <h2 className="text-5xl md:text-8xl font-medium tracking-tighter text-[#F7F5F0]">THE DIFFERENCE IS IN THE DETAILS.</h2>
        </motion.div>

        {/* FINAL CTA & RESOLUTION */}
        <motion.div style={{ opacity: opFinal }} className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto mix-blend-difference">
          <h2 className="text-5xl md:text-[8rem] font-medium tracking-tighter text-[#F7F5F0] mb-12">
            LET'S MAKE SOMETHING WELL MADE.
          </h2>
          <Link href="/book" className="inline-block bg-[#C2496B] text-[#F7F5F0] px-12 py-6 text-sm uppercase tracking-widest font-bold hover:bg-[#a13b58] transition-colors">
            Start a Project &rarr;
          </Link>
          
          <motion.div style={{ opacity: useTransform(scrollYProgress, [0.95, 0.98], [0, 1]) }} className="absolute bottom-20 flex flex-col items-center">
            <div className="text-5xl font-bold tracking-widest text-[#F7F5F0] mb-2">WELLMADE</div>
            <div className="text-sm font-serif italic text-[#C8A464]">Digital experiences, made with intention.</div>
          </motion.div>
        </motion.div>

      </div>
    </div>
  );
}
"""

files['Navbar.jsx'] = """'use client';
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 py-8 px-6 md:px-12 flex items-center justify-between pointer-events-auto mix-blend-difference">
      <Link href="/" className="font-bold text-lg tracking-widest text-[#F7F5F0]">
        WELLMADE
      </Link>
      <Link href="/book" className="text-[10px] uppercase tracking-widest font-bold text-[#C2496B] hover:text-[#F7F5F0] transition-colors border-b border-[#C2496B]/30 pb-1">
        Start a Project &rarr;
      </Link>
    </nav>
  );
}
"""

# =================================================================
# PAGE ROOT
# =================================================================

page_code = """'use client';
import { useState, useEffect, Suspense } from 'react';
import { useScroll } from 'framer-motion';
import { Canvas } from '@react-three/fiber';

import Navbar from '@/components/home/Navbar';
import WellmadeMachine from '@/components/home/3d/WellmadeMachine';
import MasterTimeline from '@/components/home/MasterTimeline';

export default function Home() {
  const { scrollYProgress } = useScroll();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="relative w-full bg-[#0E0E0F] antialiased font-sans selection:bg-[#C2496B] selection:text-[#F7F5F0]">
      
      {/* 
        THE MACHINE: Global Fixed WebGL Canvas 
        This is the single evolving digital ecosystem described in the brief.
      */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {mounted && (
          <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 20], fov: 45 }}>
            <Suspense fallback={null}>
              <WellmadeMachine scrollProgress={scrollYProgress} />
            </Suspense>
          </Canvas>
        )}
      </div>

      <Navbar />
      
      {/* 
        THE STORY: Cinematic scroll-linked timeline overlay
      */}
      <div className="relative z-10 pointer-events-none">
        <MasterTimeline />
      </div>

    </main>
  );
}
"""

for name, code in files.items():
    with open(os.path.join(DIR, name), 'w', encoding='utf-8') as f:
        f.write(code)

with open(r"C:\Users\AYOUB\Desktop\webgobuilder\app\page.jsx", 'w', encoding='utf-8') as f:
    f.write(page_code)
