'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const categories = ['ALL', 'WEBSITES', 'DIGITAL PRODUCTS', 'WEB APPS'];

export default function SelectedProjects({ projects }) {
  const [activeCat, setActiveCat] = useState('ALL');

  const filtered = activeCat === 'ALL' 
    ? projects 
    : projects.filter(p => p.category.toUpperCase().includes(activeCat.replace('S', ''))); // Simple mock filtering

  return (
    <section className="py-32 bg-[#F7F5F0] text-[#0E0E0F] px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        
        {/* Elegant Filter System */}
        <div className="flex flex-wrap items-center gap-8 mb-24 border-b border-[#0E0E0F]/10 pb-8">
          <div className="text-3xl font-medium tracking-tighter mr-auto">SELECTED PROJECTS</div>
          {categories.map((cat) => (
            <button 
              key={cat}
              onClick={() => setActiveCat(cat)}
              className={`text-[10px] uppercase tracking-widest font-bold transition-colors ${activeCat === cat ? 'text-[#C2496B]' : 'text-[#0E0E0F]/40 hover:text-[#0E0E0F]'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery */}
        <div className="flex flex-col gap-32">
          <AnimatePresence mode="popLayout">
            {filtered.map((p, i) => {
              // Create editorial rhythm
              const isLarge = i % 3 === 0;
              const isRight = i % 2 !== 0;

              return (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  key={p.id} 
                  className={`flex flex-col ${isLarge ? 'md:flex-col' : isRight ? 'md:flex-row-reverse' : 'md:flex-row'} gap-12`}
                >
                  
                  {/* Image Block */}
                  <div className={`w-full ${isLarge ? 'md:w-full' : 'md:w-3/5'} relative overflow-hidden group cursor-pointer rounded-2xl border border-[#0E0E0F]/5 shadow-[0_15px_40px_rgba(0,0,0,0.08)] transition-all duration-700 hover:shadow-[0_25px_50px_rgba(0,0,0,0.12)] hover:border-[#0E0E0F]/10`}>
                    <img src={p.image} alt={p.name} className="w-full h-auto block transition-transform duration-1000 group-hover:scale-[1.03]" loading="lazy" />
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-[#0E0E0F]/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-center items-center text-center p-8">
                       <div className="text-[#C8A464] text-[10px] font-bold tracking-[0.2em] mb-4">CASE STUDY</div>
                       <div className="text-3xl text-[#F7F5F0] font-medium mb-8">View {p.name}</div>
                       <span className="w-12 h-[1px] bg-[#C2496B]"></span>
                    </div>
                  </div>
                  
                  {/* Case Study Preview */}
                  <div className={`w-full flex flex-col justify-center ${isLarge ? 'md:grid md:grid-cols-3 md:gap-8 border-t border-[#0E0E0F]/10 pt-8' : 'md:w-2/5'}`}>
                    
                    {!isLarge && (
                      <div className="mb-12">
                        <h3 className="text-4xl md:text-5xl font-medium tracking-tighter mb-2">{p.name}</h3>
                        <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#0E0E0F]/40">{p.category}</div>
                      </div>
                    )}

                    {isLarge && (
                      <div className="col-span-1">
                        <h3 className="text-4xl md:text-5xl font-medium tracking-tighter mb-2">{p.name}</h3>
                        <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#0E0E0F]/40">{p.category}</div>
                      </div>
                    )}

                    <div className={`flex flex-col gap-8 ${isLarge ? 'col-span-2 md:grid md:grid-cols-2 md:gap-8' : ''}`}>
                      <div>
                        <div className="text-[10px] uppercase tracking-widest font-bold text-[#C2496B] mb-2">The Challenge</div>
                        <p className="text-[#0E0E0F]/70 text-sm font-light leading-relaxed">
                          {p.challenge || "Legacy structures and fragmented user journeys were actively suppressing conversion rates and brand trust."}
                        </p>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-widest font-bold text-[#C2496B] mb-2">The Result</div>
                        <p className="text-[#0E0E0F]/70 text-sm font-light leading-relaxed">
                          {p.result || "A streamlined, high-performance architecture that clarified positioning and drastically improved user retention."}
                        </p>
                      </div>
                    </div>

                  </div>

                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
