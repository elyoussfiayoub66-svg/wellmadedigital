import os

COMPONENTS_DIR = r"C:\Users\AYOUB\Desktop\webgobuilder\components\home"
os.makedirs(COMPONENTS_DIR, exist_ok=True)

files = {}

# 1. Navbar
files['Navbar.jsx'] = """'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

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
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 flex items-center justify-between px-6 md:px-12 ${
        scrolled ? 'py-4 bg-[var(--wm-cream)]/90 backdrop-blur-md border-b border-[var(--wm-charcoal)]/10 shadow-sm' : 'py-8 bg-transparent border-transparent'
      }`}
    >
      <Link href="/" className="font-bold text-lg tracking-tight text-[var(--wm-charcoal)]">
        WELLMADE
      </Link>
      
      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--wm-charcoal)]">
        <Link href="#work" className="hover:text-[var(--wm-terracotta)] transition-colors">Work</Link>
        <Link href="#services" className="hover:text-[var(--wm-terracotta)] transition-colors">Services</Link>
        <Link href="#process" className="hover:text-[var(--wm-terracotta)] transition-colors">Process</Link>
        <Link href="#about" className="hover:text-[var(--wm-terracotta)] transition-colors">About</Link>
        <Link href="#insights" className="hover:text-[var(--wm-terracotta)] transition-colors">Insights</Link>
      </div>

      <Link href="/book" className="text-sm font-bold text-[var(--wm-charcoal)] hover:text-[var(--wm-terracotta)] transition-colors flex items-center gap-2">
        Start a Project <span>&rarr;</span>
      </Link>
    </motion.nav>
  );
}
"""

# 2. Hero
files['Hero.jsx'] = """'use client';
import { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { projects } from '@/data/projects';

export default function Hero() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -400]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y4 = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const y5 = useTransform(scrollYProgress, [0, 1], [0, -500]);
  const y6 = useTransform(scrollYProgress, [0, 1], [0, -250]);
  
  const transforms = [y1, y2, y3, y4, y5, y6];
  
  const positions = [
    { top: '10%', left: '5%', zIndex: 2, scale: 0.8 },
    { top: '40%', left: '20%', zIndex: 4, scale: 1.1 },
    { top: '5%', right: '15%', zIndex: 1, scale: 0.7 },
    { top: '35%', right: '5%', zIndex: 3, scale: 0.9 },
    { top: '65%', left: '10%', zIndex: 5, scale: 1 },
    { top: '75%', right: '25%', zIndex: 6, scale: 1.2 }
  ];

  return (
    <section ref={containerRef} className="relative min-h-[120vh] bg-[var(--wm-cream)] overflow-hidden pt-40 px-6 md:px-12 flex flex-col items-center">
      
      <div className="absolute inset-0 pointer-events-none perspective-[1200px]">
        {projects.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 100, rotateX: 20, rotateY: i % 2 === 0 ? 10 : -10 }}
            animate={{ opacity: 1, y: 0, rotateX: 0, rotateY: 0 }}
            transition={{ duration: 1.2, delay: 0.5 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            style={{ 
              position: 'absolute', 
              top: positions[i].top, 
              left: positions[i].left,
              right: positions[i].right,
              zIndex: positions[i].zIndex,
              scale: positions[i].scale,
              y: transforms[i]
            }}
            className="w-[30vw] min-w-[280px] max-w-[400px] aspect-[4/3] overflow-hidden shadow-[0_20px_40px_rgba(61,61,58,0.15)] border border-[var(--wm-white)]/50 bg-[var(--wm-white)]"
          >
            <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 text-center max-w-4xl mx-auto mt-[10vh] mix-blend-multiply">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
          className="text-xs font-bold tracking-[0.2em] uppercase text-[var(--wm-terracotta)] mb-6"
        >
          WELLMADE DIGITAL
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl md:text-7xl lg:text-[5.5rem] font-medium tracking-tight text-[var(--wm-charcoal)] leading-[1.05] mb-8"
        >
          Websites made to move businesses forward.
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.6 }}
          className="text-lg md:text-xl text-[var(--wm-charcoal)]/80 max-w-2xl mx-auto mb-10 leading-relaxed font-light"
        >
          We design and build strategic digital experiences that help ambitious businesses communicate their value, earn trust, and turn more visitors into customers.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a href="/book" className="bg-[var(--wm-charcoal)] text-[var(--wm-white)] px-8 py-4 text-sm font-medium hover:bg-[var(--wm-terracotta)] transition-colors">
            Start a Project &rarr;
          </a>
          <a href="#work" className="border border-[var(--wm-charcoal)]/20 text-[var(--wm-charcoal)] px-8 py-4 text-sm font-medium hover:bg-[var(--wm-charcoal)]/5 transition-colors">
            View Our Work
          </a>
        </motion.div>
      </div>
    </section>
  );
}
"""

# 3. Philosophy
files['Philosophy.jsx'] = """'use client';
import { motion } from 'framer-motion';

const principles = [
  { num: '01', title: 'Strategy', desc: 'Understand before designing.' },
  { num: '02', title: 'Clarity', desc: 'Make the value obvious.' },
  { num: '03', title: 'Craft', desc: 'Obsess over the details.' },
  { num: '04', title: 'Performance', desc: 'Build for real-world results.' },
];

export default function Philosophy() {
  return (
    <section className="py-32 bg-[var(--wm-cream)] px-6 md:px-12 text-[var(--wm-charcoal)] relative">
      <div className="max-w-6xl mx-auto">
        <div className="mb-20">
          <div className="text-xs font-bold tracking-[0.2em] uppercase text-[var(--wm-terracotta)] mb-6">OUR PHILOSOPHY</div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight leading-[1.1] max-w-3xl mb-6">
            A website is more than a digital storefront.
          </h2>
          <p className="text-lg md:text-xl text-[var(--wm-charcoal)]/70 max-w-2xl leading-relaxed">
            It's where your brand meets your customer, your positioning becomes tangible, and interest becomes action.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          <div className="hidden md:block absolute top-6 left-0 right-0 h-[1px] bg-[var(--wm-charcoal)]/10" />
          
          {principles.map((p, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="pt-6 relative bg-[var(--wm-cream)]"
            >
              <div className="hidden md:block absolute top-0 left-0 w-8 h-[2px] bg-[var(--wm-terracotta)]" />
              <div className="text-sm font-bold text-[var(--wm-terracotta)] mb-4">{p.num} — {p.title}</div>
              <p className="text-[var(--wm-charcoal)]/80 leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
"""

# 4. Problem
files['Problem.jsx'] = """'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

const problems = [
  { num: '01', title: "It doesn't reflect your business", desc: "Your company has evolved, but your website still looks like it did years ago." },
  { num: '02', title: "Your value isn't immediately clear", desc: "Visitors shouldn't have to figure out what you do or why they should choose you." },
  { num: '03', title: "It doesn't create action", desc: "A beautiful website means little if visitors leave without taking the next step." }
];

export default function Problem() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-100, 100]);

  return (
    <section ref={ref} className="py-32 bg-[var(--wm-forest)] text-[var(--wm-white)] px-6 md:px-12 relative overflow-hidden">
      
      <motion.div style={{ y }} className="absolute right-[-10%] top-[20%] w-[50%] md:w-[40%] opacity-20 pointer-events-none perspective-[1000px]">
        <div className="aspect-[4/3] bg-black shadow-2xl overflow-hidden transform-gpu rotate-y-[-20deg] rotate-x-[10deg]">
          <img src="/pic1.jpg" alt="Embedded project" className="w-full h-full object-cover" />
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="mb-24">
          <div className="text-xs font-bold tracking-[0.2em] uppercase text-[var(--wm-terracotta)] mb-6">THE PROBLEM</div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight leading-[1.1] max-w-2xl mb-6">
            Your business has outgrown its website.
          </h2>
          <p className="text-lg md:text-xl text-[var(--wm-cream)]/70 max-w-xl leading-relaxed">
            Your company has evolved. Your website should have evolved with it.
          </p>
        </div>

        <div className="space-y-16 max-w-3xl">
          {problems.map((p, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="border-t border-[var(--wm-cream)]/10 pt-8"
            >
              <div className="text-sm font-bold text-[var(--wm-terracotta)] mb-4">{p.num}</div>
              <h3 className="text-2xl md:text-3xl font-medium mb-3">{p.title}</h3>
              <p className="text-[var(--wm-cream)]/70 text-lg leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
"""

# 5. Approach
files['Approach.jsx'] = """'use client';
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
"""

# 6. Work
files['Work.jsx'] = """'use client';
import { projects } from '@/data/projects';

export default function Work() {
  return (
    <section id="work" className="py-32 bg-[var(--wm-white)] text-[var(--wm-charcoal)] px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-20">
          <div className="text-xs font-bold tracking-[0.2em] uppercase text-[var(--wm-terracotta)] mb-6">SELECTED WORK</div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight leading-[1.1] mb-6">Built with purpose.</h2>
          <p className="text-lg md:text-xl text-[var(--wm-charcoal)]/70 max-w-2xl">
            A selection of digital experiences designed to solve real business problems.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
          {projects.map((p) => (
            <div key={p.id} className="group cursor-pointer perspective-[1200px]">
              <div className="relative aspect-[16/10] mb-6 overflow-hidden bg-[var(--wm-cream)] transition-all duration-700 ease-out transform-gpu group-hover:rotate-y-[2deg] group-hover:rotate-x-[2deg] group-hover:scale-[1.02] group-hover:shadow-[0_30px_60px_rgba(61,61,58,0.15)] shadow-sm">
                <img src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
              </div>
              <div className="flex flex-col gap-2">
                <div className="text-xs font-bold text-[var(--wm-charcoal)]/50 uppercase tracking-widest">{p.industry}</div>
                <h3 className="text-3xl font-medium text-[var(--wm-charcoal)]">{p.name}</h3>
                <p className="text-sm text-[var(--wm-charcoal)]/70">{p.services}</p>
              </div>
            </div>
          ))}
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
  { title: 'STRATEGY', items: ['Positioning', 'Messaging', 'Customer journeys', 'Website architecture'] },
  { title: 'DESIGN', items: ['UX/UI', 'Art direction', 'Visual systems', 'Responsive design'] },
  { title: 'DEVELOPMENT', items: ['Custom development', 'CMS', 'Integrations', 'Performance'] },
  { title: 'GROWTH', items: ['Conversion optimization', 'Analytics', 'Landing pages', 'Continuous improvement'] }
];

export default function Services() {
  const [active, setActive] = useState(0);

  return (
    <section id="services" className="py-32 bg-[var(--wm-forest)] text-[var(--wm-white)] px-6 md:px-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16">
        <div className="md:w-1/3">
          <div className="text-xs font-bold tracking-[0.2em] uppercase text-[var(--wm-terracotta)] mb-6">WHAT WE DO</div>
          <h2 className="text-4xl md:text-5xl font-medium tracking-tight leading-[1.1] sticky top-32">
            Everything your digital presence needs.
          </h2>
        </div>
        
        <div className="md:w-2/3">
          {services.map((s, i) => (
            <div 
              key={i} 
              className={`border-b border-[var(--wm-cream)]/10 py-8 cursor-pointer transition-all duration-500 group ${active === i ? 'opacity-100' : 'opacity-40 hover:opacity-70'}`}
              onClick={() => setActive(i)}
            >
              <div className="flex justify-between items-center">
                <h3 className={`text-3xl md:text-5xl font-medium tracking-tight transition-all duration-500 ${active === i ? 'text-[var(--wm-terracotta)] translate-x-4' : 'group-hover:translate-x-2'}`}>
                  {s.title}
                </h3>
              </div>
              <AnimatePresence>
                {active === i && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <ul className="pt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-[var(--wm-cream)]/80 ml-4 md:ml-8 text-lg">
                      {s.items.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-4">
                          <span className="w-1.5 h-1.5 bg-[var(--wm-terracotta)] rounded-full shrink-0" /> {item}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
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
  { num: '01', name: 'Discover', desc: 'Understand the business.' },
  { num: '02', name: 'Strategize', desc: 'Define the direction.' },
  { num: '03', name: 'Design', desc: 'Create the experience.' },
  { num: '04', name: 'Build', desc: 'Bring it to life.' },
  { num: '05', name: 'Launch', desc: 'Test, refine and deploy.' },
];

export default function Process() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start center", "end center"] });
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section id="process" ref={ref} className="py-32 bg-[var(--wm-cream)] text-[var(--wm-charcoal)] px-6 md:px-12 overflow-hidden">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-24">
          <div className="text-xs font-bold tracking-[0.2em] uppercase text-[var(--wm-terracotta)] mb-6">OUR PROCESS</div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight leading-[1.1]">
            A better website starts with a better process.
          </h2>
        </div>

        <div className="relative pl-6 md:pl-0 md:flex md:flex-col md:items-center">
          {/* Scroll line */}
          <div className="absolute left-[29px] md:left-1/2 md:-ml-[1px] top-0 bottom-0 w-[2px] bg-[var(--wm-charcoal)]/10" />
          <motion.div 
            style={{ scaleY, originY: 0 }}
            className="absolute left-[29px] md:left-1/2 md:-ml-[1px] top-0 bottom-0 w-[2px] bg-[var(--wm-terracotta)] z-0" 
          />

          <div className="space-y-20 relative z-10 w-full">
            {steps.map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5 }}
                className={`flex flex-col md:flex-row gap-8 items-start md:items-center ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
              >
                <div className={`hidden md:block w-1/2 ${i % 2 === 0 ? 'text-right pr-12' : 'pl-12'}`}>
                  <h3 className="text-3xl font-medium mb-2">{step.name}</h3>
                  <p className="text-lg text-[var(--wm-charcoal)]/70">{step.desc}</p>
                </div>
                
                <div className="w-14 h-14 rounded-full bg-[var(--wm-cream)] border-[3px] border-[var(--wm-terracotta)] flex items-center justify-center font-bold text-[var(--wm-terracotta)] shrink-0 z-10 md:mx-auto shadow-[0_0_0_8px_var(--wm-cream)]">
                  {step.num}
                </div>
                
                <div className="md:hidden pt-2">
                  <h3 className="text-2xl font-medium mb-2">{step.name}</h3>
                  <p className="text-lg text-[var(--wm-charcoal)]/70">{step.desc}</p>
                </div>
                
                <div className={`hidden md:block w-1/2 ${i % 2 === 0 ? 'pl-12' : 'pr-12'}`} />
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
const reasons = [
  { title: 'Business before aesthetics.', desc: 'Every design decision has a reason.' },
  { title: 'Clarity over complexity.', desc: "We don't add things just because we can." },
  { title: 'Details matter.', desc: 'Typography, spacing, interactions and performance all count.' },
  { title: "Built for what's next.", desc: 'Your website should evolve with your business.' },
];

export default function WhyWellmade() {
  return (
    <section className="py-32 bg-[var(--wm-white)] text-[var(--wm-charcoal)] px-6 md:px-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16">
        <div className="md:w-1/3">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight leading-[1.1] sticky top-32">
            Built differently.
          </h2>
        </div>
        <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-16">
          {reasons.map((r, i) => (
            <div key={i}>
              <h3 className="text-2xl font-medium mb-4 text-[var(--wm-charcoal)]">{r.title}</h3>
              <p className="text-lg text-[var(--wm-charcoal)]/70 leading-relaxed">{r.desc}</p>
            </div>
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
    <section className="py-40 bg-[var(--wm-white)] text-[var(--wm-charcoal)] px-6 md:px-12 border-t border-[var(--wm-charcoal)]/5">
      <div className="max-w-5xl mx-auto text-center">
        <div className="text-xs font-bold tracking-[0.2em] uppercase text-[var(--wm-terracotta)] mb-12">CLIENT STORIES</div>
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif italic font-medium leading-[1.3] mb-12 text-[var(--wm-charcoal)]">
          "Wellmade completely changed how our business presents itself online. The results were immediate and measurable."
        </h2>
        <div>
          <div className="font-bold text-xl mb-1">Jane Doe</div>
          <div className="text-[var(--wm-charcoal)]/60 text-sm uppercase tracking-wider font-medium">Founder — TechCorp</div>
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
    <section id="insights" className="py-32 bg-[var(--wm-white)] text-[var(--wm-charcoal)] px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <div className="text-xs font-bold tracking-[0.2em] uppercase text-[var(--wm-terracotta)] mb-6">INSIGHTS</div>
          <h2 className="text-4xl md:text-5xl font-medium tracking-tight leading-[1.1]">Ideas worth sharing.</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {articles.map((a, i) => (
            <a key={i} href="#" className="group block border-t border-[var(--wm-charcoal)]/10 pt-8">
              <div className="flex justify-between items-center mb-6 text-xs font-bold text-[var(--wm-terracotta)] tracking-widest">
                <span>{a.cat}</span>
                <span className="text-[var(--wm-charcoal)]/40">{a.read}</span>
              </div>
              <h3 className="text-3xl font-medium leading-[1.2] mb-8 group-hover:text-[var(--wm-terracotta)] transition-colors text-[var(--wm-charcoal)]">{a.title}</h3>
              <div className="w-10 h-10 rounded-full border border-[var(--wm-charcoal)]/20 flex items-center justify-center group-hover:border-[var(--wm-terracotta)] group-hover:bg-[var(--wm-terracotta)] group-hover:text-[var(--wm-white)] transition-all">
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

# 12. FinalCTA
files['FinalCTA.jsx'] = """'use client';
import { motion } from 'framer-motion';
import { projects } from '@/data/projects';

export default function FinalCTA() {
  return (
    <section className="relative py-40 bg-[var(--wm-forest)] text-[var(--wm-white)] px-6 md:px-12 overflow-hidden text-center min-h-screen flex items-center justify-center">
      
      {/* Abstract "W" 3D formation with actual screenshots */}
      <div className="absolute inset-0 pointer-events-none opacity-40 perspective-[1000px] flex items-center justify-center gap-2 md:gap-4">
        {projects.slice(0,5).map((p, i) => {
          // Define angles to form a W visually
          // W has 4 strokes, we'll use 5 staggered elements
          const rotateZ = [ -15, 15, -15, 15, -15 ][i];
          const yOffset = [ -50, 50, -50, 50, -50 ][i];
          const rotateY = [ 30, -30, 30, -30, 30 ][i];
          
          return (
            <motion.div 
              key={p.id}
              initial={{ opacity: 0, y: 150, rotateX: 90 }} 
              whileInView={{ opacity: 1, y: yOffset, rotateX: 0, rotateZ, rotateY }} 
              viewport={{ once: true, margin: "0px" }}
              transition={{ duration: 1.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="w-[12vw] h-[35vh] md:w-[10vw] md:h-[45vh] bg-[var(--wm-white)] border-2 border-[var(--wm-white)]/20 transform-gpu overflow-hidden shadow-2xl" 
            >
              <img src={p.image} className="w-full h-full object-cover grayscale opacity-60" alt="" />
            </motion.div>
          );
        })}
      </div>

      <div className="relative z-10 max-w-4xl mx-auto mix-blend-plus-lighter">
        <h2 className="text-5xl md:text-7xl lg:text-[5.5rem] font-medium tracking-tight leading-[1.05] mb-8 text-[var(--wm-cream)]">
          Your next website should do more than look good.
        </h2>
        <p className="text-xl text-[var(--wm-cream)]/80 max-w-2xl mx-auto mb-12 leading-relaxed">
          Let's build a digital experience that makes your business easier to understand, easier to trust, and easier to choose.
        </p>
        <a href="/book" className="inline-block bg-[var(--wm-terracotta)] text-[var(--wm-white)] px-10 py-5 text-sm font-medium hover:bg-[#b0673d] transition-colors">
          Start a Project &rarr;
        </a>
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
    <footer className="bg-[var(--wm-forest)] text-[var(--wm-white)] px-6 md:px-12 py-16">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12 mb-20">
        <div>
          <div className="font-bold text-3xl tracking-tight mb-8">WELLMADE</div>
          <a href="/book" className="inline-flex items-center gap-2 text-[var(--wm-terracotta)] font-bold hover:text-[var(--wm-cream)] transition-colors text-lg">
            Start a Project &rarr;
          </a>
        </div>
        
        <div className="flex gap-16 md:gap-32">
          <div className="flex flex-col gap-4 text-sm font-medium">
            <Link href="#work" className="hover:text-[var(--wm-terracotta)] transition-colors">Work</Link>
            <Link href="#services" className="hover:text-[var(--wm-terracotta)] transition-colors">Services</Link>
            <Link href="#process" className="hover:text-[var(--wm-terracotta)] transition-colors">Process</Link>
            <Link href="#about" className="hover:text-[var(--wm-terracotta)] transition-colors">About</Link>
            <Link href="#insights" className="hover:text-[var(--wm-terracotta)] transition-colors">Insights</Link>
          </div>
          <div className="flex flex-col gap-4 text-sm font-medium text-[var(--wm-white)]/60">
            <a href="#" className="hover:text-[var(--wm-white)] transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-[var(--wm-white)] transition-colors">Instagram</a>
            <a href="#" className="hover:text-[var(--wm-white)] transition-colors">X</a>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto border-t border-[var(--wm-white)]/10 pt-8 flex flex-col md:flex-row justify-between text-xs text-[var(--wm-white)]/40">
        <div>© 2026 Wellmade Digital. All rights reserved.</div>
        <div className="flex gap-6 mt-4 md:mt-0">
          <a href="#" className="hover:text-[var(--wm-white)] transition-colors">Privacy</a>
          <a href="#" className="hover:text-[var(--wm-white)] transition-colors">Terms</a>
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
import Philosophy from '@/components/home/Philosophy';
import Problem from '@/components/home/Problem';
import Approach from '@/components/home/Approach';
import Work from '@/components/home/Work';
import Services from '@/components/home/Services';
import Process from '@/components/home/Process';
import WhyWellmade from '@/components/home/WhyWellmade';
import Testimonial from '@/components/home/Testimonial';
import Insights from '@/components/home/Insights';
import FinalCTA from '@/components/home/FinalCTA';
import Footer from '@/components/home/Footer';

export const metadata = {
  title: 'Wellmade Digital | Crafted digital systems',
  description: 'We design and build strategic digital experiences.',
};

export default function Home() {
  return (
    <main className="w-full bg-[var(--wm-cream)] text-[var(--wm-charcoal)] antialiased font-sans selection:bg-[var(--wm-terracotta)] selection:text-[var(--wm-white)] relative overflow-x-hidden">
      <Navbar />
      <Hero />
      <Philosophy />
      <Problem />
      <Approach />
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
