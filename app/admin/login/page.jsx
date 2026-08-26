'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@scaleup.agency');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/admin/dashboard');
      router.refresh(); // refresh layout
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg absolute inset-0 z-50">
      <div className="max-w-md w-full bg-brand-surface p-8 rounded-xl shadow-xl">
        <h1 className="text-2xl font-bold text-center mb-6">Admin Login</h1>
        
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
            <label className="block text-sm font-medium text-brand-text/80 mb-1">Password</label>
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
            className="w-full bg-brand-dark text-brand-text-light font-medium py-3 rounded-xl hover:bg-black transition-colors disabled:opacity-70"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
