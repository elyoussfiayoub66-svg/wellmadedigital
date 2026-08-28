'use client';
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
