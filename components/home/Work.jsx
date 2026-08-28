'use client';
import Image from 'next/image';

export default function Work({ projects = [] }) {
  const displayProjects = projects.slice(0, 4);

  return (
    <section id="work" className="py-40 bg-[#0E0E0F] text-[#F7F5F0] px-6 md:px-12 border-t border-[#F7F5F0]/5">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-24 border-b border-[#F7F5F0]/10 pb-8">
          <h2 className="text-5xl md:text-7xl font-medium tracking-tighter">SELECTED WORK</h2>
          <a href="/work" className="hidden md:block text-xs uppercase tracking-widest font-bold text-[#F7F5F0]/50 hover:text-[#C2496B] transition-colors">View All &rarr;</a>
        </div>

        {displayProjects.length === 0 ? (
          <div className="text-center py-20 text-[#F7F5F0]/40 font-light text-lg">
            Case studies are currently being populated. Check back soon.
          </div>
        ) : (
          <div className="flex flex-col gap-32">
            {displayProjects.map((p, i) => {
              const isLarge = i % 2 === 0;
              return (
                <div key={p.id} className={`flex flex-col ${isLarge ? 'md:flex-row' : 'md:flex-row-reverse'} gap-12 md:gap-24 group cursor-pointer`}>
                  <div className={`w-full ${isLarge ? 'md:w-2/3' : 'md:w-1/2'} overflow-hidden bg-[#1A1A1B]`}>
                    <div className="relative w-full aspect-[4/3] transform transition-transform duration-700 group-hover:scale-105 origin-center">
                      <Image src={p.image} alt={p.name} fill className="object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  
                  <div className={`w-full ${isLarge ? 'md:w-1/3' : 'md:w-1/2'} flex flex-col justify-center`}>
                    <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#C8A464] mb-6">{p.category}</div>
                    <h3 className="text-4xl md:text-5xl font-medium tracking-tighter mb-6 group-hover:text-[#C2496B] transition-colors">{p.name}</h3>
                    <p className="text-[#F7F5F0]/60 font-light mb-12 text-lg">{p.description}</p>
                    
                    <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-[#F7F5F0]">
                      <span className="w-0 h-[1px] bg-[#C2496B] group-hover:w-8 transition-all duration-300"></span>
                      <span className="group-hover:text-[#C2496B] transition-colors">View Case Study</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
