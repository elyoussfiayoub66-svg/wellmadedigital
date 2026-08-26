'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  LayoutDashboard, Users, User, CreditCard, Receipt, 
  Settings, LogOut, Calendar, CheckSquare, FolderGit2, Search, PieChart, MessageSquare, TrendingUp
} from 'lucide-react';
import { useState, useEffect } from 'react';
import NotificationsDropdown from '@/components/NotificationsDropdown';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        setUser(session.user);
      }
    };
    checkUser();
  }, [router]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', href: '/dashboard/projects', icon: FolderGit2 },
    { name: 'Chat', href: '/dashboard/chat', icon: MessageSquare },
    { name: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare },
    { name: 'Clients', href: '/dashboard/clients', icon: Users },
    { name: 'Calendar', href: '/dashboard/calendar', icon: Calendar },
    { name: 'Invoices', href: '/dashboard/invoices', icon: Receipt },
    { name: 'Payments', href: '/dashboard/payments', icon: CreditCard },
    { name: 'Expenses', href: '/dashboard/expenses', icon: PieChart },
    { name: 'Team', href: '/dashboard/team', icon: Users },
    { name: 'Case Studies', href: '/dashboard/case-studies', icon: TrendingUp },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  if (!user) return <div className="h-screen flex items-center justify-center bg-brand-bg">Loading...</div>;

  return (
    <div className="flex h-screen bg-brand-bg overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#F4EFE6] text-brand-dark flex flex-col shrink-0 border-r border-brand-dark/5 shadow-md z-20">
        <div className="py-6 border-b border-brand-dark/10 flex items-center px-6">
          <Link href="/dashboard" className="font-bold tracking-tight flex items-center gap-3 group">
            <div className="relative w-[60px] h-[60px] shrink-0 group-hover:scale-105 transition-transform flex items-center justify-center">
              {/* Fallback styling for the image just in case it doesn't load right away */}
              <img 
                src="/assets/LOGO.png" 
                alt="WellMade Digital Logo" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden w-full h-full bg-brand-dark rounded-lg items-center justify-center text-white font-black text-3xl">W</div>
            </div>
            <div className="flex flex-col">
              <span className="text-[15px] font-black leading-none tracking-wide text-brand-dark">WELLMADE</span>
              <span className="text-[11px] font-bold tracking-widest text-brand-dark/60 mt-0.5">DIGITAL</span>
            </div>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href} 
                className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-brand-dark text-white font-semibold shadow-md shadow-brand-dark/20' 
                    : 'text-brand-dark/70 hover:text-brand-dark hover:bg-brand-dark/5 font-medium'
                }`}
              >
                <item.icon className={`w-5 h-5 mr-3 shrink-0 ${isActive ? 'text-white' : 'text-brand-dark/50 group-hover:text-brand-dark'}`} /> 
                {item.name}
              </Link>
            )
          })}
        </nav>
        
        <div className="p-4 border-t border-brand-dark/10">
          <button onClick={handleLogout} className="flex items-center px-4 py-3 w-full text-left rounded-xl text-brand-dark/70 font-medium hover:text-red-600 hover:bg-red-50 transition-colors group">
            <LogOut className="w-5 h-5 mr-3 text-brand-dark/50 group-hover:text-red-500" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-20 bg-brand-surface border-b border-brand-dark/5 flex items-center justify-between px-8 shrink-0">
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-brand-text/40" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full pl-10 pr-4 py-2 bg-brand-bg rounded-lg border-none focus:ring-1 focus:ring-brand-accent text-sm"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 ml-4">
            {user && <NotificationsDropdown userId={user.id} />}
            <Link href="/dashboard/profile" className="flex items-center gap-3 pl-4 border-l border-brand-dark/10 hover:opacity-80 transition-opacity">
              <div className="w-9 h-9 rounded-full bg-brand-dark text-brand-text-light flex items-center justify-center font-bold text-sm">
                {user.email?.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-brand-text leading-tight">{user.user_metadata?.full_name || 'User'}</p>
                <p className="text-xs text-brand-text/70">{user.email}</p>
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8 text-brand-text">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
