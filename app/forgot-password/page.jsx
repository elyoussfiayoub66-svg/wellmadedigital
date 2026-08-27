'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/dashboard/profile`, // Sends them to the new security tab we built!
      });

      if (resetError) throw resetError;
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'An error occurred while trying to send the reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg absolute inset-0 z-50">
      <div className="max-w-md w-full bg-brand-surface p-8 rounded-[10px] border border-brand-border  border border-brand-border">
        
        <Link href="/login" className="inline-flex items-center gap-2 text-sm text-brand-text/50 hover:text-brand-text mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to login
        </Link>

        {success ? (
          <div className="text-center space-y-4 animate-in fade-in duration-500">
            <div className="mx-auto w-16 h-16 bg-[#0D1F0D] text-[#4ADE80] border border-[#1A3D1A] rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-brand-text">Check your email</h1>
            <p className="text-brand-text/70 leading-relaxed">
              We've sent a password reset link to <span className="font-semibold text-brand-text">{email}</span>. 
              Click the link to securely reset your password.
            </p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-2 text-brand-text">Reset Password</h1>
            <p className="text-brand-text/60 mb-6">Enter your email address and we'll send you a link to reset your password.</p>
            
            {error && <div className="bg-[#1F0D0D] text-[#F87171] border border-[#3D1515] p-3 rounded-lg mb-4 text-sm border border-red-100">{error}</div>}
            
            <form onSubmit={handleReset} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-brand-text/80 mb-1.5">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full border-brand-border rounded-lg p-3.5 border focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all bg-brand-bg/50 outline-none" 
                  placeholder="name@agency.com"
                  required 
                />
              </div>
              
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-brand-accent text-white font-bold py-3.5 rounded-xl hover:bg-brand-dark/90 transition-all disabled:opacity-70  flex items-center justify-center gap-2"
              >
                {loading && <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
                {loading ? 'Sending link...' : 'Send Reset Link'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
