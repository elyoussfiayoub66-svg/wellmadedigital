import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';
import FinalCTA from '@/components/home/FinalCTA';

export const metadata = {
  title: 'Process | How We Work',
  description: 'What happens after you contact us? Discover our 6-step engineering methodology: Discovery, Planning, Design, Build, Launch, and Improve.',
};

const processSteps = [
  {
    name: "Discovery Meeting",
    desc: "We don't pitch. We listen. In our first meeting, we dissect your current operational bottlenecks, review your software stack, and calculate exactly how much time and money manual tasks are costing you."
  },
  {
    name: "Planning & Architecture",
    desc: "If we determine we can help, we map out the entire data flow. We decide which databases to use (usually PostgreSQL), what APIs need to be connected, and outline the exact logic for your automated workflows."
  },
  {
    name: "UI/UX Design",
    desc: "We design the interfaces your team and your clients will actually use. We focus on obsessive minimalism—removing every unnecessary click so that adoption rates are 100%."
  },
  {
    name: "Engineering & Build",
    desc: "Our engineers write the code. We build custom front-ends in Next.js, configure secure Supabase backends, and rig up Zapier/Make automations to connect your legacy tools."
  },
  {
    name: "Launch & Training",
    desc: "We deploy the system to your live domain. But we don't just hand over the keys—we actively train your team on how to use their new CRM or dashboard until they are entirely comfortable."
  },
  {
    name: "Iterate & Improve",
    desc: "A system is never truly finished. We monitor how your team uses the tools and make data-driven tweaks to ensure it scales perfectly as your business volume grows."
  }
];

export default function ProcessPage() {
  return (
    <main className="relative w-full bg-[#0E0E0F] text-[#F7F5F0] antialiased font-sans selection:bg-[#C2496B] selection:text-[#F7F5F0]">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-48 pb-24 px-6 md:px-12 border-b border-[#F7F5F0]/10 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="text-[10px] uppercase tracking-widest font-bold text-[#C8A464] mb-6">OUR METHODOLOGY</div>
          <h1 className="text-5xl md:text-7xl font-medium tracking-tighter leading-[1.05] mb-8">
            What happens after you <span className="text-[#C2496B]">contact us?</span>
          </h1>
          <p className="text-xl text-[#F7F5F0]/70 font-light leading-relaxed max-w-2xl mx-auto">
            Building enterprise-grade systems requires extreme discipline. Here is our exact 6-step blueprint for taking your business from operational chaos to automated precision.
          </p>
        </div>
      </section>

      {/* The 6 Steps */}
      <section className="py-32 px-6 md:px-12 max-w-5xl mx-auto">
        <div className="space-y-16">
          {processSteps.map((step, i) => (
            <div key={i} className="flex flex-col md:flex-row gap-8 md:gap-16 items-start group">
              <div className="md:w-1/4 pt-2">
                <div className="text-[80px] font-bold leading-none tracking-tighter text-[#1A1A1B] group-hover:text-[#C2496B]/20 transition-colors">
                  0{i + 1}
                </div>
              </div>
              <div className="md:w-3/4 border-l border-[#F7F5F0]/10 pl-8 md:pl-16 relative">
                {/* Connecting dot */}
                <div className="absolute top-6 -left-[5px] w-2.5 h-2.5 rounded-full bg-[#C2496B] hidden md:block"></div>
                
                <h2 className="text-3xl font-medium tracking-tighter text-[#F7F5F0] mb-4">{step.name}</h2>
                <p className="text-lg text-[#F7F5F0]/70 font-light leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* What to Expect */}
      <section className="py-32 px-6 md:px-12 bg-[#1A1A1B]/20 border-y border-[#F7F5F0]/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-medium tracking-tighter mb-12 text-[#F7F5F0]">What you can expect.</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 border border-[#F7F5F0]/10 rounded-2xl bg-[#0E0E0F]">
              <h3 className="text-xl font-medium mb-3 text-[#F7F5F0]">Radical Honesty</h3>
              <p className="text-[#F7F5F0]/60 font-light text-sm leading-relaxed">If we audit your business and realize you just need a $20 Zapier account instead of a custom $15k CRM, we will tell you.</p>
            </div>
            <div className="p-8 border border-[#F7F5F0]/10 rounded-2xl bg-[#0E0E0F]">
              <h3 className="text-xl font-medium mb-3 text-[#F7F5F0]">Zero Jargon</h3>
              <p className="text-[#F7F5F0]/60 font-light text-sm leading-relaxed">We speak in terms of business impact. We don't hide behind confusing technical acronyms. We explain exactly what we are building and why.</p>
            </div>
            <div className="p-8 border border-[#F7F5F0]/10 rounded-2xl bg-[#0E0E0F]">
              <h3 className="text-xl font-medium mb-3 text-[#F7F5F0]">Total Ownership</h3>
              <p className="text-[#F7F5F0]/60 font-light text-sm leading-relaxed">Once the build is complete and paid for, you own the IP. No holding your data hostage. No mandatory monthly maintenance fees.</p>
            </div>
          </div>
        </div>
      </section>

      <FinalCTA />
      <Footer />
    </main>
  );
}
