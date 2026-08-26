'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User, Lock, Save } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('personal');
  const [isSaving, setIsSaving] = useState(false);
  
  // Profile State
  const [fullName, setFullName] = useState('');
  
  // Password State
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        setFullName(session.user.user_metadata?.full_name || '');
      }
    };
    fetchUser();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) return toast.error("Name cannot be empty");
    
    setIsSaving(true);
    try {
      // 1. Update Auth Metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      });
      if (authError) throw authError;

      // 2. Update profiles table
      if (user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ full_name: fullName })
          .eq('id', user.id);
        if (profileError) throw profileError;
      }

      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return toast.error("Passwords do not match!");
    }
    if (passwordForm.newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters.");
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      });
      
      if (error) throw error;
      
      toast.success("Password updated successfully!");
      setPasswordForm({ newPassword: '', confirmPassword: '' });
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to update password");
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
  ];

  if (!user) return <div className="p-8 text-center text-brand-text/50">Loading profile...</div>;

  return (
    <div className="mx-auto max-w-4xl space-y-8 animate-in fade-in duration-500 pb-12">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-brand-dark mb-2">My Profile</h1>
        <p className="text-brand-text/60 max-w-lg leading-relaxed">
          Manage your personal account details and security settings.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
        {/* Sidebar */}
        <div className="md:col-span-4 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex w-full items-center gap-4 rounded-2xl p-4 text-left transition-all duration-300 group ${
                  isActive
                    ? "bg-brand-surface shadow-sm border border-brand-dark/5"
                    : "hover:bg-brand-surface/50 border border-transparent"
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-brand-accent rounded-r-full" />
                )}
                
                <div className={`p-2.5 rounded-xl transition-colors duration-300 ${
                  isActive ? "bg-brand-accent text-white shadow-md shadow-brand-accent/20" : "bg-brand-dark/5 text-brand-text/50 group-hover:bg-brand-dark/10 group-hover:text-brand-text"
                }`}>
                  <Icon className="h-4 w-4" />
                </div>
                
                <div className={`text-sm font-bold transition-colors flex-1 ${isActive ? "text-brand-dark" : "text-brand-text/70 group-hover:text-brand-dark"}`}>
                  {tab.label}
                </div>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="md:col-span-8">
          <div className="rounded-3xl bg-brand-surface p-8 shadow-sm border border-brand-dark/5 min-h-[400px] transition-all duration-500">
            
            {/* Personal Info Tab */}
            {activeTab === 'personal' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-6 pb-6 border-b border-brand-dark/5">
                  <div className="w-20 h-20 bg-brand-dark rounded-full flex-shrink-0 flex items-center justify-center text-2xl text-white font-bold border-4 border-brand-bg shadow-sm">
                    {fullName.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-brand-dark">{fullName || 'User'}</h3>
                    <p className="text-sm text-brand-text/50">{user.email}</p>
                  </div>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-brand-text/50">Full Name</label>
                    <input 
                      type="text" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded-xl border border-brand-dark/10 bg-brand-bg/50 px-4 py-3.5 text-brand-text font-medium transition-all focus:border-brand-accent focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-accent/10" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-brand-text/50">Email Address (Cannot be changed)</label>
                    <input 
                      type="email" 
                      value={user.email || ''}
                      disabled
                      className="w-full rounded-xl border border-brand-dark/5 bg-brand-bg/30 px-4 py-3.5 text-brand-text/50 font-medium cursor-not-allowed" 
                    />
                  </div>
                  
                  <div className="pt-4">
                    <button 
                      type="submit"
                      disabled={isSaving}
                      className="flex items-center gap-2 rounded-xl bg-brand-dark px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-brand-dark/90 hover:shadow-lg disabled:opacity-70"
                    >
                      {isSaving ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <Save className="h-4 w-4" />}
                      Save Profile
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <h2 className="text-2xl font-bold text-brand-dark">Change Password</h2>
                  <p className="text-sm text-brand-text/50 mt-1">Ensure your account is using a long, random password to stay secure.</p>
                </div>

                <form onSubmit={handleUpdatePassword} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-brand-text/50">New Password</label>
                    <input 
                      type="password" 
                      required
                      minLength={6}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({...prev, newPassword: e.target.value}))}
                      className="w-full rounded-xl border border-brand-dark/10 bg-brand-bg/50 px-4 py-3.5 text-brand-text font-medium transition-all focus:border-brand-accent focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-accent/10" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-brand-text/50">Confirm New Password</label>
                    <input 
                      type="password" 
                      required
                      minLength={6}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({...prev, confirmPassword: e.target.value}))}
                      className="w-full rounded-xl border border-brand-dark/10 bg-brand-bg/50 px-4 py-3.5 text-brand-text font-medium transition-all focus:border-brand-accent focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-accent/10" 
                    />
                  </div>
                  
                  <div className="pt-4">
                    <button 
                      type="submit"
                      disabled={isSaving}
                      className="flex items-center gap-2 rounded-xl bg-brand-dark px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-brand-dark/90 hover:shadow-lg disabled:opacity-70"
                    >
                      {isSaving ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <Lock className="h-4 w-4" />}
                      Update Password
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
