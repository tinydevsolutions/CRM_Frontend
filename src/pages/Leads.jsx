import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../lib/api";
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  X, 
  Loader2, 
  Filter, 
  Download,
  MoreHorizontal,
  Mail,
  Phone,
  Building2,
  ChevronRight
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

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({ 
    name: "", email: "", phone: "", company: "", address: "", status: "New",
    businessDescription: "", goal: "", serviceNeeded: "", hasWebsiteOrAds: "", budget: "", timeline: ""
  });

  const [isSuperGateOpen, setIsSuperGateOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [alertConfig, setAlertConfig] = useState({ isOpen: false, message: "" });
  
  const user = JSON.parse(localStorage.getItem("crm_user"));

  useEffect(() => {
    fetchLeads();

    const handleNewLead = () => {
      fetchLeads();
    };

    window.addEventListener("newLeadEvent", handleNewLead);
    return () => window.removeEventListener("newLeadEvent", handleNewLead);
  }, []);

  const fetchLeads = async () => {
    try {
      const { data } = await api.get("/leads");
      setLeads(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
      const { data } = await api.put(`/leads/${editingId}`, formData);
      setLeads(leads.map(l => l._id === editingId ? data : l));
      closeModal();
    } catch (error) {
      setAlertConfig({ isOpen: true, message: error.response?.data?.message || "Failed to update client" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      executeUpdate();
    } else {
      try {
        const { data } = await api.post("/leads", formData);
        setLeads([data, ...leads]);
        closeModal();
      } catch (error) {
        setAlertConfig({ isOpen: true, message: "Failed to save client" });
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const { data } = await api.put(`/leads/${id}`, { status: newStatus });
      setLeads(leads.map(l => l._id === id ? data : l));
    } catch (err) {
      setAlertConfig({ isOpen: true, message: err.response?.data?.message || "Failed to update status" });
    }
  };

  const confirmDelete = (id) => {
    setConfirmId(id);
    setIsConfirmOpen(true);
  };

  const executeDelete = async (id, password = null) => {
    try {
      const config = password ? { headers: { 'x-superadmin-password': password } } : {};
      await api.delete(`/leads/${id}`, config);
      setLeads(leads.filter(l => l._id !== id));
      setIsConfirmOpen(false);
      setIsSuperGateOpen(false);
    } catch (error) {
      setAlertConfig({ isOpen: true, message: error.response?.data?.message || "Failed to delete" });
    }
  };

  const handleDelete = () => {
    triggerSecuredAction((password) => executeDelete(confirmId, password));
  };

  const openModal = (lead = null) => {
    if (lead) {
      setFormData({ 
        name: lead.name, email: lead.email, phone: lead.phone, company: lead.company, 
        address: lead.address || "", status: lead.status,
        businessDescription: lead.businessDescription || "",
        goal: lead.goal || "",
        serviceNeeded: lead.serviceNeeded || "",
        hasWebsiteOrAds: lead.hasWebsiteOrAds || "",
        budget: lead.budget || "",
        timeline: lead.timeline || ""
      });
      setEditingId(lead._id);
    } else {
      setFormData({ 
        name: "", email: "", phone: "", company: "", address: "", status: "New",
        businessDescription: "", goal: "", serviceNeeded: "", hasWebsiteOrAds: "", budget: "", timeline: ""
      });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ 
      name: "", email: "", phone: "", company: "", address: "", status: "New",
      businessDescription: "", goal: "", serviceNeeded: "", hasWebsiteOrAds: "", budget: "", timeline: ""
    });
  };

  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (l.company && l.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
    l.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-brand-500 mb-1">
             <div className="h-1 w-8 bg-brand-500 rounded-full"></div>
             <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Management</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white">Clients Directory</h1>
          <p className="mt-2 text-zinc-400">Manage, track and onboard your global client network.</p>
        </div>
        <div className="flex items-center gap-3">
             <button className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-zinc-400 hover:text-zinc-100 transition-all">
                <Download className="h-5 w-5" />
             </button>
             <button
              onClick={() => openModal()}
              className="flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-3 text-sm font-bold text-white shadow-xl shadow-brand-500/20 hover:bg-brand-600 hover:-translate-y-0.5 transition-all active:scale-95"
            >
              <Plus className="h-4 w-4" />
              Onboard New Client
            </button>
        </div>
      </div>

      {/* Stats Quick View (Optional) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Clients', value: leads.length, color: 'text-blue-400' },
            { label: 'Won Deals', value: leads.filter(l => l.status === 'Won').length, color: 'text-emerald-400' },
            { label: 'Pipeline', value: leads.filter(l => l.status !== 'Won' && l.status !== 'Lost').length, color: 'text-amber-400' },
            { label: 'Success Rate', value: leads.length > 0 ? Math.round((leads.filter(l => l.status === 'Won').length / leads.length) * 100) + '%' : '0%', color: 'text-purple-400' },
          ].map(s => (
            <div key={s.label} className="p-4 rounded-2xl glass-card">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">{s.label}</p>
                <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
            </div>
          ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 rounded-3xl glass-card overflow-hidden flex flex-col">
        
        {/* Table Toolbar */}
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white/[0.02]">
          <div className="relative max-w-md w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-brand-400 transition-colors" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-xl border border-white/5 bg-zinc-950/50 px-4 py-2.5 pl-12 text-sm text-zinc-200 placeholder-zinc-600 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
              placeholder="Search by name, company or email..."
            />
          </div>
          <div className="flex items-center gap-3">
              <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-100 transition-all">
                 <Filter className="h-4 w-4" />
                 Filters
              </button>
          </div>
        </div>

        {/* Dynamic Table */}
        <div className="flex-1 overflow-auto custom-scrollbar">
          <div className="min-w-[800px]">
            <table className="w-full text-left text-sm whitespace-nowrap border-collapse">
              <thead>
                <tr className="bg-white/[0.01] border-b border-white/5">
                  <th className="px-8 py-4 font-bold text-zinc-500 uppercase tracking-wider text-[11px]">Client Identity</th>
                  <th className="px-8 py-4 font-bold text-zinc-500 uppercase tracking-wider text-[11px]">Business</th>
                  <th className="px-8 py-4 font-bold text-zinc-500 uppercase tracking-wider text-[11px]">Contact Point</th>
                  <th className="px-8 py-4 font-bold text-zinc-500 uppercase tracking-wider text-[11px]">Status</th>
                  <th className="px-8 py-4 font-bold text-zinc-500 uppercase tracking-wider text-[11px] text-right">Operations</th>
                </tr>
              </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
                        <span className="text-zinc-500 font-medium">Synchronizing data...</span>
                    </div>
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-50">
                        <Building2 className="h-12 w-12 text-zinc-700" />
                        <p className="text-zinc-500 font-medium">No client records found in your directory.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead, idx) => (
                  <motion.tr 
                    key={lead._id} 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-white/[0.03] transition-colors group"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                         <div className="relative">
                            <div className="absolute inset-0 bg-brand-500/20 blur-md rounded-full scale-0 group-hover:scale-100 transition-transform duration-500"></div>
                            <div className="relative h-10 w-10 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-900 flex items-center justify-center font-bold text-sm text-zinc-300 border border-white/10 group-hover:border-brand-500/50 transition-colors shadow-lg">
                              {lead.name.charAt(0)}
                            </div>
                         </div>
                         <div className="flex flex-col">
                            <span className="font-bold text-zinc-100 group-hover:text-brand-400 transition-colors">{lead.name}</span>
                            <span className="text-[10px] text-zinc-500 font-medium tracking-wide">ID: {lead._id.slice(-6).toUpperCase()}</span>
                         </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 w-fit">
                            <Building2 className="h-3.5 w-3.5 text-zinc-500" />
                            <span className="text-zinc-300 font-medium">{lead.company || "Individual"}</span>
                        </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-zinc-400 group/link cursor-pointer hover:text-white transition-colors">
                            <Mail className="h-3 w-3 text-brand-500/70" />
                            <span className="text-xs font-medium">{lead.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-500">
                            <Phone className="h-3 w-3 text-zinc-600" />
                            <span className="text-[11px]">{lead.phone || "N/A"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <select 
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                        className={cn(
                            "appearance-none border-0 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase cursor-pointer focus:ring-2 focus:ring-white/10 outline-none transition-all shadow-lg",
                            lead.status === 'Won' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                            lead.status === 'New' ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20' : 
                            lead.status === 'Lost' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                            'bg-white/5 text-zinc-400 border border-white/10'
                        )}
                      >
                        <option className="bg-zinc-900 text-zinc-100" value="New">New</option>
                        <option className="bg-zinc-900 text-zinc-100" value="Contacted">Contacted</option>
                        <option className="bg-zinc-900 text-zinc-100" value="Qualified">Qualified</option>
                        <option className="bg-zinc-900 text-zinc-100" value="Proposal">Proposal</option>
                        <option className="bg-zinc-900 text-zinc-100" value="Won">Won</option>
                        <option className="bg-zinc-900 text-zinc-100" value="Lost">Lost</option>
                      </select>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openModal(lead)}
                          className="p-2 text-zinc-500 hover:text-brand-400 bg-white/5 border border-white/5 rounded-xl hover:bg-brand-500/10 transition-all"
                          title="Edit Profile"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => confirmDelete(lead._id)}
                          className="p-2 text-zinc-500 hover:text-red-400 bg-white/5 border border-white/5 rounded-xl hover:bg-red-500/10 transition-all"
                          title="Remove Client"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <div className="p-2 text-zinc-600 hover:text-white cursor-pointer transition-colors">
                            <MoreHorizontal className="h-4 w-4" />
                        </div>
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

      {/* Onboarding Modal Overlay */}
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
                className="glass-card w-full max-w-2xl rounded-3xl p-6 md:p-10 relative max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl"
            >
                <button 
                    onClick={closeModal}
                    className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-white bg-white/5 rounded-xl transition-all"
                >
                    <X className="h-5 w-5" />
                </button>
                
                <div className="mb-8">
                    <div className="h-12 w-12 bg-brand-500/20 rounded-2xl flex items-center justify-center mb-4">
                        <Plus className="h-6 w-6 text-brand-500" />
                    </div>
                    <h2 className="text-3xl font-bold text-white">{editingId ? "Update Client Profile" : "Onboard New Client"}</h2>
                    <p className="text-zinc-500 mt-1">Provide the essential details to integrate the client into the ecosystem.</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Full Identity</label>
                            <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all" placeholder="Enter full name" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Corporate Entity</label>
                            <input type="text" name="company" value={formData.company} onChange={handleInputChange} className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all" placeholder="Enter company name" />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Primary Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                                <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 pl-11 text-sm text-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all" placeholder="client@example.com" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Secure Phone</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 pl-11 text-sm text-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all" placeholder="+123..." />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Headquarters Address</label>
                        <textarea name="address" value={formData.address} onChange={handleInputChange} className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all resize-none" placeholder="Enter physical location" rows="2" />
                    </div>

                    <div className="pt-4 pb-2 border-t border-white/5">
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-1">Project Details</h3>
                        <p className="text-xs text-zinc-500">Details sourced from Google Forms or added manually.</p>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Business Description</label>
                        <textarea name="businessDescription" value={formData.businessDescription} onChange={handleInputChange} className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all resize-none" placeholder="What does the business do?" rows="2" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Main Goal</label>
                            <input type="text" name="goal" value={formData.goal} onChange={handleInputChange} className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all" placeholder="e.g. Increase sales" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Service Needed</label>
                            <input type="text" name="serviceNeeded" value={formData.serviceNeeded} onChange={handleInputChange} className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all" placeholder="e.g. Website" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Website/Ads?</label>
                            <input type="text" name="hasWebsiteOrAds" value={formData.hasWebsiteOrAds} onChange={handleInputChange} className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all" placeholder="Yes/No" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Budget</label>
                            <input type="text" name="budget" value={formData.budget} onChange={handleInputChange} className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all" placeholder="e.g. ₹15k–50k" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Timeline</label>
                            <input type="text" name="timeline" value={formData.timeline} onChange={handleInputChange} className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all" placeholder="e.g. Immediately" />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-white/5 space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Initial Engagement Status</label>
                        <select name="status" value={formData.status} onChange={handleInputChange} className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none appearance-none">
                            <option value="New">New Lead</option>
                            <option value="Contacted">First Contact</option>
                            <option value="Qualified">Qualified Prospect</option>
                            <option value="Proposal">Proposal Phase</option>
                            <option value="Won">Deal Secured (Won)</option>
                            <option value="Lost">Deal Terminated (Lost)</option>
                        </select>
                    </div>
                    
                    <div className="mt-8 flex flex-col md:flex-row justify-end gap-3 md:gap-4 pt-6 border-t border-white/5">
                        <button type="button" onClick={closeModal} className="px-6 py-3 text-sm font-bold text-zinc-500 hover:text-white transition-colors order-2 md:order-1">
                            Discard
                        </button>
                        <button type="submit" className="px-8 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-bold shadow-xl shadow-brand-500/20 transition-all active:scale-95 order-1 md:order-2">
                            {editingId ? "Update Profile" : "Onboard Client"}
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
        title="Delete Client Record"
        message="Are you absolutely sure you want to remove this client? This will permanently delete their profile and contact information from the CRM."
        confirmText="Yes, Delete Client"
      />

      <SuperAdminModal 
        isOpen={isSuperGateOpen}
        onClose={() => setIsSuperGateOpen(false)}
        onSubmit={(password) => pendingAction && pendingAction(password)}
        targetActionLabel="deleting a client"
      />
      
      <AlertModal 
        isOpen={alertConfig.isOpen}
        onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })}
        message={alertConfig.message}
      />

    </div>
  );
}

