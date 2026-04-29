import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, X, Loader2, Info } from "lucide-react";
import { createPortal } from "react-dom";

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, isLoading, confirmText = "Confirm" }) {
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-md"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="glass-card w-full max-w-sm rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl border-white/5"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-white bg-white/5 rounded-xl transition-all"
            >
               <X className="h-5 w-5" />
            </button>
            
            <div className="flex flex-col items-center text-center space-y-6 mb-8 pt-4">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                <AlertCircle className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
                <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                  {message}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={onClose} 
                disabled={isLoading}
                className="px-6 py-3.5 text-xs font-bold text-zinc-500 hover:text-white transition-all uppercase tracking-widest"
              >
                Cancel
              </button>
              <button 
                onClick={onConfirm}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 px-6 py-3.5 text-xs font-bold bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50 uppercase tracking-widest border border-white/5"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
