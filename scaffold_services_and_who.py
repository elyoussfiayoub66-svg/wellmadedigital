import os

def ensure_dir(p):
    os.makedirs(p, exist_ok=True)

ensure_dir(r"C:\Users\AYOUB\Desktop\webgobuilder\app\services")
ensure_dir(r"C:\Users\AYOUB\Desktop\webgobuilder\app\who-we-help")
ensure_dir(r"C:\Users\AYOUB\Desktop\webgobuilder\components\services\3d")
ensure_dir(r"C:\Users\AYOUB\Desktop\webgobuilder\components\who-we-help\3d")

files = {}

# =================================================================
# SERVICES PAGE COMPONENTS
# =================================================================

files[r"components\services\3d\Services3D.jsx"] = """'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Float, Icosahedron, Box, TorusKnot } from '@react-three/drei';
import * as THREE from 'three';

export default function Services3D({ activeIndex }) {
  const groupRef = useRef();

  useFrame((state, delta) => {
    // Smoothly rotate the entire group
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.2;
      groupRef.current.rotation.x += delta * 0.1;
      
      // Scale transitions based on active index
      const targetScale0 = activeIndex === 0 ? 1 : 0;
      const targetScale1 = activeIndex === 1 ? 1 : 0;
      const targetScale2 = activeIndex === 2 ? 1 : 0;
      
      groupRef.current.children[0].scale.lerp(new THREE.Vector3(targetScale0, targetScale0, targetScale0), 0.1);
      groupRef.current.children[1].scale.lerp(new THREE.Vector3(targetScale1, targetScale1, targetScale1), 0.1);
      groupRef.current.children[2].scale.lerp(new THREE.Vector3(targetScale2, targetScale2, targetScale2), 0.1);
    }
  });

  return (
    <group ref={groupRef}>
      {/* 0: Website Design & Creation - Fluid TorusKnot */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <TorusKnot args={[1, 0.3, 128, 32]} scale={0}>
          <MeshDistortMaterial color="#C2496B" speed={2} distort={0.2} radius={1} transparent opacity={0.9} wireframe={true} />
        </TorusKnot>
      </Float>

      {/* 1: CRM Development - Structured Box System */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <Box args={[1.5, 1.5, 1.5]} scale={0}>
          <meshStandardMaterial color="#C8A464" transparent opacity={0.8} wireframe={false} metalness={0.8} roughness={0.2} />
        </Box>
        {/* Inner wireframe box for complexity */}
        <Box args={[1.8, 1.8, 1.8]} scale={0}>
          <meshBasicMaterial color="#C8A464" transparent opacity={0.2} wireframe={true} />
        </Box>
      </Float>

      {/* 2: AI Automation - Complex Neural Node */}
      <Float speed={3} rotationIntensity={1} floatIntensity={2}>
        <Icosahedron args={[1.2, 2]} scale={0}>
          <MeshDistortMaterial color="#F7F5F0" speed={4} distort={0.5} radius={1} transparent opacity={0.6} wireframe={true} />
        </Icosahedron>
      </Float>
    </group>
  );
}
"""

files[r"components\services\ServicesContent.jsx"] = """'use client';
import { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion } from 'framer-motion';
import Services3D from './3d/Services3D';

const services = [
  {
    id: 0,
    title: "Website Design & Creation",
    description: "We don't just build websites. We engineer high-performance digital environments that position your brand at the absolute top of your market. Every pixel is designed to convert.",
    features: ["Conversion Rate Optimization", "Immersive 3D/WebGL Interactions", "Next.js High-Performance Architecture", "Bespoke Editorial UI/UX"]
  },
  {
    id: 1,
    title: "CRM Development",
    description: "Stop wrestling with generic software. We build bespoke client management systems perfectly mapped to your actual sales cycle, allowing your team to close deals instead of fighting software.",
    features: ["Custom Sales Pipelines", "Client Portals & Dashboards", "Secure Data Architecture", "Zero Monthly License Fees"]
  },
  {
    id: 2,
    title: "AI Automation",
    description: "Human error and manual data entry are bottlenecks. We implement intelligent, automated workflows that connect your disparate tools, qualify leads, and process data instantly.",
    features: ["Automated Lead Qualification", "Custom AI Chatbots & Agents", "API Integrations", "Workflow Automation (Zapier/Make)"]
  }
];

export default function ServicesContent() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="relative min-h-screen bg-[#0E0E0F] text-[#F7F5F0] pt-40 px-6 md:px-12 overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 relative z-10 h-full pb-32">
        
        {/* Left Side: Editorial Content */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] uppercase tracking-widest font-bold text-[#C8A464] mb-8">
            OUR EXPERTISE
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-5xl md:text-7xl font-medium tracking-tighter leading-[1.0] mb-24">
            Digital systems <br/> built for <span className="text-[#C2496B]">scale.</span>
          </motion.h1>

          <div className="flex flex-col gap-12 border-l border-[#F7F5F0]/10 pl-8">
            {services.map((svc, i) => (
              <div 
                key={svc.id} 
                onMouseEnter={() => setActiveIndex(svc.id)}
                className={`transition-all duration-500 cursor-pointer ${activeIndex === svc.id ? 'opacity-100 scale-100' : 'opacity-40 scale-95 origin-left'}`}
              >
                <h2 className={`text-3xl md:text-4xl font-medium tracking-tighter mb-4 transition-colors ${activeIndex === svc.id ? 'text-[#F7F5F0]' : 'text-[#F7F5F0]/50'}`}>
                  {svc.title}
                </h2>
                {activeIndex === svc.id && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden">
                    <p className="text-[#F7F5F0]/70 font-light text-lg mb-6 leading-relaxed max-w-lg">
                      {svc.description}
                    </p>
                    <ul className="flex flex-col gap-2">
                      {svc.features.map((feat, fi) => (
                        <li key={fi} className="flex items-center gap-3 text-xs tracking-widest uppercase font-bold text-[#F7F5F0]/50">
                          <span className="w-4 h-[1px] bg-[#C2496B]"></span> {feat}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Fixed 3D Canvas */}
        <div className="w-full lg:w-1/2 h-[50vh] lg:h-[70vh] lg:sticky lg:top-32 relative">
           <div className="absolute inset-0 rounded-3xl overflow-hidden bg-[#1A1A1B]/30 border border-[#F7F5F0]/5 shadow-2xl backdrop-blur-sm">
             <Canvas camera={{ position: [0, 0, 5] }}>
               <ambientLight intensity={0.5} />
               <directionalLight position={[10, 10, 5]} intensity={1} />
               <Suspense fallback={null}>
                 <Services3D activeIndex={activeIndex} />
               </Suspense>
             </Canvas>
           </div>
        </div>

      </div>
    </section>
  );
}
"""

files[r"app\services\page.jsx"] = """import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';
import FinalCTA from '@/components/home/FinalCTA';
import ServicesContent from '@/components/services/ServicesContent';

export const metadata = {
  title: 'Services | Wellmade Digital',
  description: 'Website Design, CRM Development, and AI Automation.',
};

export default function ServicesPage() {
  return (
    <main className="relative w-full bg-[#0E0E0F] antialiased font-sans selection:bg-[#C2496B] selection:text-[#F7F5F0] overflow-x-hidden">
      <Navbar />
      <ServicesContent />
      <FinalCTA />
      <Footer />
    </main>
  );
}
"""

# =================================================================
# WHO WE HELP PAGE COMPONENTS
# =================================================================

files[r"components\who-we-help\TiltCard.jsx"] = """'use client';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export default function TiltCard({ title, image }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full aspect-[4/5] rounded-xl overflow-hidden cursor-pointer group"
    >
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
        style={{ backgroundImage: `url(${image})` }}
      />
      {/* Deep dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E0F] via-[#0E0E0F]/40 to-transparent" />
      
      <div 
        style={{ transform: "translateZ(50px)" }}
        className="absolute bottom-8 left-8 right-8"
      >
        <h3 className="text-2xl md:text-3xl font-medium tracking-tight text-[#F7F5F0] mb-2">{title}</h3>
        <div className="w-0 h-[1px] bg-[#C2496B] group-hover:w-12 transition-all duration-500 ease-out"></div>
      </div>
    </motion.div>
  );
}
"""

files[r"components\who-we-help\WhoWeHelpGrid.jsx"] = """'use client';
import { motion } from 'framer-motion';
import TiltCard from './TiltCard';

const industries = [
  { title: "Doctors & Medical", image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1000&auto=format&fit=crop" },
  { title: "Aesthetic Clinics", image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=1000&auto=format&fit=crop" },
  { title: "Spas & Wellness", image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1000&auto=format&fit=crop" },
  { title: "Beauty Salons", image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1000&auto=format&fit=crop" },
  { title: "Rental Car Agencies", image: "https://images.unsplash.com/photo-1503370973431-15e54eb8be34?q=80&w=1000&auto=format&fit=crop" },
  { title: "Real Estate Agencies", image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=1000&auto=format&fit=crop" },
  { title: "Luxury Hotels", image: "https://images.unsplash.com/photo-1542314831-c6a4d1409e1f?q=80&w=1000&auto=format&fit=crop" },
  { title: "Exclusive Resorts", image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1000&auto=format&fit=crop" },
  { title: "Travel Agencies", image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1000&auto=format&fit=crop" }
];

export default function WhoWeHelpGrid() {
  return (
    <section className="relative bg-[#0E0E0F] text-[#F7F5F0] pt-40 pb-32 px-6 md:px-12 overflow-hidden z-10">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-24 md:w-2/3">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] uppercase tracking-widest font-bold text-[#C8A464] mb-8">
            WHO WE HELP
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-5xl md:text-7xl font-medium tracking-tighter leading-[1.0] mb-8">
            We partner with <span className="text-[#C2496B]">high-performing</span> businesses.
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-[#F7F5F0]/60 text-xl font-light">
            Our systems are engineered for specialized industries where client experience, operational precision, and premium positioning are non-negotiable.
          </motion.p>
        </div>

        {/* 3D Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" style={{ perspective: "1000px" }}>
          {industries.map((ind, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: i * 0.1, duration: 0.8 }}
            >
              <TiltCard title={ind.title} image={ind.image} />
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
"""

files[r"app\who-we-help\page.jsx"] = """import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';
import FinalCTA from '@/components/home/FinalCTA';
import WhoWeHelpGrid from '@/components/who-we-help/WhoWeHelpGrid';

export const metadata = {
  title: 'Who We Help | Wellmade Digital',
  description: 'Specialized digital systems for clinics, real estate, travel, and luxury sectors.',
};

export default function WhoWeHelpPage() {
  return (
    <main className="relative w-full bg-[#0E0E0F] antialiased font-sans selection:bg-[#C2496B] selection:text-[#F7F5F0] overflow-x-hidden">
      <Navbar />
      <WhoWeHelpGrid />
      <FinalCTA />
      <Footer />
    </main>
  );
}
"""

# Write all files
for file_path, content in files.items():
    full_path = os.path.join(r"C:\Users\AYOUB\Desktop\webgobuilder", file_path)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)

print("Scaffolded Services and Who We Help pages.")
