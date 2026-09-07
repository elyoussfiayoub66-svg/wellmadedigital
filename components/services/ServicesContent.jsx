'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';

const services = [
  {
    id: 0,
    title: "Custom CRM Development",
    description: "Stop wrestling with messy spreadsheets and generic software. We build bespoke client management systems tailored to your exact operations, saving you countless hours of administrative chaos.",
    features: ["Custom Sales Pipelines", "Client Portals & Dashboards", "Secure Data Architecture", "Zero Monthly License Fees"],
    link: "/solutions/crm-automation"
  },
  {
    id: 1,
    title: "High-Performance Websites",
    description: "We don't just build websites. We engineer high-performance digital environments that position your brand at the absolute top of your market. Every pixel is designed to convert.",
    features: ["Conversion Rate Optimization", "Next.js Architecture", "Bespoke UI/UX", "SEO & Answer Engine Optimized"],
    link: "/work"
  },
  {
    id: 2,
    title: "Workflow Automation",
    description: "Manual data entry burns money. We implement intelligent, automated workflows that connect your disparate tools, process data instantly, and eliminate human error.",
    features: ["Automated Data Entry", "API Integrations", "Zapier/Make Workflows", "Operational Cost Reduction"],
    link: "/solutions/workflows"
  }
];

export default function ServicesContent() {
  return (
    <section className="relative bg-[#0E0E0F] text-[#F7F5F0] py-32 px-6 md:px-12 border-b border-[#F7F5F0]/10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-20 md:w-2/3">
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[10px] uppercase tracking-widest font-bold text-[#C8A464] mb-8">
            WHAT WE DO
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-4xl md:text-6xl font-medium tracking-tighter leading-[1.1] mb-8">
            Digital systems built to <span className="text-[#C2496B]">eliminate bottlenecks.</span>
          </motion.h2>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="text-xl text-[#F7F5F0]/60 font-light leading-relaxed">
            We replace manual chaos with automated precision. From custom databases to lightning-fast web architectures.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((svc, i) => (
            <motion.div 
              key={svc.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 + 0.2 }}
              className="bg-[#1A1A1B]/40 border border-[#F7F5F0]/10 rounded-2xl p-8 hover:border-[#C2496B]/50 transition-colors flex flex-col"
            >
              <h3 className="text-2xl font-medium tracking-tighter mb-4 text-[#F7F5F0]">{svc.title}</h3>
              <p className="text-[#F7F5F0]/70 font-light text-base mb-8 leading-relaxed flex-1">
                {svc.description}
              </p>
              
              <ul className="flex flex-col gap-3 mb-10">
                {svc.features.map((feat, fi) => (
                  <li key={fi} className="flex items-start gap-3 text-sm text-[#F7F5F0]/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C2496B] mt-1.5 shrink-0"></span> {feat}
                  </li>
                ))}
              </ul>
              
              <Link href={svc.link} className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#C2496B] hover:text-[#F7F5F0] transition-colors mt-auto">
                Explore Service &rarr;
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
