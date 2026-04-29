import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../lib/api";
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Loader2, 
  Briefcase, 
  CheckCircle, 
  Clock,
  Layout,
  Layers,
  Zap,
  Target,
  ChevronRight,
  Filter,
  Calendar,
  X
} from "lucide-react";
import SuperAdminModal from "../components/SuperAdminModal";
import ConfirmModal from "../components/ConfirmModal";
import AlertModal from "../components/AlertModal";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { createPortal } from "react-dom";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({ 
    projectName: "", 
    clientName: "", 
    description: "", 
    deadline: "", 
    status: "Planning",
    progress: 0
  });

  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0 });

  const [isSuperGateOpen, setIsSuperGateOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [alertConfig, setAlertConfig] = useState({ isOpen: false, message: "" });
  
  const user = JSON.parse(localStorage.getItem("crm_user"));

  useEffect(() => {
    fetchProjects();
  }, []);

  const calculateStats = (data) => {
    setStats({
      total: data.length,
      active: data.filter(p => !["Completed", "On Hold"].includes(p.status)).length,
      completed: data.filter(p => p.status === "Completed").length
    });
  };

  const fetchProjects = async () => {
    try {
      const { data } = await api.get("/projects");
      setProjects(data);
      calculateStats(data);
    } catch (error) {
      setAlertConfig({ isOpen: true, message: "Failed to fetch projects" });
    } finally {
      setLoading(false);
    }
  };

  const triggerSecuredAction = (actionFn) => {
    if (user?.role !== "superadmin") {
      setPendingAction(() => actionFn);
      setIsSuperGateOpen(true);
    } else {
      actionFn(null);
    }
  };

  const executeUpdate = async () => {
    try {
      const { data } = await api.put(`/projects/${editingId}`, formData);
      const newProjects = projects.map(p => p._id === editingId ? data : p);
      setProjects(newProjects);
      calculateStats(newProjects);
      closeModal();
    } catch (error) {
      setAlertConfig({ isOpen: true, message: error.response?.data?.message || "Failed to update project" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      executeUpdate();
    } else {
      try {
        const { data } = await api.post("/projects", formData);
        const newProjects = [data, ...projects];
        setProjects(newProjects);
        calculateStats(newProjects);
        closeModal();
      } catch (error) {
        setAlertConfig({ isOpen: true, message: "Failed to create project" });
      }
    }
  };

  const confirmDelete = (id) => {
    setConfirmId(id);
    setIsConfirmOpen(true);
  };

  const executeDelete = async (id, password = null) => {
    try {
      const config = password ? { headers: { 'x-superadmin-password': password } } : {};
      await api.delete(`/projects/${id}`, config);
      const newProjects = projects.filter(p => p._id !== id);
      setProjects(newProjects);
      calculateStats(newProjects);
      setIsConfirmOpen(false);
      setIsSuperGateOpen(false);
    } catch (err) {
      setAlertConfig({ isOpen: true, message: err.response?.data?.message || "Failed to delete" });
    }
  };

  const handleDelete = () => {
    triggerSecuredAction((password) => executeDelete(confirmId, password));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const openModal = (proj = null) => {
    if (proj) {
      setEditingId(proj._id);
      setFormData({
        projectName: proj.projectName,
        clientName: proj.clientName,
        description: proj.description || "",
        deadline: proj.deadline ? new Date(proj.deadline).toISOString().split('T')[0] : "",
        status: proj.status,
        progress: proj.progress
      });
    } else {
      setEditingId(null);
      setFormData({ projectName: "", clientName: "", description: "", deadline: "", status: "Planning", progress: 0 });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const getStatusConfig = (status) => {
    const configs = {
      "Planning": { color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
      "Design": { color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20" },
      "Development": { color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" },
      "Testing": { color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/20" },
      "Deployment": { color: "text-cyan-400", bg: "bg-cyan-400/10", border: "border-cyan-400/20" },
      "Completed": { color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
      "On Hold": { color: "text-zinc-400", bg: "bg-zinc-400/10", border: "border-zinc-400/20" }
    };
    return configs[status] || { color: "text-zinc-500", bg: "bg-zinc-500/10", border: "border-zinc-500/20" };
  };

  const filteredProjects = projects.filter(p => 
    p.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <div className="flex items-center gap-2 text-brand-500 mb-1">
             <div className="h-1 w-8 bg-brand-500 rounded-full"></div>
             <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Operational Workflow</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white">Project Pipeline</h1>
          <p className="mt-2 text-zinc-400">Orchestrate development streams and monitor deployment maturity.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-bold text-white shadow-xl shadow-brand-500/20 hover:bg-brand-500 hover:-translate-y-0.5 transition-all active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Initialize Stream
        </button>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
            { label: 'Total Streams', value: stats.total, icon: Layers, color: 'text-brand-400', bg: 'bg-brand-400/10' },
            { label: 'Active Pipeline', value: stats.active, icon: Zap, color: 'text-amber-400', bg: 'bg-amber-400/10' },
            { label: 'Completed Deliveries', value: stats.completed, icon: Target, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
        ].map((s, idx) => (
            <motion.div 
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="glass-card p-6 rounded-3xl group relative overflow-hidden"
            >
                <div className="flex items-center gap-4">
                    <div className={cn("p-4 rounded-2xl", s.bg, s.color)}>
                        <s.icon className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{s.label}</p>
                        <p className="text-3xl font-bold text-white">{s.value}</p>
                    </div>
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700">
                    <s.icon className="h-24 w-24" />
                </div>
            </motion.div>
        ))}
      </div>

      <div className="flex-1 rounded-3xl glass-card overflow-hidden flex flex-col shadow-2xl">
        {/* Toolbar */}
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white/[0.02]">
            <div className="flex items-center gap-4">
                <h3 className="font-bold text-lg text-white">Project Inventory</h3>
                <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold text-zinc-500">{filteredProjects.length} ACTIVE</span>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative group flex-1 sm:flex-none">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 group-focus-within:text-brand-400 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search matrix..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-zinc-950/50 border border-white/5 rounded-xl py-2 pl-9 pr-4 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all w-full sm:w-48 sm:focus:w-64" 
                    />
                </div>
                <button className="flex items-center justify-center p-2 bg-white/5 border border-white/10 rounded-xl text-zinc-400 hover:text-white transition-all">
                    <Filter className="h-4 w-4" />
                </button>
            </div>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar">
          <div className="min-w-[1000px]">
            {loading ? (
               <div className="flex flex-col justify-center items-center h-64">
                   <Loader2 className="h-10 w-10 text-brand-500 animate-spin mb-4" />
                   <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em]">Synchronizing Pipeline...</span>
               </div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-20">
                <div className="h-16 w-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 text-zinc-600">
                  <Briefcase className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-white">Empty Pipeline</h3>
                <p className="text-zinc-500 text-sm mt-1">Initialize a new project stream to begin tracking.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/[0.01] border-b border-white/5 text-[11px] uppercase tracking-wider text-zinc-500 font-bold">
                    <th className="px-8 py-5">Stream Name</th>
                    <th className="px-8 py-5">Stakeholder</th>
                    <th className="px-8 py-5">Maturity Status</th>
                    <th className="px-8 py-5">Completion</th>
                    <th className="px-8 py-5">ETA</th>
                    <th className="px-8 py-5 text-right">Operations</th>
                  </tr>
                </thead>
              <tbody className="divide-y divide-white/5">
                {filteredProjects.map((proj, idx) => {
                  const config = getStatusConfig(proj.status);
                  return (
                    <motion.tr 
                        key={proj._id} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="hover:bg-white/[0.03] transition-colors group"
                    >
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                            <span className="font-bold text-zinc-100 group-hover:text-brand-400 transition-colors">{proj.projectName}</span>
                            <span className="text-[10px] text-zinc-500 mt-0.5 uppercase tracking-tighter">UID-{proj._id.slice(-6).toUpperCase()}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-zinc-300 font-medium">{proj.clientName}</td>
                      <td className="px-8 py-6">
                        <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border", config.color, config.bg, config.border)}>
                          {proj.status}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-2 w-32">
                          <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${proj.progress}%` }}
                                transition={{ duration: 1, ease: "easeOut", delay: 0.2 + idx * 0.05 }}
                                className="bg-brand-500 h-full rounded-full shadow-[0_0_10px_rgba(var(--brand-500),0.5)]"
                            />
                          </div>
                          <span className="text-[10px] text-zinc-500 font-bold tracking-widest">{proj.progress}% COMPLETE</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-zinc-400">
                            <Calendar className="h-3 w-3" />
                            <span className="text-xs font-medium">{proj.deadline ? new Date(proj.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'UNDEFINED'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                           <button onClick={() => openModal(proj)} className="p-2 text-zinc-500 hover:text-brand-400 bg-white/5 border border-white/5 rounded-xl transition-all"><Edit3 className="h-4 w-4" /></button>
                           <button onClick={() => confirmDelete(proj._id)} className="p-2 text-zinc-500 hover:text-red-400 bg-white/5 border border-white/5 rounded-xl transition-all"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          )}
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
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
            className="glass-card w-full max-w-lg rounded-3xl p-6 md:p-8 relative max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl"
          >
            <button onClick={closeModal} className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-white bg-white/5 rounded-xl transition-all">
                <X className="h-5 w-5" />
            </button>

            <div className="mb-8">
                <div className="h-12 w-12 bg-brand-500/20 rounded-2xl flex items-center justify-center mb-4 text-brand-500">
                    <Briefcase className="h-6 w-6" />
                </div>
                <h2 className="text-3xl font-bold text-white tracking-tight">{editingId ? "Modify Stream" : "Initialize Matrix"}</h2>
                <p className="text-zinc-500 mt-1">Configure parameters for project execution tracking.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Project Identifier</label>
                  <input required type="text" name="projectName" value={formData.projectName} onChange={handleChange} className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-brand-500 outline-none transition-all" placeholder="e.g. Next-Gen App" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Stakeholder</label>
                  <input required type="text" name="clientName" value={formData.clientName} onChange={handleChange} className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-brand-500 outline-none transition-all" placeholder="e.g. Tech Systems" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Current Maturity Level</label>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-brand-500 outline-none appearance-none cursor-pointer transition-all">
                  <option value="Planning" className="bg-zinc-900 text-white">Planning & Analysis</option>
                  <option value="Development" className="bg-zinc-900 text-white">Active Development</option>
                  <option value="Testing" className="bg-zinc-900 text-white">Quality Assurance</option>
                  <option value="Completed" className="bg-zinc-900 text-white">Operational / Live</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Realized Progress (%)</label>
                    <input type="number" min="0" max="100" name="progress" value={formData.progress} onChange={handleChange} className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-brand-500 outline-none transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Maturity Target (Deadline)</label>
                  <input type="date" name="deadline" value={formData.deadline} onChange={handleChange} className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-brand-500 outline-none transition-all" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Operational Notes</label>
                <textarea rows="3" name="description" value={formData.description} onChange={handleChange} className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-brand-500 outline-none resize-none transition-all" placeholder="Enter key milestones or blockers..."></textarea>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-6 border-t border-white/5 mt-8">
                <button type="button" onClick={closeModal} className="flex-1 py-3 px-6 text-sm font-bold text-zinc-500 hover:text-white transition-colors order-2 sm:order-1">Discard</button>
                <button type="submit" className="flex-1 py-3 px-6 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-bold shadow-xl shadow-brand-500/20 transition-all active:scale-95 order-1 sm:order-2">
                    {editingId ? "Commit Changes" : "Start Tracking"}
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
        title="Purge Stream"
        message="Are you absolutely sure you want to permanently delete this project tracker? This action is irreversible."
        confirmText="Yes, Purge Stream"
      />

      <SuperAdminModal 
        isOpen={isSuperGateOpen}
        onClose={() => setIsSuperGateOpen(false)}
        onSubmit={(password) => pendingAction && pendingAction(password)}
        targetActionLabel="deleting a project phase"
      />
      
      <AlertModal 
        isOpen={alertConfig.isOpen}
        onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })}
        message={alertConfig.message}
      />

    </div>
  );
}

