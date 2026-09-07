'use client';
import { motion } from 'framer-motion';

const reasons = [
  {
    title: "Engineering First",
    description: "We are not marketers building websites. We are engineers building systems. Performance, security, and scalability are baked into everything."
  },
  {
    title: "Zero Retainer Bloat",
    description: "We build assets that you own. We don't charge endless monthly retainers for simple maintenance. We empower you to run your own tech."
  },
  {
    title: "Obsessive UX",
    description: "A system is only as good as its adoption rate. We design interfaces that are so intuitive, your team will actually want to use them."
  },
  {
    title: "Measurable ROI",
    description: "Before writing a single line of code, we calculate exactly how much time or money the system will save you. If it doesn't make sense, we don't build it."
  }
];

export default function WhyWellmade() {
  return (
    <section className="bg-[#0E0E0F] text-[#F7F5F0] py-32 px-6 md:px-12 border-b border-[#F7F5F0]/10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[10px] uppercase tracking-widest font-bold text-[#C8A464] mb-8">
            WHY CHOOSE US
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl font-medium tracking-tighter leading-[1.1] max-w-3xl mx-auto">
            We operate differently than <span className="text-[#C2496B]">traditional agencies.</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {reasons.map((reason, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-[#1A1A1B]/40 border border-[#F7F5F0]/10 p-8 rounded-2xl hover:border-[#C2496B]/50 transition-colors"
            >
              <h3 className="text-xl font-medium text-[#F7F5F0] mb-4">{reason.title}</h3>
              <p className="text-[#F7F5F0]/60 font-light text-sm leading-relaxed">{reason.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
