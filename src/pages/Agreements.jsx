import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../lib/api";
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Loader2, 
  FileText, 
  X,
  Shield,
  FileCheck,
  Send,
  Download,
  Search,
  Filter,
  ArrowRight,
  Eye,
  FileSignature
} from "lucide-react";
import { Link } from "react-router-dom";
import SuperAdminModal from "../components/SuperAdminModal";
import ConfirmModal from "../components/ConfirmModal";
import AlertModal from "../components/AlertModal";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { createPortal } from "react-dom";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function Agreements() {
  const [agreements, setAgreements] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const defaultTemplate = `1. Scope of Work
Development of website/mobile application including UI/UX design, development, testing, and deployment. Features outside agreed scope will be charged additionally.

2. Timeline
Project delivery within ___ days from advance payment and content submission. Delays from client side extend timeline.

3. Payment Terms
- 50% advance before project start
- 50% before final delivery
No deployment or source code delivery before full payment.

4. Revisions
Up to 2 revisions included. Additional revisions will be charged.

5. Client Responsibilities
Client must provide content, approvals, and feedback on time. Delays affect delivery.

6. Ownership
Ownership transferred only after full payment. Until then, all rights remain with Tiny Dev Solutions.

7. Cancellation Policy
Advance payment is non-refundable once work begins.

8. Limitation of Liability
Service Provider is not liable for indirect or business losses arising from usage.

9. Confidentiality
Both parties agree to maintain confidentiality of project data.`;
  const [formData, setFormData] = useState({ client: "", title: "WEBSITE & SOFTWARE DEVELOPMENT AGREEMENT", content: defaultTemplate, status: "Draft" });

  const [isSuperGateOpen, setIsSuperGateOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [alertConfig, setAlertConfig] = useState({ isOpen: false, message: "" });
  
  const user = JSON.parse(localStorage.getItem("crm_user"));

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [agrRes, leadRes] = await Promise.all([api.get("/agreements"), api.get("/leads")]);
      setAgreements(agrRes.data);
      setClients(leadRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const triggerSecuredAction = (actionFn) => {
    if (user?.role !== "superadmin") {
      setPendingAction(() => actionFn);
      setIsSuperGateOpen(true);
    } else {
      actionFn(null);
    }
  };

  const executeUpdate = async (password = null) => {
    try {
      const config = password ? { headers: { 'x-superadmin-password': password } } : {};
      const { data } = await api.put(`/agreements/${editingId}`, formData, config);
      setAgreements(agreements.map(a => a._id === editingId ? data : a));
      setIsModalOpen(false);
      setEditingId(null);
      setIsSuperGateOpen(false);
    } catch (error) {
      setAlertConfig({ isOpen: true, message: error.response?.data?.message || "Failed to update agreement" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      triggerSecuredAction(executeUpdate);
    } else {
      try {
        const { data } = await api.post("/agreements", formData);
        setAgreements([data, ...agreements]);
        setIsModalOpen(false);
        setEditingId(null);
      } catch (error) {
        setAlertConfig({ isOpen: true, message: "Failed to save agreement" });
      }
    }
  };

  const handleStatusChange = (id, newStatus) => {
    triggerSecuredAction(async (password = null) => {
      try {
        const config = password ? { headers: { 'x-superadmin-password': password } } : {};
        const { data } = await api.put(`/agreements/${id}`, { status: newStatus }, config);
        setAgreements(agreements.map(a => a._id === id ? data : a));
        setIsSuperGateOpen(false);
      } catch (err) {
        setAlertConfig({ isOpen: true, message: err.response?.data?.message || "Failed to update status" });
      }
    });
  };

  const confirmDelete = (id) => {
    setConfirmId(id);
    setIsConfirmOpen(true);
  };

  const executeDelete = async (id, password = null) => {
    try {
      const config = password ? { headers: { 'x-superadmin-password': password } } : {};
      await api.delete(`/agreements/${id}`, config);
      setAgreements(agreements.filter(a => a._id !== id));
      setIsConfirmOpen(false);
      setIsSuperGateOpen(false);
    } catch (err) {
      setAlertConfig({ isOpen: true, message: err.response?.data?.message || "Failed to delete" });
    }
  };

  const handleDelete = () => {
    triggerSecuredAction((password) => executeDelete(confirmId, password));
  };

  const openModal = (agr = null) => {
    if (agr) {
      setFormData({ client: agr.client?._id, title: agr.title, content: agr.content, status: agr.status });
      setEditingId(agr._id);
    } else {
      setFormData({ client: "", title: "Standard Agency Custom Agreement", content: defaultTemplate, status: "Draft" });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-10 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-500 mb-1">
             <div className="h-1 w-8 bg-indigo-500 rounded-full"></div>
             <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Compliance & Legal</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white">Legal Agreements</h1>
          <p className="mt-2 text-zinc-400">Generate, manage, and execute high-fidelity client contracts.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-xl shadow-indigo-500/20 hover:bg-indigo-500 hover:-translate-y-0.5 transition-all active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Draft New Agreement
        </button>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
            { label: 'Active Documents', value: agreements.length, icon: FileCheck, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
            { label: 'Executed (Signed)', value: agreements.filter(a => a.status === 'Signed').length, icon: FileSignature, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
            { label: 'Awaiting Execution', value: agreements.filter(a => a.status === 'Sent').length, icon: Send, color: 'text-amber-400', bg: 'bg-amber-400/10' },
            { label: 'Legal Maturity', value: '100%', icon: Shield, color: 'text-brand-400', bg: 'bg-brand-400/10' },
        ].map((s, idx) => (
            <motion.div 
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="glass-card p-5 rounded-3xl group relative overflow-hidden"
            >
                <div className="flex items-center gap-4">
                    <div className={cn("p-3 rounded-2xl", s.bg, s.color)}>
                        <s.icon className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{s.label}</p>
                        <p className="text-2xl font-bold text-white">{s.value}</p>
                    </div>
                </div>
            </motion.div>
        ))}
      </div>

      <div className="flex-1 rounded-3xl glass-card overflow-hidden flex flex-col shadow-2xl">
        {/* Toolbar */}
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white/[0.02]">
            <div className="flex items-center gap-4">
                <h3 className="font-bold text-lg text-white">Document Registry</h3>
                <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold text-zinc-500">{agreements.length} TOTAL</span>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative group flex-1 sm:flex-none">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Filter registry..." 
                        className="bg-zinc-950/50 border border-white/5 rounded-xl py-2 pl-9 pr-4 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all w-full sm:w-48 sm:focus:w-64" 
                    />
                </div>
                <button className="flex items-center justify-center p-2 bg-white/5 border border-white/10 rounded-xl text-zinc-400 hover:text-white transition-all">
                    <Filter className="h-4 w-4" />
                </button>
            </div>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar">
          <div className="min-w-[1000px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.01] border-b border-white/5 text-[11px] uppercase tracking-wider text-zinc-500 font-bold">
                <th className="px-8 py-5">Document Title</th>
                <th className="px-8 py-5">Stakeholder</th>
                <th className="px-8 py-5">Generation Date</th>
                <th className="px-8 py-5">Maturity Status</th>
                <th className="px-8 py-5 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                    <td colSpan="5" className="px-8 py-20 text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-500 mb-2" />
                        <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Accessing Document Vault...</span>
                    </td>
                </tr>
              ) : agreements.length === 0 ? (
                <tr>
                    <td colSpan="5" className="px-8 py-20 text-center">
                        <div className="opacity-30 flex flex-col items-center">
                            <FileText className="h-12 w-12 mb-3" />
                            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">No active agreements found.</p>
                        </div>
                    </td>
                </tr>
              ) : (
                agreements.map((agr, idx) => (
                  <motion.tr 
                    key={agr._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-white/[0.03] transition-colors group"
                  >
                    <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-zinc-100 group-hover:text-indigo-400 transition-colors">{agr.title}</span>
                                <span className="text-[10px] text-zinc-500 mt-0.5">UID-{agr._id.slice(-6).toUpperCase()}</span>
                            </div>
                        </div>
                    </td>
                    <td className="px-8 py-6 text-zinc-300 font-medium">{agr.client?.name || "—"}</td>
                    <td className="px-8 py-6">
                        <div className="flex flex-col">
                            <span className="text-zinc-300 text-xs font-medium">{new Date(agr.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                            <span className="text-[10px] text-zinc-500">{new Date(agr.createdAt).getFullYear()}</span>
                        </div>
                    </td>
                    <td className="px-8 py-6">
                      <select 
                        value={agr.status} onChange={(e) => handleStatusChange(agr._id, e.target.value)}
                        className={cn(
                            "appearance-none border-0 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase cursor-pointer focus:ring-2 focus:ring-white/10 outline-none transition-all shadow-lg",
                            agr.status === 'Signed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                            agr.status === 'Sent' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                            'bg-white/5 text-zinc-400 border border-white/10'
                        )}
                      >
                        <option className="bg-zinc-900 text-white" value="Draft">Draft Mode</option>
                        <option className="bg-zinc-900 text-white" value="Sent">Dispatched</option>
                        <option className="bg-zinc-900 text-white" value="Signed">Executed</option>
                      </select>
                    </td>
                    <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                           <button onClick={() => openModal(agr)} className="p-2 text-zinc-500 hover:text-indigo-400 bg-white/5 border border-white/5 rounded-xl transition-all" title="Edit Document"><Edit3 className="h-4 w-4" /></button>
                           <Link to={`/agreement/${agr._id}`} target="_blank" className="p-2 text-zinc-500 hover:text-white bg-white/5 border border-white/5 rounded-xl transition-all" title="View/Print Preview"><Eye className="h-4 w-4" /></Link>
                           <button onClick={() => confirmDelete(agr._id)} className="p-2 text-zinc-500 hover:text-red-400 bg-white/5 border border-white/5 rounded-xl transition-all" title="Purge Document"><Trash2 className="h-4 w-4" /></button>
                        </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>

       {/* Modal */}
       {createPortal(
       <AnimatePresence>
       {isModalOpen && (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-md"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="glass-card w-full max-w-4xl rounded-3xl p-6 md:p-8 relative max-h-[95vh] overflow-hidden flex flex-col shadow-2xl"
          >
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-white bg-white/5 rounded-xl transition-all z-10">
                <X className="h-5 w-5" />
            </button>

            <div className="mb-6 flex items-center gap-4">
                <div className="h-12 w-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-500 shrink-0">
                    <FileSignature className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">{editingId ? "Update Document Registry" : "Seal New Agreement"}</h2>
                  <p className="text-zinc-500 text-xs mt-1 uppercase tracking-widest font-bold">Legal Framework Initialization</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Document Title</label>
                  <input required type="text" name="title" value={formData.title} onChange={handleChange} className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none transition-all" placeholder="e.g. Master Services Agreement" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Associated Entity (Client)</label>
                  <select required name="client" value={formData.client} onChange={handleChange} className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none appearance-none cursor-pointer transition-all">
                    <option value="" className="bg-zinc-900 text-zinc-500">- Select Stakeholder -</option>
                    {clients.map(c => <option key={c._id} value={c._id} className="bg-zinc-900 text-white">{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex-1 flex flex-col space-y-1.5 overflow-hidden">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Contractual Clauses (Markdown Supported)</label>
                <textarea required name="content" value={formData.content} onChange={handleChange} className="flex-1 w-full bg-white/[0.02] border border-white/5 rounded-2xl px-6 py-6 text-sm text-zinc-300 focus:border-indigo-500 outline-none resize-none font-mono leading-relaxed custom-scrollbar shadow-inner" />
              </div>
              
              <div className="mt-8 flex flex-col sm:flex-row justify-end gap-3 md:gap-4 pt-6 border-t border-white/5 bg-zinc-900/50 -mx-8 px-8 -mb-8 pb-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-sm font-bold text-zinc-500 hover:text-white transition-colors order-2 sm:order-1">Discard</button>
                <button type="submit" className="flex items-center justify-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-xl shadow-indigo-500/20 transition-all active:scale-95 order-1 sm:order-2">
                    <FileCheck className="h-4 w-4" />
                    {editingId ? "Commit Clauses" : "Seal Document"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
       )}
       </AnimatePresence>,
       document.body
       )}

      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Purge Legal Stream"
        message="Are you absolutely sure you want to permanently delete this agreement? This action is irreversible and legally significant."
        confirmText="Yes, Purge Document"
      />

      <SuperAdminModal 
        isOpen={isSuperGateOpen}
        onClose={() => setIsSuperGateOpen(false)}
        onSubmit={(password) => pendingAction && pendingAction(password)}
        targetActionLabel="Modifying or deleting a legal document"
      />
      
      <AlertModal 
        isOpen={alertConfig.isOpen}
        onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })}
        message={alertConfig.message}
      />

    </div>
  );
}

