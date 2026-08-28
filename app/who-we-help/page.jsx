import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';
import FinalCTA from '@/components/home/FinalCTA';
import WhoWeHelpGrid from '@/components/who-we-help/WhoWeHelpGrid';

export const metadata = {
  title: 'Who We Help | Wellmade Digital',
  description: 'Specialized digital systems for clinics, real estate, travel, and luxury sectors.',
};

export default function WhoWeHelpPage() {
  return (
    <main className="relative w-full bg-[#0E0E0F] antialiased font-sans selection:bg-[#C2496B] selection:text-[#F7F5F0]">
      <Navbar />
      <WhoWeHelpGrid />
      <FinalCTA />
      <Footer />
    </main>
  );
}
