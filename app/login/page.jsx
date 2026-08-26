'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
    } else {
      // Check account_status in profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('account_status')
        .eq('id', authData.user.id)
        .single();
        
      if (profile && profile.account_status === 'pending') {
        await supabase.auth.signOut();
        setError('Your account is pending approval by an administrator. You cannot log in yet.');
        setLoading(false);
      } else {
        // Redirect to user dashboard
        router.push('/dashboard');
        router.refresh();
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg absolute inset-0 z-50">
      <div className="max-w-md w-full bg-brand-surface p-8 rounded-xl shadow-xl">
        <h1 className="text-2xl font-bold text-center mb-6">Welcome Back</h1>
        
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}
        
        <form onSubmit={handleLogin} className="space-y-4">
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
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-brand-text/80">Password</label>
              <Link href="/forgot-password" className="text-xs text-brand-accent hover:underline font-medium">
                Forgot password?
              </Link>
            </div>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border-brand-dark/10 rounded-lg p-3 border focus:ring-brand-dark focus:border-brand-dark" 
              required 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-brand-dark text-brand-text-light font-medium py-3 rounded-xl hover:bg-brand-accent transition-colors disabled:opacity-70"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-brand-text/70">
          Don't have an account?{' '}
          <Link href="/signup" className="text-brand-accent font-semibold hover:underline">
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
}
