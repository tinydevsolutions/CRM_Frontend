import React, { useState } from "react";
import { Lock, X, Loader2 } from "lucide-react";

export default function SuperAdminModal({ isOpen, onClose, onSubmit, isLoading, targetActionLabel }) {
  const [password, setPassword] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password.trim()) return;
    onSubmit(password);
    setPassword("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-sm rounded-2xl shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
        <button 
          onClick={() => { setPassword(""); onClose(); }}
          className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-100 transition-colors"
        >
           <X className="h-5 w-5" />
        </button>
        
        <div className="flex flex-col items-center text-center space-y-4 mb-6">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-500/10 border border-red-500/20 mb-2">
            <Lock className="h-8 w-8 text-red-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white mb-1">Restricted Action</h2>
            <p className="text-sm text-zinc-400">
              {targetActionLabel || "This action"} requires Super Admin authorization to execute.
            </p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input 
              required 
              type="password" 
              autoFocus
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all text-center placeholder-zinc-600 font-mono tracking-widest text-zinc-100" 
              placeholder="••••••••" 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading || !password.trim()}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-red-500/20 hover:bg-red-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Authorize Action"}
          </button>
        </form>
      </div>
    </div>
  );
}
