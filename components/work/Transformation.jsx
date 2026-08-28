'use client';
import { useState, useEffect, Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { useScroll } from 'framer-motion';
import Transformation3D from './3d/Transformation3D';

export default function Transformation() {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef();
  
  // The scroll timeline maps smoothly as this specific section enters the viewport
  const { scrollYProgress } = useScroll({ 
    target: containerRef, 
    offset: ["start end", "center center"] 
  });

  useEffect(() => setMounted(true), []);

  return (
    <section ref={containerRef} className="py-32 md:py-40 bg-[#0E0E0F] text-[#F7F5F0] px-6 md:px-12 border-t border-[#F7F5F0]/10 overflow-hidden relative">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-24 relative z-10">

        {/* Left: Useful Editorial Content */}
        <div className="w-full lg:w-1/2">
          <div className="text-[10px] uppercase tracking-widest font-bold text-[#C8A464] mb-8">THE TRANSFORMATION</div>
          <h2 className="text-4xl md:text-5xl font-medium tracking-tighter leading-[1.1] mb-8">
            Turning operational complexity into digital clarity.
          </h2>
          <p className="text-[#F7F5F0]/60 text-lg font-light leading-relaxed mb-16">
            Growth stalls when digital systems fracture. We don't just apply a new coat of paint—we re-engineer the underlying architecture of your digital presence to remove friction, unify your messaging, and drive measurable action.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 border-t border-[#F7F5F0]/10 pt-12">
            <div>
              <div className="text-[10px] uppercase tracking-widest font-bold text-[#C2496B] mb-6">The Symptoms</div>
              <ul className="space-y-4 text-sm text-[#F7F5F0]/70 font-light">
                <li className="flex items-start gap-3"><span className="text-[#C2496B] font-bold mt-0.5">×</span> Fragmented user journeys</li>
                <li className="flex items-start gap-3"><span className="text-[#C2496B] font-bold mt-0.5">×</span> Outdated, bloated codebases</li>
                <li className="flex items-start gap-3"><span className="text-[#C2496B] font-bold mt-0.5">×</span> Unclear market positioning</li>
              </ul>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest font-bold text-[#C8A464] mb-6">The Outcome</div>
              <ul className="space-y-4 text-sm text-[#F7F5F0]/70 font-light">
                <li className="flex items-start gap-3"><span className="text-[#C8A464] font-bold mt-0.5">✓</span> Streamlined conversion paths</li>
                <li className="flex items-start gap-3"><span className="text-[#C8A464] font-bold mt-0.5">✓</span> High-performance architecture</li>
                <li className="flex items-start gap-3"><span className="text-[#C8A464] font-bold mt-0.5">✓</span> Undeniable brand clarity</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right: The 3D Metaphor */}
        <div className="w-full lg:w-1/2 h-[400px] md:h-[600px] bg-[#1A1A1B]/30 rounded-2xl relative overflow-hidden border border-[#F7F5F0]/5 group">
          <div className="absolute inset-0">
            {mounted && (
              <Canvas camera={{ position: [0, 0, 6] }}>
                <Suspense fallback={null}>
                  <Transformation3D scrollYProgress={scrollYProgress} />
                </Suspense>
              </Canvas>
            )}
          </div>
          
          {/* Subtle label in the 3D container */}
          <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none transition-opacity duration-500 opacity-50 group-hover:opacity-100">
             <div className="text-[10px] uppercase tracking-widest font-bold text-[#F7F5F0]/50">
               Visualizing the process
             </div>
          </div>
        </div>

      </div>
    </section>
  );
}
