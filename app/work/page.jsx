import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';
import FinalCTA from '@/components/home/FinalCTA';
import FeaturedWork from '@/components/work/FeaturedWork';
import SelectedProjects from '@/components/work/SelectedProjects';
import WorkArchive from '@/components/work/WorkArchive';

import { getProjects } from '@/lib/data/fetchWork';

export const metadata = {
  title: 'Work | Case Studies & Deployments',
  description: 'Explore the custom CRMs and automated workflows we have engineered for service-based businesses.',
};

export default async function WorkPage() {
  const projects = await getProjects();
  
  const featured = projects.length > 0 ? projects[0] : null;
  const selected = projects.length > 1 ? projects.slice(1, 4) : [];
  const archive = projects;

  return (
    <main className="relative w-full bg-[#0E0E0F] text-[#F7F5F0] antialiased font-sans selection:bg-[#C2496B] selection:text-[#F7F5F0]">
      <Navbar />
      
      {/* Main Headline & Intro */}
      <section className="pt-48 pb-24 px-6 md:px-12 border-b border-[#F7F5F0]/10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-[10px] uppercase tracking-widest font-bold text-[#C8A464] mb-6">CASE STUDIES</div>
          <h1 className="text-5xl md:text-7xl font-medium tracking-tighter leading-[1.05] mb-8">
            Proof of <span className="text-[#C2496B]">performance.</span>
          </h1>
          <p className="text-xl text-[#F7F5F0]/70 font-light leading-relaxed max-w-2xl mx-auto">
            We don't measure success by how pretty a website is. We measure it by hours saved, manual tasks eliminated, and revenue generated. Explore our recent deployments below.
          </p>
        </div>
      </section>
      
      {/* Projects - Kept as is */}
      {featured && <FeaturedWork project={featured} />}
      {selected.length > 0 && <SelectedProjects projects={selected} />}
      
      {projects.length === 0 && (
        <section className="py-40 text-center text-[#F7F5F0]/50 font-light border-b border-[#F7F5F0]/10">
          <p>No published case studies available yet.</p>
        </section>
      )}

      {archive.length > 0 && <WorkArchive projects={archive} />}
      
      <FinalCTA />
      
      <Footer />
    </main>
  );
}
