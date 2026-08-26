'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${location.origin}/auth/callback`,
      }
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
    } else {
      // Force sign out immediately so they can't access the dashboard while pending
      await supabase.auth.signOut();
      
      setSuccessMessage('Your account has been created and is pending approval to be activated.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg absolute inset-0 z-50">
      <div className="max-w-md w-full bg-brand-surface p-8 rounded-xl shadow-xl">
        <h1 className="text-2xl font-bold text-center mb-6">Create an Account</h1>
        
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}
        {successMessage && <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-4 text-sm">{successMessage}</div>}
        
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-brand-text/80 mb-1">Full Name</label>
            <input 
              type="text" 
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full border-brand-dark/10 rounded-lg p-3 border focus:ring-brand-dark focus:border-brand-dark" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-text/80 mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border-brand-dark/10 rounded-lg p-3 border focus:ring-brand-dark focus:border-brand-dark" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-text/80 mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border-brand-dark/10 rounded-lg p-3 border focus:ring-brand-dark focus:border-brand-dark" 
              required 
              minLength={6}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-brand-dark text-brand-text-light font-medium py-3 rounded-xl hover:bg-brand-accent transition-colors disabled:opacity-70"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-brand-text/70">
          Already have an account?{' '}
          <Link href="/login" className="text-brand-accent font-semibold hover:underline">
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
}
