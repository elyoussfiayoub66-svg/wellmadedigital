import os

COMPONENTS_DIR = r"C:\Users\AYOUB\Desktop\webgobuilder\components\home"
THREE_DIR = os.path.join(COMPONENTS_DIR, "3d")
os.makedirs(COMPONENTS_DIR, exist_ok=True)
os.makedirs(THREE_DIR, exist_ok=True)

files = {}

# ==========================================
# 3D SYSTEM
# ==========================================

files['3d/WellmadeWorld.jsx'] = """'use client';
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
    
    // Smooth scroll progress
    const targetArray = getTargetPositions(scrollProgress);
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
    if (scrollProgress > 0.65 && scrollProgress < 0.75) {
      targetCamZ = 3; // Zoom in for Craft
    } else if (scrollProgress > 0.95) {
      targetCamZ = 15; // Zoom out for Final W
    }
    
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCamZ, 0.03);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCamY, 0.03);
    
    // Global rotation
    pointsRef.current.rotation.y += delta * 0.05;
    if (scrollProgress > 0.33 && scrollProgress < 0.40) {
      pointsRef.current.rotation.y += delta * 0.5; // Move state accelerates
    }

    // Material logic (Raspberry vs Gold vs Black based on narrative)
    if (materialRef.current) {
      // Craft uses Gold, others use Raspberry
      const isCraft = scrollProgress > 0.65 && scrollProgress < 0.75;
      const targetColor = new THREE.Color(isCraft ? "#C8A464" : "#C2496B");
      materialRef.current.color.lerp(targetColor, 0.05);
      
      // Final collapse (fade out particles when perfectly 1.0)
      if (scrollProgress > 0.98) {
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
"""

# ==========================================
# UI COMPONENTS
# ==========================================

files['Navbar.jsx'] = """'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 flex items-center justify-between px-6 md:px-12 pointer-events-auto ${
        scrolled ? 'py-4 bg-[#0E0E0F]/75 backdrop-blur-xl border-b border-[#F7F5F0]/10' : 'py-8 bg-transparent border-transparent'
      }`}
    >
      <Link href="/" className="font-bold text-lg tracking-widest text-[#F7F5F0]">
        WELLMADE
      </Link>
      
      <div className="hidden md:flex items-center gap-10 text-[10px] tracking-widest uppercase font-bold text-[#F7F5F0]/70">
        <Link href="#work" className="hover:text-[#F7F5F0] transition-colors">Work</Link>
        <Link href="#services" className="hover:text-[#F7F5F0] transition-colors">Services</Link>
        <Link href="#process" className="hover:text-[#F7F5F0] transition-colors">Process</Link>
        <Link href="#about" className="hover:text-[#F7F5F0] transition-colors">About</Link>
        <Link href="#insights" className="hover:text-[#F7F5F0] transition-colors">Insights</Link>
      </div>

      <Link href="/book" className="text-[10px] uppercase tracking-widest font-bold text-[#C2496B] hover:text-[#F7F5F0] transition-colors">
        Start a Project &rarr;
      </Link>
    </motion.nav>
  );
}
"""

files['Hero.jsx'] = """'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

// The Hero section is massive (600vh) to allow the 6 stages of scroll transformation
// RAW (0vh) -> THINK (100vh) -> STRUCTURE (200vh) -> DESIGN (300vh) -> BUILD (400vh) -> MOVE (500vh)
export default function Hero() {
  const containerRef = useRef();
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });

  // Map scroll progress to opacities of different text stages
  const oIntro = useTransform(scrollYProgress, [0, 0.05, 0.1], [1, 1, 0]);
  const oRaw = useTransform(scrollYProgress, [0.08, 0.1, 0.15, 0.18], [0, 1, 1, 0]);
  const oThink = useTransform(scrollYProgress, [0.17, 0.2, 0.25, 0.28], [0, 1, 1, 0]);
  const oStruct = useTransform(scrollYProgress, [0.27, 0.3, 0.35, 0.38], [0, 1, 1, 0]);
  const oDesign = useTransform(scrollYProgress, [0.37, 0.4, 0.45, 0.48], [0, 1, 1, 0]);
  const oBuild = useTransform(scrollYProgress, [0.47, 0.5, 0.55, 0.58], [0, 1, 1, 0]);
  const oMove = useTransform(scrollYProgress, [0.57, 0.6, 0.65, 0.7], [0, 1, 1, 0]);

  return (
    <section ref={containerRef} className="relative h-[700vh] w-full pointer-events-none">
      <div className="sticky top-0 h-screen w-full flex items-center justify-center text-center px-6">
        
        {/* INTRO */}
        <motion.div style={{ opacity: oIntro }} className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto">
          <div className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#F7F5F0]/50 mb-8">
            DIGITAL STUDIO / STRATEGY × DESIGN × TECHNOLOGY
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-[7rem] font-medium tracking-tighter text-[#F7F5F0] leading-[1.05] mb-8">
            We make digital <br/> experiences move.
          </h1>
          <p className="text-lg text-[#F7F5F0]/70 max-w-2xl mx-auto mb-16 font-light">
            Strategy, design and technology brought together to create digital experiences people understand, remember and act on.
          </p>
          <div className="flex gap-8">
            <a href="/book" className="text-xs uppercase tracking-widest font-bold text-[#C2496B] border-b border-[#C2496B] pb-1">Start a Project &rarr;</a>
            <a href="#work" className="text-xs uppercase tracking-widest font-bold text-[#F7F5F0]/50 hover:text-[#F7F5F0]">Explore Our Work</a>
          </div>
        </motion.div>

        {/* 01 RAW */}
        <motion.div style={{ opacity: oRaw }} className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-xs font-bold tracking-[0.3em] uppercase text-[#C2496B] mb-8">01 / RAW</div>
          <h2 className="text-5xl md:text-8xl font-medium tracking-tighter text-[#F7F5F0]">Everything starts undefined.</h2>
        </motion.div>

        {/* 02 THINK */}
        <motion.div style={{ opacity: oThink }} className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-xs font-bold tracking-[0.3em] uppercase text-[#C2496B] mb-8">02 / STRATEGY</div>
          <h2 className="text-5xl md:text-8xl font-medium tracking-tighter text-[#F7F5F0]">Before we build, we understand.</h2>
        </motion.div>

        {/* 03 STRUCTURE */}
        <motion.div style={{ opacity: oStruct }} className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-xs font-bold tracking-[0.3em] uppercase text-[#C2496B] mb-8">03 / STRUCTURE</div>
          <h2 className="text-5xl md:text-8xl font-medium tracking-tighter text-[#F7F5F0]">Ideas need architecture.</h2>
        </motion.div>

        {/* 04 DESIGN */}
        <motion.div style={{ opacity: oDesign }} className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-xs font-bold tracking-[0.3em] uppercase text-[#C2496B] mb-8">04 / DESIGN</div>
          <h2 className="text-5xl md:text-8xl font-medium tracking-tighter text-[#F7F5F0]">Structure becomes experience.</h2>
        </motion.div>

        {/* 05 BUILD */}
        <motion.div style={{ opacity: oBuild }} className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-xs font-bold tracking-[0.3em] uppercase text-[#C2496B] mb-8">05 / TECHNOLOGY</div>
          <h2 className="text-5xl md:text-8xl font-medium tracking-tighter text-[#F7F5F0]">Then we make it real.</h2>
        </motion.div>

        {/* 06 MOVE */}
        <motion.div style={{ opacity: oMove }} className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-xs font-bold tracking-[0.3em] uppercase text-[#C2496B] mb-8">06 / EXPERIENCE</div>
          <h2 className="text-5xl md:text-8xl font-medium tracking-tighter text-[#F7F5F0] max-w-4xl leading-[1.05]">
            Because a digital experience should never feel static.
          </h2>
        </motion.div>

      </div>
    </section>
  );
}
"""

files['Manifesto.jsx'] = """'use client';
import { motion } from 'framer-motion';

export default function Manifesto() {
  return (
    <section className="relative bg-[#F7F5F0] text-[#0E0E0F] py-40 px-6 md:px-12 min-h-screen flex items-center justify-center z-10 pointer-events-auto">
      <div className="max-w-5xl mx-auto text-center">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1 }}
          className="text-6xl md:text-8xl lg:text-[9rem] font-medium tracking-tighter leading-[1.0]"
        >
          Good design isn't decoration.
        </motion.h2>
        <motion.h2 
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1.5, delay: 0.5 }}
          className="text-6xl md:text-8xl lg:text-[9rem] font-medium tracking-tighter leading-[1.0] mt-4 text-[#0E0E0F]/40"
        >
          It's <span className="text-[#C2496B]">direction.</span>
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1, delay: 1 }}
          className="mt-16 text-xl tracking-widest font-bold uppercase text-[#0E0E0F]/60"
        >
          We design with a reason.
        </motion.p>
      </div>
    </section>
  );
}
"""

files['InvisibleLayer.jsx'] = """'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const nodes = [
  { id: 'BUSINESS GOAL', connects: 'USER ACTION' },
  { id: 'USER ACTION', connects: 'INTERFACE' },
  { id: 'INTERFACE', connects: 'CONVERSION' },
  { id: 'CONVERSION', connects: 'BUSINESS GOAL' },
];

export default function InvisibleLayer() {
  const [activeNode, setActiveNode] = useState(null);

  return (
    <section className="relative bg-[#0E0E0F] text-[#F7F5F0] py-40 px-6 md:px-12 min-h-screen flex flex-col justify-center items-center z-10 pointer-events-auto overflow-hidden">
      <div className="text-center mb-32 relative z-10">
        <h2 className="text-4xl md:text-6xl font-medium tracking-tighter mb-4">The Invisible Layer.</h2>
        <p className="text-[#F7F5F0]/50 tracking-widest uppercase text-xs font-bold">Everything is connected.</p>
      </div>

      <div className="relative w-full max-w-4xl aspect-video md:aspect-auto md:h-[400px] flex flex-wrap justify-center items-center gap-12 z-10">
        {nodes.map((node) => (
          <div 
            key={node.id}
            onMouseEnter={() => setActiveNode(node)}
            onMouseLeave={() => setActiveNode(null)}
            className={`cursor-pointer px-8 py-4 border transition-all duration-500 rounded-full ${
              activeNode?.id === node.id 
                ? 'border-[#C2496B] bg-[#C2496B]/10 text-[#C2496B] scale-110' 
                : activeNode?.connects === node.id
                ? 'border-[#C8A464] text-[#C8A464] bg-[#C8A464]/10'
                : 'border-[#F7F5F0]/20 text-[#F7F5F0]/50 hover:border-[#F7F5F0]'
            }`}
          >
            <span className="text-sm tracking-[0.2em] font-bold">{node.id}</span>
          </div>
        ))}

        {/* Abstract connection lines mapped visually */}
        <AnimatePresence>
          {activeNode && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none flex items-center justify-center"
            >
               <div className="w-[60%] h-[2px] bg-gradient-to-r from-[#C2496B] to-[#C8A464] blur-sm absolute" style={{ transform: `rotate(${Math.random() * 180}deg)` }}/>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
"""

files['Strategy.jsx'] = """'use client';
export default function Strategy() {
  return (
    <section className="relative bg-[#F7F5F0] text-[#0E0E0F] py-40 px-6 md:px-12 z-10 pointer-events-auto">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-5xl md:text-7xl font-medium tracking-tighter leading-[1.1] mb-32 max-w-4xl">
          We solve the problem before we design the solution.
        </h2>

        <div className="flex flex-col gap-24 border-t border-[#0E0E0F]/10 pt-16 relative">
          {[
            { t: 'POSITION', d: "Where should your business live in the customer's mind?" },
            { t: 'MESSAGE', d: "What should they understand immediately?" },
            { t: 'ACTION', d: "What should they do next?" },
          ].map((item, i) => (
            <div key={i} className="group relative">
              <h3 className="text-6xl md:text-[7rem] font-medium tracking-tighter mb-6 text-[#0E0E0F]/80 group-hover:text-[#C2496B] transition-colors duration-500">{item.t}</h3>
              <p className="text-2xl md:text-4xl text-[#0E0E0F]/50 font-serif italic max-w-3xl">{item.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
"""

files['Services.jsx'] = """'use client';
export default function Services() {
  const services = ['STRATEGY', 'DESIGN', 'DEVELOPMENT', 'GROWTH'];
  return (
    <section className="relative bg-[#0E0E0F] text-[#F7F5F0] py-40 px-6 md:px-12 min-h-screen z-10 pointer-events-auto mix-blend-difference">
      {/* 
        This section uses the global WellmadeWorld canvas behind it.
        We make the background transparent so the canvas shows through.
      */}
      <div className="max-w-7xl mx-auto relative z-10">
        <h2 className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#F7F5F0]/40 mb-20">What we make.</h2>
        <div className="flex flex-col">
          {services.map((s, i) => (
            <div key={i} className="py-12 border-b border-[#F7F5F0]/10 cursor-pointer group">
              <h3 className="text-6xl md:text-[8rem] font-medium tracking-tighter text-[#F7F5F0]/30 group-hover:text-[#C2496B] transition-colors duration-500">
                {s}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
"""

files['Process.jsx'] = """'use client';
export default function Process() {
  const steps = ['DISCOVER', 'DEFINE', 'DESIGN', 'BUILD', 'REFINE'];
  return (
    <section className="relative bg-[#F7F5F0] text-[#0E0E0F] py-40 px-6 md:px-12 z-10 pointer-events-auto">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-5xl md:text-7xl font-medium tracking-tighter leading-[1.05] mb-40 max-w-4xl">
          A better process creates a better result.
        </h2>
        <div className="relative pl-12 md:pl-[30%]">
          <div className="absolute left-[3px] top-0 bottom-0 w-[2px] bg-[#C2496B]" />
          <div className="space-y-40 pb-20">
            {steps.map((step, i) => (
              <div key={i} className="relative pl-12">
                <div className="absolute left-[-5px] top-3 w-4 h-4 rounded-full bg-[#F7F5F0] border-2 border-[#C2496B]" />
                <div className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#C8A464] mb-4">0{i+1}</div>
                <h3 className="text-5xl md:text-6xl font-medium tracking-tighter text-[#0E0E0F]">{step}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
"""

files['Craft.jsx'] = """'use client';
export default function Craft() {
  return (
    <section className="relative bg-transparent text-[#F7F5F0] py-40 px-6 md:px-12 min-h-[120vh] z-10 pointer-events-none flex items-center justify-center">
      {/* Background is transparent to see the global 3D 'CRAFT' state (Zoomed in, gold) */}
      <div className="max-w-6xl mx-auto text-center relative z-10 pointer-events-auto mix-blend-difference">
        <h2 className="text-6xl md:text-[9rem] font-medium tracking-tighter leading-[1.0] text-[#C8A464]">
          Details change everything.
        </h2>
      </div>
    </section>
  );
}
"""

files['Performance.jsx'] = """'use client';
export default function Performance() {
  return (
    <section className="relative bg-[#0E0E0F] text-[#F7F5F0] py-40 px-6 md:px-12 z-10 pointer-events-auto">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-5xl md:text-7xl font-medium tracking-tighter leading-[1.05] mb-12">
          Complexity should exist behind simplicity.
        </h2>
        <p className="text-xl md:text-3xl text-[#F7F5F0]/60 max-w-4xl mx-auto font-light leading-relaxed">
          The best experiences feel effortless because the complexity has been handled for you.
        </p>
      </div>
    </section>
  );
}
"""

files['WhyWellmade.jsx'] = """'use client';
import { motion } from 'framer-motion';

export default function WhyWellmade() {
  return (
    <section className="relative bg-[#F7F5F0] text-[#0E0E0F] py-40 px-6 md:px-12 z-10 pointer-events-auto min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto w-full">
        <h2 className="text-6xl md:text-[8rem] font-medium tracking-tighter leading-[1.0] mb-6">We don't add more.</h2>
        <h2 className="text-6xl md:text-[8rem] font-medium tracking-tighter leading-[1.0] text-[#0E0E0F]/40 mb-32">
          We make what matters <span className="text-[#C2496B]">better.</span>
        </h2>
        
        <div className="flex flex-col gap-8">
          {['CLARITY', 'CRAFT', 'PERFORMANCE', 'PURPOSE'].map((w, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: i * 0.2 }} className="flex items-center gap-6">
              <div className="text-4xl md:text-6xl font-medium tracking-tight text-[#0E0E0F]">{w}</div>
              <div className="w-2 h-2 rounded-full bg-[#C2496B]" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
"""

files['Insights.jsx'] = """'use client';
export default function Insights() {
  const articles = [
    "Why most business websites don't convert",
    "The difference between a website and a digital experience",
    "Designing for attention, trust and action"
  ];
  return (
    <section className="relative bg-[#F7F5F0] text-[#0E0E0F] py-40 px-6 md:px-12 z-10 pointer-events-auto border-t border-[#0E0E0F]/10">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-5xl md:text-7xl font-medium tracking-tighter mb-24">Thinking beyond the interface.</h2>
        <div className="flex flex-col">
          {articles.map((a, i) => (
            <div key={i} className="group py-12 border-b border-[#0E0E0F]/10 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between cursor-pointer transition-transform hover:translate-x-4">
              <div className="flex-1">
                <div className="text-[10px] font-bold tracking-[0.2em] text-[#C2496B] mb-4">ARTICLE</div>
                <h3 className="text-3xl md:text-4xl font-medium tracking-tight group-hover:text-[#C2496B] transition-colors">{a}</h3>
              </div>
              <div className="w-12 h-12 rounded-full border border-[#0E0E0F]/20 flex items-center justify-center group-hover:bg-[#C2496B] group-hover:border-[#C2496B] group-hover:text-[#F7F5F0] transition-all">&rarr;</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
"""

files['FinalCTA.jsx'] = """'use client';
export default function FinalCTA() {
  // Transparent background so the global W and point collapse is visible
  return (
    <section className="relative bg-transparent text-[#F7F5F0] h-[200vh] pointer-events-none flex flex-col justify-between">
      
      {/* Top portion: the CTA text */}
      <div className="pt-40 px-6 md:px-12 max-w-5xl mx-auto text-center mix-blend-difference pointer-events-auto">
        <h2 className="text-6xl md:text-[8rem] font-medium tracking-tighter leading-[1.0] mb-12">
          Let's make something unforgettable.
        </h2>
        <p className="text-xl md:text-3xl text-[#F7F5F0]/70 max-w-3xl mx-auto mb-16 font-light">
          Tell us where your business is today. We'll help you build where it's going next.
        </p>
        <a href="/book" className="inline-block bg-[#C2496B] text-[#F7F5F0] px-12 py-6 text-sm uppercase tracking-widest font-bold hover:bg-[#a13b58] transition-colors pointer-events-auto">
          Start a Project &rarr;
        </a>
      </div>

      {/* Bottom portion: The final WELLMADE resolution at the bottom of the scroll */}
      <div className="pb-20 px-6 text-center mix-blend-difference">
        <div className="text-5xl md:text-7xl font-bold tracking-widest text-[#F7F5F0] mb-4">WELLMADE</div>
        <div className="text-lg font-serif italic text-[#C8A464]">Digital experiences, made well.</div>
      </div>
    </section>
  );
}
"""

files['Footer.jsx'] = """'use client';
export default function Footer() {
  return (
    <footer className="bg-[#0E0E0F] text-[#F7F5F0] px-6 md:px-12 py-12 relative z-20 pointer-events-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between text-[10px] uppercase tracking-widest font-bold text-[#F7F5F0]/40">
        <div>© 2026 Wellmade Digital. Make the invisible visible.</div>
        <div className="flex gap-8 mt-4 md:mt-0">
          <a href="#" className="hover:text-[#F7F5F0]">Privacy</a>
          <a href="#" className="hover:text-[#F7F5F0]">Terms</a>
        </div>
      </div>
    </footer>
  );
}
"""

for name, code in files.items():
    with open(os.path.join(COMPONENTS_DIR, name), 'w', encoding='utf-8') as f:
        f.write(code)

page_code = """'use client';
import { useState, useEffect, Suspense } from 'react';
import { useScroll } from 'framer-motion';
import { Canvas } from '@react-three/fiber';

import Navbar from '@/components/home/Navbar';
import WellmadeWorld from '@/components/home/3d/WellmadeWorld';
import Hero from '@/components/home/Hero';
import Manifesto from '@/components/home/Manifesto';
import InvisibleLayer from '@/components/home/InvisibleLayer';
import Strategy from '@/components/home/Strategy';
import Services from '@/components/home/Services';
import Process from '@/components/home/Process';
import Craft from '@/components/home/Craft';
import Performance from '@/components/home/Performance';
import WhyWellmade from '@/components/home/WhyWellmade';
import Insights from '@/components/home/Insights';
import FinalCTA from '@/components/home/FinalCTA';
import Footer from '@/components/home/Footer';

export default function Home() {
  const { scrollYProgress } = useScroll();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="relative w-full bg-[#0E0E0F] antialiased font-sans selection:bg-[#C2496B] selection:text-[#F7F5F0]">
      
      {/* Global Fixed Canvas for a singular continuous 3D world */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {mounted && (
          <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 12], fov: 45 }}>
            <Suspense fallback={null}>
              <WellmadeWorld scrollProgress={scrollYProgress} />
            </Suspense>
          </Canvas>
        )}
      </div>

      <Navbar />
      
      {/* Scrollable Narrative Overlay */}
      <div className="relative z-10 pointer-events-none">
        <Hero />
        <Manifesto />
        <InvisibleLayer />
        <Strategy />
        <Services />
        <Process />
        <Craft />
        <Performance />
        <WhyWellmade />
        <Insights />
        <FinalCTA />
        <Footer />
      </div>

    </main>
  );
}
"""

with open(r"C:\Users\AYOUB\Desktop\webgobuilder\app\page.jsx", 'w', encoding='utf-8') as f:
    f.write(page_code)
