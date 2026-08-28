'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function WorkArchive({ projects }) {
  const [hoveredProject, setHoveredProject] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateMousePos = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', updateMousePos);
    return () => window.removeEventListener('mousemove', updateMousePos);
  }, []);

  return (
    <section className="py-40 bg-[#F7F5F0] text-[#0E0E0F] px-6 md:px-12 relative">
      
      {/* Floating Image cursor tracker */}
      {hoveredProject && (
        <motion.div
          animate={{ x: mousePos.x + 20, y: mousePos.y + 20 }}
          transition={{ type: 'spring', stiffness: 100, damping: 25, mass: 0.5 }}
          className="fixed top-0 left-0 w-64 aspect-[4/3] pointer-events-none z-50 rounded-lg overflow-hidden shadow-2xl hidden md:block"
        >
          <img src={hoveredProject.image} alt="Preview" className="w-full h-full object-cover" />
        </motion.div>
      )}

      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-medium tracking-tighter mb-16 border-b border-[#0E0E0F]/10 pb-8">PROJECT ARCHIVE</h2>
        
        <div className="flex flex-col">
          {/* Header Row */}
          <div className="flex text-[10px] uppercase tracking-widest font-bold text-[#0E0E0F]/40 border-b border-[#0E0E0F]/10 pb-4 mb-4">
            <div className="w-1/2 md:w-2/5">Project</div>
            <div className="hidden md:block w-2/5">Type</div>
            <div className="w-1/2 md:w-1/5 text-right">Year</div>
          </div>

          {projects.map((p, i) => (
            <div 
              key={i}
              onMouseEnter={() => setHoveredProject(p)}
              onMouseLeave={() => setHoveredProject(null)}
              className="flex items-center py-6 border-b border-[#0E0E0F]/5 cursor-pointer group"
            >
              <div className="w-1/2 md:w-2/5 text-2xl md:text-3xl font-medium tracking-tight group-hover:text-[#C2496B] transition-colors">{p.name}</div>
              <div className="hidden md:block w-2/5 text-sm font-light text-[#0E0E0F]/60">{p.category}</div>
              <div className="w-1/2 md:w-1/5 text-right font-serif italic text-[#0E0E0F]/40 group-hover:text-[#0E0E0F] transition-colors">
                2026
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
