'use client';
export default function Footer() {
  return (
    <footer className="bg-[#0E0E0F] text-[#F7F5F0] px-6 md:px-12 pt-20 pb-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end border-t border-[#F7F5F0]/10 pt-10">
        
        <div className="mb-12 md:mb-0">
          <div className="mb-4">
            <img src="/assets/logo.png?v=2" alt="Wellmade Digital Logo" className="h-[90px] w-auto object-contain" />
          </div>
          <div className="text-sm font-serif italic text-[#C8A464]">Digital systems built for growth.</div>
        </div>

        <div className="flex flex-col md:flex-row gap-12 md:gap-24 text-[10px] uppercase tracking-widest font-bold text-[#F7F5F0]/50">
          <div className="flex flex-col gap-4">
            <span className="text-[#C2496B]">Solutions</span>
            <a href="/solutions/crm-automation" className="hover:text-[#F7F5F0]">CRM Systems</a>
            <a href="/solutions/workflows" className="hover:text-[#F7F5F0]">Workflow Automations</a>
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-[#C2496B]">Industries</span>
            <a href="/industries/dental-clinics" className="hover:text-[#F7F5F0]">Dental Clinics</a>
            <a href="/industries/aesthetic-clinics" className="hover:text-[#F7F5F0]">Aesthetic Clinics</a>
            <a href="/industries/beauty-salons" className="hover:text-[#F7F5F0]">Beauty Salons</a>
            <a href="/industries/spas" className="hover:text-[#F7F5F0]">Spas</a>
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-[#C2496B]">More Industries</span>
            <a href="/industries/travel-agencies" className="hover:text-[#F7F5F0]">Travel Agencies</a>
            <a href="/industries/hotels" className="hover:text-[#F7F5F0]">Hotels</a>
            <a href="/industries/rental-car-agencies" className="hover:text-[#F7F5F0]">Rental Car Agencies</a>
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-[#C2496B]">Contact</span>
            <a href="mailto:hello@wellmade.com" className="hover:text-[#F7F5F0]">hello@wellmade.com</a>
            <a href="/insights" className="hover:text-[#F7F5F0] mt-2">Insights & Research</a>
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-[#C2496B]">Legal</span>
            <span>© 2026 Wellmade Digital.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
