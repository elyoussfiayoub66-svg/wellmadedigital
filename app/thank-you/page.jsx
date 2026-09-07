import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';
import Link from 'next/link';

export const metadata = {
  title: 'Thank You | Wellmade Digital',
  description: 'Your booking has been received.',
};

export default function ThankYouPage() {
  return (
    <main className="relative w-full bg-[#0E0E0F] text-[#F7F5F0] min-h-screen flex flex-col antialiased font-sans selection:bg-[#C2496B] selection:text-[#F7F5F0]">
      <Navbar />
      
      <div className="flex-1 flex flex-col items-center justify-center pt-32 pb-20 px-6 md:px-12 text-center relative overflow-hidden">
        
        {/* Abstract Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#C2496B]/5 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="relative z-10 max-w-2xl mx-auto border border-[#F7F5F0]/10 bg-[#1A1A1B]/40 p-12 md:p-20 rounded-3xl backdrop-blur-md shadow-2xl">
          <div className="w-20 h-20 bg-[#C2496B]/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-[#C2496B]/30">
            <svg className="w-10 h-10 text-[#C2496B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-medium tracking-tighter mb-6 text-[#F7F5F0]">
            Meeting Requested.
          </h1>
          
          <p className="text-lg text-[#F7F5F0]/70 font-light leading-relaxed mb-10">
            Thank you for reaching out. We have received your system requirements and preferred time slot. 
            <br className="hidden md:block" />
            <strong className="text-[#F7F5F0] font-medium mt-4 block">Next Step:</strong> Our team will review your application and contact you as soon as possible to officially confirm the meeting and send you the calendar invite.
          </p>

          <Link href="/" className="inline-flex items-center gap-3 bg-[#F7F5F0] text-[#0E0E0F] px-8 py-4 rounded-lg font-bold text-sm tracking-widest uppercase hover:bg-[#C8A464] hover:text-[#F7F5F0] transition-colors">
            Return to Homepage &rarr;
          </Link>
        </div>

      </div>

      <Footer />
    </main>
  );
}
