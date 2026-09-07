'use client';
import { motion } from 'framer-motion';

const technologies = [
  { name: 'React', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg' },
  { name: 'Next.js', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg' },
  { name: 'PostgreSQL', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg' },
  { name: 'Supabase', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/supabase/supabase-original.svg' },
  { name: 'Node.js', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg' },
  { name: 'Tailwind CSS', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg' },
  { name: 'Python', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg' },
  { name: 'GraphQL', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/graphql/graphql-plain.svg' },
  { name: 'AWS', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg' },
  { name: 'Vercel', logo: 'https://assets.vercel.com/image/upload/v1588805858/repositories/vercel/logo.png' }
];

export default function TechStackSlider() {
  return (
    <section className="py-10 bg-[#0E0E0F] border-b border-[#F7F5F0]/10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-6">
        <p className="text-[10px] uppercase tracking-widest font-bold text-[#F7F5F0]/50 text-center">
          Powered by Enterprise-Grade Technology
        </p>
      </div>
      
      <div className="relative flex overflow-hidden">
        {/* Gradient Masks for smooth fade on edges */}
        <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-[#0E0E0F] to-transparent z-10"></div>
        <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-[#0E0E0F] to-transparent z-10"></div>

        <motion.div 
          className="flex whitespace-nowrap items-center gap-16 px-8"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, ease: "linear", duration: 25 }}
        >
          {/* Double the array for seamless infinite scroll */}
          {[...technologies, ...technologies, ...technologies].map((tech, i) => (
            <div key={i} className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0">
              <img src={tech.logo} alt={tech.name} className="h-8 md:h-10 w-auto object-contain" />
              <span className="text-[#F7F5F0] font-medium hidden md:block">{tech.name}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
