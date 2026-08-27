'use client';

import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', confirmStyle = 'danger' }) {
  if (!isOpen) return null;

  const btnClasses = confirmStyle === 'danger' 
    ? 'bg-red-600 hover:bg-red-700 text-white '
    : 'bg-brand-accent hover:opacity-90 text-white ';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-brand-surface w-full max-w-sm rounded-2xl  border border-brand-border overflow-hidden scale-in-center">
        <div className="p-6 text-center">
          <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-4 ${confirmStyle === 'danger' ? 'bg-[#1F0D0D] text-[#F87171] border border-[#3D1515]' : 'bg-brand-accent/10 text-brand-accent'}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-brand-text mb-2">{title}</h2>
          <p className="text-brand-text/70 text-sm mb-6">{message}</p>
          
          <div className="flex gap-3 justify-center">
            <button 
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg text-sm font-medium text-brand-text hover:bg-brand-bg transition-colors flex-1 border border-brand-border"
            >
              Cancel
            </button>
            <button 
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex-1 ${btnClasses}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
