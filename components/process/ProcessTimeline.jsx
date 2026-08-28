'use client';
import { useRef, useState, useEffect, Suspense } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import Process3D from './3d/Process3D';

const phases = [
  {
    num: "01",
    title: "Discovery & Understanding",
    text: "We begin by deeply understanding the exact problem you are facing. We analyze your operations and map out the current bottlenecks.",
    deliverables: ["Needs Analysis", "Problem Mapping", "Strategy Brief"]
  },
  {
    num: "02",
    title: "Solution Proposal",
    text: "We architect and propose the exact digital solution required to solve your problem efficiently.",
    deliverables: ["Architectural Blueprint", "UX Wireframes", "Investment Proposal"]
  },
  {
    num: "03",
    title: "Building the Solution",
    text: "Our engineering team starts building the solution using modern, high-performance tech stacks (Next.js, WebGL).",
    deliverables: ["Frontend Development", "Backend Systems", "WebGL Integration"]
  },
  {
    num: "04",
    title: "Testing",
    text: "We rigorously test the built solution directly with you to ensure it perfectly addresses the initial problem.",
    deliverables: ["QA Sessions", "Edge-case Simulation", "Client Feedback Loop"]
  },
  {
    num: "05",
    title: "Optimization",
    text: "Based on testing feedback, we optimize performance, refine the user experience, and tune conversion metrics.",
    deliverables: ["Performance Tuning", "Conversion Optimization", "Code Refinement"]
  },
  {
    num: "06",
    title: "Review Delivery",
    text: "We deliver the polished solution to you on a secure staging environment for a final comprehensive review.",
    deliverables: ["Staging Environment", "Final Walkthrough", "Final Revisions"]
  },
  {
    num: "07",
    title: "Final Delivery",
    text: "We officially deliver and launch the solution into production, handing over all assets.",
    deliverables: ["Production Launch", "Source Code Handover", "Post-Launch Support"]
  }
];

export default function ProcessTimeline() {
  const [mounted, setMounted] = useState(false);
  const targetRef = useRef(null);
  
  // Track vertical scroll over the entire section
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"]
  });

  useEffect(() => setMounted(true), []);

  return (
    <section ref={targetRef} className="relative w-full bg-[#0E0E0F]">
      
      {/* Sticky 3D Background - Stays fixed behind the content while you scroll */}
      <div className="sticky top-0 h-screen w-full overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0">
          {mounted && (
            <Canvas camera={{ position: [0, 0, 25], fov: 45 }}>
              <fog attach="fog" args={['#0E0E0F', 10, 40]} />
              <Suspense fallback={null}>
                <Process3D scrollYProgress={scrollYProgress} />
              </Suspense>
            </Canvas>
          )}
        </div>
        {/* Gradients to ensure text legibility over the 3D scene */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0E0E0F] via-[#0E0E0F]/60 to-[#0E0E0F] z-10" />
      </div>

      {/* The Native Vertical Scrolling Content */}
      <div className="relative z-20 w-full -mt-[100vh]">
        
        {/* Title / Hero Section */}
        <div className="min-h-screen flex flex-col md:flex-row items-center justify-between px-[5vw] py-20 gap-12">
          <div className="flex-1 max-w-2xl relative z-10">
            <div className="text-[10px] uppercase tracking-widest font-bold text-[#C8A464] mb-8">THE PROCESS</div>
            <h1 className="text-6xl md:text-[8rem] font-medium tracking-tighter leading-[0.9] text-[#F7F5F0]">
              The Engine of <br/><span className="text-[#C2496B]">Clarity.</span>
            </h1>
            <p className="mt-12 text-xl text-[#F7F5F0]/60 max-w-lg font-light leading-relaxed">
              Scroll to explore the seven-phase methodology we use to turn operational chaos into highly scalable digital systems.
            </p>
          </div>
          
          {/* High-end Technical Graphic */}
          <div className="hidden md:flex flex-1 justify-center relative pointer-events-none">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              className="w-[450px] h-[450px] border border-[#F7F5F0]/10 rounded-full flex items-center justify-center relative"
            >
              <div className="absolute inset-[10%] border border-[#C2496B]/20 rounded-full" />
              <div className="absolute inset-[25%] border border-[#C8A464]/20 rounded-full border-dashed" />
              <div className="absolute inset-0 bg-gradient-to-tr from-[#C2496B]/5 to-transparent rounded-full blur-3xl" />
              <div className="absolute top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-[#F7F5F0]/20 to-transparent" />
              <div className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#F7F5F0]/20 to-transparent" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-[#C8A464] rounded-full shadow-[0_0_15px_#C8A464]" />
              <div className="absolute bottom-[25%] right-[25%] translate-x-1/2 translate-y-1/2 w-2 h-2 bg-[#C2496B] rounded-full shadow-[0_0_10px_#C2496B]" />
              <div className="w-20 h-20 bg-[#1A1A1B]/80 backdrop-blur-md border border-[#C2496B] rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(194,73,107,0.2)]">
                <div className="w-6 h-6 bg-[#C8A464] rounded-full animate-pulse" />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Vertical Timeline Phases */}
        <div className="w-full max-w-6xl mx-auto px-[5vw] py-32 flex flex-col gap-32">
          {phases.map((phase, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-20%" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col md:flex-row gap-8 md:gap-16 items-start"
            >
              {/* Massive Phase Number */}
              <div className="md:w-1/4 pt-4">
                <div className="text-[6rem] md:text-[8rem] font-black tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-[#C8A464]/40 to-transparent">
                  {phase.num}
                </div>
              </div>
              
              {/* Content Card */}
              <div className="md:w-3/4 bg-[#1A1A1B]/60 backdrop-blur-xl border border-[#F7F5F0]/10 p-10 md:p-16 rounded-3xl relative overflow-hidden group hover:border-[#C2496B]/30 transition-colors duration-500">
                <div className="absolute -inset-[100px] bg-[#C2496B]/10 opacity-0 group-hover:opacity-100 blur-3xl transition-opacity duration-1000 pointer-events-none" />
                
                <div className="relative z-10">
                  <h2 className="text-3xl md:text-5xl font-medium tracking-tighter mb-6 text-[#F7F5F0]">{phase.title}</h2>
                  <p className="text-[#F7F5F0]/70 text-lg md:text-xl font-light leading-relaxed mb-10">
                    {phase.text}
                  </p>
                  
                  <div className="flex flex-col gap-4">
                    {phase.deliverables.map((del, di) => (
                      <div key={di} className="flex items-center gap-4 text-sm uppercase tracking-widest font-bold text-[#F7F5F0]/50">
                        <span className="w-8 h-[1px] bg-[#C2496B]"></span> {del}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom padding */}
        <div className="h-[20vh]" />

      </div>
    </section>
  );
}
