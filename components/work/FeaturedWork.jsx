'use client';
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
          <div className="hidden md:block absolute left-1/3 top-1/2 -translate-y-1/2 w-24 h-[1px] z-20">
            <motion.div style={{ width: lineWidth }} className="h-full bg-[#C2496B]" />
          </div>

          {/* Natural Size Image */}
          <motion.div style={{ y: yImage }} className="md:w-2/3 relative z-30 flex flex-col justify-center">
            <div className="relative w-full rounded-2xl overflow-hidden border border-[#F7F5F0]/10 bg-[#1A1A1B] shadow-[0_20px_50px_rgba(0,0,0,0.5)] group-hover:border-[#F7F5F0]/20 transition-colors duration-700">
              <img src={project.image} alt={project.name} className="w-full h-auto block opacity-90 hover:opacity-100 transition-all duration-700 hover:scale-[1.02]" />
            </div>
          </motion.div>
          
        </div>
      </div>
    </section>
  );
}
