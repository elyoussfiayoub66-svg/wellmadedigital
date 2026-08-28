'use client';
export default function SocialProof() {
  return (
    <section className="py-40 bg-[#F7F5F0] text-[#0E0E0F] px-6 md:px-12 border-t border-[#0E0E0F]/10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-24">
        <div className="md:w-1/2">
          <h2 className="text-4xl md:text-5xl font-medium tracking-tighter mb-12">"Wellmade delivered a platform that fundamentally changed how our customers interact with us."</h2>
          <div className="text-sm font-bold uppercase tracking-widest text-[#0E0E0F]/60">Sarah Jenkins, CEO @ TechFlow</div>
        </div>
        <div className="md:w-1/2 flex flex-col justify-center">
          <div className="grid grid-cols-2 gap-12">
            <div>
              <div className="text-6xl font-medium text-[#C2496B] mb-2">40+</div>
              <div className="text-xs uppercase tracking-widest font-bold text-[#0E0E0F]/50">Projects Delivered</div>
            </div>
            <div>
              <div className="text-6xl font-medium text-[#C2496B] mb-2">12</div>
              <div className="text-xs uppercase tracking-widest font-bold text-[#0E0E0F]/50">Industry Awards</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
