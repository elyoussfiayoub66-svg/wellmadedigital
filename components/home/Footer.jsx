'use client';
export default function Footer() {
  return (
    <footer className="bg-[#0E0E0F] text-[#F7F5F0] px-6 md:px-12 pt-20 pb-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end border-t border-[#F7F5F0]/10 pt-10">
        
        <div className="mb-12 md:mb-0">
          <div className="mb-4">
            <img src="/assets/logo.png?v=2" alt="Wellmade Digital Logo" className="h-[90px] w-auto object-contain" />
          </div>
          <div className="text-sm font-serif italic text-[#C8A464]">Digital experiences, made well.</div>
        </div>

        <div className="flex flex-col md:flex-row gap-12 md:gap-24 text-[10px] uppercase tracking-widest font-bold text-[#F7F5F0]/50">
          <div className="flex flex-col gap-4">
            <a href="#" className="hover:text-[#F7F5F0]">Twitter</a>
            <a href="#" className="hover:text-[#F7F5F0]">LinkedIn</a>
            <a href="#" className="hover:text-[#F7F5F0]">Instagram</a>
          </div>
          <div className="flex flex-col gap-4">
            <a href="mailto:hello@wellmade.com" className="hover:text-[#F7F5F0]">hello@wellmade.com</a>
            <span>New York, NY</span>
          </div>
          <div className="flex flex-col gap-4">
            <span>© 2026 Wellmade Digital.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
