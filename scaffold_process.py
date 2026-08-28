import os

def ensure_dir(p):
    os.makedirs(p, exist_ok=True)

ensure_dir(r"C:\Users\AYOUB\Desktop\webgobuilder\app\process")
ensure_dir(r"C:\Users\AYOUB\Desktop\webgobuilder\components\process\3d")
ensure_dir(r"C:\Users\AYOUB\Desktop\webgobuilder\lib\data")

files = {}

# =================================================================
# DB FETCH HELPER
# =================================================================

files[r"lib\data\fetchWork.js"] = """import { createClient } from '@/lib/supabase/server';
import { projects as fallbackProjects } from '@/data/projects';

export async function getProjects() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('case_studies')
      .select('*')
      .eq('status', 'PUBLISHED')
      .order('created_at', { ascending: false });

    // If there's an error, or the table is completely empty, fallback to hardcoded
    // so the UI remains beautiful during development.
    if (error || !data || data.length === 0) {
      console.log('No published case studies found in DB or error occurred, using fallback data.');
      return fallbackProjects;
    }

    // Map Supabase DB fields to the expected UI fields
    return data.map((item, index) => {
      // Use fallback images/text if DB fields are missing
      const fallbackIndex = index % fallbackProjects.length;
      return {
        id: item.id,
        name: item.title,
        category: item.industry || 'Digital Experience',
        image: item.image_url || fallbackProjects[fallbackIndex].image,
        description: item.short_description || fallbackProjects[fallbackIndex].description,
        challenge: item.problem || "Legacy systems creating bottlenecks and poor user retention.",
        approach: item.solution || "A complete architectural redesign focused on speed and clarity.",
        result: "Simplified the core journey, drastically improving conversion.",
        services: "Strategy • Design • Development",
        href: `/work/${item.id}`
      };
    });
  } catch (e) {
    console.error('Error fetching case studies:', e);
    return fallbackProjects;
  }
}
"""

# =================================================================
# PROCESS PAGE COMPONENTS
# =================================================================

files[r"components\process\3d\Process3D.jsx"] = """'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScroll, useTransform } from 'framer-motion';
import { Icosahedron, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

export default function Process3D({ scrollYProgress }) {
  const meshRef = useRef();

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    // Constant slow rotation
    meshRef.current.rotation.y += delta * 0.1;
    meshRef.current.rotation.x += delta * 0.05;

    // Map scroll progress to scale and distortion
    const p = scrollYProgress.get ? scrollYProgress.get() : 0;
    
    // The deeper you scroll, the more precise the shape becomes
    const targetScale = 1 + (p * 0.5);
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    
    const material = meshRef.current.material;
    if (material && material.distort !== undefined) {
      // Starts distorted (chaos/discovery), ends perfectly geometric (deployment)
      const targetDistort = Math.max(0, 0.6 - (p * 0.8));
      material.distort = THREE.MathUtils.lerp(material.distort, targetDistort, 0.05);
    }
  });

  return (
    <Icosahedron ref={meshRef} args={[1.5, 4]}>
      <MeshDistortMaterial 
        color="#C8A464" 
        wireframe={true} 
        transparent 
        opacity={0.3} 
        speed={2} 
        distort={0.6} 
        radius={1} 
      />
    </Icosahedron>
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
    text: "We don't guess. We analyze your business operations, map out current bottlenecks, and architect a digital system designed explicitly to solve them.",
    deliverables: ["Technical Audit", "Information Architecture", "Strategic Roadmapping"]
  },
  {
    num: "02",
    title: "Architectural Design",
    text: "Translating the strategy into a high-fidelity visual system. We engineer the user experience to be frictionless, premium, and impossible to ignore.",
    deliverables: ["Wireframing", "UI/UX Design", "Interactive Prototyping"]
  },
  {
    num: "03",
    title: "Precision Development",
    text: "Building the actual system. We use modern, high-performance stacks (Next.js, WebGL) to ensure your experience feels instantaneous, secure, and native.",
    deliverables: ["Frontend Engineering", "Backend Integration", "WebGL / 3D Implementation"]
  },
  {
    num: "04",
    title: "Deployment & Optimization",
    text: "Launching the system into production. We monitor performance, optimize conversion metrics, and ensure the infrastructure scales effortlessly.",
    deliverables: ["QA Testing", "Production Launch", "Performance Monitoring"]
  }
];

export default function ProcessTimeline() {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef();
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  useEffect(() => setMounted(true), []);

  return (
    <section ref={containerRef} className="relative bg-[#0E0E0F] text-[#F7F5F0] min-h-[400vh]">
      
      {/* Fixed Background and 3D Canvas */}
      <div className="sticky top-0 h-screen w-full flex overflow-hidden border-b border-[#F7F5F0]/10">
        
        {/* Abstract 3D Metaphor */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
          {mounted && (
            <Canvas camera={{ position: [0, 0, 5] }}>
              <Suspense fallback={null}>
                <Process3D scrollYProgress={scrollYProgress} />
              </Suspense>
            </Canvas>
          )}
        </div>

        {/* Content Container */}
        <div className="w-full h-full max-w-7xl mx-auto px-6 md:px-12 relative z-10 flex flex-col md:flex-row">
          
          {/* Left: Titles */}
          <div className="md:w-1/2 pt-32 pb-12 flex flex-col justify-center h-full">
            <div className="text-[10px] uppercase tracking-widest font-bold text-[#C8A464] mb-8">THE PROCESS</div>
            <h1 className="text-5xl md:text-7xl font-medium tracking-tighter leading-[1.0] mb-8">
              How we build <br/><span className="text-[#C2496B]">digital systems.</span>
            </h1>
            <p className="text-xl text-[#F7F5F0]/60 font-light max-w-md">
              A rigorous, four-step methodology engineered to turn complexity into clarity.
            </p>
          </div>

          {/* Right: Scrolling Timeline */}
          <div className="md:w-1/2 relative h-full flex items-center justify-center pt-32">
            
            {/* The Connecting Line container (Fixed) */}
            <div className="absolute left-0 md:left-12 top-1/4 bottom-1/4 w-[2px] bg-[#F7F5F0]/10 rounded-full overflow-hidden">
               <motion.div style={{ height: lineHeight }} className="w-full bg-[#C2496B] rounded-full" />
            </div>

            {/* The scrolling phases */}
            <div className="w-full pl-8 md:pl-24 flex flex-col gap-32 absolute top-[25vh]">
              {phases.map((phase, i) => (
                <div key={i} className="min-h-[50vh] flex flex-col justify-center">
                  <div className="text-[10px] uppercase tracking-widest font-bold text-[#C8A464] mb-4">PHASE {phase.num}</div>
                  <h2 className="text-3xl md:text-4xl font-medium tracking-tighter mb-6">{phase.title}</h2>
                  <p className="text-[#F7F5F0]/60 text-lg font-light leading-relaxed mb-8 max-w-md">
                    {phase.text}
                  </p>
                  
                  <div className="flex flex-col gap-3">
                    {phase.deliverables.map((del, di) => (
                      <div key={di} className="flex items-center gap-3 text-xs uppercase tracking-widest font-bold text-[#F7F5F0]/40">
                        <span className="w-4 h-[1px] bg-[#C2496B]"></span> {del}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              {/* Spacer at the bottom so the last item can reach the center */}
              <div className="h-[50vh]" />
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
"""

files[r"app\process\page.jsx"] = """import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';
import FinalCTA from '@/components/home/FinalCTA';
import ProcessTimeline from '@/components/process/ProcessTimeline';

export const metadata = {
  title: 'Process | Wellmade Digital',
  description: 'Our methodology for building digital systems.',
};

export default function ProcessPage() {
  return (
    <main className="relative w-full bg-[#0E0E0F] antialiased font-sans selection:bg-[#C2496B] selection:text-[#F7F5F0] overflow-x-hidden">
      <Navbar />
      <ProcessTimeline />
      <FinalCTA />
      <Footer />
    </main>
  );
}
"""

# Write all files
for file_path, content in files.items():
    full_path = os.path.join(r"C:\Users\AYOUB\Desktop\webgobuilder", file_path)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)

print("Scaffolded Process page and DB Fetch helper.")
