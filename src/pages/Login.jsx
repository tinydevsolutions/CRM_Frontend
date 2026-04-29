import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../lib/api";
import { LayoutDashboard, Loader2, ArrowRight, ShieldCheck, Lock } from "lucide-react";
import tdsLogo from "../../public/favicon.ico";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data } = await api.post("/auth/login", { email: formData.email, password: formData.password });
      
      localStorage.setItem("crm_user", JSON.stringify(data));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Authentication failed. Please verify credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden text-zinc-100">
      {/* Ambient Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-500/10 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center"
      >
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-zinc-900 border border-white/10 shadow-2xl mb-8 relative group">
            <div className="absolute inset-0 bg-brand-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <img src={tdsLogo} alt="TDS Logo" className="h-12 w-12 relative z-10" />
        </div>
        <h2 className="text-4xl font-bold tracking-tight text-white mb-2">
          Cloud Central
        </h2>
        <p className="text-zinc-500 font-medium text-sm tracking-wide uppercase">
          TinyDevSolutions Executive CRM
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mt-10 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="glass-card py-10 px-8 shadow-2xl sm:rounded-[2.5rem] sm:px-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-500 to-transparent" />
          
          <div className="mb-8">
              <h3 className="text-xl font-bold text-white mb-1">Administrative Access</h3>
              <p className="text-xs text-zinc-500">Secure gateway for authorized internal personnel.</p>
          </div>

          <AnimatePresence>
          {error && (
            <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold"
            >
              {error}
            </motion.div>
          )}
          </AnimatePresence>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Identity (Email)</label>
              <div className="relative group">
                <input
                  name="email"
                  type="email"
                  required
                  className="block w-full rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3.5 placeholder-zinc-600 focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all text-white text-sm"
                  placeholder="admin@tinydevsolutions.com"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Authorization (Password)</label>
              <div className="relative group">
                <input
                  name="password"
                  type="password"
                  required
                  className="block w-full rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3.5 placeholder-zinc-600 focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all text-white text-sm"
                  placeholder="••••••••"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative flex w-full justify-center items-center gap-3 rounded-2xl bg-brand-600 py-4 px-4 text-sm font-bold text-white shadow-xl shadow-brand-500/20 hover:bg-brand-500 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                    <>
                      Verify & Initialize
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
            </div>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 flex items-center justify-center gap-2 text-zinc-500">
              <ShieldCheck className="h-4 w-4 text-brand-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest">End-to-End Encrypted Session</span>
          </div>
        </div>
        
        <p className="mt-8 text-center text-zinc-600 text-xs font-medium">
            © 2026 TinyDevSolutions. Proprietary System.
        </p>
      </motion.div>
    </div>
  );
}
