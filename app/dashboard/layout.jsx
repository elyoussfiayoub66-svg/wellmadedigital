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
            <div className="w-0 h-0 border-t-[6px] border-b-[6px] border-r-[8px] border-t-transparent border-b-transparent border-r-brand-surface" />
            <div className="bg-brand-surface border border-brand-border text-brand-text text-xs font-medium px-3 py-2 rounded-lg  whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-150">
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
  const [unreadCount, setUnreadCount] = useState(0);

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

  useEffect(() => {
    if (!user) return;
    
    let subscription;
    const setupUnread = async () => {
      const supabase = createClient();
      
      const { data: members } = await supabase
        .from('project_members')
        .select('project_id')
        .eq('user_id', user.id);
        
      if (members && members.length > 0) {
        const projectIds = members.map(m => m.project_id);
        const { count, error } = await supabase
          .from('project_messages')
          .select('*', { count: 'exact', head: true })
          .in('project_id', projectIds)
          .neq('sender_id', user.id)
          .gt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
          
        if (!error && count !== null) {
          setUnreadCount(count);
        }
      }

      subscription = supabase.channel('chat_unread')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'project_messages' }, (payload) => {
          if (payload.new.sender_id !== user.id) {
            setUnreadCount(prev => prev + 1);
          }
        })
        .subscribe();
    };
    
    setupUnread();
    
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [user]);

  useEffect(() => {
    if (pathname === '/dashboard/chat') {
      setUnreadCount(0);
    }
  }, [pathname]);

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

  if (!user) return (
    <div className="h-screen flex items-center justify-center bg-brand-bg">
      <div className="w-5 h-5 rounded-full border-2 border-brand-border border-t-brand-accent animate-spin" />
    </div>
  );

  return (
    <div className="flex h-screen bg-brand-bg overflow-hidden">

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside
        className={`relative bg-brand-surface text-brand-text flex flex-col shrink-0 border-r border-brand-border z-20 transition-all duration-300 ease-in-out ${
          collapsed ? 'w-[68px]' : 'w-64'
        }`}
      >
        {/* Logo */}
        <div className={`border-b border-brand-border flex items-center shrink-0 transition-all duration-300 ${
          collapsed ? 'justify-center py-4 px-0' : 'justify-center py-4 px-5'
        }`}>
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="relative w-[52px] h-[52px] shrink-0 group-hover:scale-105 transition-transform flex items-center justify-center">
              <img
                src="/assets/logo.png"
                alt="Studio Noir Logo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              {/* Fallback: angular SVG mark */}
              <div className="hidden w-full h-full bg-brand-surface rounded-[10px] border border-brand-border items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <polygon points="11,2 20,19 2,19" fill="#C2496B" />
                </svg>
              </div>
            </div>
            <span className={`text-[13px] font-semibold tracking-wide text-brand-text whitespace-nowrap transition-all duration-300 ${
              collapsed ? 'w-0 opacity-0 overflow-hidden' : 'opacity-100'
            }`}>
              Studio Noir
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
                    className={`relative flex items-center justify-center w-full py-3 rounded-lg transition-all duration-200 group ${
                      isActive
                        ? 'bg-brand-accent/10'
                        : 'hover:bg-brand-border/40'
                    }`}
                  >
                    {/* Active left bar */}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-brand-accent rounded-r-full" />
                    )}
                    <item.icon
                      className={`w-[18px] h-[18px] transition-all duration-200 ${
                        isActive
                          ? 'text-brand-accent'
                          : 'text-brand-muted group-hover:text-brand-secondary group-hover:scale-110'
                      }`}
                    />
                    {item.name === 'Chat' && unreadCount > 0 && (
                      <span className='absolute top-1.5 right-1.5 w-2 h-2 bg-brand-accent rounded-full' />
                    )}
                  </Link>
                </NavTooltip>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? 'bg-brand-accent/10 text-brand-accent font-medium'
                    : 'text-brand-muted hover:text-brand-text hover:bg-brand-border/40 font-normal'
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-brand-accent rounded-r-full" />
                )}
                <item.icon
                  className={`w-[18px] h-[18px] shrink-0 transition-all duration-200 ${
                    isActive ? 'text-brand-accent' : 'text-brand-muted group-hover:text-brand-text group-hover:scale-110'
                  }`}
                />
                <span className="text-sm">{item.name}</span>
                {item.name === 'Chat' && unreadCount > 0 && (
                  <span className='ml-auto bg-brand-accent text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center'>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sign Out */}
        <div className={`border-t border-brand-border shrink-0 transition-all duration-300 ${collapsed ? 'p-2' : 'p-3'}`}>
          {collapsed ? (
            <NavTooltip label="Sign Out">
              <button
                onClick={handleLogout}
                className="flex items-center justify-center w-full py-3 rounded-lg text-brand-muted hover:text-[#F87171] hover:bg-[#1F0D0D] transition-all duration-200 group"
              >
                <LogOut className="w-[18px] h-[18px] group-hover:scale-110 transition-transform" />
              </button>
            </NavTooltip>
          ) : (
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2.5 w-full rounded-lg text-brand-muted font-normal hover:text-[#F87171] hover:bg-[#1F0D0D] transition-colors group"
            >
              <LogOut className="w-[18px] h-[18px] group-hover:scale-110 transition-all" />
              <span className="text-sm">Sign Out</span>
            </button>
          )}
        </div>

        {/* Toggle button — floating on edge */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-[88px] z-30 w-6 h-6 bg-brand-surface border border-brand-border text-brand-muted rounded-full flex items-center justify-center  hover:border-brand-accent hover:text-brand-accent transition-all duration-200"
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
        <header className="h-16 bg-brand-surface border-b border-brand-border flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-lg text-brand-muted hover:text-brand-text hover:bg-brand-border/40 transition-colors md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-9 pr-4 py-2 bg-brand-bg rounded-lg border border-brand-border focus:ring-1 focus:ring-brand-accent focus:border-brand-accent focus:outline-none text-sm text-brand-text placeholder:text-brand-muted transition-all"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 ml-4">
            {user && <NotificationsDropdown userId={user.id} />}
            <Link href="/dashboard/profile" className="flex items-center gap-3 pl-4 border-l border-brand-border hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-full bg-brand-accent/15 text-brand-accent flex items-center justify-center font-semibold text-sm shrink-0 border border-brand-accent/20">
                {user.email?.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-brand-text leading-tight">{user.user_metadata?.full_name || 'User'}</p>
                <p className="text-xs text-brand-muted">{user.email}</p>
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
