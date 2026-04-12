import React from "react";
import { AlertCircle, X, Loader2 } from "lucide-react";

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, isLoading, confirmText = "Confirm" }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-sm rounded-2xl shadow-xl p-6 relative animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-100 transition-colors"
        >
           <X className="h-5 w-5" />
        </button>
        
        <div className="flex gap-4">
          <div className="shrink-0 inline-flex items-center justify-center h-10 w-10 rounded-full bg-orange-500/10 text-orange-500 mt-1">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white mb-1">{title}</h2>
            <p className="text-sm text-zinc-400 leading-relaxed mb-6">
              {message}
            </p>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 pt-2">
          <button 
            onClick={onClose} 
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
