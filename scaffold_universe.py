import os

COMPONENTS_DIR = r"C:\Users\AYOUB\Desktop\webgobuilder\components\home"
THREE_DIR = os.path.join(COMPONENTS_DIR, "3d")
os.makedirs(COMPONENTS_DIR, exist_ok=True)
os.makedirs(THREE_DIR, exist_ok=True)

files = {}

# ==========================================
# 3D COMPONENTS
# ==========================================

files['3d/Hero3D.jsx'] = """'use client';
import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Image, Float, Sparkles, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { projects } from '@/data/projects';

export default function Hero3D({ scrollProgress }) {
  const groupRef = useRef();
  const { mouse, viewport } = useThree();

  // Create an abstract fragmented sphere arrangement for the 6 screenshots
  const panels = useMemo(() => {
    return projects.slice(0, 6).map((p, i) => {
      const phi = Math.acos(-1 + (2 * i) / 6);
      const theta = Math.sqrt(6 * Math.PI) * phi;
      const r = 2.5;
      const x = r * Math.cos(theta) * Math.sin(phi);
      const y = r * Math.sin(theta) * Math.sin(phi);
      const z = r * Math.cos(phi);
      return { ...p, position: [x, y, z], id: p.id };
    });
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    // Rotation based on time and scroll
    groupRef.current.rotation.y += delta * 0.1;
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, scrollProgress * Math.PI, 0.05);
    
    // Parallax based on mouse
    const targetX = (mouse.x * viewport.width) / 10;
    const targetY = (mouse.y * viewport.height) / 10;
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.05);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.05);
    
    // Explode effect on scroll
    groupRef.current.children.forEach((child, i) => {
      if (child.isMesh) return; // skip sparkles
      const targetScale = 1 + scrollProgress * 0.5;
      const targetPos = new THREE.Vector3(...panels[i].position).multiplyScalar(1 + scrollProgress * 2);
      child.scale.lerp(new THREE.Vector3(targetScale, targetScale, 1), 0.05);
      child.position.lerp(targetPos, 0.05);
      child.lookAt(0, 0, 0); // Always face away from center
    });
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={45} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} color="#C2496B" intensity={2} />
      <pointLight position={[-10, -10, -10]} color="#C8A464" intensity={1} />
      
      <group ref={groupRef}>
        {panels.map((p, i) => (
          <Float key={p.id} speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
            <Image 
              url={p.image} 
              transparent 
              opacity={0.9}
              toneMapped={false}
              position={p.position}
            />
          </Float>
        ))}
        {/* Raspberry digital dust */}
        <Sparkles count={200} scale={10} size={1} speed={0.4} opacity={0.3} color="#C2496B" />
        <Sparkles count={100} scale={10} size={0.5} speed={0.2} opacity={0.2} color="#C8A464" />
      </group>
    </>
  );
}
"""

files['3d/Final3D.jsx'] = """'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Sparkles, Edges } from '@react-three/drei';
import * as THREE from 'three';

export default function Final3D() {
  const meshRef = useRef();

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.2;
      meshRef.current.rotation.y += delta * 0.3;
      
      // Pulse scale
      const s = 1 + Math.sin(state.clock.elapsedTime) * 0.1;
      meshRef.current.scale.set(s, s, s);
    }
  });

  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 5, 5]} intensity={1} color="#C2496B" />
      <pointLight position={[-5, -5, -5]} intensity={0.5} color="#C8A464" />
      
      <group>
        {/* The Raspberry Core */}
        <Sphere ref={meshRef} args={[1.5, 64, 64]}>
          <MeshDistortMaterial 
            color="#0E0E0F" 
            emissive="#C2496B"
            emissiveIntensity={0.5}
            distort={0.4} 
            speed={2} 
            roughness={0.2}
            metalness={0.8}
          />
        </Sphere>
        
        {/* Gold Orbital Lines */}
        <mesh rotation={[Math.PI/4, 0, 0]}>
          <torusGeometry args={[2.5, 0.01, 16, 100]} />
          <meshBasicMaterial color="#C8A464" opacity={0.5} transparent />
        </mesh>
        <mesh rotation={[-Math.PI/4, Math.PI/4, 0]}>
          <torusGeometry args={[3, 0.01, 16, 100]} />
          <meshBasicMaterial color="#C8A464" opacity={0.3} transparent />
        </mesh>

        {/* Dense inner particles */}
        <Sparkles count={300} scale={3} size={1} speed={1} color="#C2496B" opacity={0.8} />
      </group>
    </>
  );
}
"""

# ==========================================
# UI COMPONENTS
# ==========================================

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
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 flex items-center justify-between px-6 md:px-12 ${
        scrolled ? 'py-4 bg-[#0E0E0F]/80 backdrop-blur-xl border-b border-[#F7F5F0]/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)]' : 'py-8 bg-transparent border-transparent'
      }`}
    >
      <Link href="/" className="font-bold text-lg tracking-widest text-[#F7F5F0]">
        WELLMADE
      </Link>
      
      <div className="hidden md:flex items-center gap-10 text-[10px] tracking-widest uppercase font-bold text-[#F7F5F0]/70">
        <Link href="#work" className="hover:text-[#F7F5F0] transition-colors duration-300">Work</Link>
        <Link href="#services" className="hover:text-[#F7F5F0] transition-colors duration-300">Services</Link>
        <Link href="#process" className="hover:text-[#F7F5F0] transition-colors duration-300">Process</Link>
        <Link href="#about" className="hover:text-[#F7F5F0] transition-colors duration-300">About</Link>
        <Link href="#insights" className="hover:text-[#F7F5F0] transition-colors duration-300">Insights</Link>
      </div>

      <Link href="/book" className="text-[10px] uppercase tracking-widest font-bold text-[#C2496B] hover:text-[#F7F5F0] transition-colors duration-300">
        Start a Project &rarr;
      </Link>
    </motion.nav>
  );
}
"""

files['Hero.jsx'] = """'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import Hero3D from './3d/Hero3D';

export default function Hero() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const progress = Math.min(window.scrollY / window.innerHeight, 1);
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="relative min-h-[150vh] bg-[#0E0E0F] overflow-hidden">
      {/* 3D WebGL Canvas */}
      <div className="sticky top-0 h-screen w-full">
        <div className="absolute inset-0 z-0">
          <Canvas dpr={[1, 2]}>
            <Hero3D scrollProgress={scrollProgress} />
          </Canvas>
        </div>

        {/* Typography Overlay */}
        <motion.div 
          style={{ opacity: 1 - scrollProgress * 2 }}
          className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6 pointer-events-none mt-10"
        >
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.5 }}
            className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#F7F5F0]/50 mb-8"
          >
            WELLMADE DIGITAL / CREATIVE STUDIO
          </motion.div>
          
          <div className="overflow-hidden mb-8">
            <motion.h1 
              initial={{ y: "100%" }} animate={{ y: 0 }} transition={{ duration: 1.2, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl md:text-7xl lg:text-[7rem] font-medium tracking-tighter text-[#F7F5F0] leading-[1.05]"
            >
              Digital experiences,<br className="hidden md:block"/> made to move.
            </motion.h1>
          </div>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg md:text-xl text-[#F7F5F0]/70 max-w-2xl mx-auto mb-16 leading-relaxed font-light"
          >
            We design and build strategic digital experiences for ambitious businesses that want to be understood, remembered, and chosen.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-8 pointer-events-auto"
          >
            <a href="/book" className="text-xs uppercase tracking-widest font-bold text-[#C2496B] hover:text-[#F7F5F0] transition-colors border-b border-[#C2496B]/30 pb-2">
              Start a Project &rarr;
            </a>
            <a href="#work" className="text-xs uppercase tracking-widest font-medium text-[#F7F5F0]/60 hover:text-[#C8A464] transition-colors">
              Explore Our Work
            </a>
          </motion.div>
        </motion.div>
        
        {/* Gradient mask */}
        <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-[#0E0E0F] to-transparent z-20 pointer-events-none" />
      </div>
    </section>
  );
}
"""

files['Work.jsx'] = """'use client';
import { motion } from 'framer-motion';
import { projects } from '@/data/projects';

export default function Work() {
  return (
    <section id="work" className="py-40 bg-[#F7F5F0] text-[#0E0E0F] px-6 md:px-12 relative z-30">
      <div className="max-w-7xl mx-auto">
        <div className="mb-24 text-center md:text-left">
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-medium tracking-tighter leading-[1.05] mb-6">Selected work.</h2>
          <p className="text-xl md:text-2xl text-[#0E0E0F]/70 max-w-2xl">
            Digital experiences built around real business objectives.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-16">
          {projects.map((p, i) => {
            let colSpan = "md:col-span-6";
            let aspect = "aspect-[4/3]";
            
            if (i === 0) { colSpan = "md:col-span-12"; aspect = "aspect-[16/9]"; } 
            else if (i === 1) { colSpan = "md:col-span-7"; aspect = "aspect-[4/3]"; } 
            else if (i === 2) { colSpan = "md:col-span-5"; aspect = "aspect-[3/4]"; } 
            else if (i === 5) { colSpan = "md:col-span-12"; aspect = "aspect-[21/9]"; }
            
            return (
              <motion.div 
                key={p.id} 
                initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className={`${colSpan} group cursor-pointer mb-12 flex flex-col`}
              >
                <div className={`relative ${aspect} overflow-hidden bg-[#0E0E0F] mb-6`}>
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform duration-1000 ease-[0.16,1,0.3,1] group-hover:scale-105" />
                  <div className="absolute inset-0 bg-[#C2496B]/0 group-hover:bg-[#C2496B]/10 transition-colors duration-700 mix-blend-overlay" />
                </div>
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mt-4 border-t border-[#0E0E0F]/10 pt-6">
                  <div>
                    <h3 className="text-3xl font-medium tracking-tight mb-2 text-[#0E0E0F]">{p.name}</h3>
                    <div className="text-[10px] font-bold text-[#0E0E0F]/50 uppercase tracking-widest mb-4">{p.industry}</div>
                    <p className="text-sm text-[#0E0E0F]/70 max-w-md">{p.description}</p>
                  </div>
                  <div className="mt-6 md:mt-0 text-xs font-bold uppercase tracking-widest text-[#C2496B] group-hover:text-[#0E0E0F] transition-colors duration-300">
                    View Case Study &rarr;
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
"""

files['Manifesto.jsx'] = """'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export default function Manifesto() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start end", "end start"] });
  
  const y1 = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [150, -150]);
  const y3 = useTransform(scrollYProgress, [0, 1], [200, -200]);

  return (
    <section ref={containerRef} className="py-40 bg-[#0E0E0F] px-6 md:px-12 flex flex-col items-center justify-center min-h-[100vh] overflow-hidden">
      <div className="max-w-7xl mx-auto text-center w-full">
        <motion.h2 
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1.5 }}
          className="text-5xl md:text-7xl lg:text-[8rem] font-medium tracking-tighter text-[#F7F5F0] leading-[1.05] mb-32"
        >
          Design should create <br/><span className="italic font-serif text-[#F7F5F0]">movement.</span>
        </motion.h2>

        <div className="flex flex-col md:flex-row justify-center gap-12 md:gap-24 items-center">
          <motion.div style={{ y: y1 }} className="text-2xl md:text-4xl font-medium tracking-tight text-[#F7F5F0]/40">
            Movement in <span className="text-[#F7F5F0]">perception.</span>
          </motion.div>
          <motion.div style={{ y: y2 }} className="text-2xl md:text-4xl font-medium tracking-tight text-[#F7F5F0]/40">
            Movement in <span className="text-[#F7F5F0]">attention.</span>
          </motion.div>
          <motion.div style={{ y: y3 }} className="text-2xl md:text-4xl font-medium tracking-tight text-[#C2496B]">
            Movement in action.
          </motion.div>
        </div>
      </div>
    </section>
  );
}
"""

files['Strategy.jsx'] = """'use client';
import { motion } from 'framer-motion';

export default function Strategy() {
  return (
    <section className="py-40 bg-[#0E0E0F] text-[#F7F5F0] px-6 md:px-12 relative overflow-hidden border-t border-[#F7F5F0]/10">
      
      {/* Fake Generative 3D Field (CSS representation of particles/lines organizing) */}
      <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
        <div className="absolute w-[200%] h-[200%] top-[-50%] left-[-50%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#C2496B]/20 via-[#0E0E0F]/0 to-transparent animate-pulse" style={{ animationDuration: '8s' }}/>
        <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#C8A464" strokeWidth="0.5" strokeOpacity="0.2"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" className="animate-[spin_60s_linear_infinite] origin-center scale-150" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <h2 className="text-5xl md:text-7xl lg:text-8xl font-medium tracking-tighter leading-[1.05] mb-24 max-w-5xl">
          Before we design, we <span className="text-[#C2496B]">understand.</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8 border-t border-[#F7F5F0]/10 pt-16">
          {[
            { title: 'POSITION', q: 'Where should your brand live?' },
            { title: 'MESSAGE', q: 'Why should someone care?' },
            { title: 'EXPERIENCE', q: 'What should they do next?' }
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: i * 0.2 }}>
              <h3 className="text-3xl md:text-4xl font-medium tracking-tight mb-4 text-[#F7F5F0]">{item.title}</h3>
              <p className="text-xl text-[#F7F5F0]/50 font-serif italic">{item.q}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
"""

files['Services.jsx'] = """'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const services = [
  { title: 'STRATEGY', items: ['Positioning', 'Messaging', 'Customer journeys', 'Information architecture'] },
  { title: 'DESIGN', items: ['UX/UI', 'Art direction', 'Visual systems', 'Interaction'] },
  { title: 'DEVELOPMENT', items: ['Web development', 'CMS', 'Integrations', 'Performance'] },
  { title: 'GROWTH', items: ['Conversion optimization', 'Analytics', 'Landing pages', 'Continuous improvement'] }
];

export default function Services() {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <section id="services" className="relative py-40 bg-[#F7F5F0] text-[#0E0E0F] px-6 md:px-12 min-h-[100vh] flex items-center">
      
      {/* Abstract 3D Geometry representations via CSS for performance */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30 overflow-hidden perspective-[1000px]">
        <AnimatePresence mode="wait">
          {hoveredIndex === 0 && (
            <motion.div key="0" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="w-[40vw] h-[40vw] rounded-full border border-[#0E0E0F]/20 border-dashed animate-[spin_20s_linear_infinite]" />
          )}
          {hoveredIndex === 1 && (
            <motion.div key="1" initial={{ opacity: 0, rotateX: 90 }} animate={{ opacity: 1, rotateX: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="w-[50vw] h-[20vw] bg-gradient-to-r from-[#C2496B]/10 to-transparent blur-3xl transform-gpu" />
          )}
          {hoveredIndex === 2 && (
            <motion.div key="2" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="w-[30vw] h-[30vw] border-4 border-[#0E0E0F] transform-gpu rotate-45" />
          )}
          {hoveredIndex === 3 && (
            <motion.div key="3" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1.2 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="w-[40vw] h-[40vw] bg-[radial-gradient(circle,_#C2496B_0%,_transparent_70%)] opacity-20" />
          )}
        </AnimatePresence>
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="mb-24">
          <h2 className="text-5xl md:text-7xl font-medium tracking-tighter leading-[1.1]">What we make.</h2>
        </div>
        
        <div className="flex flex-col border-t border-[#0E0E0F]/10">
          {services.map((s, i) => (
            <div 
              key={i} 
              className="group border-b border-[#0E0E0F]/10 py-12 flex flex-col md:flex-row justify-between items-start md:items-center cursor-pointer relative overflow-hidden"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <h3 className="text-6xl md:text-8xl lg:text-[8rem] font-medium tracking-tighter text-[#0E0E0F]/20 group-hover:text-[#0E0E0F] transition-all duration-700 relative z-10">
                {s.title}
                <motion.div 
                  className="absolute bottom-4 left-0 h-2 bg-[#C2496B]"
                  initial={{ width: 0 }}
                  animate={{ width: hoveredIndex === i ? '100%' : 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </h3>
              
              <div className={`mt-8 md:mt-0 transition-all duration-700 transform ${hoveredIndex === i ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
                <ul className="text-right">
                  {s.items.map((item, idx) => (
                    <li key={idx} className="text-[#0E0E0F]/70 text-sm tracking-widest uppercase font-bold mb-2">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
"""

files['Process.jsx'] = """'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

const steps = [
  { num: '01', title: 'DISCOVER', desc: 'Understand the business.' },
  { num: '02', title: 'STRATEGIZE', desc: 'Define the opportunity.' },
  { num: '03', title: 'DESIGN', desc: 'Create the experience.' },
  { num: '04', title: 'BUILD', desc: 'Bring the system to life.' },
  { num: '05', title: 'LAUNCH', desc: 'Test, refine and deploy.' },
];

export default function Process() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start center", "end center"] });
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section id="process" ref={ref} className="py-40 bg-[#0E0E0F] text-[#F7F5F0] px-6 md:px-12 relative overflow-hidden min-h-[150vh]">
      
      <div className="max-w-5xl mx-auto relative z-10 pt-20">
        <h2 className="text-5xl md:text-7xl lg:text-[6rem] font-medium tracking-tighter leading-[1.05] mb-32 max-w-4xl text-center md:text-left">
          From first thought to finished experience.
        </h2>

        <div className="relative pl-8 md:pl-[30%]">
          {/* Energy line */}
          <div className="absolute left-[3px] top-0 bottom-0 w-[1px] bg-[#F7F5F0]/10" />
          <motion.div 
            style={{ scaleY, originY: 0 }}
            className="absolute left-[2px] top-0 bottom-0 w-[3px] bg-[#C2496B] z-0 shadow-[0_0_15px_#C2496B]" 
          />

          <div className="space-y-32 relative z-10 pb-40">
            {steps.map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-20%" }} transition={{ duration: 0.8 }}
                className="relative pl-12"
              >
                <div className="absolute left-[-4.5px] top-2 w-3 h-3 rounded-full bg-[#0E0E0F] border-2 border-[#C2496B]" />
                <div className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#C8A464] mb-4">{step.num}</div>
                <h3 className="text-4xl md:text-5xl font-medium tracking-tighter mb-4 text-[#F7F5F0]">{step.title}</h3>
                <p className="text-xl text-[#F7F5F0]/50">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
"""

files['WhyWellmade.jsx'] = """'use client';
import { motion } from 'framer-motion';

const details = ['Typography.', 'Spacing.', 'Motion.', 'Performance.', 'Clarity.'];

export default function WhyWellmade() {
  return (
    <section className="py-40 bg-[#F7F5F0] text-[#0E0E0F] px-6 md:px-12 min-h-screen flex items-center justify-center">
      <div className="max-w-6xl mx-auto w-full">
        <motion.h2 
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1.5 }}
          className="text-5xl md:text-7xl lg:text-[7rem] font-medium tracking-tighter leading-[1.05] mb-24 max-w-5xl"
        >
          We care about the details most people never notice.
        </motion.h2>
        
        <div className="flex flex-col gap-6 pl-2 md:pl-8">
          {details.map((d, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: i * 0.2 }}
              className="flex items-center gap-6"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#C2496B]" />
              <div className="text-2xl md:text-4xl font-medium tracking-tight text-[#0E0E0F]/70">{d}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
"""

files['ClientExperience.jsx'] = """'use client';
export default function ClientExperience() {
  return (
    <section className="relative py-40 bg-[#0E0E0F] text-[#F7F5F0] px-6 md:px-12 min-h-[80vh] flex items-center justify-center overflow-hidden">
      
      {/* Animated Raspberry noise/gradient */}
      <div className="absolute inset-0 pointer-events-none opacity-20 mix-blend-screen bg-[radial-gradient(circle_at_50%_50%,_#C2496B_0%,_transparent_60%)] animate-pulse" style={{ animationDuration: '6s' }} />

      <div className="max-w-5xl mx-auto relative z-10 text-center">
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-serif italic font-medium leading-[1.2] mb-16 tracking-tight">
          "Wellmade changed the way our business shows up online."
        </h2>
        <div>
          <div className="font-bold text-xl mb-2 uppercase tracking-widest text-[#F7F5F0]">Jane Doe</div>
          <div className="text-[#C8A464] text-xs uppercase tracking-[0.2em] font-medium">Founder — Company</div>
        </div>
      </div>
    </section>
  );
}
"""

files['Insights.jsx'] = """'use client';
const articles = [
  { title: "Why most business websites don't convert", read: '4 MIN READ' },
  { title: "The anatomy of a high-performing service website", read: '6 MIN READ' },
  { title: "What separates a €2,000 website from a €10,000 website", read: '5 MIN READ' },
];

export default function Insights() {
  return (
    <section id="insights" className="py-40 bg-[#F7F5F0] text-[#0E0E0F] px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-24">
          <h2 className="text-5xl md:text-7xl font-medium tracking-tighter leading-[1.1]">Thinking beyond the interface.</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 border-t border-[#0E0E0F]/10 pt-16">
          {articles.map((a, i) => (
            <a key={i} href="#" className="group block">
              <div className="mb-6 text-[10px] font-bold tracking-[0.2em] text-[#C2496B]">
                {a.read}
              </div>
              <h3 className="text-3xl lg:text-4xl font-medium leading-[1.2] tracking-tight mb-8 group-hover:text-[#0E0E0F]/60 transition-colors">{a.title}</h3>
              <div className="w-10 h-10 rounded-full border border-[#0E0E0F]/20 flex items-center justify-center group-hover:border-[#C2496B] group-hover:bg-[#C2496B] group-hover:text-[#F7F5F0] transition-all duration-300">
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

files['FinalCTA.jsx'] = """'use client';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import Final3D from './3d/Final3D';

export default function FinalCTA() {
  return (
    <section className="relative py-40 bg-[#0E0E0F] text-[#F7F5F0] px-6 md:px-12 overflow-hidden text-center min-h-[120vh] flex flex-col justify-center">
      
      {/* 3D WebGL Canvas */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <Canvas dpr={[1, 2]}>
          <Final3D />
        </Canvas>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto mix-blend-difference mt-[20vh] pointer-events-none">
        <motion.h2 
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1.5 }}
          className="text-6xl md:text-8xl lg:text-[9rem] font-medium tracking-tighter leading-[1.0] mb-12 text-[#F7F5F0]"
        >
          Let's make something unforgettable.
        </motion.h2>
        <p className="text-xl md:text-3xl text-[#F7F5F0]/70 max-w-3xl mx-auto mb-20 leading-relaxed font-light">
          Tell us where your business is today. We'll help you build where it's going next.
        </p>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.5 }} className="pointer-events-auto">
          <a href="/book" className="inline-block bg-[#C2496B] text-[#F7F5F0] px-12 py-6 text-sm uppercase tracking-widest font-bold hover:bg-[#a13b58] transition-colors">
            Start a Project &rarr;
          </a>
        </motion.div>
      </div>

      <div className="relative z-10 mt-auto pt-40 pb-10 text-center">
        <div className="text-4xl md:text-6xl font-bold tracking-widest text-[#F7F5F0] mb-4">WELLMADE</div>
        <div className="text-sm font-serif italic text-[#C8A464]">Digital experiences, made well.</div>
      </div>
    </section>
  );
}
"""

files['Footer.jsx'] = """'use client';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#0E0E0F] text-[#F7F5F0] px-6 md:px-12 py-16 border-t border-[#F7F5F0]/10 relative z-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12 mb-20">
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
import Strategy from '@/components/home/Strategy';
import Process from '@/components/home/Process';
import WhyWellmade from '@/components/home/WhyWellmade';
import ClientExperience from '@/components/home/ClientExperience';
import Insights from '@/components/home/Insights';
import FinalCTA from '@/components/home/FinalCTA';
import Footer from '@/components/home/Footer';

export const metadata = {
  title: 'Wellmade Digital | The Digital Universe',
  description: 'Extremely advanced digital studio website.',
};

export default function Home() {
  return (
    <main className="w-full bg-[#0E0E0F] text-[#F7F5F0] antialiased font-sans selection:bg-[#C2496B] selection:text-[#F7F5F0] relative overflow-x-hidden">
      <Navbar />
      <Hero />
      <Work />
      <Manifesto />
      <Strategy />
      <Services />
      <Process />
      <WhyWellmade />
      <ClientExperience />
      <Insights />
      <FinalCTA />
      <Footer />
    </main>
  );
}
"""

with open(r"C:\Users\AYOUB\Desktop\webgobuilder\app\page.jsx", 'w', encoding='utf-8') as f:
    f.write(page_code)
