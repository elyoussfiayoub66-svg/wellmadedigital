import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';
import FinalCTA from '@/components/home/FinalCTA';
import WhoWeHelpGrid from '@/components/who-we-help/WhoWeHelpGrid';

export const metadata = {
  title: 'Industries We Serve | Wellmade Digital',
  description: 'Custom CRM systems and workflow automations tailored for dental clinics, aesthetic clinics, beauty salons, travel agencies, hotels, spas, and rental car agencies.',
};

export default function IndustriesIndexPage() {
  return (
    <main className="relative w-full bg-[#0E0E0F] antialiased font-sans selection:bg-[#C2496B] selection:text-[#F7F5F0]">
      <Navbar />
      <WhoWeHelpGrid />
      <FinalCTA />
      <Footer />
    </main>
  );
}
