import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';
import FinalCTA from '@/components/home/FinalCTA';
import WorkHero from '@/components/work/WorkHero';
import FeaturedWork from '@/components/work/FeaturedWork';
import SelectedProjects from '@/components/work/SelectedProjects';
import Transformation from '@/components/work/Transformation';
import WorkResults from '@/components/work/WorkResults';
import ClientPerspective from '@/components/work/ClientPerspective';
import WorkArchive from '@/components/work/WorkArchive';

import { getProjects } from '@/lib/data/fetchWork';

export const metadata = {
  title: 'Work | Wellmade Digital',
  description: 'Selected work by Wellmade Digital.',
};

export default async function WorkPage() {
  const projects = await getProjects();
  
  const featured = projects.length > 0 ? projects[0] : null;
  const selected = projects.length > 1 ? projects.slice(1, 4) : [];
  const archive = projects;

  return (
    <main className="relative w-full bg-[#0E0E0F] antialiased font-sans selection:bg-[#C2496B] selection:text-[#F7F5F0] overflow-x-hidden">
      <Navbar />
      
      <WorkHero />
      
      {/* Only render these sections if database returns data */}
      {featured && <FeaturedWork project={featured} />}
      {selected.length > 0 && <SelectedProjects projects={selected} />}
      
      {projects.length === 0 && (
        <section className="py-40 text-center text-[#F7F5F0]/50 font-light border-b border-[#F7F5F0]/10">
          <p>No published case studies available yet.</p>
        </section>
      )}

      <Transformation />
      <WorkResults />
      <ClientPerspective />
      
      {archive.length > 0 && <WorkArchive projects={archive} />}
      
      <FinalCTA />
      
      <Footer />
    </main>
  );
}
