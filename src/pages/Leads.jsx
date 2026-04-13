import React, { useState, useEffect } from "react";
import api from "../lib/api";
import { Plus, Search, Trash2, Edit3, X, Loader2 } from "lucide-react";
import SuperAdminModal from "../components/SuperAdminModal";
import ConfirmModal from "../components/ConfirmModal";
import AlertModal from "../components/AlertModal";

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", company: "", address: "", status: "New" });

  const [isSuperGateOpen, setIsSuperGateOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [alertConfig, setAlertConfig] = useState({ isOpen: false, message: "" });
  
  const user = JSON.parse(localStorage.getItem("crm_user"));

  useEffect(() => {
    fetchLeads();
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
      setFormData({ name: lead.name, email: lead.email, phone: lead.phone, company: lead.company, address: lead.address || "", status: lead.status });
      setEditingId(lead._id);
    } else {
      setFormData({ name: "", email: "", phone: "", company: "", address: "", status: "New" });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ name: "", email: "", phone: "", company: "", address: "", status: "New" });
  };

  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (l.company && l.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
    l.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-full flex flex-col">
      <div className="flex sm:items-center sm:justify-between flex-col sm:flex-row gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients Directory</h1>
          <p className="mt-1 text-zinc-400">Manage your entire client roster securely.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-brand-500/20 hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-zinc-950 transition-all"
        >
          <Plus className="h-4 w-4" />
          Onboard Client
        </button>
      </div>

      <div className="flex-1 rounded-2xl border border-zinc-800/60 bg-zinc-900/60 overflow-hidden flex flex-col shadow-sm">
        
        {/* Table Toolbar */}
        <div className="p-4 border-b border-zinc-800/60 flex items-center bg-zinc-900/80">
          <div className="relative max-w-sm w-full">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-zinc-500" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 pl-10 text-sm placeholder-zinc-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all"
              placeholder="Search clients..."
            />
          </div>
        </div>

        {/* Dynamic Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-900 border-b border-zinc-800/60 text-zinc-400 sticky top-0 z-10 backdrop-blur-md">
              <tr>
                <th className="px-6 py-3 font-medium">Client</th>
                <th className="px-6 py-3 font-medium">Company</th>
                <th className="px-6 py-3 font-medium">Contact</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-zinc-500">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-brand-500" />
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-zinc-500">
                    No clients found. Click "Onboard Client" to begin.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-zinc-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                         <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center font-medium text-xs text-zinc-300 border border-zinc-700">
                          {lead.name.charAt(0)}
                        </div>
                        <span className="font-medium text-zinc-100">{lead.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-400">{lead.company || "—"}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-zinc-300">{lead.email}</span>
                        <span className="text-xs text-zinc-500">{lead.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                        className={`bg-transparent border-0 px-2.5 py-1 rounded-full text-xs font-bold font-sans cursor-pointer focus:ring-0 outline-none
                          ${lead.status === 'Won' ? 'text-emerald-400 bg-emerald-500/10' : 
                            lead.status === 'New' ? 'text-brand-400 bg-brand-500/10' : 
                            'text-zinc-400 bg-zinc-500/10'}`}
                      >
                        <option className="bg-zinc-900 text-zinc-100" value="New">New</option>
                        <option className="bg-zinc-900 text-zinc-100" value="Contacted">Contacted</option>
                        <option className="bg-zinc-900 text-zinc-100" value="Qualified">Qualified</option>
                        <option className="bg-zinc-900 text-zinc-100" value="Proposal">Proposal</option>
                        <option className="bg-zinc-900 text-zinc-100" value="Won">Won</option>
                        <option className="bg-zinc-900 text-zinc-100" value="Lost">Lost</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openModal(lead)}
                          className="p-1.5 text-zinc-400 hover:text-brand-400 bg-zinc-800/50 rounded-md hover:bg-brand-500/10 transition-colors"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => confirmDelete(lead._id)}
                          className="p-1.5 text-zinc-400 hover:text-red-400 bg-zinc-800/50 rounded-md hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Onboarding Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-100 transition-colors"
            >
               <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold mb-4">{editingId ? "Update Client Details" : "Onboard New Client"}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Full Name</label>
                <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none" placeholder="Jane Doe" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none" placeholder="jane@co.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Phone</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none" placeholder="+123456789" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Company</label>
                <input type="text" name="company" value={formData.company} onChange={handleInputChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none" placeholder="Acme Corp" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Address</label>
                <textarea name="address" value={formData.address} onChange={handleInputChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none resize-none" placeholder="123 Main St, City..." rows="2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none appearance-none">
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Proposal">Proposal</option>
                  <option value="Won">Won</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>
              
              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-zinc-800">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-medium bg-brand-600 hover:bg-brand-500 text-white rounded-lg transition-colors">
                  {editingId ? "Update Client" : "Save Client"}
                </button>
              </div>
            </form>
          </div>
        </div>
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
