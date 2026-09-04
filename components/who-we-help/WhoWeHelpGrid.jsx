'use client';
import { useRef, useState, useEffect, Suspense } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import WhoWeHelp3D from './WhoWeHelp3D';

const industries = [
  { 
    title: "Dental Clinics", 
    slug: "dental-clinics",
    image: "/industries/medical.jpg",
    howWeHelp: "We build secure, robust CRM systems and automated appointment workflows that integrate seamlessly with your existing clinical software.",
    outcome: "Elimination of double-bookings, significantly fewer missed appointments, and hundreds of administrative hours saved every month."
  },
  { 
    title: "Aesthetic Clinics", 
    slug: "aesthetic-clinics",
    image: "/industries/aesthetics.jpg",
    howWeHelp: "We design highly visual, luxury-focused digital environments and integrate them with automated consultation and follow-up pipelines.",
    outcome: "Effortless internal patient management, automated retention sequences, and an operational flow that justifies high-ticket pricing."
  },
  { 
    title: "Beauty Salons", 
    slug: "beauty-salons",
    image: "/industries/salon.jpg",
    howWeHelp: "We develop systems that handle complex stylist schedules, inventory tracking, and intelligent SMS reminders.",
    outcome: "Zero administrative chaos at the front desk, the virtual elimination of no-shows, and drastically reduced operational costs."
  },
  { 
    title: "Travel Agencies", 
    slug: "travel-agencies",
    image: "/industries/travel.jpg",
    howWeHelp: "We develop complex CRM dashboards to manage custom itinerary building, client documents, and secure global payment processing.",
    outcome: "Fully automated booking workflows and the technological infrastructure to flawlessly manage high-ticket clients without relying on messy spreadsheets."
  },
  { 
    title: "Hotels", 
    slug: "hotels",
    image: "/industries/hotels.jpg",
    howWeHelp: "We craft experiential booking interfaces backed by rigorous automation that connects to your internal Property Management Systems (PMS).",
    outcome: "A massive reduction in manual guest communication, streamlined check-in processes, and a seamless digital concierge experience."
  },
  { 
    title: "Spas", 
    slug: "spas",
    image: "/industries/spa.jpg",
    howWeHelp: "We engineer digital environments with integrated e-commerce for products, gift cards, and automated treatment scheduling workflows.",
    outcome: "A 24/7 automated receptionist that handles bookings and payments, freeing your staff to focus purely on the client experience."
  },
  { 
    title: "Rental Car Agencies", 
    slug: "rental-car-agencies",
    image: "/industries/rental.jpg",
    howWeHelp: "We engineer dynamic fleet inventory management systems, pricing algorithms, and frictionless checkout automations.",
    outcome: "Mathematically optimized fleet utilization, zero double-booking errors, and a streamlined back-office system that saves immense time and money."
  }
];

export default function WhoWeHelpGrid() {
  const [mounted, setMounted] = useState(false);
  const targetRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Track vertical scroll across the massive 1000vh container
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"]
  });

  // Mathematically track exactly which industry is active and trigger a state update ONLY when it changes
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const total = industries.length - 1;
    const newIndex = Math.round(latest * total);
    // Ensure we stay within bounds
    const clampedIndex = Math.max(0, Math.min(total, newIndex));
    if (clampedIndex !== activeIndex) {
      setActiveIndex(clampedIndex);
    }
  });

  useEffect(() => setMounted(true), []);

  const activeIndustry = industries[activeIndex];

  return (
    <div className="relative w-full bg-[#0E0E0F]">
      
      {/* Intro Header (Scrolls normally) */}
      <div className="pt-40 pb-20 px-6 md:px-12 max-w-7xl mx-auto relative z-20">
        <div className="md:w-3/4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] uppercase tracking-widest font-bold text-[#C8A464] mb-8">
            WHO WE HELP
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-5xl md:text-7xl lg:text-[6rem] font-medium tracking-tighter leading-[0.9] mb-8 text-[#F7F5F0]">
            Specialized systems for <br/><span className="text-[#C2496B]">specialized industries.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-[#F7F5F0]/60 text-xl font-light max-w-2xl leading-relaxed">
            Scroll down to explore the high-performance digital infrastructure we engineer for specific luxury and operational business models.
          </motion.p>
        </div>
      </div>

      {/* The 3D Scroll-Locked Interactive Experience */}
      <section ref={targetRef} className="relative h-[900vh] bg-[#0E0E0F]">
        
        <div className="sticky top-0 h-screen w-full flex items-center overflow-hidden">
          
          {/* 3D WebGL Background Layer */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            {mounted && (
              <Canvas camera={{ position: [0, 0, 25], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <fog attach="fog" args={['#0E0E0F', 15, 40]} />
                <Suspense fallback={null}>
                  <WhoWeHelp3D scrollYProgress={scrollYProgress} industries={industries} />
                </Suspense>
              </Canvas>
            )}
            
            {/* Gradients to blend 3D canvas with the DOM */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0E0E0F] via-[#0E0E0F]/80 to-transparent w-full md:w-2/3 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E0F] via-transparent to-[#0E0E0F] opacity-90 pointer-events-none" />
          </div>

          {/* DOM Overlay: Crossfading Text Information */}
          <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 h-full flex items-center">
            <div className="w-full md:w-1/2 relative h-[60vh] flex flex-col justify-center">
              
              {/* AnimatePresence mode="wait" guarantees that the old text completes its exit animation BEFORE the new one starts entering. This mathematically eliminates any possibility of overlap. */}
              <AnimatePresence mode="wait">
                <motion.div 
                  key={activeIndex} 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="w-full"
                >
                  <div className="text-[10px] uppercase tracking-widest font-bold text-[#C8A464] mb-4">
                    {String(activeIndex + 1).padStart(2, '0')} / {String(industries.length).padStart(2, '0')}
                  </div>
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tighter text-[#F7F5F0] mb-8">
                    {activeIndustry.title}
                  </h2>
                  
                  <div className="flex flex-col gap-6">
                    <div className="relative pl-6 border-l border-[#C8A464] bg-gradient-to-r from-[#C8A464]/10 to-transparent py-4 pr-4 rounded-r-xl">
                      <h4 className="text-[11px] font-bold text-[#C8A464] uppercase tracking-widest mb-2">How We Help</h4>
                      <p className="text-base text-[#F7F5F0]/80 font-light leading-relaxed">
                        {activeIndustry.howWeHelp}
                      </p>
                    </div>
                    
                    <div className="relative pl-6 border-l border-[#C2496B] bg-gradient-to-r from-[#C2496B]/10 to-transparent py-4 pr-4 rounded-r-xl">
                      <h4 className="text-[11px] font-bold text-[#C2496B] uppercase tracking-widest mb-2">The Outcome</h4>
                      <p className="text-base text-[#F7F5F0]/90 font-medium leading-relaxed">
                        {activeIndustry.outcome}
                      </p>
                    </div>

                    <a 
                      href={`/industries/${activeIndustry.slug}`}
                      className="mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#F7F5F0] group cursor-pointer w-max"
                    >
                      <span className="group-hover:text-[#C2496B] transition-colors">View Industry Solution</span>
                      <span className="w-8 h-[1px] bg-[#C2496B] group-hover:w-12 transition-all duration-300"></span>
                    </a>
                  </div>
                </motion.div>
              </AnimatePresence>
              
            </div>
          </div>
          
        </div>
      </section>
      
      {/* SEO / AEO Semantic Layer: Ensures all industries are instantly crawlable without requiring scroll interaction */}
      <div className="sr-only">
        {industries.map((ind, i) => (
          <div key={i}>
            <h2>{ind.title}</h2>
            <h3>How We Help</h3>
            <p>{ind.howWeHelp}</p>
            <h3>The Outcome</h3>
            <p>{ind.outcome}</p>
          </div>
        ))}
      </div>

    </div>
  );
}
