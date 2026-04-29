import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, X, Loader2, ShieldAlert } from "lucide-react";
import { createPortal } from "react-dom";

export default function SuperAdminModal({ isOpen, onClose, onSubmit, isLoading, targetActionLabel }) {
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password.trim()) return;
    onSubmit(password);
    setPassword("");
  };

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
            className="glass-card w-full max-w-sm rounded-[2.5rem] p-10 relative overflow-hidden shadow-2xl border-red-500/10"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
            
            <button 
              onClick={() => { setPassword(""); onClose(); }}
              className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-white bg-white/5 rounded-xl transition-all"
            >
               <X className="h-5 w-5" />
            </button>
            
            <div className="flex flex-col items-center text-center space-y-6 mb-8">
              <div className="inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-red-500/10 border border-red-500/20 shadow-xl relative group">
                <div className="absolute inset-0 bg-red-500/20 blur-xl animate-pulse" />
                <ShieldAlert className="h-10 w-10 text-red-500 relative z-10" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white mb-2">Restricted Action</h2>
                <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                    {targetActionLabel || "The requested operation"} is protected by high-level security protocols.
                </p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 ml-1">Master Passphrase</label>
                <div className="relative group">
                    <input 
                      required 
                      type="password" 
                      autoFocus
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-4 py-4 text-sm focus:border-red-500/50 outline-none transition-all text-center placeholder-zinc-700 font-mono tracking-[0.5em] text-white" 
                      placeholder="••••••••" 
                    />
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={isLoading || !password.trim()}
                className="group relative w-full flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-4 text-sm font-bold text-white shadow-xl shadow-red-500/20 hover:bg-red-500 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                    <>
                        <Lock className="h-4 w-4" />
                        Authorize Sequence
                    </>
                )}
              </button>
              
              <p className="text-[9px] text-zinc-600 text-center uppercase tracking-widest font-bold">
                  Encryption Layer Active
              </p>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

