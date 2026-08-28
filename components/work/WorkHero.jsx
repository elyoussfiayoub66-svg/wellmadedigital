'use client';
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
