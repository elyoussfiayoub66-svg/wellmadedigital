'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  LayoutDashboard, Users, User, CreditCard, Receipt, 
  Settings, LogOut, Calendar, CheckSquare, FolderGit2, Search, PieChart, MessageSquare, TrendingUp,
  ChevronLeft, ChevronRight, Menu
} from 'lucide-react';
import { useState, useEffect } from 'react';
import NotificationsDropdown from '@/components/NotificationsDropdown';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [collapsed, setCollapsed] = useState(false);

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
      <aside
        className={`relative bg-[#F4EFE6] text-brand-dark flex flex-col shrink-0 border-r border-brand-dark/5 shadow-md z-20 transition-all duration-300 ease-in-out ${
          collapsed ? 'w-[72px]' : 'w-64'
        }`}
      >
        {/* Logo Header */}
        <div className={`py-5 border-b border-brand-dark/10 flex items-center shrink-0 overflow-hidden transition-all duration-300 ${collapsed ? 'justify-center px-0' : 'px-5 gap-3'}`}>
          <Link href="/dashboard" className="flex items-center gap-3 group shrink-0">
            <div className="relative w-[52px] h-[52px] shrink-0 group-hover:scale-105 transition-transform flex items-center justify-center">
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

            {/* Brand name — hidden when collapsed */}
            <div className={`flex flex-col overflow-hidden transition-all duration-300 ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
              <span className="text-[15px] font-black leading-none tracking-wide text-brand-dark whitespace-nowrap">WELLMADE</span>
              <span className="text-[11px] font-bold tracking-widest text-brand-dark/60 mt-0.5 whitespace-nowrap">DIGITAL</span>
            </div>
          </Link>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                title={collapsed ? item.name : undefined}
                className={`flex items-center rounded-xl transition-all duration-200 group overflow-hidden ${
                  collapsed ? 'justify-center px-0 py-3' : 'px-4 py-3 gap-3'
                } ${
                  isActive
                    ? 'bg-brand-dark text-white font-semibold shadow-md shadow-brand-dark/20'
                    : 'text-brand-dark/70 hover:text-brand-dark hover:bg-brand-dark/5 font-medium'
                }`}
              >
                <item.icon className={`w-5 h-5 shrink-0 transition-colors ${isActive ? 'text-white' : 'text-brand-dark/50 group-hover:text-brand-dark'}`} />
                <span className={`text-sm whitespace-nowrap overflow-hidden transition-all duration-300 ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Sign Out */}
        <div className="p-3 border-t border-brand-dark/10 shrink-0">
          <button
            onClick={handleLogout}
            title={collapsed ? 'Sign Out' : undefined}
            className={`flex items-center w-full rounded-xl text-brand-dark/70 font-medium hover:text-red-600 hover:bg-red-50 transition-colors group overflow-hidden ${
              collapsed ? 'justify-center px-0 py-3' : 'px-4 py-3 gap-3'
            }`}
          >
            <LogOut className="w-5 h-5 shrink-0 text-brand-dark/50 group-hover:text-red-500" />
            <span className={`text-sm whitespace-nowrap overflow-hidden transition-all duration-300 ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
              Sign Out
            </span>
          </button>
        </div>

        {/* Toggle Button — floats on the right edge of the sidebar */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3.5 top-[76px] z-30 w-7 h-7 bg-[#F4EFE6] border border-brand-dark/15 rounded-full flex items-center justify-center shadow-md hover:bg-brand-dark hover:text-white hover:border-brand-dark transition-all duration-200 group"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed
            ? <ChevronRight className="w-3.5 h-3.5 text-brand-dark/60 group-hover:text-white" />
            : <ChevronLeft className="w-3.5 h-3.5 text-brand-dark/60 group-hover:text-white" />
          }
        </button>
      </aside>

      {/* Main Content Area — reacts to sidebar width automatically via flex */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        {/* Header */}
        <header className="h-20 bg-brand-surface border-b border-brand-dark/5 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4 flex-1">
            {/* Mobile / extra toggle in header */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-lg text-brand-text/50 hover:text-brand-text hover:bg-brand-bg transition-colors md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>

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
          </div>

          <div className="flex items-center gap-4 ml-4">
            {user && <NotificationsDropdown userId={user.id} />}
            <Link href="/dashboard/profile" className="flex items-center gap-3 pl-4 border-l border-brand-dark/10 hover:opacity-80 transition-opacity">
              <div className="w-9 h-9 rounded-full bg-brand-dark text-brand-text-light flex items-center justify-center font-bold text-sm shrink-0">
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
