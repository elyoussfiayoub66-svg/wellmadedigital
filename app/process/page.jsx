import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';
import FinalCTA from '@/components/home/FinalCTA';
import ProcessTimeline from '@/components/process/ProcessTimeline';

export const metadata = {
  title: 'Process | Wellmade Digital',
  description: 'Our methodology for building digital systems.',
};

export default function ProcessPage() {
  return (
    <main className="relative w-full bg-[#0E0E0F] antialiased font-sans selection:bg-[#C2496B] selection:text-[#F7F5F0] overflow-x-hidden">
      <Navbar />
      <ProcessTimeline />
      <FinalCTA />
      <Footer />
    </main>
  );
}
