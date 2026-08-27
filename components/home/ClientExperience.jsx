'use client';
export default function ClientExperience() {
  return (
    <section className="relative py-40 bg-[#0E0E0F] text-[#F7F5F0] px-6 md:px-12 min-h-[80vh] flex items-center justify-center overflow-hidden">
      
      {/* Animated Raspberry noise/gradient */}
      <div className="absolute inset-0 pointer-events-none opacity-20 mix-blend-screen bg-[radial-gradient(circle_at_50%_50%,_#C2496B_0%,_transparent_60%)] animate-pulse" style={{ animationDuration: '6s' }} />

      <div className="max-w-5xl mx-auto relative z-10 text-center">
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-serif italic font-medium leading-[1.2] mb-16 tracking-tight">
          "Wellmade changed the way our business shows up online."
        </h2>
        <div>
          <div className="font-bold text-xl mb-2 uppercase tracking-widest text-[#F7F5F0]">Jane Doe</div>
          <div className="text-[#C8A464] text-xs uppercase tracking-[0.2em] font-medium">Founder — Company</div>
        </div>
      </div>
    </section>
  );
}
