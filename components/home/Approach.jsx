'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export default function Approach() {
  const containerRef = useRef();
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start center", "end center"] });
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const stages = ['CLARITY', 'STRATEGY', 'EXPERIENCE', 'EXECUTION'];

  return (
    <section ref={containerRef} className="py-40 bg-[#F7F5F0] text-[#0E0E0F] px-6 md:px-12 relative min-h-[150vh] flex flex-col justify-center">
      <div className="max-w-6xl mx-auto w-full">
        <h2 className="text-6xl md:text-[8rem] font-medium tracking-tighter leading-[1.0] mb-40 text-center">
          WE START <br/> WITH THE WHY.
        </h2>

        <div className="relative pl-8 md:pl-24 max-w-3xl mx-auto">
          {/* Static thin line */}
          <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-[#0E0E0F]/10" />
          
          {/* Animated Raspberry Line */}
          <motion.div style={{ scaleY, originY: 0 }} className="absolute left-0 top-0 bottom-0 w-[1px] bg-[#C2496B] z-10" />

          {/* Scrolling Particle */}
          <motion.div style={{ top: useTransform(scrollYProgress, [0, 1], ["0%", "100%"]) }} className="absolute left-[-3.5px] w-2 h-2 rounded-full bg-[#C2496B] z-20 shadow-[0_0_10px_#C2496B]" />

          <div className="space-y-40 pb-20">
            {stages.map((stage, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-20%" }} className="relative">
                <div className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#C8A464] mb-4">0{i+1}</div>
                <h3 className="text-4xl md:text-6xl font-medium tracking-tighter">{stage}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
