import os

COMPONENTS_DIR = r"C:\Users\AYOUB\Desktop\webgobuilder\components\home"
THREE_DIR = os.path.join(COMPONENTS_DIR, "3d")
os.makedirs(COMPONENTS_DIR, exist_ok=True)
os.makedirs(THREE_DIR, exist_ok=True)

files = {}

# ==========================================
# 3D PROCEDURAL COMPONENTS
# ==========================================

files['3d/HeroCore.jsx'] = """'use client';
import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { MeshDistortMaterial, Sparkles, PerspectiveCamera, Trail } from '@react-three/drei';
import * as THREE from 'three';

export default function HeroCore({ scrollProgress }) {
  const groupRef = useRef();
  const innerCore = useRef();
  const { mouse, viewport } = useThree();

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    // Complex organic rotation
    groupRef.current.rotation.y += delta * 0.15;
    groupRef.current.rotation.x += delta * 0.1;
    groupRef.current.rotation.z += delta * 0.05;

    // Mouse parallax (Physical interaction)
    const targetX = (mouse.x * viewport.width) / 15;
    const targetY = (mouse.y * viewport.height) / 15;
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.05);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.05);

    // Scroll Transformation
    // Stage 1: Form (0) -> Stage 2: Structure (0.3) -> Stage 3: System (0.6) -> Dissolve (1)
    const scale = 1 + scrollProgress * 2;
    groupRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.05);
    
    if (innerCore.current) {
      innerCore.current.rotation.y -= delta * 0.3;
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={45} />
      <ambientLight intensity={0.1} />
      <directionalLight position={[5, 5, 5]} color="#C2496B" intensity={3} />
      <pointLight position={[-5, -5, -5]} color="#C8A464" intensity={1} />
      
      <group ref={groupRef}>
        {/* Inner Sculptural Core */}
        <mesh ref={innerCore}>
          <icosahedronGeometry args={[1.5, 2]} />
          <meshStandardMaterial color="#0E0E0F" roughness={0.1} metalness={0.9} flatShading />
        </mesh>

        {/* Middle Layer: Raspberry Translucent Geometry */}
        <mesh>
          <sphereGeometry args={[2.2, 32, 32]} />
          <MeshDistortMaterial 
            color="#C2496B" 
            emissive="#C2496B" 
            emissiveIntensity={0.2}
            transparent 
            opacity={0.15} 
            distort={0.3} 
            speed={2} 
            wireframe 
          />
        </mesh>

        {/* Outer Layer: Technical orbital lines */}
        <mesh rotation={[Math.PI/3, 0, 0]}>
          <torusGeometry args={[3.2, 0.005, 16, 100]} />
          <meshBasicMaterial color="#C8A464" transparent opacity={0.3} />
        </mesh>
        <mesh rotation={[-Math.PI/4, Math.PI/4, 0]}>
          <torusGeometry args={[3.5, 0.005, 16, 100]} />
          <meshBasicMaterial color="#C2496B" transparent opacity={0.4} />
        </mesh>

        {/* Orbital Particles */}
        <Sparkles count={400} scale={10} size={1.5} speed={0.4} color="#C2496B" opacity={0.6} />
        <Sparkles count={100} scale={8} size={1} speed={0.2} color="#C8A464" opacity={0.8} />
      </group>
    </>
  );
}
"""

files['3d/GenerativeField.jsx'] = """'use client';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function GenerativeField({ scrollProgress }) {
  const pointsRef = useRef();
  const count = 2000;

  // Generate chaotic (random sphere) and structural (grid) positions
  const { randomPos, gridPos } = useMemo(() => {
    const random = new Float32Array(count * 3);
    const grid = new Float32Array(count * 3);
    
    const size = Math.ceil(Math.pow(count, 1/3));
    const step = 0.5;
    let gridIdx = 0;

    for (let i = 0; i < count; i++) {
      // Chaos
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos((Math.random() * 2) - 1);
      const r = 5 + Math.random() * 5;
      random[i*3] = r * Math.sin(phi) * Math.cos(theta);
      random[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
      random[i*3+2] = r * Math.cos(phi);

      // Structure (Grid)
      if (gridIdx < count) {
        const x = (gridIdx % size) - size/2;
        const y = (Math.floor(gridIdx / size) % size) - size/2;
        const z = (Math.floor(gridIdx / (size * size))) - size/2;
        grid[i*3] = x * step;
        grid[i*3+1] = y * step;
        grid[i*3+2] = z * step;
        gridIdx++;
      }
    }
    return { randomPos: random, gridPos: grid };
  }, [count]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y += delta * 0.05;

    // Morph between chaos and structure based on scroll
    // Scroll progress maps 0 -> Chaos, 1 -> Structure
    const positions = pointsRef.current.geometry.attributes.position.array;
    for (let i = 0; i < count * 3; i++) {
      positions[i] = THREE.MathUtils.lerp(
        randomPos[i],
        gridPos[i],
        scrollProgress // Eased interpolation
      );
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={count}
            array={randomPos}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial 
          size={0.03} 
          color="#C2496B" 
          transparent 
          opacity={0.8}
          sizeAttenuation 
        />
      </points>
    </>
  );
}
"""

files['3d/SystemNodes.jsx'] = """'use client';
import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export default function SystemNodes({ scrollProgress }) {
  const groupRef = useRef();
  const linesRef = useRef();
  const { mouse } = useThree();
  const nodeCount = 50;

  const nodes = useMemo(() => {
    return Array.from({ length: nodeCount }).map(() => ({
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      ),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02
      )
    }));
  }, []);

  const lineGeometry = useMemo(() => new THREE.BufferGeometry(), []);

  useFrame(() => {
    if (!groupRef.current) return;
    
    groupRef.current.rotation.y += 0.002;
    groupRef.current.rotation.x += 0.001;

    // Update nodes
    const positions = new Float32Array(nodeCount * nodeCount * 3);
    let lineIdx = 0;

    nodes.forEach((node, i) => {
      // Basic movement
      node.position.add(node.velocity);
      if (node.position.length() > 6) node.velocity.multiplyScalar(-1);

      // Connect nodes if close enough and scroll progress is high
      nodes.forEach((otherNode, j) => {
        if (i < j) {
          const dist = node.position.distanceTo(otherNode.position);
          // Scroll progress tightens the connection threshold (forms the system)
          const threshold = 2 + (scrollProgress * 4); 
          if (dist < threshold) {
            positions[lineIdx++] = node.position.x;
            positions[lineIdx++] = node.position.y;
            positions[lineIdx++] = node.position.z;
            positions[lineIdx++] = otherNode.position.x;
            positions[lineIdx++] = otherNode.position.y;
            positions[lineIdx++] = otherNode.position.z;
          }
        }
      });
    });

    lineGeometry.setAttribute('position', new THREE.BufferAttribute(positions.slice(0, lineIdx), 3));
  });

  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={nodeCount}
            array={new Float32Array(nodes.flatMap(n => [n.position.x, n.position.y, n.position.z]))}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.1} color="#C2496B" />
      </points>
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial color="#C8A464" transparent opacity={0.15} />
      </lineSegments>
    </group>
  );
}
"""

files['3d/FinalAscent.jsx'] = """'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';

export default function FinalAscent({ scrollProgress }) {
  const groupRef = useRef();
  
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.2;
    
    // Collapse to a point based on scroll progress
    const scale = Math.max(0.001, 1 - scrollProgress);
    groupRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
  });

  return (
    <group ref={groupRef}>
      {/* Central energy point */}
      <mesh>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshBasicMaterial color="#C2496B" />
      </mesh>
      
      {/* Complex geometric wireframe */}
      <mesh>
        <icosahedronGeometry args={[3, 2]} />
        <meshBasicMaterial color="#C8A464" wireframe transparent opacity={0.2} />
      </mesh>

      <Sparkles count={500} scale={6} size={2} speed={1} color="#C2496B" />
    </group>
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
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 flex items-center justify-between px-6 md:px-12 ${
        scrolled ? 'py-4 bg-[#0E0E0F]/75 backdrop-blur-xl border-b border-[#F7F5F0]/10' : 'py-8 bg-transparent border-transparent'
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
import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import HeroCore from './3d/HeroCore';

export default function Hero() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      const progress = Math.min(window.scrollY / window.innerHeight, 1);
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="relative min-h-[150vh] bg-[#0E0E0F] overflow-hidden">
      <div className="sticky top-0 h-screen w-full">
        <div className="absolute inset-0 z-0">
          {mounted && (
            <Canvas dpr={[1, 2]} gl={{ antialias: true, alpha: false }}>
              <color attach="background" args={['#0E0E0F']} />
              <Suspense fallback={null}>
                <HeroCore scrollProgress={scrollProgress} />
              </Suspense>
            </Canvas>
          )}
        </div>

        <motion.div 
          style={{ opacity: 1 - scrollProgress * 3 }}
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
            We design and build strategic digital experiences that help ambitious businesses communicate their value, earn trust, and turn attention into action.
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
  const scale = useTransform(scrollYProgress, [0.3, 0.6], [1, 1.1]);

  return (
    <section ref={containerRef} className="py-40 bg-[#F7F5F0] px-6 md:px-12 flex flex-col items-center justify-center min-h-[100vh] overflow-hidden relative z-10">
      <div className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#0E0E0F]/40 mb-20">
        THE WELLMADE STANDARD
      </div>
      <div className="max-w-7xl mx-auto text-center w-full">
        <motion.h2 
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1.5 }}
          className="text-5xl md:text-7xl lg:text-[8rem] font-medium tracking-tighter text-[#0E0E0F] leading-[1.05] mb-32"
        >
          Good design gets attention.
        </motion.h2>

        <div className="flex flex-col justify-center gap-12 items-center">
          <motion.div style={{ y: y1 }} className="text-3xl md:text-5xl font-medium tracking-tight text-[#0E0E0F]/40">
            Great digital experiences create
          </motion.div>
          <motion.div style={{ y: y3, scale }} className="text-5xl md:text-8xl lg:text-[10rem] font-medium tracking-tighter text-[#C2496B]">
            movement.
          </motion.div>
        </div>
      </div>
    </section>
  );
}
"""

files['GenerativeSection.jsx'] = """'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { motion, useScroll } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import GenerativeField from './3d/GenerativeField';

export default function GenerativeSection() {
  const containerRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, 1 - (rect.bottom / (window.innerHeight + rect.height))));
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section ref={containerRef} className="relative h-[150vh] bg-[#0E0E0F] overflow-hidden">
      <div className="sticky top-0 h-screen w-full">
        <div className="absolute inset-0 z-0">
          {mounted && (
            <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 15], fov: 45 }}>
              <Suspense fallback={null}>
                <GenerativeField scrollProgress={scrollProgress} />
              </Suspense>
            </Canvas>
          )}
        </div>
        
        {/* Typographic Overlay */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
          <motion.h2 
            style={{ opacity: scrollProgress * 2 }}
            className="text-4xl md:text-6xl font-medium tracking-tighter text-[#F7F5F0] mb-4 uppercase tracking-[0.2em]"
          >
            Chaos &rarr; Structure
          </motion.h2>
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
    <section className="py-40 bg-[#F7F5F0] text-[#0E0E0F] px-6 md:px-12 relative overflow-hidden">
      
      {/* Animated Technical Diagram (CSS SVG) */}
      <div className="absolute inset-0 pointer-events-none opacity-10 flex items-center justify-center">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <motion.path 
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            transition={{ duration: 3, ease: "linear" }}
            d="M 100 100 L 500 200 L 300 600 L 800 400 Z" 
            fill="none" 
            stroke="#0E0E0F" 
            strokeWidth="2" 
          />
          <circle cx="100" cy="100" r="10" fill="#C2496B" />
          <circle cx="500" cy="200" r="5" fill="#C8A464" />
          <circle cx="300" cy="600" r="5" fill="#C8A464" />
          <circle cx="800" cy="400" r="5" fill="#C8A464" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <h2 className="text-5xl md:text-7xl lg:text-8xl font-medium tracking-tighter leading-[1.05] mb-32 max-w-5xl">
          Before we design, we <span className="text-[#C2496B]">understand.</span>
        </h2>

        <div className="flex flex-col gap-24 border-t border-[#0E0E0F]/10 pt-16">
          {[
            { title: 'POSITION', q: 'Where should your brand live?' },
            { title: 'MESSAGE', q: 'Why should someone care?' },
            { title: 'EXPERIENCE', q: 'What should someone do next?' }
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8, delay: i * 0.2 }}>
              <h3 className="text-6xl md:text-8xl font-medium tracking-tighter mb-6 text-[#0E0E0F]">{item.title}</h3>
              <p className="text-2xl md:text-4xl text-[#0E0E0F]/50 font-serif italic">{item.q}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
"""

files['SystemSection.jsx'] = """'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import SystemNodes from './3d/SystemNodes';

export default function SystemSection() {
  const containerRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, 1 - (rect.bottom / (window.innerHeight + rect.height))));
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section ref={containerRef} className="relative h-[150vh] bg-[#0E0E0F] overflow-hidden">
      <div className="sticky top-0 h-screen w-full">
        <div className="absolute inset-0 z-0">
          {mounted && (
            <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 15], fov: 45 }}>
              <Suspense fallback={null}>
                <SystemNodes scrollProgress={scrollProgress} />
              </Suspense>
            </Canvas>
          )}
        </div>
        
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
          <h2 className="text-2xl md:text-4xl font-medium tracking-[0.3em] text-[#F7F5F0] mb-4 uppercase">
            Components &rarr; System &rarr; Experience
          </h2>
        </div>
      </div>
    </section>
  );
}
"""

files['Services.jsx'] = """'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const services = ['STRATEGY', 'DESIGN', 'DEVELOPMENT', 'GROWTH'];

export default function Services() {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <section id="services" className="relative py-40 bg-[#0E0E0F] text-[#F7F5F0] px-6 md:px-12 min-h-[100vh] flex items-center">
      
      {/* Abstract CSS 3D Geometry representations for distinct motion languages */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-40 overflow-hidden perspective-[1000px]">
        <AnimatePresence mode="wait">
          {hoveredIndex === 0 && (
            <motion.div key="0" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="w-[40vw] h-[40vw] rounded-full border border-[#C2496B]/50 border-dashed animate-[spin_10s_linear_infinite]" />
          )}
          {hoveredIndex === 1 && (
            <motion.div key="1" initial={{ opacity: 0, rotateX: 90 }} animate={{ opacity: 1, rotateX: 0 }} exit={{ opacity: 0 }} className="w-[50vw] h-[20vw] bg-gradient-to-r from-[#C2496B]/20 to-transparent blur-3xl transform-gpu rotate-y-45 animate-pulse" />
          )}
          {hoveredIndex === 2 && (
            <motion.div key="2" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="w-[30vw] h-[30vw] border-2 border-[#C8A464] transform-gpu rotate-45" />
          )}
          {hoveredIndex === 3 && (
            <motion.div key="3" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1.5 }} exit={{ opacity: 0 }} className="w-[40vw] h-[40vw] bg-[radial-gradient(circle,_#C2496B_0%,_transparent_50%)] opacity-30" />
          )}
        </AnimatePresence>
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="flex flex-col gap-12">
          {services.map((s, i) => (
            <div 
              key={i} 
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <motion.h3 
                animate={{ color: hoveredIndex === i ? '#C2496B' : '#F7F5F0', x: hoveredIndex === i ? 20 : 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="text-6xl md:text-8xl lg:text-[9rem] font-medium tracking-tighter opacity-80 hover:opacity-100"
              >
                {s}
              </motion.h3>
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

const steps = ['DISCOVER', 'STRATEGIZE', 'DESIGN', 'BUILD', 'LAUNCH'];

export default function Process() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start center", "end center"] });
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section id="process" ref={ref} className="py-40 bg-[#F7F5F0] text-[#0E0E0F] px-6 md:px-12 relative overflow-hidden min-h-[200vh]">
      <div className="max-w-5xl mx-auto relative z-10 pt-20">
        <h2 className="text-5xl md:text-7xl lg:text-[7rem] font-medium tracking-tighter leading-[1.05] mb-40 max-w-4xl">
          From first thought to finished experience.
        </h2>

        <div className="relative pl-12 md:pl-[30%]">
          {/* Procedural line simulation */}
          <div className="absolute left-[3px] top-0 bottom-0 w-[2px] bg-[#0E0E0F]/10" />
          <motion.div 
            style={{ scaleY, originY: 0 }}
            className="absolute left-[3px] top-0 bottom-0 w-[2px] bg-[#C2496B] z-0" 
          />

          <div className="space-y-40 relative z-10 pb-40">
            {steps.map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-20%" }} transition={{ duration: 0.8 }}
                className="relative pl-12"
              >
                <div className="absolute left-[-5px] top-3 w-4 h-4 rounded-full bg-[#F7F5F0] border-2 border-[#C2496B]" />
                <div className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#C8A464] mb-4">0{i+1}</div>
                <h3 className="text-5xl md:text-6xl font-medium tracking-tighter text-[#0E0E0F]">{step}</h3>
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
    <section className="py-40 bg-[#0E0E0F] text-[#F7F5F0] px-6 md:px-12 min-h-screen flex flex-col justify-center">
      <div className="max-w-6xl mx-auto w-full">
        <motion.h2 
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1.5 }}
          className="text-5xl md:text-7xl lg:text-[7rem] font-medium tracking-tighter leading-[1.05] mb-32 max-w-5xl"
        >
          We care about the details most people never notice.
        </motion.h2>
        
        <div className="flex flex-col gap-8 pl-4 md:pl-8">
          {details.map((d, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: i * 0.2 }}
              className="flex items-center gap-6"
            >
              <div className="w-2 h-2 rounded-full bg-[#C2496B] shadow-[0_0_10px_#C2496B]" />
              <div className="text-3xl md:text-5xl font-medium tracking-tight text-[#F7F5F0]/80">{d}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
"""

files['Philosophy.jsx'] = """'use client';
import { motion } from 'framer-motion';

export default function Philosophy() {
  return (
    <section className="relative py-40 bg-[#0E0E0F] text-[#F7F5F0] px-6 md:px-12 min-h-screen flex items-center justify-center overflow-hidden">
      
      {/* Animated perspective grid */}
      <div className="absolute inset-0 pointer-events-none perspective-[1000px] flex items-center justify-center opacity-20">
        <div className="w-[200vw] h-[200vh] border border-[#F7F5F0]/10 transform-gpu rotate-x-60 translate-y-40">
           <div className="absolute inset-0 bg-[linear-gradient(to_right,#F7F5F0_1px,transparent_1px),linear-gradient(to_bottom,#F7F5F0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />
           {/* Occasional raspberry laser line */}
           <motion.div 
             animate={{ x: ['-100vw', '100vw'] }}
             transition={{ duration: 8, ease: "linear", repeat: Infinity, repeatDelay: 5 }}
             className="absolute top-1/2 w-4 h-40 bg-[#C2496B] blur-md"
           />
        </div>
      </div>

      <div className="max-w-5xl mx-auto relative z-10 text-center">
        <h2 className="text-5xl md:text-8xl lg:text-[9rem] font-medium tracking-tighter leading-[1.0] text-[#F7F5F0]">
          Less noise. <br/>
          <span className="text-[#C2496B]">More intention.</span>
        </h2>
      </div>
    </section>
  );
}
"""

files['Insights.jsx'] = """'use client';
const articles = [
  { cat: 'DESIGN', title: "Why most business websites don't convert", read: '4 MIN READ' },
  { cat: 'STRATEGY', title: "The anatomy of a high-performing service website", read: '6 MIN READ' },
  { cat: 'BUSINESS', title: "What separates a €2,000 website from a €10,000 website", read: '5 MIN READ' },
];

export default function Insights() {
  return (
    <section id="insights" className="py-40 bg-[#F7F5F0] text-[#0E0E0F] px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-24">
          <h2 className="text-6xl md:text-8xl font-medium tracking-tighter leading-[1.1]">Thinking beyond the interface.</h2>
        </div>
        
        <div className="flex flex-col border-t border-[#0E0E0F]/10">
          {articles.map((a, i) => (
            <a key={i} href="#" className="group border-b border-[#0E0E0F]/10 py-12 flex flex-col md:flex-row justify-between items-start md:items-center relative overflow-hidden transition-transform hover:translate-x-4">
              <div className="flex items-center gap-12 relative z-10 w-full">
                <div className="text-4xl md:text-6xl font-serif italic text-[#0E0E0F]/20 font-light">0{i+1}</div>
                <div className="flex-1">
                  <div className="text-[10px] font-bold tracking-[0.2em] text-[#C2496B] mb-2">{a.cat}</div>
                  <h3 className="text-3xl md:text-5xl font-medium tracking-tight text-[#0E0E0F] group-hover:text-[#C2496B] transition-colors">{a.title}</h3>
                </div>
                <div className="hidden md:flex flex-col items-end">
                  <div className="text-[10px] font-bold tracking-[0.2em] text-[#0E0E0F]/50 mb-4">{a.read}</div>
                  <div className="w-12 h-12 rounded-full border border-[#0E0E0F]/20 flex items-center justify-center group-hover:border-[#C2496B] group-hover:bg-[#C2496B] group-hover:text-[#F7F5F0] transition-all duration-300">
                    &rarr;
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 h-1 bg-[#C2496B] w-0 group-hover:w-full transition-all duration-700 ease-out" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
"""

files['FinalCTA.jsx'] = """'use client';
import { useState, useEffect, Suspense } from 'react';
import { motion, useScroll } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import FinalAscent from './3d/FinalAscent';

export default function FinalCTA() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      const progress = Math.min(window.scrollY / window.innerHeight, 1);
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="relative h-[150vh] bg-[#0E0E0F] text-[#F7F5F0] overflow-hidden text-center flex flex-col justify-center">
      
      {/* 3D WebGL Canvas */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          {mounted && (
            <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 10], fov: 45 }}>
              <Suspense fallback={null}>
                <FinalAscent scrollProgress={scrollProgress} />
              </Suspense>
            </Canvas>
          )}
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 pointer-events-none w-full mix-blend-difference">
          <motion.h2 
            style={{ opacity: 1 - scrollProgress * 1.5 }}
            className="text-6xl md:text-8xl lg:text-[9rem] font-medium tracking-tighter leading-[1.0] mb-12 text-[#F7F5F0]"
          >
            Let's make something unforgettable.
          </motion.h2>
          
          <motion.div style={{ opacity: 1 - scrollProgress * 1.5 }} className="pointer-events-auto">
            <a href="/book" className="inline-block bg-[#C2496B] text-[#F7F5F0] px-12 py-6 text-sm uppercase tracking-widest font-bold hover:bg-[#a13b58] transition-colors">
              Start a Project &rarr;
            </a>
          </motion.div>
        </div>
        
        {/* Final Typographic Reveal based on extreme scroll */}
        <motion.div 
          style={{ opacity: scrollProgress > 0.8 ? (scrollProgress - 0.8) * 5 : 0 }}
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none bg-[#0E0E0F]"
        >
          <div className="text-5xl md:text-7xl font-bold tracking-widest text-[#F7F5F0] mb-4">WELLMADE</div>
          <div className="text-xl font-serif italic text-[#C8A464]">Digital experiences, made well.</div>
        </motion.div>
      </div>
    </section>
  );
}
"""

files['Footer.jsx'] = """'use client';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#0E0E0F] text-[#F7F5F0] px-6 md:px-12 py-16 relative z-20">
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
import GenerativeSection from '@/components/home/GenerativeSection';
import Strategy from '@/components/home/Strategy';
import SystemSection from '@/components/home/SystemSection';
import Services from '@/components/home/Services';
import Process from '@/components/home/Process';
import WhyWellmade from '@/components/home/WhyWellmade';
import Philosophy from '@/components/home/Philosophy';
import Insights from '@/components/home/Insights';
import FinalCTA from '@/components/home/FinalCTA';
import Footer from '@/components/home/Footer';

export const metadata = {
  title: 'Wellmade Digital | Generative Experience',
  description: 'Digital experiences, made well.',
};

export default function Home() {
  return (
    <main className="w-full bg-[#0E0E0F] text-[#F7F5F0] antialiased font-sans selection:bg-[#C2496B] selection:text-[#F7F5F0] relative overflow-x-hidden">
      <Navbar />
      <Hero />
      <Manifesto />
      <GenerativeSection />
      <Strategy />
      <SystemSection />
      <Services />
      <Process />
      <WhyWellmade />
      <Philosophy />
      <Insights />
      <FinalCTA />
      <Footer />
    </main>
  );
}
"""

with open(r"C:\Users\AYOUB\Desktop\webgobuilder\app\page.jsx", 'w', encoding='utf-8') as f:
    f.write(page_code)
