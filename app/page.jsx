import Navbar from '@/components/home/Navbar';
import Hero from '@/components/home/Hero';
import Philosophy from '@/components/home/Philosophy';
import Problem from '@/components/home/Problem';
import Approach from '@/components/home/Approach';
import Work from '@/components/home/Work';
import Services from '@/components/home/Services';
import Process from '@/components/home/Process';
import WhyWellmade from '@/components/home/WhyWellmade';
import SocialProof from '@/components/home/SocialProof';
import Insights from '@/components/home/Insights';
import FinalCTA from '@/components/home/FinalCTA';
import Footer from '@/components/home/Footer';
import LoginShortcut from '@/components/home/LoginShortcut';
import { getProjects } from '@/lib/data/fetchWork';

export const metadata = {
  title: 'Wellmade Digital | Editorial Design Studio',
  description: 'Digital experiences, made with intention.',
};

export default async function Home() {
  const projects = await getProjects();

  return (
    <main className="relative w-full bg-[#0E0E0F] antialiased font-sans selection:bg-[#C2496B] selection:text-[#F7F5F0] overflow-x-hidden">
      <LoginShortcut />
      <Navbar />
      <Hero />
      <Philosophy />
      <Problem />
      <Approach />
      <Work projects={projects} />
      <Services />
      <Process />
      <WhyWellmade />
      <SocialProof />
      <Insights />
      <FinalCTA />
      <Footer />
    </main>
  );
}
