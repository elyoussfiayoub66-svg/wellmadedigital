'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';

export default function MasterTimeline() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });

  // Map scroll progress to opacity of chapters (fade in and out precisely)
  const mapOpacity = (start, peak1, peak2, end) => useTransform(scrollYProgress, [start, peak1, peak2, end], [0, 1, 1, 0]);
  
  const opHero = mapOpacity(0.00, 0.02, 0.05, 0.08);
  const opIdea = mapOpacity(0.09, 0.11, 0.14, 0.16);
  const opStrat = mapOpacity(0.18, 0.21, 0.24, 0.27);
  const opStruct = mapOpacity(0.28, 0.31, 0.34, 0.37);
  const opDesign = mapOpacity(0.38, 0.41, 0.44, 0.47);
  const opBuild = mapOpacity(0.48, 0.51, 0.54, 0.57);
  const opMove = mapOpacity(0.58, 0.61, 0.64, 0.67);
  
  // Quiet Section (0.7 to 0.75) uses background color change, covered below
  const opCraft = mapOpacity(0.77, 0.80, 0.83, 0.86);
  const opFinal = mapOpacity(0.88, 0.92, 1.0, 1.0);

  return (
    <div ref={containerRef} className="relative h-[1200vh] w-full pointer-events-none">
      
      {/* Fixed Sticky Wrapper for perfectly centered content overlay */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center text-center px-6">
        
        {/* HERO */}
        <motion.div style={{ opacity: opHero }} className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto">
          <h1 className="text-6xl md:text-[8rem] font-medium tracking-tighter text-[#F7F5F0] leading-[1.0] mb-8 mix-blend-difference">
            WE MAKE<br/> DIGITAL<br/> EXPERIENCES<br/> <span className="text-[#C2496B]">MOVE.</span>
          </h1>
        </motion.div>

        {/* 01 IDEA */}
        <motion.div style={{ opacity: opIdea }} className="absolute inset-0 flex flex-col items-center justify-center mix-blend-difference">
          <div className="text-xs font-bold tracking-[0.3em] uppercase text-[#C2496B] mb-8">01 / RAW</div>
          <h2 className="text-5xl md:text-8xl font-medium tracking-tighter text-[#F7F5F0]">EVERYTHING STARTS WITH AN IDEA.</h2>
        </motion.div>

        {/* 02 STRATEGY */}
        <motion.div style={{ opacity: opStrat }} className="absolute inset-0 flex flex-col items-center justify-center mix-blend-difference">
          <div className="text-xs font-bold tracking-[0.3em] uppercase text-[#C2496B] mb-8">02 / STRATEGY</div>
          <h2 className="text-5xl md:text-8xl font-medium tracking-tighter text-[#F7F5F0]">CLARITY BEFORE CREATION.</h2>
        </motion.div>

        {/* 03 STRUCTURE */}
        <motion.div style={{ opacity: opStruct }} className="absolute inset-0 flex flex-col items-center justify-center mix-blend-difference">
          <div className="text-xs font-bold tracking-[0.3em] uppercase text-[#C2496B] mb-8">03 / STRUCTURE</div>
          <h2 className="text-5xl md:text-8xl font-medium tracking-tighter text-[#F7F5F0]">IDEAS NEED STRUCTURE.</h2>
        </motion.div>

        {/* 04 DESIGN */}
        <motion.div style={{ opacity: opDesign }} className="absolute inset-0 flex flex-col items-center justify-center mix-blend-difference">
          <div className="text-xs font-bold tracking-[0.3em] uppercase text-[#C2496B] mb-8">04 / DESIGN</div>
          <h2 className="text-5xl md:text-8xl font-medium tracking-tighter text-[#F7F5F0]">STRUCTURE BECOMES EXPERIENCE.</h2>
        </motion.div>

        {/* 05 BUILD */}
        <motion.div style={{ opacity: opBuild }} className="absolute inset-0 flex flex-col items-center justify-center mix-blend-difference">
          <div className="text-xs font-bold tracking-[0.3em] uppercase text-[#C8A464] mb-8">05 / TECHNOLOGY</div>
          <h2 className="text-5xl md:text-8xl font-medium tracking-tighter text-[#F7F5F0]">MAKE IT REAL.</h2>
        </motion.div>

        {/* 06 MOVE */}
        <motion.div style={{ opacity: opMove }} className="absolute inset-0 flex flex-col items-center justify-center mix-blend-difference">
          <div className="text-xs font-bold tracking-[0.3em] uppercase text-[#C2496B] mb-8">06 / EXPERIENCE</div>
          <h2 className="text-5xl md:text-8xl font-medium tracking-tighter text-[#F7F5F0] leading-[1.05]">
            A DIGITAL EXPERIENCE SHOULD <span className="text-[#C2496B]">MOVE</span> PEOPLE.
          </h2>
        </motion.div>

        {/* THE QUIET SECTION (0.7 - 0.75) */}
        {/* We use a solid Ivory overlay to block out the 3D completely */}
        <motion.div 
          style={{ opacity: mapOpacity(0.69, 0.71, 0.74, 0.76) }} 
          className="absolute inset-0 flex flex-col items-center justify-center bg-[#F7F5F0] text-[#0E0E0F] pointer-events-auto"
        >
          <div className="max-w-6xl mx-auto text-left w-full px-6">
            <h2 className="text-6xl md:text-[9rem] font-medium tracking-tighter leading-[1.0] mb-8">WE DON'T ADD MORE.</h2>
            <h2 className="text-6xl md:text-[9rem] font-medium tracking-tighter leading-[1.0] text-[#0E0E0F]/40">WE MAKE WHAT MATTERS <span className="text-[#C2496B]">BETTER.</span></h2>
          </div>
        </motion.div>

        {/* CRAFT */}
        <motion.div style={{ opacity: opCraft }} className="absolute inset-0 flex flex-col items-center justify-center mix-blend-difference">
          <div className="text-xs font-bold tracking-[0.3em] uppercase text-[#C8A464] mb-8">07 / CRAFT</div>
          <h2 className="text-5xl md:text-8xl font-medium tracking-tighter text-[#F7F5F0]">THE DIFFERENCE IS IN THE DETAILS.</h2>
        </motion.div>

        {/* FINAL CTA & RESOLUTION */}
        <motion.div style={{ opacity: opFinal }} className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto mix-blend-difference">
          <h2 className="text-5xl md:text-[8rem] font-medium tracking-tighter text-[#F7F5F0] mb-12">
            LET'S MAKE SOMETHING WELL MADE.
          </h2>
          <Link href="/book" className="inline-block bg-[#C2496B] text-[#F7F5F0] px-12 py-6 text-sm uppercase tracking-widest font-bold hover:bg-[#a13b58] transition-colors">
            Start a Project &rarr;
          </Link>
          
          <motion.div style={{ opacity: useTransform(scrollYProgress, [0.95, 0.98], [0, 1]) }} className="absolute bottom-20 flex flex-col items-center">
            <div className="text-5xl font-bold tracking-widest text-[#F7F5F0] mb-2">WELLMADE</div>
            <div className="text-sm font-serif italic text-[#C8A464]">Digital experiences, made with intention.</div>
          </motion.div>
        </motion.div>

      </div>
    </div>
  );
}
