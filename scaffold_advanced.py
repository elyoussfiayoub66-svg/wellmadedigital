import os

def ensure_dir(p):
    os.makedirs(p, exist_ok=True)

files = {}

# =================================================================
# TASK 1: REMOVE HARDCODED PROJECTS
# =================================================================

files[r"lib\data\fetchWork.js"] = """import { createClient } from '@/lib/supabase/server';

export async function getProjects() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('case_studies')
      .select('*')
      .eq('status', 'PUBLISHED')
      .order('created_at', { ascending: false });

    // STRICT RETURN: No hardcoded fallback data.
    if (error || !data) {
      return [];
    }

    // Map Supabase DB fields directly to the expected UI fields
    return data.map((item) => {
      return {
        id: item.id,
        name: item.title,
        category: item.industry || 'Digital Experience',
        image: item.image_url || '/assets/pic1.PNG', // safe fallback to prevent Next Image crash
        description: item.short_description || "",
        challenge: item.problem || "",
        approach: item.solution || "",
        result: "", // Can be mapped from results JSONB if needed
        services: "Strategy • Design • Development",
        href: `/work/${item.id}`
      };
    });
  } catch (e) {
    console.error('Error fetching case studies:', e);
    return [];
  }
}
"""

files[r"app\work\page.jsx"] = """import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';
import FinalCTA from '@/components/home/FinalCTA';
import WorkHero from '@/components/work/WorkHero';
import FeaturedWork from '@/components/work/FeaturedWork';
import SelectedProjects from '@/components/work/SelectedProjects';
import Transformation from '@/components/work/Transformation';
import WorkResults from '@/components/work/WorkResults';
import ClientPerspective from '@/components/work/ClientPerspective';
import WorkArchive from '@/components/work/WorkArchive';

import { getProjects } from '@/lib/data/fetchWork';

export const metadata = {
  title: 'Work | Wellmade Digital',
  description: 'Selected work by Wellmade Digital.',
};

export default async function WorkPage() {
  const projects = await getProjects();
  
  const featured = projects.length > 0 ? projects[0] : null;
  const selected = projects.length > 1 ? projects.slice(1, 4) : [];
  const archive = projects;

  return (
    <main className="relative w-full bg-[#0E0E0F] antialiased font-sans selection:bg-[#C2496B] selection:text-[#F7F5F0] overflow-x-hidden">
      <Navbar />
      
      <WorkHero />
      
      {/* Only render these sections if database returns data */}
      {featured && <FeaturedWork project={featured} />}
      {selected.length > 0 && <SelectedProjects projects={selected} />}
      
      {projects.length === 0 && (
        <section className="py-40 text-center text-[#F7F5F0]/50 font-light border-b border-[#F7F5F0]/10">
          <p>No published case studies available yet.</p>
        </section>
      )}

      <Transformation />
      <WorkResults />
      <ClientPerspective />
      
      {archive.length > 0 && <WorkArchive projects={archive} />}
      
      <FinalCTA />
      
      <Footer />
    </main>
  );
}
"""

files[r"components\home\Work.jsx"] = """'use client';
import Image from 'next/image';

export default function Work({ projects = [] }) {
  const displayProjects = projects.slice(0, 4);

  return (
    <section id="work" className="py-40 bg-[#0E0E0F] text-[#F7F5F0] px-6 md:px-12 border-t border-[#F7F5F0]/5">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-24 border-b border-[#F7F5F0]/10 pb-8">
          <h2 className="text-5xl md:text-7xl font-medium tracking-tighter">SELECTED WORK</h2>
          <a href="/work" className="hidden md:block text-xs uppercase tracking-widest font-bold text-[#F7F5F0]/50 hover:text-[#C2496B] transition-colors">View All &rarr;</a>
        </div>

        {displayProjects.length === 0 ? (
          <div className="text-center py-20 text-[#F7F5F0]/40 font-light text-lg">
            Case studies are currently being populated. Check back soon.
          </div>
        ) : (
          <div className="flex flex-col gap-32">
            {displayProjects.map((p, i) => {
              const isLarge = i % 2 === 0;
              return (
                <div key={p.id} className={`flex flex-col ${isLarge ? 'md:flex-row' : 'md:flex-row-reverse'} gap-12 md:gap-24 group cursor-pointer`}>
                  <div className={`w-full ${isLarge ? 'md:w-2/3' : 'md:w-1/2'} overflow-hidden bg-[#1A1A1B]`}>
                    <div className="relative w-full aspect-[4/3] transform transition-transform duration-700 group-hover:scale-105 origin-center">
                      <Image src={p.image} alt={p.name} fill className="object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  
                  <div className={`w-full ${isLarge ? 'md:w-1/3' : 'md:w-1/2'} flex flex-col justify-center`}>
                    <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#C8A464] mb-6">{p.category}</div>
                    <h3 className="text-4xl md:text-5xl font-medium tracking-tighter mb-6 group-hover:text-[#C2496B] transition-colors">{p.name}</h3>
                    <p className="text-[#F7F5F0]/60 font-light mb-12 text-lg">{p.description}</p>
                    
                    <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-[#F7F5F0]">
                      <span className="w-0 h-[1px] bg-[#C2496B] group-hover:w-8 transition-all duration-300"></span>
                      <span className="group-hover:text-[#C2496B] transition-colors">View Case Study</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
"""

# =================================================================
# TASK 2: HYPER-ADVANCED PROCESS PAGE
# =================================================================

files[r"components\process\3d\Process3D.jsx"] = """'use client';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Process3D({ scrollYProgress }) {
  const pointsRef = useRef();
  
  // Create an immense tunnel of particles
  const particleCount = 2000;
  const particles = useMemo(() => {
    const temp = new Float32Array(particleCount * 3);
    for(let i = 0; i < particleCount; i++) {
      const theta = Math.random() * 2 * Math.PI;
      const radius = 3 + Math.random() * 4; // Hollow center tunnel
      const z = (Math.random() - 0.5) * 50; // Long tunnel depth
      
      temp[i * 3] = Math.cos(theta) * radius;
      temp[i * 3 + 1] = Math.sin(theta) * radius;
      temp[i * 3 + 2] = z;
    }
    return temp;
  }, []);

  useFrame((state, delta) => {
    if(!pointsRef.current) return;
    
    // Auto rotation for ambient life
    pointsRef.current.rotation.z += delta * 0.05;

    // Advanced camera motion tied to scroll
    const progress = scrollYProgress.get ? scrollYProgress.get() : 0;
    
    // Move the camera THROUGH the tunnel based on horizontal scroll progress!
    state.camera.position.z = THREE.MathUtils.lerp(25, -25, progress);
    
    // Slight camera tilt for dramatic effect
    state.camera.rotation.z = THREE.MathUtils.lerp(0, Math.PI / 4, progress);
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={particleCount} array={particles} itemSize={3} />
      </bufferGeometry>
      {/* High-end cinematic points */}
      <pointsMaterial size={0.03} color="#C2496B" transparent opacity={0.4} blending={THREE.AdditiveBlending} />
    </points>
  );
}
"""

files[r"components\process\ProcessTimeline.jsx"] = """'use client';
import { useRef, useState, useEffect, Suspense } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import Process3D from './3d/Process3D';

const phases = [
  {
    num: "01",
    title: "Discovery & Strategy",
    text: "We don't guess. We analyze your operations, map bottlenecks, and architect a system explicitly designed to solve them.",
    deliverables: ["Technical Audit", "Information Architecture", "Strategic Roadmapping"]
  },
  {
    num: "02",
    title: "Architectural Design",
    text: "Translating strategy into a high-fidelity visual system. We engineer the user experience to be frictionless and premium.",
    deliverables: ["Wireframing", "UI/UX Design", "Interactive Prototyping"]
  },
  {
    num: "03",
    title: "Precision Development",
    text: "Building the actual system using modern, high-performance stacks (Next.js, WebGL) ensuring instantaneous, secure experiences.",
    deliverables: ["Frontend Engineering", "Backend Integration", "WebGL / 3D Implementation"]
  },
  {
    num: "04",
    title: "Deployment & Optimization",
    text: "Launching into production. We monitor performance, optimize conversion metrics, and ensure infrastructure scales effortlessly.",
    deliverables: ["QA Testing", "Production Launch", "Performance Monitoring"]
  }
];

export default function ProcessTimeline() {
  const [mounted, setMounted] = useState(false);
  const targetRef = useRef(null);
  
  // Creates a highly advanced horizontal scrolling section powered by vertical scroll
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"]
  });

  // Transform scroll progress (0-1) into X translation (0% to -75%)
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-75%"]);

  useEffect(() => setMounted(true), []);

  return (
    <section ref={targetRef} className="relative h-[400vh] bg-[#0E0E0F]">
      
      {/* Sticky container that stays in view while you scroll down for 400vh */}
      <div className="sticky top-0 h-screen w-full flex items-center overflow-hidden">
        
        {/* Abstract 3D WebGL Background that reacts to the scroll */}
        <div className="absolute inset-0 z-0 pointer-events-none bg-[#0E0E0F]">
          {mounted && (
            <Canvas camera={{ position: [0, 0, 25], fov: 45 }}>
              <fog attach="fog" args={['#0E0E0F', 10, 40]} />
              <Suspense fallback={null}>
                <Process3D scrollYProgress={scrollYProgress} />
              </Suspense>
            </Canvas>
          )}
          {/* Heavy gradient overlay to keep text legible */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E0F] via-[#0E0E0F]/80 to-[#0E0E0F] opacity-90 z-10" />
        </div>

        {/* The Horizontal Scrolling Track */}
        <motion.div style={{ x }} className="flex relative z-20 w-[400vw] h-full items-center">
          
          {/* Title Slide */}
          <div className="w-[100vw] flex-shrink-0 px-[10vw] flex flex-col justify-center">
            <div className="text-[10px] uppercase tracking-widest font-bold text-[#C8A464] mb-8">THE PROCESS</div>
            <h1 className="text-6xl md:text-[8rem] font-medium tracking-tighter leading-[0.9] text-[#F7F5F0]">
              The Engine of <br/><span className="text-[#C2496B]">Clarity.</span>
            </h1>
            <p className="mt-12 text-xl text-[#F7F5F0]/60 max-w-lg font-light leading-relaxed">
              Scroll to explore the four-phase methodology we use to turn operational chaos into highly scalable digital systems.
            </p>
          </div>

          {/* Phase Slides */}
          {phases.map((phase, i) => (
            <div key={i} className="w-[75vw] flex-shrink-0 px-[5vw] flex items-center justify-center">
              <div className="w-full max-w-3xl bg-[#1A1A1B]/40 backdrop-blur-md border border-[#F7F5F0]/10 p-12 md:p-20 rounded-3xl relative overflow-hidden group">
                
                {/* Accent glow on card */}
                <div className="absolute -inset-[100px] bg-[#C2496B]/10 opacity-0 group-hover:opacity-100 blur-3xl transition-opacity duration-1000" />
                
                <div className="relative z-10">
                  <div className="text-[10px] uppercase tracking-widest font-bold text-[#C8A464] mb-6">PHASE {phase.num}</div>
                  <h2 className="text-4xl md:text-5xl font-medium tracking-tighter mb-8 text-[#F7F5F0]">{phase.title}</h2>
                  <p className="text-[#F7F5F0]/70 text-xl font-light leading-relaxed mb-12">
                    {phase.text}
                  </p>
                  
                  <div className="flex flex-col gap-4">
                    {phase.deliverables.map((del, di) => (
                      <div key={di} className="flex items-center gap-4 text-sm uppercase tracking-widest font-bold text-[#F7F5F0]/50">
                        <span className="w-8 h-[1px] bg-[#C2496B]"></span> {del}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* End padding for smooth exit */}
          <div className="w-[25vw] flex-shrink-0" />

        </motion.div>

      </div>
    </section>
  );
}
"""

for file_path, content in files.items():
    full_path = os.path.join(r"C:\Users\AYOUB\Desktop\webgobuilder", file_path)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)

print("Removed hardcoded fallbacks and implemented advanced horizontal scrolling process page.")
