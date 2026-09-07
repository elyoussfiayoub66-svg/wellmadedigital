'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import LanguageSwitcher from './LanguageSwitcher';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [mobileMenuOpen]);

  const navLinks = [
    { name: 'Solutions', href: '/solutions/crm-automation' },
    { name: 'Services', href: '/services' },
    { name: 'Industries', href: '/industries' },
    { name: 'Process', href: '/process' },
    { name: 'Work', href: '/work' },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-[100] transition-all duration-700 px-6 md:px-12 flex justify-between items-center ${scrolled || mobileMenuOpen ? 'py-4 bg-[#0E0E0F]/90 backdrop-blur-md border-b border-[#F7F5F0]/5' : 'py-8 bg-transparent'}`}>
        <Link href="/" className="flex items-center z-50 relative" onClick={() => setMobileMenuOpen(false)}>
          <img src="/assets/logo.png?v=2" alt="Wellmade Digital Logo" className="h-[60px] md:h-[80px] w-auto object-contain transition-all duration-500" />
        </Link>
        
        {/* Desktop Links */}
        <div className="hidden lg:flex gap-10 text-[10px] uppercase tracking-widest font-bold text-[#F7F5F0]/60">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.href} className="hover:text-[#F7F5F0] transition-colors">{link.name}</Link>
          ))}
        </div>

        <div className="flex items-center gap-4 md:gap-6 z-50 relative">
          <LanguageSwitcher />
          
          <Link href="/book" className="hidden md:flex text-[10px] uppercase tracking-widest font-bold text-[#C2496B] items-center gap-2 group">
            <span>Start a Project</span>
            <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
          </Link>

          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden flex flex-col justify-center items-center w-8 h-8 space-y-1.5 focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            <span className={`block w-6 h-[2px] bg-[#F7F5F0] transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'rotate-45 translate-y-[8px]' : ''}`}></span>
            <span className={`block w-6 h-[2px] bg-[#F7F5F0] transition-opacity duration-300 ease-in-out ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
            <span className={`block w-6 h-[2px] bg-[#F7F5F0] transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? '-rotate-45 -translate-y-[8px]' : ''}`}></span>
          </button>
        </div>
      </nav>

      {/* Advanced Full-Screen Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: '-100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '-100%' }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-40 bg-[#0E0E0F] flex flex-col justify-center px-8"
          >
            {/* Abstract Background for mobile menu */}
            <div className="absolute bottom-0 right-0 w-[80vw] h-[80vw] bg-[#C2496B]/10 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="flex flex-col gap-8 relative z-10">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + (i * 0.1), duration: 0.5, ease: "easeOut" }}
                >
                  <Link 
                    href={link.href} 
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-4xl sm:text-5xl font-medium tracking-tighter text-[#F7F5F0] hover:text-[#C2496B] transition-colors inline-block"
                  >
                    {link.name}.
                  </Link>
                </motion.div>
              ))}
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="mt-8 pt-8 border-t border-[#F7F5F0]/10"
              >
                <Link 
                  href="/book" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="bg-[#C2496B] text-white w-full py-5 rounded-lg font-bold uppercase tracking-widest text-xs flex justify-center items-center shadow-[0_0_20px_rgba(194,73,107,0.3)]"
                >
                  Start a Project &rarr;
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
