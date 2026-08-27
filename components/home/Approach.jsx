'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

const stages = ['Strategy', 'Experience', 'Design', 'Technology'];

export default function Approach() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  
  return (
    <section ref={ref} className="py-32 bg-[var(--wm-cream)] text-[var(--wm-charcoal)] px-6 md:px-12 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-24">
          <div className="text-xs font-bold tracking-[0.2em] uppercase text-[var(--wm-terracotta)] mb-6">THE WELLMADE APPROACH</div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight leading-[1.1] max-w-4xl mx-auto">
            We don't just design websites. We design the experience around your business.
          </h2>
        </div>

        <div className="relative h-[60vh] min-h-[500px] flex items-center justify-center perspective-[1200px]">
          {stages.map((stage, i) => {
            const progressRange = [0, 0.4 + (i * 0.15)];
            
            // Wait, using a hook inside a loop violates rules of hooks! We'll just use simple motion.div whileInView
            return (
              <motion.div
                key={stage}
                initial={{ opacity: 0, y: 150, z: -300 + (i * 50), rotateX: 60 }}
                whileInView={{ opacity: 1, y: i * 20, z: i * 20, rotateX: 20 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1.2, delay: i * 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="absolute w-[80%] max-w-[600px] aspect-[4/1] bg-[var(--wm-white)] border border-[var(--wm-charcoal)]/10 shadow-[0_20px_40px_rgba(0,0,0,0.05)] flex items-center justify-center transform-gpu"
                style={{ top: '20%' }}
              >
                <span className="text-xl md:text-3xl font-medium text-[var(--wm-charcoal)] tracking-tight">{stage}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
