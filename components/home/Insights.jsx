'use client';
export default function Insights() {
  const articles = [
    { cat: 'DESIGN', title: "Why most business websites don't convert" },
    { cat: 'STRATEGY', title: "The difference between a website and a digital experience" },
    { cat: 'PERFORMANCE', title: "Designing for attention, trust and action" }
  ];

  return (
    <section id="insights" className="py-40 bg-[#0E0E0F] text-[#F7F5F0] px-6 md:px-12 border-t border-[#F7F5F0]/10">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-6xl md:text-[7rem] font-medium tracking-tighter leading-[1.0] mb-32 max-w-4xl">
          THINKING BEHIND <br/><span className="text-[#C8A464]">THE WORK.</span>
        </h2>
        
        <div className="flex flex-col border-t border-[#F7F5F0]/10">
          {articles.map((a, i) => (
            <div key={i} className="group py-12 border-b border-[#F7F5F0]/10 flex flex-col md:flex-row justify-between items-start md:items-center cursor-pointer relative overflow-hidden transition-transform hover:translate-x-4">
              <div className="flex items-center gap-12 relative z-10 w-full">
                <div className="text-4xl md:text-5xl font-serif italic text-[#F7F5F0]/20 font-light">0{i+1}</div>
                <div className="flex-1">
                  <div className="text-[10px] font-bold tracking-[0.2em] text-[#C8A464] mb-2">{a.cat}</div>
                  <h3 className="text-3xl md:text-4xl font-medium tracking-tight text-[#F7F5F0] group-hover:text-[#C2496B] transition-colors">{a.title}</h3>
                </div>
                <div className="hidden md:flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-[#F7F5F0]/50 group-hover:text-[#F7F5F0]">
                  <span>Read Article</span>
                  <span className="group-hover:translate-x-2 transition-transform">&rarr;</span>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 h-[1px] bg-[#C2496B] w-0 group-hover:w-full transition-all duration-700 ease-out" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
