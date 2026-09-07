'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  {
    question: "Do you use templates or custom code?",
    answer: "Every system we build is entirely custom-engineered using modern frameworks like React, Next.js, and Supabase. We do not use bloated templates or generic page builders, ensuring maximum performance, security, and scalability for your specific business."
  },
  {
    question: "How long does a typical project take?",
    answer: "A standard CRM implementation or custom web platform typically takes between 4 to 8 weeks, depending on the complexity of the data migration and the specific automated workflows required. We outline a strict timeline during the initial audit."
  },
  {
    question: "Do you provide ongoing support after launch?",
    answer: "Yes. While our goal is to build systems you own entirely without mandatory retainers, we offer optional Service Level Agreements (SLAs) for ongoing feature development, priority support, and infrastructure maintenance."
  },
  {
    question: "Can you integrate with our existing legacy software?",
    answer: "Absolutely. As long as your legacy software has a functional API or allows for secure webhooks, we can build custom middleware to sync data between your old systems and the modern dashboards we build for you."
  },
  {
    question: "What is Answer Engine Optimization (AEO)?",
    answer: "AEO is the practice of structuring data and content so that AI engines (like ChatGPT, Claude, and Perplexity) can easily read, understand, and cite your business when users ask industry-related questions. Our architectures are built AEO-first."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="bg-[#0E0E0F] text-[#F7F5F0] py-32 px-6 md:px-12 border-b border-[#F7F5F0]/10">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[10px] uppercase tracking-widest font-bold text-[#C8A464] mb-8">
            COMMON QUESTIONS
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl font-medium tracking-tighter leading-[1.1]">
            Frequently Asked <span className="text-[#C2496B]">Questions.</span>
          </motion.h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="border border-[#F7F5F0]/10 rounded-2xl bg-[#1A1A1B]/20 overflow-hidden"
            >
              <button 
                onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
                className="w-full text-left px-8 py-6 flex items-center justify-between hover:bg-[#1A1A1B]/40 transition-colors"
              >
                <span className="text-lg font-medium pr-8">{faq.question}</span>
                <span className={`text-[#C2496B] font-medium text-2xl transition-transform duration-300 ${openIndex === i ? 'rotate-45' : ''}`}>
                  +
                </span>
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-8 pb-6 text-[#F7F5F0]/60 font-light leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Semantic AEO Schema */}
      <div className="sr-only">
        {faqs.map((faq, i) => (
          <article key={i}>
            <h2>{faq.question}</h2>
            <p>{faq.answer}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
