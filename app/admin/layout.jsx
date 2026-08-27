'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LayoutDashboard, Users, UserMinus, BarChart, Settings, LogOut, Megaphone } from 'lucide-react';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-brand-bg">
      {/* Sidebar */}
      <aside className="w-64 bg-brand-accent text-brand-text-light flex flex-col">
        <div className="p-6 font-bold text-xl tracking-tight border-b border-brand-text-light/10 flex items-center gap-3">
          <img src="/assets/logo.png" alt="Wellmade Digital Logo" className="w-[120px] h-auto rounded" />
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <Link href="/admin/dashboard" className="flex items-center px-4 py-3 rounded-lg hover:bg-brand-dark/90 transition-colors">
            <LayoutDashboard className="w-5 h-5 mr-3" /> Dashboard
          </Link>
          <Link href="/admin/leads" className="flex items-center px-4 py-3 rounded-lg hover:bg-brand-dark/90 transition-colors">
            <Users className="w-5 h-5 mr-3" /> Leads CRM
          </Link>
          <Link href="/admin/case-studies" className="flex items-center px-4 py-3 rounded-lg hover:bg-brand-dark/90 transition-colors">
            <LayoutDashboard className="w-5 h-5 mr-3" /> Case Studies
          </Link>
          <Link href="/admin/abandoned" className="flex items-center px-4 py-3 rounded-lg hover:bg-brand-dark/90 transition-colors">
            <UserMinus className="w-5 h-5 mr-3" /> Abandoned
          </Link>
          <Link href="/admin/campaigns" className="flex items-center px-4 py-3 rounded-lg hover:bg-brand-dark/90 transition-colors">
            <Megaphone className="w-5 h-5 mr-3" /> Campaigns
          </Link>
          <Link href="/admin/analytics" className="flex items-center px-4 py-3 rounded-lg hover:bg-brand-dark/90 transition-colors">
            <BarChart className="w-5 h-5 mr-3" /> Analytics
          </Link>
          <Link href="/admin/settings" className="flex items-center px-4 py-3 rounded-lg hover:bg-brand-dark/90 transition-colors">
            <Settings className="w-5 h-5 mr-3" /> Settings
          </Link>
        </nav>
        <div className="p-4 border-t border-brand-text-light/10">
          <button onClick={handleLogout} className="flex items-center px-4 py-2 w-full text-left rounded-lg text-brand-text-light/70 hover:text-brand-text-light hover:bg-brand-dark/90 transition-colors">
            <LogOut className="w-5 h-5 mr-3" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 text-brand-text">
        {children}
      </main>
    </div>
  );
}
