'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, X, ShieldAlert } from 'lucide-react';

export default function SecurityDeleteModal({ isOpen, onClose, onConfirm, userName }) {
  const [understood, setUnderstood] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setUnderstood(false);
      setPassword('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!understood) {
      setError("Please affirm that you understand the consequences.");
      return;
    }
    if (password !== "Admin@2004") {
      setError("Incorrect security password.");
      return;
    }
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-dark/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-brand-surface w-full max-w-md rounded-2xl shadow-2xl border border-red-500/20 overflow-hidden scale-in-center">
        <div className="bg-red-50 border-b border-red-100 p-6 flex flex-col items-center text-center relative">
          <button onClick={onClose} className="absolute top-4 right-4 p-1 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600 ring-4 ring-red-50">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-red-700 mb-1">Security Verification Required</h2>
          <p className="text-red-600/80 text-sm">You are about to permanently delete the user account for <strong className="text-red-700">{userName}</strong>.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <label className="flex items-start gap-3 p-3 bg-brand-bg rounded-lg border border-brand-dark/10 cursor-pointer hover:border-brand-dark/20 transition-colors">
              <input 
                type="checkbox" 
                checked={understood}
                onChange={(e) => {
                  setUnderstood(e.target.checked);
                  setError('');
                }}
                className="mt-1 w-4 h-4 text-red-600 rounded border-brand-dark/20 focus:ring-red-600"
              />
              <span className="text-sm text-brand-text/80">
                I affirm that this action <strong className="text-red-600 font-semibold">CANNOT BE UNDONE</strong>. All associated data, projects, and history may be affected.
              </span>
            </label>

            <div className={`transition-all duration-300 ${understood ? 'opacity-100 h-auto' : 'opacity-50 pointer-events-none'}`}>
              <label className="block text-sm font-medium text-brand-text mb-1.5">Enter Security Password</label>
              <input 
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Required to complete action"
                className={`w-full bg-brand-bg border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all ${
                  error ? 'border-red-300 focus:ring-red-500/20' : 'border-brand-dark/10 focus:ring-brand-accent/20 focus:border-brand-accent'
                }`}
                disabled={!understood}
              />
              {error && <p className="text-red-500 text-xs mt-1.5 font-medium">{error}</p>}
            </div>
          </div>
          
          <div className="flex gap-3 justify-end mt-6 pt-6 border-t border-brand-dark/5">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg text-sm font-medium text-brand-text hover:bg-brand-bg transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={!understood || !password}
              className="px-5 py-2.5 rounded-lg text-sm font-bold bg-red-600 hover:bg-red-700 text-white shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" /> Delete User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
