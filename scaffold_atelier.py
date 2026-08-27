import os

COMPONENTS_DIR = r"C:\Users\AYOUB\Desktop\webgobuilder\components\home"
os.makedirs(COMPONENTS_DIR, exist_ok=True)

files = {}

# 1. Navbar
files['Navbar.jsx'] = """'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 flex items-center justify-between px-6 md:px-12 ${
        scrolled ? 'py-4 bg-[#0E0E0F]/80 backdrop-blur-xl border-b border-[#F7F5F0]/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)]' : 'py-8 bg-transparent border-transparent'
      }`}
    >
      <Link href="/" className="font-bold text-lg tracking-widest text-[#F7F5F0]">
        WELLMADE
      </Link>
      
      <div className="hidden md:flex items-center gap-10 text-xs tracking-widest uppercase font-medium text-[#F7F5F0]/70">
        <Link href="#work" className="hover:text-[#C8A464] transition-colors duration-300">Work</Link>
        <Link href="#services" className="hover:text-[#C8A464] transition-colors duration-300">Services</Link>
        <Link href="#process" className="hover:text-[#C8A464] transition-colors duration-300">Process</Link>
        <Link href="#about" className="hover:text-[#C8A464] transition-colors duration-300">About</Link>
        <Link href="#insights" className="hover:text-[#C8A464] transition-colors duration-300">Insights</Link>
      </div>

      <Link href="/book" className="text-xs uppercase tracking-widest font-bold text-[#F7F5F0] hover:text-[#C2496B] transition-colors duration-300">
        Start a Project
      </Link>
    </motion.nav>
  );
}
"""

# 2. Hero
files['Hero.jsx'] = """'use client';
import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { projects } from '@/data/projects';

export default function Hero() {
  const containerRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 2; // -1 to 1
      const y = (e.clientY / innerHeight - 0.5) * 2;
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const opacityTransform = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scaleTransform = useTransform(scrollYProgress, [0, 1], [1, 1.5]);

  // Positions simulating an asymmetrical art installation
  const layout = [
    { left: '5%', top: '15%', z: 100, rotateY: 15, scale: 0.9 },
    { left: '25%', top: '45%', z: 300, rotateY: 5, scale: 1.2 },
    { left: '60%', top: '10%', z: 0, rotateY: -15, scale: 0.8 },
    { left: '55%', top: '60%', z: 200, rotateY: -5, scale: 1.1 },
    { left: '80%', top: '35%', z: 50, rotateY: -20, scale: 0.85 },
    { left: '10%', top: '75%', z: 150, rotateY: 10, scale: 0.95 },
  ];

  return (
    <section ref={containerRef} className="relative min-h-[120vh] bg-[#0E0E0F] overflow-hidden pt-40 flex flex-col items-center perspective-[1500px]">
      
      {/* 3D Art Installation */}
      <motion.div style={{ scale: scaleTransform }} className="absolute inset-0 pointer-events-none transform-gpu origin-center">
        {projects.map((p, i) => {
          const depthFactor = layout[i].z / 300; // 0 to 1
          const mouseX = mousePos.x * 30 * depthFactor;
          const mouseY = mousePos.y * 30 * depthFactor;
          
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, z: layout[i].z - 500, rotateX: 20 }}
              animate={{ opacity: 1, z: layout[i].z, rotateX: 0, x: mouseX, y: mouseY }}
              transition={{ 
                opacity: { duration: 2, delay: 1 + i * 0.2 },
                z: { duration: 2, delay: 1 + i * 0.2, ease: [0.16, 1, 0.3, 1] },
                rotateX: { duration: 2, delay: 1 + i * 0.2, ease: [0.16, 1, 0.3, 1] },
                x: { type: 'spring', stiffness: 50, damping: 20 },
                y: { type: 'spring', stiffness: 50, damping: 20 }
              }}
              className="absolute w-[25vw] min-w-[200px] aspect-[4/3] bg-[#0E0E0F] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.8)] border border-[#C8A464]/20 transform-gpu"
              style={{
                left: layout[i].left,
                top: layout[i].top,
                rotateY: layout[i].rotateY,
                scale: layout[i].scale,
              }}
            >
              <img src={p.image} alt={p.name} className="w-full h-full object-cover opacity-80 mix-blend-screen" />
              {/* Subtle lighting overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#C2496B]/10 via-transparent to-[#C8A464]/10 mix-blend-overlay" />
            </motion.div>
          )
        })}
      </motion.div>

      {/* Hero Typography */}
      <motion.div style={{ opacity: opacityTransform }} className="relative z-10 text-center max-w-5xl mx-auto mt-[10vh] px-6">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.8 }}
          className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#F7F5F0]/60 mb-8"
        >
          WELLMADE DIGITAL / 2026
        </motion.div>
        
        <div className="overflow-hidden mb-10">
          <motion.h1 
            initial={{ y: "100%" }} animate={{ y: 0 }} transition={{ duration: 1.2, delay: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-7xl lg:text-8xl font-medium tracking-tighter text-[#F7F5F0] leading-[1.05]"
          >
            Websites made to move <br className="hidden md:block"/> businesses forward.
          </motion.h1>
        </div>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, delay: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className="text-lg md:text-2xl text-[#F7F5F0]/70 max-w-2xl mx-auto mb-16 leading-relaxed font-light"
        >
          We design and build strategic digital experiences that help ambitious businesses communicate their value, earn trust, and turn attention into action.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-8"
        >
          <a href="/book" className="text-xs uppercase tracking-widest font-bold text-[#C2496B] hover:text-[#F7F5F0] transition-colors border-b border-[#C2496B] pb-1">
            Start a Project &rarr;
          </a>
          <a href="#work" className="text-xs uppercase tracking-widest font-medium text-[#F7F5F0]/60 hover:text-[#C8A464] transition-colors">
            Explore Our Work
          </a>
        </motion.div>
      </motion.div>
      
      {/* Vignette to blend into next section */}
      <div className="absolute bottom-0 w-full h-[30vh] bg-gradient-to-t from-[#0E0E0F] to-transparent pointer-events-none z-20" />
    </section>
  );
}
"""

# 3. Manifesto
files['Manifesto.jsx'] = """'use client';
import { motion } from 'framer-motion';

export default function Manifesto() {
  return (
    <section className="py-40 bg-[#0E0E0F] px-6 md:px-12 flex items-center justify-center min-h-[80vh]">
      <div className="max-w-5xl mx-auto text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 1 }}
          className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#F7F5F0]/40 mb-12"
        >
          THE WELLMADE STANDARD
        </motion.div>
        
        <motion.h2 
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 1.5, delay: 0.2 }}
          className="text-4xl md:text-6xl lg:text-7xl font-serif italic text-[#F7F5F0] leading-[1.2] tracking-tight"
        >
          Good design gets <span className="text-[#F7F5F0]">attention</span>.<br/>
          Great digital experiences create <span className="text-[#C2496B] not-italic font-sans font-medium tracking-tighter">action</span>.
        </motion.h2>
      </div>
    </section>
  );
}
"""

# 4. Problem
files['Problem.jsx'] = """'use client';
import { motion } from 'framer-motion';

const problems = [
  { num: '01', title: "The wrong impression", desc: "Your website doesn't reflect the quality of the business behind it." },
  { num: '02', title: "The unclear message", desc: "Visitors shouldn't need to work to understand your value." },
  { num: '03', title: "The missed opportunity", desc: "Attention means nothing if it doesn't lead somewhere." }
];

export default function Problem() {
  return (
    <section className="py-40 bg-[#F7F5F0] text-[#0E0E0F] px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-24">
          <div className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#0E0E0F]/50 mb-8">WHY WE EXIST</div>
          <h2 className="text-4xl md:text-6xl font-medium tracking-tighter leading-[1.1] max-w-4xl">
            Your website is often the first decision your customer makes about you.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-[#0E0E0F]/10 pt-16">
          {problems.map((p, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8, delay: i * 0.15 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-1.5 h-1.5 rounded-full bg-[#C2496B]" />
                <div className="text-xs font-bold tracking-widest text-[#0E0E0F]/40">{p.num}</div>
              </div>
              <h3 className="text-2xl md:text-3xl font-medium mb-4 tracking-tight">{p.title}</h3>
              <p className="text-[#0E0E0F]/70 text-lg leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
"""

# 5. Method
files['Method.jsx'] = """'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

const stages = ['01 STRATEGY', '02 EXPERIENCE', '03 DESIGN', '04 DEVELOPMENT', '05 OPTIMIZATION'];

export default function Method() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-50%"]);

  return (
    <section ref={containerRef} className="py-40 bg-[#0E0E0F] text-[#F7F5F0] overflow-hidden min-h-[80vh] flex flex-col justify-center">
      <div className="px-6 md:px-12 mb-20 max-w-7xl mx-auto w-full">
        <div className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#F7F5F0]/40 mb-8">OUR METHOD</div>
        <h2 className="text-4xl md:text-6xl font-medium tracking-tighter leading-[1.1] max-w-4xl">
          Strategy first. Design second.<br className="hidden md:block"/> Technology with purpose.
        </h2>
      </div>

      <div className="relative border-y border-[#F7F5F0]/10 py-16 mt-10">
        {/* Raspberry line indicator */}
        <motion.div 
          className="absolute top-0 left-0 h-[1px] bg-[#C2496B]" 
          style={{ width: useTransform(scrollYProgress, [0, 1], ["0%", "100%"]) }}
        />
        
        <motion.div style={{ x }} className="flex items-center gap-16 md:gap-32 px-6 md:px-12 w-max">
          {stages.map((stage, i) => (
            <div key={i} className="flex items-center gap-16 md:gap-32">
              <div className="relative">
                <span className="text-6xl md:text-8xl lg:text-[8rem] font-medium tracking-tighter text-[#F7F5F0]/20 hover:text-[#F7F5F0] transition-colors duration-700 cursor-default">
                  {stage}
                </span>
                {/* Extremely subtle 3D depth illusion on text hover (CSS shadow trick) */}
                <span className="absolute inset-0 text-6xl md:text-8xl lg:text-[8rem] font-medium tracking-tighter text-transparent shadow-text opacity-0 hover:opacity-100 transition-opacity duration-700 pointer-events-none" style={{ textShadow: '4px 4px 10px rgba(194,73,107,0.3)' }}>
                  {stage}
                </span>
              </div>
              {i < stages.length - 1 && (
                <div className="text-[#C8A464]/30 text-4xl">&darr;</div>
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
"""

# 6. Work
files['Work.jsx'] = """'use client';
import { projects } from '@/data/projects';

export default function Work() {
  return (
    <section id="work" className="py-40 bg-[#F7F5F0] text-[#0E0E0F] px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-24">
          <div className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#0E0E0F]/50 mb-8">SELECTED WORK</div>
          <h2 className="text-5xl md:text-7xl font-medium tracking-tighter leading-[1.1]">Made well. Built to perform.</h2>
        </div>

        {/* Asymmetrical Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12 auto-rows-auto">
          {projects.map((p, i) => {
            // Assign varying spans to create asymmetry
            let colSpan = "md:col-span-6";
            let aspect = "aspect-[4/3]";
            
            if (i === 0) { colSpan = "md:col-span-12"; aspect = "aspect-[16/9]"; } // Massive
            else if (i === 2) { colSpan = "md:col-span-4"; aspect = "aspect-[3/4]"; } // Vertical
            else if (i === 3) { colSpan = "md:col-span-8"; aspect = "aspect-[16/10]"; } // Wide
            
            return (
              <div key={p.id} className={`${colSpan} group cursor-pointer perspective-[1200px] mb-12`}>
                <div className={`relative ${aspect} overflow-hidden bg-[#0E0E0F] transition-all duration-1000 ease-[0.16,1,0.3,1] transform-gpu group-hover:rotate-y-[2deg] group-hover:rotate-x-[2deg] group-hover:scale-[1.03] group-hover:shadow-[0_40px_80px_rgba(0,0,0,0.2)]`}>
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform duration-[1.5s] ease-[0.16,1,0.3,1] group-hover:scale-110 opacity-90 group-hover:opacity-100 filter contrast-125" />
                  
                  {/* Subtle raspberry/gold lighting overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#C2496B]/0 via-transparent to-[#C8A464]/0 group-hover:from-[#C2496B]/20 group-hover:to-[#C8A464]/10 transition-all duration-1000 mix-blend-overlay" />
                  
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-10 transition-opacity duration-1000" />
                </div>
                
                <div className="mt-8 flex justify-between items-start opacity-70 group-hover:opacity-100 transition-opacity duration-500">
                  <div>
                    <h3 className="text-2xl font-medium tracking-tight mb-2 uppercase">{p.name}</h3>
                    <div className="text-[10px] font-bold text-[#0E0E0F]/50 uppercase tracking-widest mb-2">{p.industry}</div>
                    <p className="text-sm text-[#0E0E0F]/70">{p.services}</p>
                  </div>
                  <div className="hidden md:block text-xs font-bold uppercase tracking-widest text-[#C2496B] translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                    View Case Study &rarr;
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
"""

# 7. Services
files['Services.jsx'] = """'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const services = [
  { title: 'STRATEGY', image: '/pic1.png', items: ['Positioning', 'Messaging', 'Customer journeys', 'Information architecture'] },
  { title: 'DESIGN', image: '/pic2.png', items: ['UX/UI', 'Art direction', 'Visual systems', 'Interaction'] },
  { title: 'DEVELOPMENT', image: '/pic4.png', items: ['Web development', 'CMS', 'Integrations', 'Performance'] },
  { title: 'GROWTH', image: '/pic5.png', items: ['Conversion optimization', 'Analytics', 'Landing pages', 'Continuous improvement'] }
];

export default function Services() {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <section id="services" className="relative py-40 bg-[#0E0E0F] text-[#F7F5F0] px-6 md:px-12 min-h-screen flex items-center">
      
      {/* Background Images on Hover */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center perspective-[1000px]">
        <AnimatePresence>
          {hoveredIndex !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotateX: 10 }}
              animate={{ opacity: 0.15, scale: 1, rotateX: 0 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="absolute w-[60vw] aspect-video transform-gpu"
            >
              <img src={services[hoveredIndex].image} alt="" className="w-full h-full object-cover filter contrast-125" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="mb-24">
          <h2 className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#F7F5F0]/40 mb-8">What we build.</h2>
        </div>
        
        <div className="flex flex-col">
          {services.map((s, i) => (
            <div 
              key={i} 
              className="group border-b border-[#F7F5F0]/10 py-12 flex flex-col md:flex-row justify-between items-start md:items-center cursor-pointer transition-colors hover:border-[#C2496B]/50"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <h3 className="text-5xl md:text-7xl lg:text-[6rem] font-medium tracking-tighter text-[#F7F5F0]/40 group-hover:text-[#F7F5F0] transition-colors duration-500 mb-6 md:mb-0">
                {s.title}
                <span className="hidden md:inline-block ml-6 text-6xl text-[#C2496B] opacity-0 group-hover:opacity-100 group-hover:translate-x-4 transition-all duration-500 transform-gpu">&rarr;</span>
              </h3>
              
              <ul className="grid grid-cols-1 gap-2 text-right">
                {s.items.map((item, idx) => (
                  <li key={idx} className="text-[#C8A464]/60 group-hover:text-[#C8A464] text-sm tracking-widest uppercase font-medium transition-colors duration-500">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
"""

# 8. Process
files['Process.jsx'] = """'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

const steps = [
  { num: '01 DISCOVER', desc: 'Understand the business.' },
  { num: '02 STRATEGIZE', desc: 'Define the opportunity.' },
  { num: '03 DESIGN', desc: 'Create the experience.' },
  { num: '04 BUILD', desc: 'Bring the system to life.' },
  { num: '05 LAUNCH', desc: 'Test, refine and deploy.' },
];

export default function Process() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start center", "end center"] });
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section id="process" ref={ref} className="py-40 bg-[#F7F5F0] text-[#0E0E0F] px-6 md:px-12 relative overflow-hidden">
      
      {/* Decorative scattered screenshots */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <img src="/pic2.png" className="absolute top-[20%] right-[-10%] w-[40vw] rotate-12" alt="" />
        <img src="/pic3.png" className="absolute bottom-[10%] left-[-10%] w-[30vw] -rotate-12" alt="" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="mb-32">
          <div className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#0E0E0F]/50 mb-8">HOW WE WORK</div>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-medium tracking-tighter leading-[1.1]">
            From first idea to finished experience.
          </h2>
        </div>

        <div className="relative pl-8 md:pl-0 md:ml-[30%]">
          {/* Scroll line */}
          <div className="absolute left-[3px] top-0 bottom-0 w-[1px] bg-[#0E0E0F]/10" />
          <motion.div 
            style={{ scaleY, originY: 0 }}
            className="absolute left-[3px] top-0 bottom-0 w-[2px] bg-[#C2496B] z-0" 
          />

          <div className="space-y-24 relative z-10">
            {steps.map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8 }}
                className="relative pl-12"
              >
                <div className="absolute left-[-1.5px] top-2 w-2 h-2 rounded-full bg-[#0E0E0F]" />
                <h3 className="text-2xl font-bold tracking-widest uppercase mb-4 text-[#0E0E0F]">{step.num}</h3>
                <p className="text-xl text-[#0E0E0F]/60 font-serif italic">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
"""

# 9. WhyWellmade
files['WhyWellmade.jsx'] = """'use client';
import { motion } from 'framer-motion';

const statements = [
  { title: 'BUSINESS FIRST', desc: 'Every decision starts with an objective.' },
  { title: 'CLARITY OVER COMPLEXITY', desc: "We remove what doesn't matter." },
  { title: 'CRAFT MATTERS', desc: 'The details are the difference.' },
  { title: 'BUILT TO EVOLVE', desc: 'Your website should grow with your business.' },
];

export default function WhyWellmade() {
  return (
    <section className="py-40 bg-[#0E0E0F] text-[#F7F5F0] px-6 md:px-12 flex flex-col justify-center min-h-screen">
      <div className="max-w-7xl mx-auto w-full">
        <div className="mb-32">
          <h2 className="text-5xl md:text-7xl lg:text-[6rem] font-medium tracking-tighter leading-[1.1] mb-6">
            We don't design for awards.
          </h2>
          <motion.h2 
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1.5, delay: 0.5 }}
            className="text-5xl md:text-7xl lg:text-[6rem] font-medium tracking-tighter leading-[1.1] text-[#C2496B]"
          >
            We design for businesses.
          </motion.h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 border-t border-[#F7F5F0]/10 pt-16">
          {statements.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: i * 0.1 }}>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-4 text-[#F7F5F0]">{s.title}</h3>
              <p className="text-sm text-[#F7F5F0]/50 leading-relaxed pr-4">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
"""

# 10. Testimonial
files['Testimonial.jsx'] = """'use client';
export default function Testimonial() {
  return (
    <section className="py-40 bg-[#F7F5F0] text-[#0E0E0F] px-6 md:px-12 relative overflow-hidden flex items-center min-h-[80vh]">
      
      {/* Partially cropped screenshot */}
      <div className="absolute right-0 top-0 bottom-0 w-1/3 pointer-events-none hidden md:block">
        <img src="/pic4.png" alt="" className="w-full h-full object-cover object-left opacity-30 grayscale mix-blend-multiply" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#C8A464] mb-12">CLIENT STORY</div>
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-serif italic font-medium leading-[1.2] mb-16 max-w-4xl tracking-tight">
          "Wellmade completely changed how our business presents itself online."
        </h2>
        <div>
          <div className="font-bold text-lg mb-1 uppercase tracking-widest">Jane Doe</div>
          <div className="text-[#0E0E0F]/50 text-xs uppercase tracking-[0.2em] font-medium">Founder — Company</div>
        </div>
      </div>
    </section>
  );
}
"""

# 11. Insights
files['Insights.jsx'] = """'use client';
const articles = [
  { cat: 'STRATEGY', title: "Why most business websites don't convert", read: '4 MIN READ' },
  { cat: 'DESIGN', title: "The anatomy of a high-performing service website", read: '6 MIN READ' },
  { cat: 'BUSINESS', title: "What separates a €2,000 website from a €10,000 website", read: '5 MIN READ' },
];

export default function Insights() {
  return (
    <section id="insights" className="py-40 bg-[#0E0E0F] text-[#F7F5F0] px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-24">
          <div className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#F7F5F0]/40 mb-8">INSIGHTS</div>
          <h2 className="text-4xl md:text-6xl font-medium tracking-tighter leading-[1.1]">Things worth thinking about.</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {articles.map((a, i) => (
            <a key={i} href="#" className="group block border-t border-[#F7F5F0]/10 pt-10">
              <div className="flex justify-between items-center mb-8 text-[10px] font-bold tracking-[0.2em] text-[#C8A464]">
                <span>{a.cat}</span>
                <span className="text-[#F7F5F0]/30">{a.read}</span>
              </div>
              <h3 className="text-3xl lg:text-4xl font-medium leading-[1.1] tracking-tight mb-10 group-hover:text-[#F7F5F0]/70 transition-colors">{a.title}</h3>
              <div className="w-12 h-12 rounded-full border border-[#F7F5F0]/20 flex items-center justify-center group-hover:border-[#C2496B] group-hover:bg-[#C2496B] group-hover:text-[#F7F5F0] transition-all duration-500">
                &rarr;
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
"""

# 12. FinalCTA (W shape 3D)
files['FinalCTA.jsx'] = """'use client';
import { motion } from 'framer-motion';
import { projects } from '@/data/projects';

export default function FinalCTA() {
  return (
    <section className="relative py-40 bg-[#0E0E0F] text-[#F7F5F0] px-6 md:px-12 overflow-hidden text-center min-h-screen flex items-center justify-center perspective-[2000px]">
      
      <div className="relative z-10 max-w-4xl mx-auto mix-blend-difference mt-20">
        <h2 className="text-5xl md:text-7xl lg:text-[6rem] font-medium tracking-tighter leading-[1.05] mb-8 text-[#F7F5F0]">
          Let's make something well made.
        </h2>
        <p className="text-lg md:text-2xl text-[#F7F5F0]/70 max-w-2xl mx-auto mb-16 leading-relaxed font-light">
          Tell us where your business is today. We'll help you build where it's going next.
        </p>
        <a href="/book" className="inline-block text-xs uppercase tracking-widest font-bold text-[#C2496B] hover:text-[#F7F5F0] transition-colors border-b border-[#C2496B] pb-2">
          Start a Project &rarr;
        </a>
      </div>
      
      {/* Cinematic W Sequence */}
      <div className="absolute inset-0 pointer-events-none opacity-40 flex items-center justify-center gap-2 transform-gpu">
        {projects.slice(0, 6).map((p, i) => {
          // Abstract geometric W
          // V shape left, V shape right
          const rotateZ = [ -25, 25, 0, -25, 25, 0 ][i];
          const yOffset = [ -100, 100, -50, 100, -100, 0 ][i];
          const rotateY = [ 45, -45, 10, 45, -45, -10 ][i];
          
          return (
            <motion.div 
              key={p.id}
              initial={{ opacity: 0, y: 300, rotateX: 90, z: -500 }} 
              whileInView={{ opacity: 1, y: yOffset, rotateX: 0, rotateZ, rotateY, z: 0 }} 
              viewport={{ once: true, margin: "100px" }}
              transition={{ duration: 2.5, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="w-[12vw] h-[40vh] bg-[#0E0E0F] border border-[#C8A464]/20 transform-gpu overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.8)]" 
            >
              <img src={p.image} className="w-full h-full object-cover grayscale opacity-50 mix-blend-screen" alt="" />
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
"""

# 13. Footer
files['Footer.jsx'] = """'use client';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#0E0E0F] text-[#F7F5F0] px-6 md:px-12 py-16 border-t border-[#F7F5F0]/10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12 mb-32">
        <div>
          <div className="font-bold text-3xl tracking-widest mb-10">WELLMADE</div>
          <a href="/book" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#C2496B] font-bold hover:text-[#F7F5F0] transition-colors">
            Start a Project &rarr;
          </a>
        </div>
        
        <div className="flex gap-16 md:gap-32 text-xs uppercase tracking-widest font-medium">
          <div className="flex flex-col gap-6">
            <Link href="#work" className="hover:text-[#C8A464] transition-colors text-[#F7F5F0]/70">Work</Link>
            <Link href="#services" className="hover:text-[#C8A464] transition-colors text-[#F7F5F0]/70">Services</Link>
            <Link href="#process" className="hover:text-[#C8A464] transition-colors text-[#F7F5F0]/70">Process</Link>
            <Link href="#about" className="hover:text-[#C8A464] transition-colors text-[#F7F5F0]/70">About</Link>
            <Link href="#insights" className="hover:text-[#C8A464] transition-colors text-[#F7F5F0]/70">Insights</Link>
          </div>
          <div className="flex flex-col gap-6 text-[#F7F5F0]/40">
            <a href="#" className="hover:text-[#F7F5F0] transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-[#F7F5F0] transition-colors">Instagram</a>
            <a href="#" className="hover:text-[#F7F5F0] transition-colors">X</a>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto border-t border-[#F7F5F0]/10 pt-8 flex flex-col md:flex-row justify-between text-[10px] uppercase tracking-widest text-[#F7F5F0]/30 font-bold">
        <div>© 2026 Wellmade Digital.</div>
        <div className="flex gap-8 mt-4 md:mt-0">
          <a href="#" className="hover:text-[#F7F5F0]/60 transition-colors">Privacy</a>
          <a href="#" className="hover:text-[#F7F5F0]/60 transition-colors">Terms</a>
        </div>
      </div>
    </footer>
  );
}
"""

for name, code in files.items():
    with open(os.path.join(COMPONENTS_DIR, name), 'w', encoding='utf-8') as f:
        f.write(code)

page_code = """import Navbar from '@/components/home/Navbar';
import Hero from '@/components/home/Hero';
import Manifesto from '@/components/home/Manifesto';
import Problem from '@/components/home/Problem';
import Method from '@/components/home/Method';
import Work from '@/components/home/Work';
import Services from '@/components/home/Services';
import Process from '@/components/home/Process';
import WhyWellmade from '@/components/home/WhyWellmade';
import Testimonial from '@/components/home/Testimonial';
import Insights from '@/components/home/Insights';
import FinalCTA from '@/components/home/FinalCTA';
import Footer from '@/components/home/Footer';

export const metadata = {
  title: 'Wellmade Digital | Digital Atelier',
  description: 'Ultra-premium dark editorial digital studio.',
};

export default function Home() {
  return (
    <main className="w-full bg-[#0E0E0F] text-[#F7F5F0] antialiased font-sans selection:bg-[#C2496B] selection:text-[#F7F5F0] relative overflow-x-hidden">
      <Navbar />
      <Hero />
      <Manifesto />
      <Problem />
      <Method />
      <Work />
      <Services />
      <Process />
      <WhyWellmade />
      <Testimonial />
      <Insights />
      <FinalCTA />
      <Footer />
    </main>
  );
}
"""

with open(r"C:\Users\AYOUB\Desktop\webgobuilder\app\page.jsx", 'w', encoding='utf-8') as f:
    f.write(page_code)
