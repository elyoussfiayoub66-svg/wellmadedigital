'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export default function Process() {
  const containerRef = useRef();
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start center", "end center"] });
  const width = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const steps = ['DISCOVER', 'DEFINE', 'DESIGN', 'BUILD', 'REFINE'];

  return (
    <section id="process" ref={containerRef} className="py-40 bg-[#F7F5F0] text-[#0E0E0F] px-6 md:px-12 min-h-[100vh] flex flex-col justify-center overflow-hidden">
      <div className="max-w-7xl mx-auto w-full">
        <h2 className="text-5xl md:text-[6rem] font-medium tracking-tighter leading-[1.0] mb-40 text-center">
          A SIMPLE PROCESS.<br/>
          A SERIOUS RESULT.
        </h2>

        <div className="relative pt-8">
          {/* Timeline background */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-[#0E0E0F]/10" />
          
          {/* Animated Timeline */}
          <motion.div style={{ width }} className="absolute top-0 left-0 h-[1px] bg-[#C2496B] z-10 origin-left" />

          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="relative pt-8">
                {/* Tick mark */}
                <div className="absolute top-[-4px] left-0 w-2 h-2 rounded-full bg-[#F7F5F0] border border-[#0E0E0F]/30" />
                <div className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#C8A464] mb-4">0{i+1}</div>
                <h3 className="text-xl md:text-2xl font-bold tracking-tight">{step}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
