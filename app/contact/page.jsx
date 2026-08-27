'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ContactPage() {
  const [status, setStatus] = useState('idle');

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('submitting');
    // Simulate submission
    setTimeout(() => setStatus('success'), 1000);
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text font-sans flex flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-brand-bg/90 backdrop-blur-md border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="text-xl font-medium text-brand-text flex items-center gap-2">
            <img src="/assets/logo.png" alt="Wellmade Digital Logo" className="w-[120px] h-auto object-contain" />
          </Link>
          <nav className="hidden md:flex gap-8 text-sm font-medium text-brand-text/70">
            <Link href="/services" className="hover:text-brand-text transition-colors">Solutions</Link>
            <Link href="/contact" className="text-brand-text">Contact</Link>
          </nav>
          <Link href="/book" className="text-sm font-medium bg-brand-accent text-brand-text-light px-5 py-2.5 rounded-lg hover:opacity-90 hover:scale-[1.02] transition-all">
            Book Consultation
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center py-24 px-6">
        <div className="max-w-xl w-full">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-medium text-brand-text mb-4">
              Get in Touch
            </h1>
            <p className="text-lg text-brand-text/70">
              Have a general inquiry? Send us a message and we'll get back to you shortly. For project inquiries, please <Link href="/book" className="text-brand-accent underline underline-offset-4 font-medium hover:text-brand-accent/80 transition-colors">book a consultation</Link>.
            </p>
          </div>
          
          <div className="bg-brand-surface p-8 md:p-10 border border-brand-border rounded-xl ">
            {status === 'success' ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-brand-bg text-brand-accent rounded-xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-medium text-brand-text mb-2">Message Sent</h3>
                <p className="text-brand-text/70">Thank you for reaching out. We will get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-brand-text">First Name</label>
                    <input required type="text" className="w-full bg-brand-surface border border-brand-border rounded-lg px-4 py-3 text-brand-text focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/20 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-brand-text">Last Name</label>
                    <input required type="text" className="w-full bg-brand-surface border border-brand-border rounded-lg px-4 py-3 text-brand-text focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/20 transition-all" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-brand-text">Work Email</label>
                  <input required type="email" className="w-full bg-brand-surface border border-brand-border rounded-lg px-4 py-3 text-brand-text focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/20 transition-all" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-brand-text">Company</label>
                  <input required type="text" className="w-full bg-brand-surface border border-brand-border rounded-lg px-4 py-3 text-brand-text focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/20 transition-all" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-brand-text">Message</label>
                  <textarea required rows={4} className="w-full bg-brand-surface border border-brand-border rounded-lg px-4 py-3 text-brand-text focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/20 transition-all resize-none"></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={status === 'submitting'}
                  className="w-full bg-brand-accent text-brand-text-light font-medium py-4 rounded-lg hover:opacity-90 transition-all disabled:opacity-70 shadow-none"
                >
                  {status === 'submitting' ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-brand-bg py-12 px-6 border-t border-brand-border mt-auto">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="font-medium text-brand-text flex items-center gap-2">
            <img src="/assets/logo.png" alt="Wellmade Digital Logo" className="w-[100px] h-auto object-contain" />
          </div>
          <p className="text-sm text-brand-text/60">&copy; {new Date().getFullYear()} Wellmade Digital.</p>
        </div>
      </footer>
    </div>
  );
}
