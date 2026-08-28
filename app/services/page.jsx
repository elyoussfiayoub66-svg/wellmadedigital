import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';
import FinalCTA from '@/components/home/FinalCTA';
import ServicesContent from '@/components/services/ServicesContent';

export const metadata = {
  title: 'Services | Wellmade Digital',
  description: 'Website Design, CRM Development, and AI Automation.',
};

export default function ServicesPage() {
  return (
    <main className="relative w-full bg-[#0E0E0F] antialiased font-sans selection:bg-[#C2496B] selection:text-[#F7F5F0] overflow-x-hidden">
      <Navbar />
      <ServicesContent />
      <FinalCTA />
      <Footer />
    </main>
  );
}
