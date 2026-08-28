'use client';
export default function Services() {
  const services = ['STRATEGY', 'WEB DESIGN', 'DEVELOPMENT', 'DIGITAL EXPERIENCES', 'GROWTH'];
  
  return (
    <section id="services" className="py-40 bg-[#0E0E0F] text-[#F7F5F0] px-6 md:px-12 border-t border-[#F7F5F0]/5 relative min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto w-full relative z-10">
        <h2 className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#C8A464] mb-16">WHAT WE DO</h2>
        
        <div className="flex flex-col">
          {services.map((s, i) => (
            <div key={i} className="group py-10 md:py-16 border-b border-[#F7F5F0]/10 flex items-baseline gap-8 cursor-pointer relative overflow-hidden">
              <span className="text-sm md:text-lg font-serif italic text-[#F7F5F0]/30 group-hover:text-[#C2496B] transition-colors w-12">0{i+1}</span>
              <h3 className="text-5xl md:text-[6rem] lg:text-[7rem] font-medium tracking-tighter text-[#F7F5F0]/60 group-hover:text-[#F7F5F0] transition-colors duration-500 relative z-10">
                {s}
              </h3>
              {/* Subtle hover indicator */}
              <div className="absolute left-0 bottom-0 h-[1px] w-0 bg-[#C2496B] group-hover:w-full transition-all duration-700 ease-out" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
