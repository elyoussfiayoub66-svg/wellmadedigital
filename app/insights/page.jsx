import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';
import FinalCTA from '@/components/home/FinalCTA';
import Link from 'next/link';

export const metadata = {
  title: 'Insights & Research | Wellmade Digital',
  description: 'Foundational guides, original research, and data-driven insights on custom CRMs, workflow automations, and operational efficiency.',
};

export default function InsightsPage() {
  const guides = [
    {
      title: "The 5-Minute Survival Rule",
      description: "Original research on how lead response time impacts conversion rates for service businesses.",
      category: "Research",
      href: "/research/lead-response-benchmark"
    },
    {
      title: "Speed-to-Lead Economics",
      description: "How automating your CRM follow-ups within 5 minutes can 21x your conversion rate.",
      category: "Automation",
      href: "#"
    },
    {
      title: "Conversion-First Web Design",
      description: "Stop building digital brochures. Start engineering environments that convert traffic into qualified leads.",
      category: "Conversion",
      href: "#"
    }
  ];

  return (
    <main className="relative w-full bg-[#0E0E0F] antialiased font-sans selection:bg-[#C2496B] selection:text-[#F7F5F0] overflow-x-hidden text-[#F7F5F0]">
      <Navbar />
      
      <section className="pt-40 pb-20 px-6 md:px-12 max-w-7xl mx-auto border-b border-[#F7F5F0]/10">
        <div className="text-[10px] uppercase tracking-widest font-bold text-[#C8A464] mb-8">
          INSIGHTS & RESEARCH
        </div>
        <h1 className="text-5xl md:text-7xl lg:text-[7rem] font-medium tracking-tighter leading-[0.9] mb-8">
          The Growth <br /> <span className="text-[#C2496B]">Library.</span>
        </h1>
        <p className="text-xl md:text-2xl text-[#F7F5F0]/60 max-w-3xl font-light">
          Original research and tactical methodologies for service businesses looking to scale their customer acquisition.
        </p>
      </section>

      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <h2 className="text-3xl font-medium tracking-tighter mb-12">Foundational Guides</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {guides.map((guide, i) => (
            <Link key={i} href={guide.href} className="group block p-8 bg-[#1A1A1B]/30 border border-[#F7F5F0]/5 rounded-2xl hover:border-[#C2496B]/50 transition-colors">
              <div className="text-[10px] uppercase tracking-widest font-bold text-[#C8A464] mb-4">
                {guide.category}
              </div>
              <h3 className="text-2xl font-medium mb-4 group-hover:text-[#C2496B] transition-colors">{guide.title}</h3>
              <p className="text-[#F7F5F0]/60 font-light leading-relaxed">{guide.description}</p>
              
              <div className="mt-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#F7F5F0]">
                Read Guide <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-t border-[#F7F5F0]/10">
        <div className="bg-gradient-to-r from-[#C2496B]/20 to-transparent border border-[#C2496B]/30 rounded-2xl p-8 md:p-16 flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-2/3">
            <h2 className="text-3xl md:text-5xl font-medium tracking-tighter mb-4">Original Research.</h2>
            <p className="text-lg text-[#F7F5F0]/70 font-light max-w-lg mb-8">
              We are currently compiling the 2026 Service Business Digital Acquisition Benchmark. Subscribe to receive the raw data when it is published.
            </p>
            <div className="flex w-full max-w-md">
              <input type="email" placeholder="Email address" className="bg-[#0E0E0F] border border-[#F7F5F0]/20 rounded-l-lg px-4 py-3 w-full outline-none focus:border-[#C2496B]" />
              <button className="bg-[#C2496B] text-[#F7F5F0] px-6 py-3 rounded-r-lg font-medium hover:bg-[#A33D5A] transition-colors">Notify Me</button>
            </div>
          </div>
          <div className="md:w-1/3 text-center">
             <div className="w-32 h-32 mx-auto bg-[#C2496B]/10 rounded-full flex items-center justify-center border border-[#C2496B]/30">
               <span className="text-4xl">📊</span>
             </div>
          </div>
        </div>
      </section>

      <FinalCTA />
      <Footer />
    </main>
  );
}
