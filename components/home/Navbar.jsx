'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-700 px-6 md:px-12 flex justify-between items-center ${scrolled ? 'py-6 bg-[#0E0E0F]/80 backdrop-blur-md border-b border-[#F7F5F0]/5' : 'py-10 bg-transparent'}`}>
      <Link href="/" className="flex items-center">
        <img src="/assets/logo.png?v=2" alt="Wellmade Digital Logo" className="h-[90px] w-auto object-contain" />
      </Link>
      
      <div className="hidden md:flex gap-10 text-[10px] uppercase tracking-widest font-bold text-[#F7F5F0]/60">
        <Link href="/work" className="hover:text-[#F7F5F0] transition-colors">Work</Link>
        <Link href="/services" className="hover:text-[#F7F5F0] transition-colors">Services</Link>
        <Link href="/process" className="hover:text-[#F7F5F0] transition-colors">Process</Link>
        <Link href="/who-we-help" className="hover:text-[#F7F5F0] transition-colors">Who We Help</Link>
      </div>

      <Link href="/book" className="text-[10px] uppercase tracking-widest font-bold text-[#C2496B] flex items-center gap-2 group">
        <span>Start a Project</span>
        <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
      </Link>
    </nav>
  );
}
