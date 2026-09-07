'use client';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

export default function Hero() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  
  const yText = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacityText = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={containerRef} className="relative min-h-[90vh] bg-[#0E0E0F] overflow-hidden flex flex-col items-center justify-center pt-32 pb-20">
      
      {/* Background Image / Texture */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0E0E0F]/50 to-[#0E0E0F] z-10" />
        <img 
          src="/assets/hero-crm.jpg" 
          alt="Abstract operational background" 
          className="w-full h-full object-cover"
          onError={(e) => e.target.style.display = 'none'} // Fallback if image doesn't exist
        />
      </div>

      {/* Main Content */}
      <motion.div style={{ y: yText, opacity: opacityText }} className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 text-center flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="inline-block px-4 py-1.5 rounded-full border border-[#C2496B]/30 bg-[#C2496B]/10 text-[#C2496B] text-xs font-bold uppercase tracking-widest mb-8"
        >
          Systems Engineering Agency
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-[7rem] font-medium tracking-tighter text-[#F7F5F0] leading-[1.05] mb-8"
        >
          ELIMINATE <br className="hidden md:block"/> OPERATIONAL <br className="hidden md:block"/>
          <span className="text-[#C2496B]">CHAOS.</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-lg md:text-xl text-[#F7F5F0]/70 max-w-2xl font-light mb-12 leading-relaxed"
        >
          We engineer custom CRM systems, high-performance websites, and digital workflows that save you time, reduce costs, and organize your business.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center gap-6"
        >
          <Link href="/book" className="bg-[#C2496B] text-white px-8 py-4 rounded-lg font-medium hover:bg-[#a63c5a] transition-all shadow-lg hover:shadow-[#C2496B]/20 w-full sm:w-auto text-center">
            Start a Project
          </Link>
          <Link href="/work" className="text-[#F7F5F0] hover:text-[#C2496B] font-medium transition-colors border border-[#F7F5F0]/20 hover:border-[#C2496B]/50 px-8 py-4 rounded-lg w-full sm:w-auto text-center">
            Explore Our Work
          </Link>
        </motion.div>
      </motion.div>

    </section>
  );
}
