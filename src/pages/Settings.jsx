import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../lib/api";
import { 
  Plus,
  Save, 
  Loader2, 
  Key, 
  User, 
  Link as LinkIcon, 
  Copy, 
  CheckCircle2,
  Shield,
  Fingerprint,
  Mail,
  Zap,
  Globe,
  Bell,
  Layers
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function Settings() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [preferences, setPreferences] = useState({
    notifications: {
        financialAlerts: true,
        newLeadWebhooks: true,
        systemLogs: false
    }
  });
  const [loading, setLoading] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("crm_user"));
    if (user) {
      setFormData({ name: user.name || "", email: user.email || "", password: "" });
      if (user.preferences) setPreferences(user.preferences);
    }
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ text: "", type: "" });
    try {
      const { data } = await api.put("/auth/profile", formData);
      localStorage.setItem("crm_user", JSON.stringify(data));
      setFormData({ ...formData, password: "" }); // clear password
      setMsg({ text: "Profile updated successfully!", type: "success" });
    } catch (err) {
      setMsg({ text: err.response?.data?.message || "Failed to update profile", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInvite = async () => {
    setInviteLoading(true);
    setInviteLink("");
    setCopied(false);
    try {
      const { data } = await api.post("/invites");
      setInviteLink(data.link);
    } catch (err) {
      setMsg({ text: err.response?.data?.message || "Failed to generate invite.", type: "error" });
    } finally {
      setInviteLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTogglePreference = async (key) => {
    const updatedPreferences = {
      ...preferences,
      notifications: {
        ...preferences.notifications,
        [key]: !preferences.notifications[key]
      }
    };
    
    // Optimistic update
    setPreferences(updatedPreferences);
    
    try {
      const { data } = await api.put("/auth/profile", { preferences: updatedPreferences });
      localStorage.setItem("crm_user", JSON.stringify(data));
      setMsg({ text: "Preferences updated!", type: "success" });
    } catch (err) {
      // Revert on error
      setPreferences(preferences);
      setMsg({ text: "Failed to update preferences", type: "error" });
    }
  };

  return (
    <div className="max-w-4xl space-y-10">
      <div>
          <div className="flex items-center gap-2 text-brand-500 mb-1">
             <div className="h-1 w-8 bg-brand-500 rounded-full"></div>
             <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Preference Hub</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white">System Settings</h1>
          <p className="mt-2 text-zinc-400">Manage your administrative identity and system-level configurations.</p>
      </div>

      <AnimatePresence>
      {msg.text && (
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn(
                "p-4 rounded-2xl border font-bold text-xs uppercase tracking-widest",
                msg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
            )}
        >
          {msg.text}
        </motion.div>
      )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            <form onSubmit={handleSubmit} className="glass-card p-8 rounded-3xl space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-brand-500/10 rounded-xl text-brand-400">
                            <Fingerprint className="h-5 w-5" />
                        </div>
                        <h2 className="text-lg font-bold text-white">Identity Credentials</h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Full Name</label>
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-brand-400 transition-colors" />
                            <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-white focus:border-brand-500 outline-none transition-all" />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Email Endpoint</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-brand-400 transition-colors" />
                            <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-white focus:border-brand-500 outline-none transition-all" />
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-white/5">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400">
                            <Key className="h-5 w-5" />
                        </div>
                        <h2 className="text-lg font-bold text-white">Security Override</h2>
                    </div>
                    
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Update Password</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-4 py-3.5 text-sm text-white focus:border-brand-500 outline-none transition-all" placeholder="Enter new password to reset" />
                        <p className="text-[10px] text-zinc-500 italic mt-1.5 ml-1">Minimum 8 characters with alphanumeric combinations recommended.</p>
                    </div>
                </div>

                <div className="pt-6 border-t border-white/5 flex justify-end">
                    <button type="submit" disabled={loading} className="group relative flex items-center gap-2 rounded-2xl bg-brand-600 px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-brand-500/20 hover:bg-brand-500 transition-all active:scale-95 disabled:opacity-50">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 group-hover:scale-110 transition-transform" />}
                        Commit Settings
                    </button>
                </div>
            </form>

            <div className="glass-card p-8 rounded-3xl">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400">
                        <Zap className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg font-bold text-white">Access Orchestration</h2>
                </div>
                <p className="text-sm text-zinc-400 mb-8 leading-relaxed">
                    Registration is locked globally. Authorized personnel can generate temporary invitations for new stakeholder onboarding.
                </p>

                <div className="space-y-4">
                    <button 
                        onClick={handleGenerateInvite} 
                        disabled={inviteLoading} 
                        className="flex items-center justify-center gap-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-4 text-xs font-bold text-white uppercase tracking-widest transition-all w-full active:scale-[0.98] disabled:opacity-50"
                    >
                        {inviteLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                        Generate Magic Link
                    </button>

                    <AnimatePresence>
                    {inviteLink && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 space-y-4"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Temporal Link (24H EXPIRE)</span>
                                <div className="flex items-center gap-1.5 text-[10px] text-emerald-500 font-bold uppercase tracking-tighter">
                                    <Shield className="h-3 w-3" />
                                    SECURE
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <input 
                                    readOnly 
                                    value={inviteLink} 
                                    className="flex-1 bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs text-zinc-300 outline-none font-mono"
                                />
                                <button 
                                    onClick={copyToClipboard}
                                    className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg shadow-emerald-500/20"
                                >
                                    {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                </button>
                            </div>
                        </motion.div>
                    )}
                    </AnimatePresence>
                </div>
            </div>
        </div>

        <div className="space-y-6">
            <div className="glass-card p-6 rounded-3xl space-y-6">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em] px-1">Integrations</h3>
                <div className="space-y-4">
                    {[
                        { label: 'Cloud Database', status: 'Optimal', icon: Globe, color: 'text-emerald-400' },
                        { label: 'Asset Storage', status: 'Connected', icon: Layers, color: 'text-indigo-400' },
                        { label: 'Security Protocols', status: 'Locked', icon: Shield, color: 'text-brand-400' },
                    ].map(item => (
                        <div key={item.label} className="flex items-center justify-between p-3.5 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors cursor-default">
                            <div className="flex items-center gap-3">
                                <item.icon className={cn("h-4 w-4", item.color)} />
                                <span className="text-xs font-bold text-zinc-300">{item.label}</span>
                            </div>
                            <span className="text-[10px] font-bold text-zinc-500 uppercase">{item.status}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="glass-card p-6 rounded-3xl space-y-6">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em] px-1">Notifications</h3>
                <div className="space-y-4">
                    {[
                        { key: 'financialAlerts', label: 'Financial Alerts', active: preferences.notifications?.financialAlerts ?? true },
                        { key: 'newLeadWebhooks', label: 'New Lead Webhooks', active: preferences.notifications?.newLeadWebhooks ?? true },
                        { key: 'systemLogs', label: 'System Logs', active: preferences.notifications?.systemLogs ?? false },
                    ].map(item => (
                        <div key={item.key} className="flex items-center justify-between group cursor-pointer" onClick={() => handleTogglePreference(item.key)}>
                            <span className="text-xs font-medium text-zinc-400 group-hover:text-white transition-colors">{item.label}</span>
                            <div className={cn(
                                "w-10 h-5 rounded-full relative transition-colors duration-300 cursor-pointer border",
                                item.active ? "bg-brand-500/20 border-brand-500/50" : "bg-white/5 border-white/10"
                            )}>
                                <div className={cn(
                                    "absolute top-0.5 w-3.5 h-3.5 rounded-full transition-all duration-300",
                                    item.active ? "right-0.5 bg-brand-500" : "left-0.5 bg-zinc-600"
                                )} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

