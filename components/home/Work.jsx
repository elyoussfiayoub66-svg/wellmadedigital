import Link from 'next/link';

export default function Work({ projects }) {
  // Only take exactly 4 projects
  const recentProjects = projects?.slice(0, 4) || [];

  return (
    <section id="work" className="relative bg-[#0E0E0F] py-32 px-6 md:px-12 border-b border-[#F7F5F0]/10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div className="md:w-2/3">
            <div className="text-[10px] uppercase tracking-widest font-bold text-[#C8A464] mb-8">WHAT WE BUILD</div>
            <h2 className="text-4xl md:text-5xl font-medium tracking-tighter text-[#F7F5F0] leading-[1.1] mb-6">
              We don't build features.<br />
              <span className="text-[#C2496B]">We build outcomes.</span>
            </h2>
            <p className="text-xl text-[#F7F5F0]/60 font-light leading-relaxed max-w-2xl">
              Every system, dashboard, and website we deploy is measured by the hours of manual labor it eliminates and the direct revenue it generates.
            </p>
          </div>
          <Link href="/work" className="inline-block border-b border-[#F7F5F0]/30 pb-1 text-sm font-bold uppercase tracking-widest text-[#F7F5F0] hover:border-[#F7F5F0] transition-colors shrink-0">
            View All Work &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {recentProjects.map((project, i) => (
            <Link key={project.id} href={`/work/${project.id}`} className="group block relative overflow-hidden rounded-2xl bg-[#1A1A1B]/40 border border-[#F7F5F0]/10 hover:border-[#C2496B]/50 transition-colors">
              <div className="aspect-video w-full overflow-hidden relative">
                {project.image ? (
                  <img src={project.image} alt={project.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full bg-[#1A1A1B] flex items-center justify-center text-[#F7F5F0]/20">No Image</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E0F] via-transparent to-transparent opacity-80" />
              </div>
              <div className="p-8">
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.category && (
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-[#F7F5F0]/10 rounded text-[#F7F5F0]/70">{project.category}</span>
                  )}
                </div>
                <h3 className="text-2xl font-medium text-[#F7F5F0] mb-3 group-hover:text-[#C2496B] transition-colors">{project.name}</h3>
                <p className="text-[#F7F5F0]/60 font-light text-sm line-clamp-2">{project.description}</p>
                {/* Outcomes metric if available in your DB, otherwise static text */}
                <div className="mt-6 pt-6 border-t border-[#F7F5F0]/10 flex items-center gap-4 text-xs font-bold text-[#C8A464] uppercase tracking-wider">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                  Read Case Study
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
