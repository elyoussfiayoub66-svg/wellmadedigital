'use client';
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 py-8 px-6 md:px-12 flex items-center justify-between pointer-events-auto mix-blend-difference">
      <Link href="/" className="font-bold text-lg tracking-widest text-[#F7F5F0]">
        WELLMADE
      </Link>
      <Link href="/book" className="text-[10px] uppercase tracking-widest font-bold text-[#C2496B] hover:text-[#F7F5F0] transition-colors border-b border-[#C2496B]/30 pb-1">
        Start a Project &rarr;
      </Link>
    </nav>
  );
}
