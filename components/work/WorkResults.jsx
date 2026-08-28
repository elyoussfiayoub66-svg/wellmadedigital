'use client';
export default function WorkResults() {
  const stats = [
    { num: '+42%', label: 'Conversion Rate' },
    { num: '3.2×', label: 'More Qualified Leads' },
    { num: '-38%', label: 'Drop-off Rate' },
    { num: '+120%', label: 'User Engagement' }
  ];

  return (
    <section className="py-40 bg-[#F7F5F0] text-[#0E0E0F] px-6 md:px-12 border-t border-[#0E0E0F]/10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16 md:gap-32">
        <div className="md:w-1/3">
          <h2 className="text-5xl md:text-6xl font-medium tracking-tighter mb-8 leading-[1.0]">Did it actually <span className="text-[#C2496B]">work?</span></h2>
          <p className="text-[#0E0E0F]/60 text-lg font-light leading-relaxed">
            Beautiful design is meaningless if it doesn't move the needle. Our focus is always on engineering clear business outcomes.
          </p>
        </div>
        
        <div className="md:w-2/3 grid grid-cols-2 gap-y-20 gap-x-12">
          {stats.map((s, i) => (
            <div key={i} className="border-t border-[#0E0E0F]/20 pt-8 relative group cursor-default">
              {/* Subtle hover line */}
              <div className="absolute top-[-1px] left-0 w-0 h-[2px] bg-[#C2496B] group-hover:w-full transition-all duration-500 ease-out" />
              <div className="text-6xl md:text-7xl font-medium tracking-tighter mb-4">{s.num}</div>
              <div className="text-xs uppercase tracking-widest font-bold text-[#0E0E0F]/50">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
