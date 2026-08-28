'use client';
export default function ClientPerspective() {
  return (
    <section className="py-40 bg-[#0E0E0F] text-[#F7F5F0] px-6 md:px-12 relative overflow-hidden flex items-center min-h-[70vh]">
      {/* Super subtle background line */}
      <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-gradient-to-r from-[#0E0E0F] via-[#C2496B]/20 to-[#0E0E0F] pointer-events-none transform -translate-y-1/2" />
      
      <div className="max-w-5xl mx-auto text-center relative z-10">
        <div className="text-[10px] uppercase tracking-widest font-bold text-[#C8A464] mb-12">CLIENT PERSPECTIVE</div>
        <h2 className="text-4xl md:text-6xl font-medium tracking-tighter leading-[1.1] mb-16">
          "Wellmade didn't just redesign our website. They completely changed how we present the business to the world. The clarity and precision they brought is unmatched."
        </h2>
        <div className="inline-block border-t border-[#F7F5F0]/20 pt-8">
          <div className="font-medium text-lg">Marcus Sterling</div>
          <div className="text-xs uppercase tracking-widest font-bold text-[#F7F5F0]/40 mt-2">Founder & CEO, Sterling Tech</div>
        </div>
      </div>
    </section>
  );
}
