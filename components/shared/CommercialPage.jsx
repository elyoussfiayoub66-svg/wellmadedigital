'use client';
import { motion } from 'framer-motion';
import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';
import FinalCTA from '@/components/home/FinalCTA';

export default function CommercialPage({ content }) {
  const {
    title,
    subtitle,
    definition,
    problem,
    mechanism,
    deliverables,
    outcomes,
    process,
    faqs,
  } = content;

  return (
    <main className="relative w-full bg-[#0E0E0F] antialiased font-sans selection:bg-[#C2496B] selection:text-[#F7F5F0] overflow-x-hidden text-[#F7F5F0]">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 md:px-12 max-w-7xl mx-auto border-b border-[#F7F5F0]/10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] uppercase tracking-widest font-bold text-[#C8A464] mb-8">
          SOLUTION
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-5xl md:text-7xl lg:text-[6rem] font-medium tracking-tighter leading-[0.9] mb-8">
          {title}
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-xl md:text-2xl text-[#F7F5F0]/60 max-w-3xl font-light">
          {subtitle}
        </motion.p>
      </section>

      {/* 1. Definition & 2. Problem */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 border-b border-[#F7F5F0]/10">
        <div>
          <h2 className="text-[11px] font-bold text-[#C2496B] uppercase tracking-widest mb-4">The Definition</h2>
          <p className="text-lg md:text-xl font-light leading-relaxed text-[#F7F5F0]/80">
            {definition}
          </p>
        </div>
        <div className="relative pl-6 border-l border-[#C8A464] bg-gradient-to-r from-[#C8A464]/5 to-transparent py-6 pr-6 rounded-r-2xl">
          <h2 className="text-[11px] font-bold text-[#C8A464] uppercase tracking-widest mb-4">The Problem</h2>
          <p className="text-lg font-medium leading-relaxed text-[#F7F5F0]">
            {problem}
          </p>
        </div>
      </section>

      {/* 3. Mechanism & 4. Deliverables */}
      <section className="py-24 px-6 md:px-12 bg-[#121213]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <h2 className="text-3xl md:text-5xl font-medium tracking-tighter mb-6">How it works.</h2>
            <p className="text-[#F7F5F0]/60 max-w-2xl text-lg font-light">{mechanism}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {deliverables.map((item, i) => (
              <div key={i} className="p-8 bg-[#1A1A1B]/50 border border-[#F7F5F0]/5 rounded-2xl">
                <span className="text-[#C2496B] font-serif italic text-xl mb-4 block">0{i+1}</span>
                <h3 className="text-xl font-medium mb-4">{item.title}</h3>
                <p className="text-[#F7F5F0]/60 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Outcomes */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-b border-[#F7F5F0]/10">
        <h2 className="text-3xl md:text-5xl font-medium tracking-tighter mb-16 text-center">Business Outcomes.</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {outcomes.map((outcome, i) => (
            <div key={i} className="flex gap-6 items-start">
              <div className="w-12 h-12 rounded-full bg-[#C2496B]/10 border border-[#C2496B]/30 flex items-center justify-center shrink-0 text-[#C2496B]">✓</div>
              <div>
                <h3 className="text-xl font-medium mb-2">{outcome.title}</h3>
                <p className="text-[#F7F5F0]/60">{outcome.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Process */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-b border-[#F7F5F0]/10">
        <h2 className="text-3xl md:text-5xl font-medium tracking-tighter mb-12">Our Methodology.</h2>
        <div className="flex flex-col gap-8">
          {process.map((step, i) => (
            <div key={i} className="flex flex-col md:flex-row gap-6 md:gap-12 items-baseline border-t border-[#F7F5F0]/5 pt-8">
              <span className="text-sm font-bold text-[#C8A464] tracking-widest uppercase w-32 shrink-0">Phase {i+1}</span>
              <div>
                <h3 className="text-2xl font-medium mb-2">{step.title}</h3>
                <p className="text-[#F7F5F0]/60">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. FAQs (AEO Optimized) */}
      <section className="py-24 px-6 md:px-12 max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-medium tracking-tighter mb-12 text-center">Frequently Asked.</h2>
        <div className="flex flex-col gap-6">
          {faqs.map((faq, i) => (
            <details key={i} className="group bg-[#1A1A1B]/30 border border-[#F7F5F0]/10 rounded-xl p-6 cursor-pointer">
              <summary className="text-lg font-medium list-none flex justify-between items-center">
                {faq.question}
                <span className="text-[#C2496B] group-open:rotate-45 transition-transform">+</span>
              </summary>
              <div className="pt-4 mt-4 border-t border-[#F7F5F0]/10 text-[#F7F5F0]/70 font-light leading-relaxed">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </section>

      <FinalCTA />
      <Footer />
    </main>
  );
}
