'use client';
import { useState, useEffect, Suspense, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import Hero3D from './3d/Hero3D';

export default function Hero() {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  
  const yText = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const opacityText = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale3D = useTransform(scrollYProgress, [0, 1], [1, 0.8]);
  const y3D = useTransform(scrollYProgress, [0, 1], [0, 200]);

  useEffect(() => setMounted(true), []);

  return (
    <section ref={containerRef} className="relative h-screen bg-[#0E0E0F] overflow-hidden flex flex-col items-center justify-center pt-20">
      
      {/* Editorial Text Composition (Upper Middle) */}
      <motion.div style={{ y: yText, opacity: opacityText }} className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 text-center flex flex-col items-center">
        <h1 className="text-5xl md:text-7xl lg:text-[7rem] font-medium tracking-tighter text-[#F7F5F0] leading-[1.05] mb-8">
          WE MAKE <br /> DIGITAL EXPERIENCES <br />
          <span className="text-[#C2496B]">MOVE.</span>
        </h1>
        <p className="text-lg md:text-xl text-[#F7F5F0]/60 max-w-2xl font-light mb-12">
          Strategy, design and technology for businesses that want to move forward.
        </p>
        <div className="flex items-center gap-8 text-xs font-bold uppercase tracking-widest">
          <a href="/book" className="text-[#C2496B] border-b border-[#C2496B]/30 pb-1 hover:border-[#C2496B] transition-colors">Start a Project &rarr;</a>
          <a href="#work" className="text-[#F7F5F0]/50 hover:text-[#F7F5F0] transition-colors">Explore Our Work</a>
        </div>
      </motion.div>

      {/* Kinetic Sculpture Background */}
      <motion.div style={{ scale: scale3D, y: y3D }} className="absolute inset-0 z-0 pointer-events-auto">
        {mounted && (
          <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 8], fov: 45 }}>
            <Suspense fallback={null}>
              <Hero3D />
            </Suspense>
          </Canvas>
        )}
      </motion.div>
    </section>
  );
}
