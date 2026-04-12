import React, { useState, useEffect } from "react";
import api from "../lib/api";
import { Save, Loader2, Key, User, Link as LinkIcon, Copy, CheckCircle2 } from "lucide-react";

export default function Settings() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("crm_user"));
    if (user) {
      setFormData({ name: user.name || "", email: user.email || "", password: "" });
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

  return (
    <div className="max-w-2xl animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold tracking-tight mb-2">System Settings</h1>
      <p className="text-zinc-400 mb-8">Manage your agency profile and administrative credentials securely.</p>

      {msg.text && (
        <div className={`mb-6 p-4 rounded-xl border font-medium text-sm ${msg.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
          {msg.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-zinc-900/60 border border-zinc-800/60 p-8 rounded-2xl shadow-sm">
        
        <div className="flex items-center gap-3 border-b border-zinc-800/60 pb-4 mb-4">
          <User className="text-brand-400 h-5 w-5" />
          <h2 className="text-lg font-semibold">Profile Details</h2>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">Admin Name</label>
          <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm focus:border-brand-500 outline-none transition-all text-zinc-100" />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">Email Address</label>
          <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm focus:border-brand-500 outline-none transition-all text-zinc-100" />
        </div>

        <div className="flex items-center gap-3 border-b border-zinc-800/60 pb-4 mb-4 mt-8 pt-6">
          <Key className="text-brand-400 h-5 w-5" />
          <h2 className="text-lg font-semibold">Security</h2>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">New Password <span className="text-xs text-zinc-600 font-normal">(Leave blank to keep unchanged)</span></label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm focus:border-brand-500 outline-none transition-all text-zinc-100" placeholder="••••••••" />
        </div>

        <div className="pt-6 border-t border-zinc-800/60 flex justify-end">
          <button type="submit" disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-brand-500/20 hover:bg-brand-500 transition-all disabled:opacity-50">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Settings
          </button>
        </div>
      </form>

      {/* Team Management & Invites */}
      <div className="mt-8 bg-zinc-900/60 border border-zinc-800/60 p-8 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3 border-b border-zinc-800/60 pb-4 mb-4">
          <LinkIcon className="text-brand-400 h-5 w-5" />
          <h2 className="text-lg font-semibold">Team Management & Invites</h2>
        </div>
        <p className="text-sm text-zinc-400 mb-6">Public registration is fully disabled. Generate a secure, one-time-use invite link to allow a new teammate to register.</p>

        <button 
          onClick={handleGenerateInvite} 
          disabled={inviteLoading} 
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 px-5 py-2.5 text-sm font-medium text-zinc-200 transition-all border border-zinc-700 mb-4"
        >
          {inviteLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "+ Generate Magic Registration Link"}
        </button>

        {inviteLink && (
           <div className="p-4 rounded-xl border border-brand-500/30 bg-brand-500/5 animate-in fade-in zoom-in-95 duration-300">
             <p className="text-xs text-brand-400 font-bold uppercase tracking-wider mb-2">Secure Link Generated (Expires in 24h)</p>
             <div className="flex items-center gap-3">
                <input 
                  readOnly 
                  value={inviteLink} 
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 outline-none"
                />
                <button 
                  onClick={copyToClipboard}
                  className="p-2.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white transition-colors flex shrink-0"
                  title="Copy to clipboard"
                >
                  {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
             </div>
           </div>
        )}
      </div>

    </div>
  );
}
