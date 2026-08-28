import os

DIR = r"C:\Users\AYOUB\Desktop\webgobuilder\components\work"
THREE_DIR = os.path.join(DIR, "3d")
os.makedirs(DIR, exist_ok=True)
os.makedirs(THREE_DIR, exist_ok=True)
os.makedirs(r"C:\Users\AYOUB\Desktop\webgobuilder\app\work", exist_ok=True)

files = {}

# =================================================================
# 3D COMPONENTS
# =================================================================

files['3d/WorkHero3D.jsx'] = """'use client';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function WorkHero3D() {
  const lineRef = useRef();
  
  // Abstract elegant curve
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-4, -4, 0),
      new THREE.Vector3(-2, 2, 2),
      new THREE.Vector3(0, -1, -2),
      new THREE.Vector3(2, 3, 1),
      new THREE.Vector3(4, -3, 0)
    ], false, 'chordal', 0.8);
  }, []);

  useFrame((state) => {
    if (lineRef.current) {
      lineRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.2;
      lineRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.2) * 0.1;
      
      // Animate draw range for a "drawing itself" effect
      const material = lineRef.current.material;
      if (material.dashOffset !== undefined) {
        material.dashOffset -= 0.005;
      }
    }
  });

  return (
    <group>
      <mesh ref={lineRef}>
        <tubeGeometry args={[curve, 100, 0.015, 8, false]} />
        <meshBasicMaterial color="#C2496B" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}
"""

files['3d/Transformation3D.jsx'] = """'use client';
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
    
    // Map scroll progress tightly to lerp target
    const target = p > 0.5 ? order : chaos;
    const lerpFactor = p > 0.5 ? (p - 0.5) * 2 : (0.5 - p) * 2; // Intense transition
    
    for (let i = 0; i < count * 3; i++) {
      current[i] = THREE.MathUtils.lerp(current[i], target[i], 0.05 + (lerpFactor * 0.05));
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
"""

# =================================================================
# DOM COMPONENTS
# =================================================================

files['WorkHero.jsx'] = """'use client';
import { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion } from 'framer-motion';
import WorkHero3D from './3d/WorkHero3D';

export default function WorkHero() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section className="relative h-screen bg-[#0E0E0F] pt-32 px-6 md:px-12 flex flex-col justify-center overflow-hidden border-b border-[#F7F5F0]/10">
      <div className="absolute inset-0 z-0 pointer-events-none opacity-60">
        {mounted && (
          <Canvas camera={{ position: [0, 0, 8] }}>
            <Suspense fallback={null}>
              <WorkHero3D />
            </Suspense>
          </Canvas>
        )}
      </div>

      <div className="relative z-10 max-w-5xl mx-auto w-full">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#C8A464] mb-8">
          SELECTED WORK / 2024—2026
        </motion.div>
        
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }} className="text-6xl md:text-[7rem] font-medium tracking-tighter text-[#F7F5F0] leading-[1.0] mb-8">
          Work made to move <br className="hidden md:block" /> businesses <span className="text-[#C2496B]">forward.</span>
        </motion.h1>
        
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="text-xl md:text-2xl text-[#F7F5F0]/60 font-light max-w-2xl">
          A selection of websites, digital products and experiences we've designed and built for ambitious businesses.
        </motion.p>
      </div>
    </section>
  );
}
"""

files['FeaturedWork.jsx'] = """'use client';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';

export default function FeaturedWork({ project }) {
  const containerRef = useRef();
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start end", "end start"] });
  
  const yImage = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const yText = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const lineWidth = useTransform(scrollYProgress, [0.2, 0.5], ["0%", "100%"]);

  if (!project) return null;

  return (
    <section ref={containerRef} className="py-32 bg-[#0E0E0F] text-[#F7F5F0] px-6 md:px-12 overflow-hidden border-b border-[#F7F5F0]/5">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-16 relative">
          
          {/* Typographic Metadata */}
          <motion.div style={{ y: yText }} className="md:w-1/3 flex flex-col justify-center z-10">
            <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#C8A464] mb-4">01 / {project.category}</div>
            <h2 className="text-6xl md:text-[7rem] font-medium tracking-tighter mb-8 leading-[0.9]">{project.name}</h2>
            <p className="text-xl text-[#F7F5F0]/60 font-light mb-12">{project.description}</p>
            <div className="text-xs uppercase tracking-widest font-bold text-[#F7F5F0]/40 mb-12">
              {project.services}
            </div>
            
            <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-[#F7F5F0] group cursor-pointer w-max">
              <span className="group-hover:text-[#C2496B] transition-colors">View Case Study</span>
              <span className="w-8 h-[1px] bg-[#C2496B] group-hover:w-12 transition-all duration-300"></span>
            </div>
          </motion.div>

          {/* Connection Line */}
          <div className="hidden md:block absolute left-1/3 top-1/2 -translate-y-1/2 w-32 h-[1px] z-20">
            <motion.div style={{ width: lineWidth }} className="h-full bg-[#C2496B]" />
          </div>

          {/* Massive Image */}
          <div className="md:w-2/3 relative h-[60vh] md:h-[80vh] overflow-hidden bg-[#1A1A1B]">
            <motion.div style={{ y: yImage, scale: 1.05 }} className="absolute inset-[-10%] w-[120%] h-[120%]">
              <Image src={project.image} alt={project.name} fill className="object-cover opacity-90 hover:opacity-100 transition-opacity duration-700" />
            </motion.div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
"""

files['SelectedProjects.jsx'] = """'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const categories = ['ALL', 'WEBSITES', 'DIGITAL PRODUCTS', 'WEB APPS'];

export default function SelectedProjects({ projects }) {
  const [activeCat, setActiveCat] = useState('ALL');

  const filtered = activeCat === 'ALL' 
    ? projects 
    : projects.filter(p => p.category.toUpperCase().includes(activeCat.replace('S', ''))); // Simple mock filtering

  return (
    <section className="py-32 bg-[#F7F5F0] text-[#0E0E0F] px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        
        {/* Elegant Filter System */}
        <div className="flex flex-wrap items-center gap-8 mb-24 border-b border-[#0E0E0F]/10 pb-8">
          <div className="text-3xl font-medium tracking-tighter mr-auto">SELECTED PROJECTS</div>
          {categories.map((cat) => (
            <button 
              key={cat}
              onClick={() => setActiveCat(cat)}
              className={`text-[10px] uppercase tracking-widest font-bold transition-colors ${activeCat === cat ? 'text-[#C2496B]' : 'text-[#0E0E0F]/40 hover:text-[#0E0E0F]'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery */}
        <div className="flex flex-col gap-32">
          <AnimatePresence mode="popLayout">
            {filtered.map((p, i) => {
              // Create editorial rhythm
              const isLarge = i % 3 === 0;
              const isRight = i % 2 !== 0;

              return (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  key={p.id} 
                  className={`flex flex-col ${isLarge ? 'md:flex-col' : isRight ? 'md:flex-row-reverse' : 'md:flex-row'} gap-12`}
                >
                  
                  {/* Image Block */}
                  <div className={`w-full ${isLarge ? 'h-[70vh]' : 'md:w-3/5 h-[50vh]'} relative overflow-hidden bg-[#EAE8E3] group cursor-pointer`}>
                    <Image src={p.image} alt={p.name} fill className="object-cover transition-transform duration-1000 group-hover:scale-105" />
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-[#0E0E0F]/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-center items-center text-center p-8">
                       <div className="text-[#C8A464] text-[10px] font-bold tracking-[0.2em] mb-4">CASE STUDY</div>
                       <div className="text-3xl text-[#F7F5F0] font-medium mb-8">View {p.name}</div>
                       <span className="w-12 h-[1px] bg-[#C2496B]"></span>
                    </div>
                  </div>
                  
                  {/* Case Study Preview */}
                  <div className={`w-full flex flex-col justify-center ${isLarge ? 'md:grid md:grid-cols-3 md:gap-8 border-t border-[#0E0E0F]/10 pt-8' : 'md:w-2/5'}`}>
                    
                    {!isLarge && (
                      <div className="mb-12">
                        <h3 className="text-4xl md:text-5xl font-medium tracking-tighter mb-2">{p.name}</h3>
                        <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#0E0E0F]/40">{p.category}</div>
                      </div>
                    )}

                    {isLarge && (
                      <div className="col-span-1">
                        <h3 className="text-4xl md:text-5xl font-medium tracking-tighter mb-2">{p.name}</h3>
                        <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#0E0E0F]/40">{p.category}</div>
                      </div>
                    )}

                    <div className={`flex flex-col gap-8 ${isLarge ? 'col-span-2 md:grid md:grid-cols-2 md:gap-8' : ''}`}>
                      <div>
                        <div className="text-[10px] uppercase tracking-widest font-bold text-[#C2496B] mb-2">The Challenge</div>
                        <p className="text-[#0E0E0F]/70 text-sm font-light leading-relaxed">
                          {p.challenge || "Legacy structures and fragmented user journeys were actively suppressing conversion rates and brand trust."}
                        </p>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-widest font-bold text-[#C2496B] mb-2">The Result</div>
                        <p className="text-[#0E0E0F]/70 text-sm font-light leading-relaxed">
                          {p.result || "A streamlined, high-performance architecture that clarified positioning and drastically improved user retention."}
                        </p>
                      </div>
                    </div>

                  </div>

                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
"""

files['Transformation.jsx'] = """'use client';
import { useState, useEffect, Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { useScroll, motion, useTransform } from 'framer-motion';
import Transformation3D from './3d/Transformation3D';

export default function Transformation() {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef();
  
  // The scroll timeline maps exactly to the 3D morph
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  
  // Text opacities based on scroll progress
  const opBefore = useTransform(scrollYProgress, [0, 0.3, 0.45], [1, 1, 0]);
  const opMid = useTransform(scrollYProgress, [0.4, 0.5, 0.6], [0, 1, 0]);
  const opAfter = useTransform(scrollYProgress, [0.55, 0.7, 1], [0, 1, 1]);

  useEffect(() => setMounted(true), []);

  return (
    <section ref={containerRef} className="relative h-[300vh] bg-[#0E0E0F]">
      {/* Fixed Background Canvas */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        
        <div className="absolute inset-0 z-0">
          {mounted && (
            <Canvas camera={{ position: [0, 0, 5] }}>
              <Suspense fallback={null}>
                <Transformation3D scrollYProgress={scrollYProgress} />
              </Suspense>
            </Canvas>
          )}
        </div>

        {/* Cinematic Typography Overlays */}
        <motion.div style={{ opacity: opBefore }} className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none mix-blend-difference">
          <div className="text-[10px] uppercase tracking-widest font-bold text-[#F7F5F0]/50 mb-4">BEFORE</div>
          <h2 className="text-5xl md:text-7xl font-medium tracking-tighter text-[#F7F5F0]">Messy. Fragmented. Unclear.</h2>
        </motion.div>

        <motion.div style={{ opacity: opMid }} className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none mix-blend-difference">
          <h2 className="text-6xl md:text-[8rem] font-medium tracking-widest text-[#C8A464]">WELLMADE</h2>
        </motion.div>

        <motion.div style={{ opacity: opAfter }} className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none mix-blend-difference">
          <div className="text-[10px] uppercase tracking-widest font-bold text-[#C2496B] mb-4">AFTER</div>
          <h2 className="text-5xl md:text-7xl font-medium tracking-tighter text-[#F7F5F0]">Clean. Precise. Purposeful.</h2>
        </motion.div>

      </div>
    </section>
  );
}
"""

files['WorkResults.jsx'] = """'use client';
export default function WorkResults() {
  const stats = [
    { num: '+42%', label: 'Conversion Rate' },
    { num: '3.2×', label: 'More Qualified Leads' },
    { num: '-38%', label: 'Drop-off Rate' },
    { num: '+120%', label: 'User Engagement' }
  ];

  return (
    <section className="py-40 bg-[#F7F5F0] text-[#0E0E0F] px-6 md:px-12 border-t border-[#0E0E0F]/10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16 md:gap-32">
        <div className="md:w-1/3">
          <h2 className="text-5xl md:text-6xl font-medium tracking-tighter mb-8 leading-[1.0]">Did it actually <span className="text-[#C2496B]">work?</span></h2>
          <p className="text-[#0E0E0F]/60 text-lg font-light leading-relaxed">
            Beautiful design is meaningless if it doesn't move the needle. Our focus is always on engineering clear business outcomes.
          </p>
        </div>
        
        <div className="md:w-2/3 grid grid-cols-2 gap-y-20 gap-x-12">
          {stats.map((s, i) => (
            <div key={i} className="border-t border-[#0E0E0F]/20 pt-8 relative group cursor-default">
              {/* Subtle hover line */}
              <div className="absolute top-[-1px] left-0 w-0 h-[2px] bg-[#C2496B] group-hover:w-full transition-all duration-500 ease-out" />
              <div className="text-6xl md:text-7xl font-medium tracking-tighter mb-4">{s.num}</div>
              <div className="text-xs uppercase tracking-widest font-bold text-[#0E0E0F]/50">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
"""

files['ClientPerspective.jsx'] = """'use client';
export default function ClientPerspective() {
  return (
    <section className="py-40 bg-[#0E0E0F] text-[#F7F5F0] px-6 md:px-12 relative overflow-hidden flex items-center min-h-[70vh]">
      {/* Super subtle background line */}
      <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-gradient-to-r from-[#0E0E0F] via-[#C2496B]/20 to-[#0E0E0F] pointer-events-none transform -translate-y-1/2" />
      
      <div className="max-w-5xl mx-auto text-center relative z-10">
        <div className="text-[10px] uppercase tracking-widest font-bold text-[#C8A464] mb-12">CLIENT PERSPECTIVE</div>
        <h2 className="text-4xl md:text-6xl font-medium tracking-tighter leading-[1.1] mb-16">
          "Wellmade didn't just redesign our website. They completely changed how we present the business to the world. The clarity and precision they brought is unmatched."
        </h2>
        <div className="inline-block border-t border-[#F7F5F0]/20 pt-8">
          <div className="font-medium text-lg">Marcus Sterling</div>
          <div className="text-xs uppercase tracking-widest font-bold text-[#F7F5F0]/40 mt-2">Founder & CEO, Sterling Tech</div>
        </div>
      </div>
    </section>
  );
}
"""

files['WorkArchive.jsx'] = """'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function WorkArchive({ projects }) {
  const [hoveredProject, setHoveredProject] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateMousePos = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', updateMousePos);
    return () => window.removeEventListener('mousemove', updateMousePos);
  }, []);

  return (
    <section className="py-40 bg-[#F7F5F0] text-[#0E0E0F] px-6 md:px-12 relative">
      
      {/* Floating Image cursor tracker */}
      {hoveredProject && (
        <motion.div
          animate={{ x: mousePos.x + 20, y: mousePos.y + 20 }}
          transition={{ type: 'spring', stiffness: 100, damping: 25, mass: 0.5 }}
          className="fixed top-0 left-0 w-64 aspect-[4/3] pointer-events-none z-50 rounded-lg overflow-hidden shadow-2xl hidden md:block"
        >
          <img src={hoveredProject.image} alt="Preview" className="w-full h-full object-cover" />
        </motion.div>
      )}

      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-medium tracking-tighter mb-16 border-b border-[#0E0E0F]/10 pb-8">PROJECT ARCHIVE</h2>
        
        <div className="flex flex-col">
          {/* Header Row */}
          <div className="flex text-[10px] uppercase tracking-widest font-bold text-[#0E0E0F]/40 border-b border-[#0E0E0F]/10 pb-4 mb-4">
            <div className="w-1/2 md:w-2/5">Project</div>
            <div className="hidden md:block w-2/5">Type</div>
            <div className="w-1/2 md:w-1/5 text-right">Year</div>
          </div>

          {projects.map((p, i) => (
            <div 
              key={i}
              onMouseEnter={() => setHoveredProject(p)}
              onMouseLeave={() => setHoveredProject(null)}
              className="flex items-center py-6 border-b border-[#0E0E0F]/5 cursor-pointer group"
            >
              <div className="w-1/2 md:w-2/5 text-2xl md:text-3xl font-medium tracking-tight group-hover:text-[#C2496B] transition-colors">{p.name}</div>
              <div className="hidden md:block w-2/5 text-sm font-light text-[#0E0E0F]/60">{p.category}</div>
              <div className="w-1/2 md:w-1/5 text-right font-serif italic text-[#0E0E0F]/40 group-hover:text-[#0E0E0F] transition-colors">
                2026
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
"""

files['page.jsx'] = """import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';
import FinalCTA from '@/components/home/FinalCTA';
import WorkHero from '@/components/work/WorkHero';
import FeaturedWork from '@/components/work/FeaturedWork';
import SelectedProjects from '@/components/work/SelectedProjects';
import Transformation from '@/components/work/Transformation';
import WorkResults from '@/components/work/WorkResults';
import ClientPerspective from '@/components/work/ClientPerspective';
import WorkArchive from '@/components/work/WorkArchive';

import { projects } from '@/data/projects';

export const metadata = {
  title: 'Work | Wellmade Digital',
  description: 'Selected work by Wellmade Digital.',
};

export default function WorkPage() {
  // We use the first project as featured
  const featured = projects[0];
  // Next 3 projects for the selected editorial rhythm
  const selected = projects.slice(1, 4);
  // All projects for the archive
  const archive = projects;

  return (
    <main className="relative w-full bg-[#0E0E0F] antialiased font-sans selection:bg-[#C2496B] selection:text-[#F7F5F0] overflow-x-hidden">
      <Navbar />
      
      <WorkHero />
      <FeaturedWork project={featured} />
      <SelectedProjects projects={selected} />
      <Transformation />
      <WorkResults />
      <ClientPerspective />
      <WorkArchive projects={archive} />
      
      {/* Reusing the elegant Final CTA from the homepage */}
      <FinalCTA />
      
      <Footer />
    </main>
  );
}
"""

for name, code in files.items():
    if name == 'page.jsx':
        with open(r"C:\Users\AYOUB\Desktop\webgobuilder\app\work\page.jsx", 'w', encoding='utf-8') as f:
            f.write(code)
    else:
        with open(os.path.join(DIR, name), 'w', encoding='utf-8') as f:
            f.write(code)
