import os

DIR = r"C:\Users\AYOUB\Desktop\webgobuilder\components\home"
THREE_DIR = os.path.join(DIR, "3d")
os.makedirs(DIR, exist_ok=True)
os.makedirs(THREE_DIR, exist_ok=True)

files = {}

# =================================================================
# 3D COMPONENTS (THE SCULPTURE)
# =================================================================

files['3d/Hero3D.jsx'] = """'use client';
import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { MeshTransmissionMaterial, Sparkles, Float } from '@react-three/drei';
import * as THREE from 'three';

export default function Hero3D() {
  const groupRef = useRef();
  const innerRef = useRef();
  const { mouse, viewport } = useThree();

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    // Breathing, slow rotation
    groupRef.current.rotation.y += delta * 0.05;
    groupRef.current.rotation.x += delta * 0.02;
    
    if (innerRef.current) {
      innerRef.current.rotation.y -= delta * 0.08;
      innerRef.current.rotation.z += delta * 0.03;
    }

    // Subtle cursor physics (Inertia)
    const targetX = (mouse.x * viewport.width) * 0.05;
    const targetY = (mouse.y * viewport.height) * 0.05;
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.02);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.02);
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={2} color="#C2496B" />
      <spotLight position={[-10, -10, 10]} intensity={1} color="#C8A464" />
      
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
        <group ref={groupRef} scale={1.5}>
          {/* Glass-like fluid outer architecture */}
          <mesh>
            <torusKnotGeometry args={[1.5, 0.4, 128, 64]} />
            <MeshTransmissionMaterial 
              color="#0E0E0F"
              transmission={0.9}
              thickness={1.5}
              roughness={0.1}
              ior={1.5}
              chromaticAberration={0.04}
              resolution={512}
            />
          </mesh>

          {/* Precision inner core (Raspberry & Gold lines) */}
          <mesh ref={innerRef}>
            <icosahedronGeometry args={[1.2, 1]} />
            <meshStandardMaterial color="#0E0E0F" wireframe />
          </mesh>
          
          <mesh rotation={[Math.PI/2, 0, 0]}>
            <torusGeometry args={[2.2, 0.005, 16, 100]} />
            <meshBasicMaterial color="#C8A464" transparent opacity={0.3} />
          </mesh>

          {/* Tiny subtle particles */}
          <Sparkles count={100} scale={5} size={1} speed={0.1} color="#C2496B" opacity={0.5} />
        </group>
      </Float>
    </>
  );
}
"""

files['3d/Problem3D.jsx'] = """'use client';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Problem3D({ scrollYProgress }) {
  const groupRef = useRef();
  
  // Create disconnected pieces of an icosahedron
  const pieces = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(2, 0);
    const pos = geo.attributes.position;
    const arr = [];
    for(let i=0; i<pos.count; i+=3) {
      arr.push({
        p1: new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i)),
        p2: new THREE.Vector3(pos.getX(i+1), pos.getY(i+1), pos.getZ(i+1)),
        p3: new THREE.Vector3(pos.getX(i+2), pos.getY(i+2), pos.getZ(i+2)),
        dir: new THREE.Vector3(
          (pos.getX(i) + pos.getX(i+1) + pos.getX(i+2))/3,
          (pos.getY(i) + pos.getY(i+1) + pos.getY(i+2))/3,
          (pos.getZ(i) + pos.getZ(i+1) + pos.getZ(i+2))/3
        ).normalize(),
        drift: Math.random() * 2
      });
    }
    return arr;
  }, []);

  useFrame(() => {
    if (!groupRef.current) return;
    const p = scrollYProgress.get ? scrollYProgress.get() : 0;
    
    // Slow rotation
    groupRef.current.rotation.y += 0.002;
    groupRef.current.rotation.x += 0.001;
    
    // Break apart based on scroll
    groupRef.current.children.forEach((mesh, i) => {
      const piece = pieces[i];
      const distance = p * piece.drift * 3; 
      mesh.position.copy(piece.dir).multiplyScalar(distance);
      mesh.rotation.x = distance * 0.5;
      mesh.rotation.y = distance * 0.3;
    });
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 5, 5]} color="#C2496B" intensity={1} />
      {pieces.map((piece, i) => {
        const geo = new THREE.BufferGeometry();
        const vertices = new Float32Array([
          piece.p1.x, piece.p1.y, piece.p1.z,
          piece.p2.x, piece.p2.y, piece.p2.z,
          piece.p3.x, piece.p3.y, piece.p3.z,
        ]);
        geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        geo.computeVertexNormals();
        return (
          <mesh key={i} geometry={geo}>
            <meshStandardMaterial color="#0E0E0F" metalness={0.8} roughness={0.2} side={THREE.DoubleSide} wireframe={i%3===0} />
          </mesh>
        );
      })}
    </group>
  );
}
"""

files['3d/Final3D.jsx'] = """'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Final3D() {
  const lineRef = useRef();
  
  // Abstract W curve
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-3, 2, 0),
    new THREE.Vector3(-1.5, -2, 0),
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(1.5, -2, 0),
    new THREE.Vector3(3, 2, 0)
  ]);

  useFrame((state) => {
    if(lineRef.current) {
      lineRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  return (
    <group ref={lineRef}>
      <ambientLight intensity={1} />
      <mesh>
        <tubeGeometry args={[curve, 64, 0.02, 8, false]} />
        <meshBasicMaterial color="#C2496B" />
      </mesh>
    </group>
  );
}
"""

# =================================================================
# DOM COMPONENTS
# =================================================================

files['Navbar.jsx'] = """'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-700 px-6 md:px-12 flex justify-between items-center ${scrolled ? 'py-6 bg-[#0E0E0F]/80 backdrop-blur-md border-b border-[#F7F5F0]/5' : 'py-10 bg-transparent'}`}>
      <Link href="/" className="font-bold tracking-widest text-[#F7F5F0] text-sm">
        WELLMADE
      </Link>
      
      <div className="hidden md:flex gap-10 text-[10px] uppercase tracking-widest font-bold text-[#F7F5F0]/60">
        <Link href="#work" className="hover:text-[#F7F5F0] transition-colors">Work</Link>
        <Link href="#services" className="hover:text-[#F7F5F0] transition-colors">Services</Link>
        <Link href="#process" className="hover:text-[#F7F5F0] transition-colors">Process</Link>
        <Link href="#insights" className="hover:text-[#F7F5F0] transition-colors">Insights</Link>
      </div>

      <Link href="/book" className="text-[10px] uppercase tracking-widest font-bold text-[#C2496B] flex items-center gap-2 group">
        <span>Start a Project</span>
        <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
      </Link>
    </nav>
  );
}
"""

files['Hero.jsx'] = """'use client';
import { useState, useEffect, Suspense, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import Hero3D from './3d/Hero3D';

export default function Hero() {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  
  const yText = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const opacityText = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale3D = useTransform(scrollYProgress, [0, 1], [1, 0.8]);
  const y3D = useTransform(scrollYProgress, [0, 1], [0, 200]);

  useEffect(() => setMounted(true), []);

  return (
    <section ref={containerRef} className="relative h-screen bg-[#0E0E0F] overflow-hidden flex flex-col items-center justify-center pt-20">
      
      {/* Editorial Text Composition (Upper Middle) */}
      <motion.div style={{ y: yText, opacity: opacityText }} className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 text-center flex flex-col items-center">
        <h1 className="text-5xl md:text-7xl lg:text-[7rem] font-medium tracking-tighter text-[#F7F5F0] leading-[1.05] mb-8">
          WE MAKE <br /> DIGITAL EXPERIENCES <br />
          <span className="text-[#C2496B]">MOVE.</span>
        </h1>
        <p className="text-lg md:text-xl text-[#F7F5F0]/60 max-w-2xl font-light mb-12">
          Strategy, design and technology for businesses that want to move forward.
        </p>
        <div className="flex items-center gap-8 text-xs font-bold uppercase tracking-widest">
          <a href="/book" className="text-[#C2496B] border-b border-[#C2496B]/30 pb-1 hover:border-[#C2496B] transition-colors">Start a Project &rarr;</a>
          <a href="#work" className="text-[#F7F5F0]/50 hover:text-[#F7F5F0] transition-colors">Explore Our Work</a>
        </div>
      </motion.div>

      {/* Kinetic Sculpture Background */}
      <motion.div style={{ scale: scale3D, y: y3D }} className="absolute inset-0 z-0 pointer-events-auto">
        {mounted && (
          <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 8], fov: 45 }}>
            <Suspense fallback={null}>
              <Hero3D />
            </Suspense>
          </Canvas>
        )}
      </motion.div>
    </section>
  );
}
"""

files['Philosophy.jsx'] = """'use client';
import { motion } from 'framer-motion';

export default function Philosophy() {
  return (
    <section className="py-40 bg-[#F7F5F0] text-[#0E0E0F] px-6 md:px-12 flex items-center justify-center min-h-[80vh] relative">
      <div className="max-w-5xl mx-auto text-center relative z-10">
        {/* Subtle Raspberry Detail */}
        <div className="w-[1px] h-20 bg-[#C2496B] mx-auto mb-16" />
        
        <motion.h2 
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1 }}
          className="text-5xl md:text-7xl lg:text-[8rem] font-medium tracking-tighter leading-[1.0] mb-12"
        >
          GOOD DIGITAL EXPERIENCES ARE NOT ACCIDENTAL.
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.3 }}
          className="text-2xl md:text-4xl text-[#0E0E0F]/50 font-light max-w-4xl mx-auto"
        >
          They are the result of clear thinking, strong design and intentional execution.
        </motion.p>
      </div>
    </section>
  );
}
"""

files['Problem.jsx'] = """'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { motion, useScroll } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import Problem3D from './3d/Problem3D';

export default function Problem() {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef();
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start end", "end start"] });

  useEffect(() => setMounted(true), []);

  return (
    <section ref={containerRef} className="relative py-40 bg-[#0E0E0F] text-[#F7F5F0] min-h-[120vh] px-6 md:px-12 overflow-hidden flex items-center">
      <div className="absolute right-0 top-0 w-full md:w-1/2 h-full z-0 pointer-events-none opacity-40 md:opacity-100">
        {mounted && (
          <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 8] }}>
            <Suspense fallback={null}>
              <Problem3D scrollYProgress={scrollYProgress} />
            </Suspense>
          </Canvas>
        )}
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-10 flex">
        <div className="w-full md:w-1/2">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 1 }}
            className="text-6xl md:text-[7rem] font-medium tracking-tighter leading-[1.0] mb-32"
          >
            MOST WEBSITES<br/> LOOK FINE.<br/>
            <span className="text-[#C2496B]">FEW ACTUALLY<br/> WORK.</span>
          </motion.h2>
          
          <div className="flex flex-col gap-12 border-t border-[#F7F5F0]/10 pt-12">
            {['NO CLEAR POSITIONING', 'TOO MUCH NOISE', 'NO CLEAR PATH TO ACTION'].map((prob, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i*0.2 }}>
                <h3 className="text-xl md:text-2xl font-bold tracking-widest text-[#F7F5F0]/80">0{i+1} / {prob}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
"""

files['Approach.jsx'] = """'use client';
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
"""

files['Work.jsx'] = """'use client';
import { projects } from '@/data/projects';
import Image from 'next/image';

// Uses real project screenshots. Rhythm: Large, Small, Large.
export default function Work() {
  const displayProjects = projects.slice(0, 4);

  return (
    <section id="work" className="py-40 bg-[#0E0E0F] text-[#F7F5F0] px-6 md:px-12 border-t border-[#F7F5F0]/5">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-24 border-b border-[#F7F5F0]/10 pb-8">
          <h2 className="text-5xl md:text-7xl font-medium tracking-tighter">SELECTED WORK</h2>
          <a href="/work" className="hidden md:block text-xs uppercase tracking-widest font-bold text-[#F7F5F0]/50 hover:text-[#C2496B] transition-colors">View All &rarr;</a>
        </div>

        <div className="flex flex-col gap-32">
          {displayProjects.map((p, i) => {
            const isLarge = i % 2 === 0;
            return (
              <div key={p.id} className={`flex flex-col ${isLarge ? 'md:flex-row' : 'md:flex-row-reverse'} gap-12 md:gap-24 group cursor-pointer`}>
                <div className={`w-full ${isLarge ? 'md:w-2/3' : 'md:w-1/2'} overflow-hidden bg-[#1A1A1B]`}>
                  <div className="relative w-full aspect-[4/3] transform transition-transform duration-700 group-hover:scale-105 origin-center">
                    <Image src={p.image} alt={p.name} fill className="object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                
                <div className={`w-full ${isLarge ? 'md:w-1/3' : 'md:w-1/2'} flex flex-col justify-center`}>
                  <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#C8A464] mb-6">{p.category}</div>
                  <h3 className="text-4xl md:text-5xl font-medium tracking-tighter mb-6 group-hover:text-[#C2496B] transition-colors">{p.name}</h3>
                  <p className="text-[#F7F5F0]/60 font-light mb-12 text-lg">{p.description}</p>
                  
                  <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-[#F7F5F0]">
                    <span className="w-0 h-[1px] bg-[#C2496B] group-hover:w-8 transition-all duration-300"></span>
                    <span className="group-hover:text-[#C2496B] transition-colors">View Case Study</span>
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

files['Services.jsx'] = """'use client';
export default function Services() {
  const services = ['STRATEGY', 'WEB DESIGN', 'DEVELOPMENT', 'DIGITAL EXPERIENCES', 'GROWTH'];
  
  return (
    <section id="services" className="py-40 bg-[#0E0E0F] text-[#F7F5F0] px-6 md:px-12 border-t border-[#F7F5F0]/5 relative min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto w-full relative z-10">
        <h2 className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#C8A464] mb-16">WHAT WE DO</h2>
        
        <div className="flex flex-col">
          {services.map((s, i) => (
            <div key={i} className="group py-10 md:py-16 border-b border-[#F7F5F0]/10 flex items-baseline gap-8 cursor-pointer relative overflow-hidden">
              <span className="text-sm md:text-lg font-serif italic text-[#F7F5F0]/30 group-hover:text-[#C2496B] transition-colors w-12">0{i+1}</span>
              <h3 className="text-5xl md:text-[6rem] lg:text-[7rem] font-medium tracking-tighter text-[#F7F5F0]/60 group-hover:text-[#F7F5F0] transition-colors duration-500 relative z-10">
                {s}
              </h3>
              {/* Subtle hover indicator */}
              <div className="absolute left-0 bottom-0 h-[1px] w-0 bg-[#C2496B] group-hover:w-full transition-all duration-700 ease-out" />
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

export default function Process() {
  const containerRef = useRef();
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start center", "end center"] });
  const width = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const steps = ['DISCOVER', 'DEFINE', 'DESIGN', 'BUILD', 'REFINE'];

  return (
    <section id="process" ref={containerRef} className="py-40 bg-[#F7F5F0] text-[#0E0E0F] px-6 md:px-12 min-h-[100vh] flex flex-col justify-center overflow-hidden">
      <div className="max-w-7xl mx-auto w-full">
        <h2 className="text-5xl md:text-[6rem] font-medium tracking-tighter leading-[1.0] mb-40 text-center">
          A SIMPLE PROCESS.<br/>
          A SERIOUS RESULT.
        </h2>

        <div className="relative pt-8">
          {/* Timeline background */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-[#0E0E0F]/10" />
          
          {/* Animated Timeline */}
          <motion.div style={{ width }} className="absolute top-0 left-0 h-[1px] bg-[#C2496B] z-10 origin-left" />

          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="relative pt-8">
                {/* Tick mark */}
                <div className="absolute top-[-4px] left-0 w-2 h-2 rounded-full bg-[#F7F5F0] border border-[#0E0E0F]/30" />
                <div className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#C8A464] mb-4">0{i+1}</div>
                <h3 className="text-xl md:text-2xl font-bold tracking-tight">{step}</h3>
              </div>
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

export default function WhyWellmade() {
  const words = ['CLARITY', 'CRAFT', 'PERFORMANCE', 'PURPOSE'];
  
  return (
    <section className="py-40 bg-[#0E0E0F] text-[#F7F5F0] px-6 md:px-12 min-h-screen flex items-center justify-center relative">
      <div className="max-w-5xl mx-auto w-full text-center">
        <div className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#C2496B] mb-20">WHY WELLMADE?</div>
        
        <div className="flex flex-col gap-8">
          {words.map((w, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-10%" }} transition={{ duration: 0.8, delay: i*0.1 }}>
              <h2 className="text-6xl md:text-[9rem] font-medium tracking-tighter text-[#F7F5F0]/80 hover:text-[#C8A464] transition-colors cursor-default">
                {w}
              </h2>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
"""

files['SocialProof.jsx'] = """'use client';
export default function SocialProof() {
  return (
    <section className="py-40 bg-[#F7F5F0] text-[#0E0E0F] px-6 md:px-12 border-t border-[#0E0E0F]/10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-24">
        <div className="md:w-1/2">
          <h2 className="text-4xl md:text-5xl font-medium tracking-tighter mb-12">"Wellmade delivered a platform that fundamentally changed how our customers interact with us."</h2>
          <div className="text-sm font-bold uppercase tracking-widest text-[#0E0E0F]/60">Sarah Jenkins, CEO @ TechFlow</div>
        </div>
        <div className="md:w-1/2 flex flex-col justify-center">
          <div className="grid grid-cols-2 gap-12">
            <div>
              <div className="text-6xl font-medium text-[#C2496B] mb-2">40+</div>
              <div className="text-xs uppercase tracking-widest font-bold text-[#0E0E0F]/50">Projects Delivered</div>
            </div>
            <div>
              <div className="text-6xl font-medium text-[#C2496B] mb-2">12</div>
              <div className="text-xs uppercase tracking-widest font-bold text-[#0E0E0F]/50">Industry Awards</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
"""

files['Insights.jsx'] = """'use client';
export default function Insights() {
  const articles = [
    { cat: 'DESIGN', title: "Why most business websites don't convert" },
    { cat: 'STRATEGY', title: "The difference between a website and a digital experience" },
    { cat: 'PERFORMANCE', title: "Designing for attention, trust and action" }
  ];

  return (
    <section id="insights" className="py-40 bg-[#0E0E0F] text-[#F7F5F0] px-6 md:px-12 border-t border-[#F7F5F0]/10">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-6xl md:text-[7rem] font-medium tracking-tighter leading-[1.0] mb-32 max-w-4xl">
          THINKING BEHIND <br/><span className="text-[#C8A464]">THE WORK.</span>
        </h2>
        
        <div className="flex flex-col border-t border-[#F7F5F0]/10">
          {articles.map((a, i) => (
            <div key={i} className="group py-12 border-b border-[#F7F5F0]/10 flex flex-col md:flex-row justify-between items-start md:items-center cursor-pointer relative overflow-hidden transition-transform hover:translate-x-4">
              <div className="flex items-center gap-12 relative z-10 w-full">
                <div className="text-4xl md:text-5xl font-serif italic text-[#F7F5F0]/20 font-light">0{i+1}</div>
                <div className="flex-1">
                  <div className="text-[10px] font-bold tracking-[0.2em] text-[#C8A464] mb-2">{a.cat}</div>
                  <h3 className="text-3xl md:text-4xl font-medium tracking-tight text-[#F7F5F0] group-hover:text-[#C2496B] transition-colors">{a.title}</h3>
                </div>
                <div className="hidden md:flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-[#F7F5F0]/50 group-hover:text-[#F7F5F0]">
                  <span>Read Article</span>
                  <span className="group-hover:translate-x-2 transition-transform">&rarr;</span>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 h-[1px] bg-[#C2496B] w-0 group-hover:w-full transition-all duration-700 ease-out" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
"""

files['FinalCTA.jsx'] = """'use client';
import { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import Final3D from './3d/Final3D';

export default function FinalCTA() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section className="relative py-40 bg-[#0E0E0F] text-[#F7F5F0] min-h-[100vh] flex flex-col items-center justify-center overflow-hidden">
      
      {/* Subtle abstract W line */}
      <div className="absolute inset-0 pointer-events-none opacity-50 z-0">
        {mounted && (
          <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 10] }}>
            <Suspense fallback={null}>
              <Final3D />
            </Suspense>
          </Canvas>
        )}
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <h2 className="text-6xl md:text-[8rem] font-medium tracking-tighter leading-[1.0] mb-8">
          LET'S MAKE <br/> SOMETHING <br/> WELL MADE.
        </h2>
        <p className="text-xl md:text-2xl text-[#F7F5F0]/60 max-w-2xl mx-auto font-light mb-16">
          Have a project in mind? Let's talk about what you're building.
        </p>
        <a href="/book" className="inline-block border border-[#C2496B] text-[#F7F5F0] px-12 py-6 text-sm uppercase tracking-widest font-bold hover:bg-[#C2496B] transition-colors">
          Start a Project &rarr;
        </a>
      </div>
    </section>
  );
}
"""

files['Footer.jsx'] = """'use client';
export default function Footer() {
  return (
    <footer className="bg-[#0E0E0F] text-[#F7F5F0] px-6 md:px-12 pt-20 pb-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end border-t border-[#F7F5F0]/10 pt-10">
        
        <div className="mb-12 md:mb-0">
          <div className="text-4xl font-bold tracking-widest mb-2">WELLMADE</div>
          <div className="text-sm font-serif italic text-[#C8A464]">Digital experiences, made well.</div>
        </div>

        <div className="flex flex-col md:flex-row gap-12 md:gap-24 text-[10px] uppercase tracking-widest font-bold text-[#F7F5F0]/50">
          <div className="flex flex-col gap-4">
            <a href="#" className="hover:text-[#F7F5F0]">Twitter</a>
            <a href="#" className="hover:text-[#F7F5F0]">LinkedIn</a>
            <a href="#" className="hover:text-[#F7F5F0]">Instagram</a>
          </div>
          <div className="flex flex-col gap-4">
            <a href="mailto:hello@wellmade.com" className="hover:text-[#F7F5F0]">hello@wellmade.com</a>
            <span>New York, NY</span>
          </div>
          <div className="flex flex-col gap-4">
            <span>© 2026 Wellmade Digital.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
"""

# =================================================================
# PAGE ROOT
# =================================================================

page_code = """import Navbar from '@/components/home/Navbar';
import Hero from '@/components/home/Hero';
import Philosophy from '@/components/home/Philosophy';
import Problem from '@/components/home/Problem';
import Approach from '@/components/home/Approach';
import Work from '@/components/home/Work';
import Services from '@/components/home/Services';
import Process from '@/components/home/Process';
import WhyWellmade from '@/components/home/WhyWellmade';
import SocialProof from '@/components/home/SocialProof';
import Insights from '@/components/home/Insights';
import FinalCTA from '@/components/home/FinalCTA';
import Footer from '@/components/home/Footer';

export const metadata = {
  title: 'Wellmade Digital | Editorial Design Studio',
  description: 'Digital experiences, made with intention.',
};

export default function Home() {
  return (
    <main className="relative w-full bg-[#0E0E0F] antialiased font-sans selection:bg-[#C2496B] selection:text-[#F7F5F0] overflow-x-hidden">
      <Navbar />
      <Hero />
      <Philosophy />
      <Problem />
      <Approach />
      <Work />
      <Services />
      <Process />
      <WhyWellmade />
      <SocialProof />
      <Insights />
      <FinalCTA />
      <Footer />
    </main>
  );
}
"""

for name, code in files.items():
    with open(os.path.join(DIR, name), 'w', encoding='utf-8') as f:
        f.write(code)

with open(r"C:\Users\AYOUB\Desktop\webgobuilder\app\page.jsx", 'w', encoding='utf-8') as f:
    f.write(page_code)
