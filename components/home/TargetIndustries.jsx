'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';

const industries = [
  { name: "Dental Clinics", slug: "dental-clinics" },
  { name: "Aesthetic Clinics", slug: "aesthetic-clinics" },
  { name: "Beauty Salons", slug: "beauty-salons" },
  { name: "Travel Agencies", slug: "travel-agencies" },
  { name: "Hotels", slug: "hotels" },
  { name: "Spas", slug: "spas" },
  { name: "Rental Car Agencies", slug: "rental-car-agencies" },
];

export default function TargetIndustries() {
  return (
    <section className="bg-[#0E0E0F] text-[#F7F5F0] py-32 px-6 md:px-12 border-b border-[#F7F5F0]/10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16 items-center">
        
        <div className="w-full md:w-1/2">
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[10px] uppercase tracking-widest font-bold text-[#C8A464] mb-8">
            WHO WE HELP
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl font-medium tracking-tighter leading-[1.1] mb-8">
            Engineered for <br/> <span className="text-[#C2496B]">service-based businesses.</span>
          </motion.h2>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="text-xl text-[#F7F5F0]/60 font-light leading-relaxed mb-10">
            We don't build generic solutions. We construct highly specialized operational pipelines, booking engines, and CRM architectures for industries that rely on client retention and seamless scheduling.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
            <Link href="/industries" className="inline-flex items-center gap-3 bg-[#1A1A1B] border border-[#F7F5F0]/10 hover:border-[#C2496B] px-8 py-4 rounded-lg font-medium transition-all">
              View All Industries &rarr;
            </Link>
          </motion.div>
        </div>

        <div className="w-full md:w-1/2">
          <div className="flex flex-wrap gap-4">
            {industries.map((ind, i) => (
              <motion.div
                key={ind.slug}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link href={`/industries/${ind.slug}`} className="block px-6 py-3 rounded-full border border-[#F7F5F0]/20 text-sm font-medium hover:bg-[#C2496B] hover:border-[#C2496B] transition-colors">
                  {ind.name}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
