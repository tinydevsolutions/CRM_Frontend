import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../lib/api";
import { Loader2, ArrowRight, ShieldCheck, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import tdsLogo from "../../public/favicon.ico";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

  const LeftPanel = () => (
    <div className="hidden lg:flex lg:w-[45%] bg-zinc-950 relative overflow-hidden flex-col justify-center p-12 lg:p-20 border-r border-white/5">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-brand-500/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 max-w-md">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-zinc-900 border border-white/10 shadow-2xl mb-8 group">
                <img src={tdsLogo} alt="TDS Logo" className="h-7 w-7 relative z-10" />
            </div>
            
            <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
                Welcome Back
            </h1>
            <p className="text-zinc-400 text-sm mb-12 leading-relaxed">
                Log in to access your TinyDevSolutions Executive CRM dashboard and manage your business.
            </p>

            <div className="space-y-8">
                {[
                    { title: "Secure Access", desc: "Enterprise-grade encryption protecting your administrative session." },
                    { title: "Real-time Sync", desc: "Live dashboard updates and instant push notifications." },
                    { title: "Unified Control", desc: "Manage clients, projects, and revenue from one central hub." }
                ].map((item, idx) => (
                    <motion.div 
                      key={idx} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 + 0.2 }}
                      className="flex gap-4"
                    >
                        <div className="mt-0.5">
                            <CheckCircle2 className="h-5 w-5 text-brand-500" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white">{item.title}</h3>
                            <p className="text-xs text-zinc-500 mt-1">{item.desc}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col lg:flex-row text-zinc-100">
      
      <LeftPanel />

      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 relative bg-zinc-950/50">
        
        {/* Mobile Header */}
        <div className="lg:hidden text-center mb-10">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-zinc-900 border border-white/10 shadow-2xl mb-6 relative">
                <img src={tdsLogo} alt="TDS Logo" className="h-7 w-7 relative z-10" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Welcome Back</h2>
            <p className="text-zinc-500 font-medium text-xs tracking-wide uppercase">TinyDevSolutions CRM</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="mx-auto w-full max-w-md"
        >
          <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 py-10 px-8 shadow-2xl rounded-3xl sm:px-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-500 to-transparent opacity-50" />
            
            <div className="mb-8 text-center">
                <h3 className="text-xl font-bold text-white mb-1">Administrative Login</h3>
                <p className="text-sm text-zinc-400">Please authenticate to continue.</p>
            </div>

            <AnimatePresence>
            {error && (
              <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium text-center"
              >
                {error}
              </motion.div>
            )}
            </AnimatePresence>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1">Email Address</label>
                <input
                  name="email"
                  type="email"
                  required
                  className="block w-full rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 placeholder-zinc-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all text-white text-sm"
                  placeholder="admin@tinydevsolutions.com"
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1">Password</label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="block w-full rounded-xl border border-white/10 bg-white/[0.02] pl-4 pr-12 py-3 placeholder-zinc-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all text-white text-sm"
                    placeholder="••••••••"
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative flex w-full justify-center items-center gap-2 rounded-xl bg-brand-500 hover:bg-brand-600 py-3.5 px-4 text-sm font-bold text-white shadow-lg transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                      <>
                        Sign In
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
              </div>
            </form>

            <div className="mt-8 flex items-center justify-center gap-2 text-zinc-500">
                <ShieldCheck className="h-4 w-4 text-brand-500/70" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Encrypted Session</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
