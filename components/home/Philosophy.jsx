'use client';
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
