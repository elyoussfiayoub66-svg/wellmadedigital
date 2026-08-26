'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Send, Hash, MessageSquare, Loader2, Info } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ChatPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);
  const channelRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchUserAndProjects = async () => {
      setLoadingProjects(true);
      try {
        const supabase = createClient();
        
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) return;
        
        setCurrentUser(user);

        // Fetch projects where the user is a member
        const { data: memberProjects, error } = await supabase
          .from('project_members')
          .select(`
            project_id,
            projects (id, name, status)
          `)
          .eq('user_id', user.id);

        if (error) {
          console.error("Error fetching projects:", error);
          toast.error(error.message || "Failed to load projects");
          return;
        }

        if (memberProjects) {
          // Extract the projects from the join table
          const userProjects = memberProjects.map(mp => mp.projects).filter(Boolean);
          setProjects(userProjects);
        }
      } catch (err) {
        console.error(err);
        toast.error("An error occurred while loading projects");
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchUserAndProjects();
  }, []);

  useEffect(() => {
    if (!selectedProject || !currentUser) return;

    const fetchMessages = async () => {
      setLoadingMessages(true);
      const supabase = createClient();

      const { data, error } = await supabase
        .from('project_messages')
        .select(`
          *,
          profiles (id, full_name)
        `)
        .eq('project_id', selectedProject.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
        toast.error("Failed to load messages");
      } else {
        setMessages(data || []);
      }
      setLoadingMessages(false);
    };

    fetchMessages();

    // Subscribe to real-time changes
    const supabase = createClient();
    const channel = supabase
      .channel(`chat_${selectedProject.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'project_messages',
        filter: `project_id=eq.${selectedProject.id}`
      }, async (payload) => {
        // We need to fetch the sender's profile for the new message
        const newMsg = payload.new;
        
        // Optimistic UI might already have the message if we sent it
        if (newMsg.sender_id === currentUser.id) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('id, full_name')
          .eq('id', newMsg.sender_id)
          .single();

        setMessages(prev => [...prev, { ...newMsg, profiles: profile }]);
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [selectedProject, currentUser]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedProject || !currentUser) return;

    const messageText = newMessage;
    setNewMessage('');
    setSending(true);

    // Optimistic UI Update
    const optimisticMessage = {
      id: crypto.randomUUID(),
      project_id: selectedProject.id,
      sender_id: currentUser.id,
      content: messageText,
      created_at: new Date().toISOString(),
      profiles: { id: currentUser.id, full_name: currentUser.user_metadata?.full_name || 'You' }
    };
    
    setMessages(prev => [...prev, optimisticMessage]);

    const supabase = createClient();
    const { error } = await supabase
      .from('project_messages')
      .insert([{
        project_id: selectedProject.id,
        sender_id: currentUser.id,
        content: messageText
      }]);

    if (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message.");
      // Rollback optimistic update
      setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
    }
    
    setSending(false);
  };

  return (
    <div className="h-[calc(100vh-8rem)] bg-brand-surface border border-brand-dark/10 rounded-2xl overflow-hidden flex shadow-sm">
      
      {/* Projects Sidebar */}
      <div className="w-1/3 max-w-[320px] bg-brand-bg/50 border-r border-brand-dark/10 flex flex-col">
        <div className="p-5 border-b border-brand-dark/10 bg-brand-surface shrink-0">
          <h2 className="font-semibold text-brand-text flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-brand-accent" /> Project Chats
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
          {loadingProjects ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-6 h-6 text-brand-accent animate-spin" />
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center p-6 text-brand-text/50 text-sm">
              You are not assigned to any projects yet.
            </div>
          ) : (
            projects.map(project => (
              <button
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                  selectedProject?.id === project.id 
                    ? 'bg-brand-dark text-white shadow-md' 
                    : 'text-brand-text hover:bg-brand-surface border border-transparent hover:border-brand-dark/5'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  selectedProject?.id === project.id ? 'bg-white/20' : 'bg-brand-dark/5'
                }`}>
                  <Hash className={`w-5 h-5 ${selectedProject?.id === project.id ? 'text-white' : 'text-brand-accent'}`} />
                </div>
                <div className="overflow-hidden">
                  <h3 className="font-medium truncate">{project.name}</h3>
                  <p className={`text-xs truncate ${selectedProject?.id === project.id ? 'text-white/70' : 'text-brand-text/50'}`}>
                    {project.status}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-brand-surface relative">
        {selectedProject ? (
          <>
            {/* Chat Header */}
            <div className="p-5 border-b border-brand-dark/10 bg-brand-surface/95 backdrop-blur z-10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-dark/5 rounded-lg flex items-center justify-center">
                  <Hash className="w-5 h-5 text-brand-accent" />
                </div>
                <div>
                  <h2 className="font-bold text-brand-text text-lg">{selectedProject.name}</h2>
                  <p className="text-xs text-brand-text/60">Internal team chat</p>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-brand-bg/20">
              {loadingMessages ? (
                <div className="flex justify-center p-12">
                  <Loader2 className="w-8 h-8 text-brand-accent animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-brand-text/40 space-y-3">
                  <MessageSquare className="w-12 h-12 opacity-20" />
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMe = msg.sender_id === currentUser?.id;
                  const showAvatar = idx === 0 || messages[idx - 1].sender_id !== msg.sender_id;
                  
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${showAvatar ? 'mt-6' : 'mt-1'}`}>
                      {!isMe && (
                        <div className="w-8 shrink-0 mr-3">
                          {showAvatar && (
                            <div className="w-8 h-8 rounded-full bg-brand-dark flex items-center justify-center text-xs font-bold text-white shadow-sm" title={msg.profiles?.full_name}>
                              {msg.profiles?.full_name?.charAt(0) || 'U'}
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                        {showAvatar && !isMe && (
                          <span className="text-xs font-medium text-brand-text/50 mb-1 ml-1">{msg.profiles?.full_name}</span>
                        )}
                        <div 
                          className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm relative ${
                            isMe 
                              ? 'bg-brand-accent text-white rounded-br-sm' 
                              : 'bg-white border border-brand-dark/5 text-brand-text rounded-bl-sm'
                          }`}
                        >
                          {msg.content}
                        </div>
                        <span className={`text-[10px] text-brand-text/40 mt-1 ${isMe ? 'mr-1' : 'ml-1'}`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 bg-brand-surface border-t border-brand-dark/10 shrink-0">
              <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-brand-bg border border-brand-dark/10 rounded-full px-5 py-3 text-sm focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="w-12 h-12 bg-brand-accent text-white rounded-full flex items-center justify-center hover:opacity-90 disabled:opacity-50 transition-all shrink-0 shadow-sm"
                >
                  <Send className="w-5 h-5 ml-1" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-brand-text/40 bg-brand-bg/30 p-8 text-center space-y-4">
            <div className="w-20 h-20 bg-brand-dark/5 rounded-full flex items-center justify-center mb-2">
              <MessageSquare className="w-10 h-10 text-brand-text/30" />
            </div>
            <h3 className="text-xl font-medium text-brand-text/70">Select a Project</h3>
            <p className="max-w-md">Choose a project from the sidebar to chat with the assigned team members and coordinate your work.</p>
          </div>
        )}
      </div>
    </div>
  );
}
