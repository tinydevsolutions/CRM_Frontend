import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { createPortal } from "react-dom";

export default function AlertModal({ isOpen, onClose, message, title = "System Alert" }) {
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
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-500">
                <AlertTriangle className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
                <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                  {message}
                </p>
              </div>
            </div>
            
            <button 
              onClick={onClose}
              className="w-full py-4 text-xs font-bold bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all active:scale-[0.98] uppercase tracking-widest border border-white/5"
            >
              Acknowledge
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

