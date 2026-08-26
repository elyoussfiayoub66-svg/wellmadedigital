'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  LayoutDashboard, Users, User, CreditCard, Receipt, 
  Settings, LogOut, Calendar, CheckSquare, FolderGit2, Search, PieChart, MessageSquare, TrendingUp,
  ChevronLeft, ChevronRight, Menu
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import NotificationsDropdown from '@/components/NotificationsDropdown';

// ── Custom Tooltip for collapsed mode ─────────────────────────────────────────
function NavTooltip({ label, children }) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState(0);
  const ref = useRef(null);

  const handleEnter = () => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setPos(rect.top + rect.height / 2);
    }
    setVisible(true);
  };

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          className="fixed left-[76px] z-[999] pointer-events-none"
          style={{ top: pos, transform: 'translateY(-50%)' }}
        >
          <div className="flex items-center gap-0">
            {/* Arrow */}
            <div className="w-0 h-0 border-t-[6px] border-b-[6px] border-r-[8px] border-t-transparent border-b-transparent border-r-brand-dark/90" />
            <div className="bg-brand-dark/90 backdrop-blur-sm text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-xl whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-150">
              {label}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
    { name: 'Dashboard',    href: '/dashboard',              icon: LayoutDashboard },
    { name: 'Projects',     href: '/dashboard/projects',     icon: FolderGit2 },
    { name: 'Chat',         href: '/dashboard/chat',         icon: MessageSquare },
    { name: 'Tasks',        href: '/dashboard/tasks',        icon: CheckSquare },
    { name: 'Clients',      href: '/dashboard/clients',      icon: Users },
    { name: 'Calendar',     href: '/dashboard/calendar',     icon: Calendar },
    { name: 'Invoices',     href: '/dashboard/invoices',     icon: Receipt },
    { name: 'Payments',     href: '/dashboard/payments',     icon: CreditCard },
    { name: 'Expenses',     href: '/dashboard/expenses',     icon: PieChart },
    { name: 'Team',         href: '/dashboard/team',         icon: Users },
    { name: 'Case Studies', href: '/dashboard/case-studies', icon: TrendingUp },
    { name: 'Profile',      href: '/dashboard/profile',      icon: User },
    { name: 'Settings',     href: '/dashboard/settings',     icon: Settings },
  ];

  if (!user) return <div className="h-screen flex items-center justify-center bg-brand-bg">Loading...</div>;

  return (
    <div className="flex h-screen bg-brand-bg overflow-hidden">

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside
        className={`relative bg-[#F4EFE6] text-brand-dark flex flex-col shrink-0 border-r border-brand-dark/5 shadow-lg z-20 transition-all duration-300 ease-in-out ${
          collapsed ? 'w-[68px]' : 'w-64'
        }`}
      >
        {/* Logo */}
        <div className={`border-b border-brand-dark/10 flex items-center shrink-0 transition-all duration-300 ${
          collapsed ? 'justify-center py-4 px-0' : 'justify-center py-4 px-5'
        }`}>
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="relative w-[65px] h-[65px] shrink-0 group-hover:scale-105 transition-transform flex items-center justify-center">
              <img
                src="/assets/LOGO.png"
                alt="WellMade Digital Logo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden w-full h-full bg-brand-dark rounded-lg items-center justify-center text-white font-black text-2xl">W</div>
            </div>
            <span className={`text-[13px] font-black tracking-wider text-brand-dark whitespace-nowrap transition-all duration-300 ${
              collapsed ? 'w-0 opacity-0 overflow-hidden' : 'opacity-100'
            }`}>
              wellmadedigital
            </span>
          </Link>
        </div>

        {/* Nav */}
        <nav className={`flex-1 overflow-y-auto custom-scrollbar transition-all duration-300 ${
          collapsed ? 'p-2 space-y-1' : 'p-3 space-y-0.5'
        }`}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            if (collapsed) {
              return (
                <NavTooltip key={item.name} label={item.name}>
                  <Link
                    href={item.href}
                    className={`relative flex items-center justify-center w-full py-3 rounded-xl transition-all duration-200 group ${
                      isActive
                        ? 'bg-brand-dark shadow-lg shadow-brand-dark/25'
                        : 'hover:bg-brand-dark/8'
                    }`}
                  >
                    {/* Active glow bar */}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-brand-accent rounded-r-full" />
                    )}
                    <item.icon
                      className={`w-[18px] h-[18px] transition-all duration-200 ${
                        isActive
                          ? 'text-white scale-110'
                          : 'text-brand-dark/40 group-hover:text-brand-dark group-hover:scale-110'
                      }`}
                    />
                  </Link>
                </NavTooltip>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-brand-dark text-white font-semibold shadow-md shadow-brand-dark/20'
                    : 'text-brand-dark/70 hover:text-brand-dark hover:bg-brand-dark/5 font-medium'
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-brand-accent rounded-r-full" />
                )}
                <item.icon
                  className={`w-[18px] h-[18px] shrink-0 transition-all duration-200 ${
                    isActive ? 'text-white' : 'text-brand-dark/40 group-hover:text-brand-dark group-hover:scale-110'
                  }`}
                />
                <span className="text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sign Out */}
        <div className={`border-t border-brand-dark/10 shrink-0 transition-all duration-300 ${collapsed ? 'p-2' : 'p-3'}`}>
          {collapsed ? (
            <NavTooltip label="Sign Out">
              <button
                onClick={handleLogout}
                className="flex items-center justify-center w-full py-3 rounded-xl text-brand-dark/40 hover:text-red-500 hover:bg-red-50 transition-all duration-200 group"
              >
                <LogOut className="w-[18px] h-[18px] group-hover:scale-110 transition-transform" />
              </button>
            </NavTooltip>
          ) : (
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2.5 w-full rounded-xl text-brand-dark/70 font-medium hover:text-red-600 hover:bg-red-50 transition-colors group"
            >
              <LogOut className="w-[18px] h-[18px] text-brand-dark/40 group-hover:text-red-500 group-hover:scale-110 transition-all" />
              <span className="text-sm">Sign Out</span>
            </button>
          )}
        </div>

        {/* Toggle button — floating on edge */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-[88px] z-30 w-6 h-6 bg-brand-dark text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-200"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed
            ? <ChevronRight className="w-3 h-3" />
            : <ChevronLeft className="w-3 h-3" />
          }
        </button>
      </aside>

      {/* ── Main Area ───────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        {/* Header */}
        <header className="h-20 bg-brand-surface border-b border-brand-dark/5 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4 flex-1">
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
