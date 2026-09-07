import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';
import FinalCTA from '@/components/home/FinalCTA';
import Link from 'next/link';

export const metadata = {
  title: 'Services | Custom CRM, Websites & Automation',
  description: 'We build digital systems that eliminate manual work. Discover our Custom CRMs, Workflow Automations, and High-Performance Websites tailored for your business.',
};

const services = [
  {
    title: "Workflow Automations",
    benefit: "Stop Doing Data Entry",
    description: "Every time a human copies and pastes data between two systems, you are losing money. We build automated bridges between your apps (Zapier, Make, custom APIs) so data flows instantly. When a lead comes in, they are immediately logged, assigned, and nurtured without anyone touching a keyboard.",
    outcomes: ["Instant Lead Response", "Elimination of Human Error", "Massive Time Savings"]
  },
  {
    title: "Custom CRMs",
    benefit: "Own Your Business Logic",
    description: "Generic CRMs force you to run your business their way. We build custom client management systems tailored exactly to how your sales and fulfillment teams actually work. You get the exact dashboards you need, built on ultra-fast databases (PostgreSQL/Supabase) that scale infinitely.",
    outcomes: ["No Monthly Seat Licenses", "Perfect Fit for Your Process", "Secure Data Ownership"]
  },
  {
    title: "High-Performance Websites",
    benefit: "Your 24/7 Sales Engine",
    description: "Your website shouldn't just look pretty—it should act as your best salesperson. We engineer lightning-fast Next.js web applications designed for conversion and structured for modern AI Answer Engines (AEO). Every page is built to capture demand and route it straight into your CRM.",
    outcomes: ["Sub-second Load Times", "SEO & AEO Optimized", "Higher Conversion Rates"]
  }
];

const faqs = [
  { q: "Do you offer monthly maintenance?", a: "We believe in building systems you own. While we offer SLAs for updates and feature additions, you are not trapped in a retainer just to keep the lights on." },
  { q: "What tech stack do you use?", a: "We exclusively build using modern, enterprise-grade tools: Next.js, React, Supabase (PostgreSQL), and TailwindCSS. This ensures your systems are secure and ridiculously fast." },
  { q: "How long does a build take?", a: "Most custom websites and automated pipelines take 4 to 8 weeks. Complex enterprise CRM architectures may take longer. We map the exact timeline during the discovery phase." }
];

export default function ServicesPage() {
  return (
    <main className="relative w-full bg-[#0E0E0F] text-[#F7F5F0] antialiased font-sans selection:bg-[#C2496B] selection:text-[#F7F5F0]">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 md:px-12 overflow-hidden border-b border-[#F7F5F0]/10">
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
           <img src="/assets/hero-crm.jpg" alt="Systems engineering abstract" className="w-full h-full object-cover" />
           <div className="absolute inset-0 bg-gradient-to-b from-[#0E0E0F] via-transparent to-[#0E0E0F]" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-medium tracking-tighter leading-[1.05] mb-6">
            Digital architecture that <span className="text-[#C2496B]">scales businesses.</span>
          </h1>
          <p className="text-xl text-[#F7F5F0]/70 font-light leading-relaxed max-w-2xl mx-auto">
            We don't sell generic services. We engineer bespoke operational systems—automations, CRMs, and websites—that directly impact your bottom line by eliminating manual chaos.
          </p>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-32 px-6 md:px-12">
        <div className="max-w-7xl mx-auto space-y-24">
          {services.map((svc, i) => (
            <div key={i} className={`flex flex-col ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-12 md:gap-24 items-center`}>
              <div className="w-full md:w-1/2">
                <div className="aspect-video w-full bg-[#1A1A1B]/40 rounded-2xl border border-[#F7F5F0]/10 overflow-hidden flex items-center justify-center p-12">
                  <div className="text-[#F7F5F0]/20 text-[120px] font-bold tracking-tighter pointer-events-none">0{i+1}</div>
                </div>
              </div>
              <div className="w-full md:w-1/2">
                <div className="text-[10px] uppercase tracking-widest font-bold text-[#C8A464] mb-4">{svc.benefit}</div>
                <h2 className="text-4xl font-medium tracking-tighter mb-6 text-[#F7F5F0]">{svc.title}</h2>
                <p className="text-lg text-[#F7F5F0]/70 font-light leading-relaxed mb-8">{svc.description}</p>
                <ul className="space-y-3">
                  {svc.outcomes.map((outcome, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-sm font-medium text-[#F7F5F0]">
                       <span className="w-1.5 h-1.5 rounded-full bg-[#C2496B]"></span>
                       {outcome}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Target Audience & Approach */}
      <section className="py-32 px-6 md:px-12 bg-[#1A1A1B]/20 border-y border-[#F7F5F0]/10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20">
          <div>
            <h2 className="text-3xl font-medium tracking-tighter mb-6 text-[#F7F5F0]">Who this is for.</h2>
            <p className="text-[#F7F5F0]/70 font-light leading-relaxed mb-6">
              Our systems are strictly engineered for service-based businesses that rely heavily on scheduling, client data management, and operational fulfillment. 
            </p>
            <p className="text-[#F7F5F0]/70 font-light leading-relaxed">
              If your team spends more than 10 hours a week doing manual data entry, answering routine emails, or tracking down leads in messy spreadsheets, our systems are built exactly for you. We partner with Clinics, Hotels, Agencies, and High-Ticket Consultancies.
            </p>
          </div>
          <div>
            <h2 className="text-3xl font-medium tracking-tighter mb-6 text-[#F7F5F0]">Our approach.</h2>
            <p className="text-[#F7F5F0]/70 font-light leading-relaxed mb-6">
              We operate under the philosophy of <strong>"Eliminate, Automate, Delegate."</strong>
            </p>
            <p className="text-[#F7F5F0]/70 font-light leading-relaxed">
              Before writing code, we map your entire operational structure. We eliminate redundant steps, automate what computers should do, and build interfaces so clean that delegation becomes effortless.
            </p>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-32 px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-medium tracking-tighter mb-4 text-[#F7F5F0]">Common Questions</h2>
          </div>
          <div className="space-y-6">
            {faqs.map((f, i) => (
              <div key={i} className="border-b border-[#F7F5F0]/10 pb-6">
                <h3 className="text-lg font-medium text-[#F7F5F0] mb-3">{f.q}</h3>
                <p className="text-[#F7F5F0]/60 font-light leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FinalCTA />
      <Footer />
    </main>
  );
}
