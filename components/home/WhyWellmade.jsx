'use client';
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
