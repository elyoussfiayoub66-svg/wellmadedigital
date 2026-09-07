'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';

const steps = [
  {
    number: "01",
    title: "Deep Operational Audit",
    description: "We don't guess. We analyze your entire business flow—from lead capture to client retention—to find exactly where time and money are leaking."
  },
  {
    number: "02",
    title: "Custom Engineering",
    description: "We build and deploy bespoke CRM systems, automations, and digital architecture specifically designed to solve the bottlenecks found in Step 1."
  }
];

export default function Process() {
  return (
    <section className="bg-[#0E0E0F] text-[#F7F5F0] py-32 px-6 md:px-12 border-b border-[#F7F5F0]/10">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16">
        
        <div className="lg:w-1/3">
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[10px] uppercase tracking-widest font-bold text-[#C8A464] mb-8">
            OUR PROCESS
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl font-medium tracking-tighter leading-[1.1] mb-8">
            How we <span className="text-[#C2496B]">execute.</span>
          </motion.h2>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="text-lg text-[#F7F5F0]/60 font-light leading-relaxed mb-10">
            We follow a rigorous, two-phase approach to guarantee every line of code we write actually impacts your bottom line.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
            <Link href="/process" className="inline-flex items-center gap-3 bg-[#1A1A1B] border border-[#F7F5F0]/10 hover:border-[#C2496B] px-8 py-4 rounded-lg font-medium transition-all">
              See Full Methodology &rarr;
            </Link>
          </motion.div>
        </div>

        <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-8">
          {steps.map((step, i) => (
            <motion.div 
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 + 0.2 }}
              className="bg-[#1A1A1B]/40 border border-[#F7F5F0]/10 p-10 rounded-2xl relative overflow-hidden group hover:border-[#C2496B]/50 transition-colors"
            >
              <div className="text-[120px] font-bold text-[#F7F5F0]/5 absolute -top-10 -right-4 pointer-events-none group-hover:text-[#C2496B]/5 transition-colors">
                {step.number}
              </div>
              <h3 className="text-2xl font-medium text-[#F7F5F0] mb-4 relative z-10">{step.title}</h3>
              <p className="text-[#F7F5F0]/70 font-light leading-relaxed relative z-10">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
