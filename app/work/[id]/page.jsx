import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';
import FinalCTA from '@/components/home/FinalCTA';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from('case_studies').select('title, short_description, industry').eq('id', id).single();
  
  if (!data) return { title: 'Case Study | Wellmade Digital' };
  
  return {
    title: `${data.title} | Customer Acquisition Case Study | Wellmade Digital`,
    description: data.short_description,
  };
}

export default async function CaseStudyPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: project, error } = await supabase
    .from('case_studies')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !project) {
    notFound();
  }

  // Parse results if they exist as JSONB, otherwise fallback
  let metrics = [];
  if (project.results && Array.isArray(project.results)) {
    metrics = project.results;
  } else {
    // Fallback metrics for layout demonstration
    metrics = [
      { label: 'Lead Volume', value: '+142%' },
      { label: 'Conversion Rate', value: '4.8%' },
      { label: 'Cost Per Acquisition', value: '-35%' },
    ];
  }

  return (
    <main className="relative w-full bg-[#0E0E0F] antialiased font-sans selection:bg-[#C2496B] selection:text-[#F7F5F0] overflow-x-hidden text-[#F7F5F0]">
      <Navbar />
      
      {/* Article Schema for GEO/AEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": `${project.title} - Digital Growth Case Study`,
            "description": project.short_description,
            "author": {
              "@type": "Organization",
              "name": "Wellmade Digital"
            }
          })
        }}
      />

      {/* Hero */}
      <section className="pt-40 pb-20 px-6 md:px-12 max-w-7xl mx-auto border-b border-[#F7F5F0]/10">
        <div className="text-[10px] uppercase tracking-widest font-bold text-[#C8A464] mb-8">
          CASE STUDY / {project.industry || 'Customer Acquisition'}
        </div>
        <h1 className="text-5xl md:text-7xl lg:text-[7rem] font-medium tracking-tighter leading-[0.9] mb-8">
          {project.title}
        </h1>
        <p className="text-xl md:text-2xl text-[#F7F5F0]/60 max-w-3xl font-light">
          {project.short_description}
        </p>
      </section>

      {/* Metrics Bar */}
      <section className="py-12 px-6 md:px-12 max-w-7xl mx-auto border-b border-[#F7F5F0]/10">
        <h2 className="sr-only">Business Outcomes</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {metrics.map((metric, i) => (
            <div key={i} className="flex flex-col">
              <span className="text-4xl md:text-5xl font-medium text-[#C2496B] mb-2">{metric.value}</span>
              <span className="text-[10px] uppercase tracking-widest font-bold text-[#F7F5F0]/50">{metric.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Main Editorial Body */}
          <div className="lg:col-span-8 flex flex-col gap-16">
            
            <div>
              <h2 className="text-3xl font-medium tracking-tighter mb-6">What was wrong?</h2>
              <div className="text-[#F7F5F0]/80 font-light text-lg leading-relaxed prose prose-invert">
                {project.problem ? <p>{project.problem}</p> : <p>The client lacked a predictable digital acquisition system, resulting in inconsistent lead volume and high customer acquisition costs.</p>}
              </div>
            </div>

            <div className="relative w-full rounded-2xl overflow-hidden bg-[#1A1A1B] border border-[#F7F5F0]/10">
              <img src={project.image_url || '/assets/pic1.PNG'} alt={project.title} className="w-full h-auto" />
            </div>

            <div>
              <h2 className="text-3xl font-medium tracking-tighter mb-6">What did Wellmade change?</h2>
              <div className="text-[#F7F5F0]/80 font-light text-lg leading-relaxed prose prose-invert">
                {project.solution ? <p>{project.solution}</p> : <p>We completely overhauled their digital infrastructure, deploying a high-converting Next.js website and mapping their sales process to a newly configured CRM.</p>}
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-medium tracking-tighter mb-6">The Implementation.</h2>
              <div className="text-[#F7F5F0]/80 font-light text-lg leading-relaxed prose prose-invert">
                <ul>
                  <li>Deployed targeted acquisition campaigns across Google Ads.</li>
                  <li>Engineered highly specific landing pages to capture search intent.</li>
                  <li>Automated speed-to-lead follow-ups via SMS and email.</li>
                  <li>Implemented end-to-end tracking to measure precise CAC.</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-medium tracking-tighter mb-6">What happened afterward?</h2>
              <div className="text-[#F7F5F0]/80 font-light text-lg leading-relaxed prose prose-invert">
                <p>By shifting from a static, brochure-style website to an integrated growth engine, the client established a predictable, scalable pipeline of qualified leads, drastically reducing their reliance on referrals.</p>
              </div>
            </div>

          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-32 p-8 bg-[#1A1A1B]/50 border border-[#F7F5F0]/10 rounded-2xl">
              <h3 className="text-xs font-bold text-[#C8A464] uppercase tracking-widest mb-6">Services Deployed</h3>
              <ul className="flex flex-col gap-4 text-[#F7F5F0]/80">
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#C2496B]"></span>
                  Digital Strategy
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#C2496B]"></span>
                  Conversion Web Design
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#C2496B]"></span>
                  CRM Automation
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#C2496B]"></span>
                  Workflow Automation
                </li>
              </ul>
              
              <div className="mt-12">
                <a href="/book" className="block w-full py-4 text-center bg-[#F7F5F0] text-[#0E0E0F] font-medium rounded-xl hover:bg-[#C2496B] hover:text-[#F7F5F0] transition-colors">
                  Build Your System
                </a>
              </div>
            </div>
          </div>
          
        </div>
      </section>

      <FinalCTA />
      <Footer />
    </main>
  );
}
