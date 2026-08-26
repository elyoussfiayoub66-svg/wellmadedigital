'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function ProfilePage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session) setUser(session.user);
    };
    fetchUser();
  }, []);

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-medium text-brand-text tracking-tight mb-2">My Profile</h1>
        <p className="text-brand-text/70">Manage your personal account details.</p>
      </div>

      <div className="bg-brand-surface rounded-xl border border-brand-dark/5 shadow-sm p-8 flex flex-col md:flex-row gap-8 items-start">
        <div className="w-32 h-32 bg-brand-dark rounded-full flex-shrink-0 flex items-center justify-center text-4xl text-white font-bold border-4 border-brand-bg shadow-sm">
          {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        
        <div className="flex-1 w-full space-y-4">
          <div>
            <label className="block text-sm font-medium text-brand-text/80 mb-1">Full Name</label>
            <input 
              type="text" 
              defaultValue={user?.user_metadata?.full_name || ''}
              className="w-full border-brand-dark/10 rounded-lg p-3 border focus:ring-brand-accent focus:border-brand-accent bg-brand-bg" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-text/80 mb-1">Email Address</label>
            <input 
              type="email" 
              value={user?.email || ''}
              disabled
              className="w-full border-brand-dark/10 rounded-lg p-3 border bg-brand-bg/50 text-brand-text/50 cursor-not-allowed" 
            />
          </div>
          <div className="pt-4">
            <button className="bg-brand-dark text-brand-text-light px-6 py-2.5 rounded-lg font-medium hover:opacity-90">
              Update Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
