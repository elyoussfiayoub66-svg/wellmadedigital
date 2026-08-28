'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { motion, useScroll } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import Problem3D from './3d/Problem3D';

export default function Problem() {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef();
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start end", "end start"] });

  useEffect(() => setMounted(true), []);

  return (
    <section ref={containerRef} className="relative py-40 bg-[#0E0E0F] text-[#F7F5F0] min-h-[120vh] px-6 md:px-12 overflow-hidden flex items-center">
      <div className="absolute right-0 top-0 w-full md:w-1/2 h-full z-0 pointer-events-none opacity-40 md:opacity-100">
        {mounted && (
          <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 8] }}>
            <Suspense fallback={null}>
              <Problem3D scrollYProgress={scrollYProgress} />
            </Suspense>
          </Canvas>
        )}
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-10 flex">
        <div className="w-full md:w-1/2">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 1 }}
            className="text-6xl md:text-[7rem] font-medium tracking-tighter leading-[1.0] mb-32"
          >
            MOST WEBSITES<br/> LOOK FINE.<br/>
            <span className="text-[#C2496B]">FEW ACTUALLY<br/> WORK.</span>
          </motion.h2>
          
          <div className="flex flex-col gap-12 border-t border-[#F7F5F0]/10 pt-12">
            {['NO CLEAR POSITIONING', 'TOO MUCH NOISE', 'NO CLEAR PATH TO ACTION'].map((prob, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i*0.2 }}>
                <h3 className="text-xl md:text-2xl font-bold tracking-widest text-[#F7F5F0]/80">0{i+1} / {prob}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
