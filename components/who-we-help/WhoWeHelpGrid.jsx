'use client';
import { useRef, useState, useEffect, Suspense } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import WhoWeHelp3D from './WhoWeHelp3D';

const industries = [
  { 
    title: "Doctors & Medical", 
    image: "/industries/medical.jpg",
    howWeHelp: "We build secure, robust patient portals, automated appointment scheduling systems, and accessible platforms that prioritize patient trust and institutional authority.",
    outcome: "Streamlined patient onboarding, drastically fewer missed appointments, and a professional digital footprint that establishes absolute medical credibility."
  },
  { 
    title: "Aesthetic Clinics", 
    image: "/industries/aesthetics.jpg",
    howWeHelp: "We design highly visual, luxury-focused digital experiences that highlight your procedures, integrating seamless consultation booking systems and CRM lead pipelines.",
    outcome: "Increased premium consultation requests, effortless internal lead management, and a brand perception that justifies the high ticket price of your services."
  },
  { 
    title: "Spas & Wellness", 
    image: "/industries/spa.jpg",
    howWeHelp: "We create calming, frictionless digital environments with integrated e-commerce for products, gift cards, and direct calendar synchronization for treatments.",
    outcome: "A 24/7 digital concierge that drives passive revenue and completely fills your booking calendar without constant manual administrative effort."
  },
  { 
    title: "Beauty Salons", 
    image: "/industries/salon.jpg",
    howWeHelp: "We develop portfolio-driven platforms that showcase your stylists' work, coupled with intelligent automated SMS reminders and VIP loyalty program integrations.",
    outcome: "Maximized customer retention, the virtual elimination of no-shows, and a highly shareable aesthetic brand that continuously attracts local high-end clientele."
  },
  { 
    title: "Rental Car Agencies", 
    image: "/industries/rental.jpg",
    howWeHelp: "We engineer dynamic fleet inventory systems, complex dynamic pricing algorithms, and frictionless checkout flows optimized for fast mobile bookings.",
    outcome: "Higher direct booking volume (bypassing third-party aggregator fees), mathematically optimized fleet utilization, and a superior customer reservation experience."
  },
  { 
    title: "Real Estate Agencies", 
    image: "/industries/realestate.jpg",
    howWeHelp: "We construct immersive property listing platforms featuring 3D virtual tours, advanced filtering algorithms, and automated CRM routing for high-net-worth buyer inquiries.",
    outcome: "Significantly faster property turnover, higher quality verified lead generation for your agents, and a digital presence that dominates the local luxury market."
  },
  { 
    title: "Luxury Hotels", 
    image: "/industries/hotels.jpg",
    howWeHelp: "We craft experiential booking platforms that sell the destination and the lifestyle, integrating flawlessly with your internal property management systems (PMS).",
    outcome: "A massive increase in direct bookings, heavily reduced reliance on OTA commissions (Booking.com/Expedia), and higher guest lifetime value."
  },
  { 
    title: "Exclusive Resorts", 
    image: "/industries/resorts.jpg",
    howWeHelp: "We build comprehensive digital ecosystems that allow guests to explore exclusive amenities, book dining or excursions before arrival, and immerse themselves in your property.",
    outcome: "Maximized on-property spend per guest, completely seamless guest experiences from booking to checkout, and elevated global brand prestige."
  },
  { 
    title: "Travel Agencies", 
    image: "/industries/travel.jpg",
    howWeHelp: "We develop scalable e-commerce platforms for complex itinerary building, custom trip packaging, and secure global payment processing for bespoke travel experiences.",
    outcome: "Fully automated booking workflows, highly scalable itinerary management, and the technological ability to seamlessly sell high-ticket travel packages globally."
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
                  </div>
                </motion.div>
              </AnimatePresence>
              
            </div>
          </div>
          
        </div>
      </section>

    </div>
  );
}
