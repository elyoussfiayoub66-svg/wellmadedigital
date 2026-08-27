'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Bell, Check, CircleAlert, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function NotificationsDropdown({ userId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [alertPreferences, setAlertPreferences] = useState(null);
  const dropdownRef = useRef(null);

  const fetchAlerts = async () => {
    const supabase = createClient();
    
    // Fetch preferences first
    const { data: settings } = await supabase
      .from('crm_settings')
      .select('alert_preferences')
      .eq('user_id', userId)
      .single();
      
    const prefs = settings?.alert_preferences || {};
    setAlertPreferences(prefs);
    
    // Fetch unread notifications
    const { data: notifs } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(10);
      
    if (notifs) {
      const filteredNotifs = notifs.filter(n => prefs[n.type] !== false);
      setNotifications(filteredNotifs);
    }

    // Fetch overdue tasks for this user (or globally if admin, but here just assignees)
    // To make it simple, we'll fetch overdue tasks where assignee_id = userId
    // If we want all overdue tasks for admins, we'd check their role. For now, just user's overdue tasks.
    const todayDate = new Date().toISOString().split('T')[0];
    const { data: tasks } = await supabase
      .from('tasks')
      .select('id, title, due_date')
      .eq('assignee_id', userId)
      .neq('status', 'Completed')
      .lt('due_date', todayDate);
      
    if (tasks) setOverdueTasks(tasks);
  };

  useEffect(() => {
    if (userId) {
      fetchAlerts();
      
      // Optional: Polling every 60 seconds
      const interval = setInterval(fetchAlerts, 60000);
      return () => clearInterval(interval);
    }
  }, [userId]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllAsRead = async () => {
    if (notifications.length === 0) return;
    const supabase = createClient();
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);
    
    setNotifications([]);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'error': return <CircleAlert className="w-5 h-5 text-red-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const totalAlerts = notifications.length + overdueTasks.length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-full transition-colors relative ${isOpen ? 'bg-brand-bg text-brand-text' : 'text-brand-text/70 hover:text-brand-text hover:bg-brand-bg'}`}
      >
        <Bell className="w-5 h-5" />
        {totalAlerts > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-brand-accent border-2 border-brand-surface rounded-full"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-brand-surface rounded-xl  border border-brand-border z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b border-brand-border flex items-center justify-between">
            <h3 className="font-medium text-brand-text">Notifications</h3>
            {totalAlerts > 0 && (
              <button onClick={markAllAsRead} className="text-xs text-brand-text/50 hover:text-brand-accent transition-colors flex items-center gap-1">
                <Check className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            {totalAlerts === 0 ? (
              <div className="p-8 text-center text-brand-text/50 text-sm">
                You're all caught up!
              </div>
            ) : (
              <div className="flex flex-col">
                {/* Overdue Tasks */}
                {overdueTasks.map(task => (
                  <Link key={`task-${task.id}`} href="/dashboard/tasks" onClick={() => setIsOpen(false)} className="p-4 border-b border-brand-border hover:bg-brand-bg/50 transition-colors flex gap-3">
                    <div className="shrink-0 mt-0.5">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-brand-text">Task Overdue</p>
                      <p className="text-xs text-brand-text/70 mt-1 line-clamp-2">"{task.title}" was due on {new Date(task.due_date).toLocaleDateString()}</p>
                    </div>
                  </Link>
                ))}

                {/* Notifications */}
                {notifications.map(notif => (
                  <div key={notif.id} className="p-4 border-b border-brand-border hover:bg-brand-bg/50 transition-colors flex gap-3">
                    <div className="shrink-0 mt-0.5">
                      {getIcon(notif.type)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-brand-text">{notif.title}</p>
                      <p className="text-xs text-brand-text/70 mt-1 line-clamp-2">{notif.message}</p>
                      <p className="text-[10px] text-brand-text/40 mt-2">{new Date(notif.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
