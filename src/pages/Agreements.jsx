import React, { useState, useEffect } from "react";
import api from "../lib/api";
import { Plus, Trash2, Edit3, Loader2, FileText, X } from "lucide-react";
import { Link } from "react-router-dom";
import SuperAdminModal from "../components/SuperAdminModal";
import ConfirmModal from "../components/ConfirmModal";
import AlertModal from "../components/AlertModal";

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
    <div className="space-y-6 animate-in fade-in duration-500 h-full flex flex-col">
      <div className="flex sm:items-center sm:justify-between flex-col sm:flex-row gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Legal Agreements</h1>
          <p className="mt-1 text-zinc-400">Generate, manage, and print customized client contracts.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition-all"
        >
          <Plus className="h-4 w-4" />
          Create Agreement
        </button>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto rounded-2xl border border-zinc-800/60 bg-zinc-900/60">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-900 border-b border-zinc-800/60 text-zinc-400 sticky top-0">
              <tr>
                <th className="px-6 py-3 font-medium">Document Title</th>
                <th className="px-6 py-3 font-medium">Client</th>
                <th className="px-6 py-3 font-medium">Date Created</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-indigo-400" /></td></tr>
              ) : agreements.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-zinc-500">No agreements generated yet.</td></tr>
              ) : (
                agreements.map((agr) => (
                  <tr key={agr._id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium">{agr.title}</td>
                    <td className="px-6 py-4 text-zinc-400">{agr.client?.name || "—"}</td>
                    <td className="px-6 py-4 text-zinc-500">{new Date(agr.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <select 
                        value={agr.status} onChange={(e) => handleStatusChange(agr._id, e.target.value)}
                        className={`bg-transparent border-0 px-2.5 py-1 rounded-full text-xs font-bold outline-none cursor-pointer ${agr.status === 'Signed' ? 'text-green-400 bg-green-500/10' : agr.status === 'Sent' ? 'text-amber-400 bg-amber-500/10' : 'text-zinc-400 bg-zinc-500/10'}`}
                      >
                        <option className="bg-zinc-900 text-white" value="Draft">Draft</option>
                        <option className="bg-zinc-900 text-white" value="Sent">Sent</option>
                        <option className="bg-zinc-900 text-white" value="Signed">Signed</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                       <button onClick={() => openModal(agr)} className="p-1.5 text-zinc-400 hover:text-indigo-400 bg-zinc-800/50 rounded-md" title="Edit Agreement"><Edit3 className="h-4 w-4" /></button>
                       <button onClick={() => confirmDelete(agr._id)} className="p-1.5 text-zinc-400 hover:text-red-400 bg-zinc-800/50 rounded-md" title="Delete Agreement"><Trash2 className="h-4 w-4" /></button>
                       <Link to={`/agreement/${agr._id}`} target="_blank" className="p-1.5 text-zinc-400 hover:text-brand-400 bg-zinc-800/50 rounded-md" title="View/Print Agreement"><FileText className="h-4 w-4" /></Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

       {/* Modal */}
       {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-2xl rounded-2xl shadow-2xl p-6 relative animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white"><X className="h-5 w-5" /></button>
            <h2 className="text-xl font-bold mb-4">{editingId ? "Edit Agreement" : "Draft New Agreement"}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-auto pr-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Target Client</label>
                  <select required name="client" value={formData.client} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none text-zinc-100">
                    <option value="">- Select a Client -</option>
                    {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Document Title</label>
                  <input required type="text" name="title" value={formData.title} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
              </div>
              <div className="flex-1 flex flex-col mt-4">
                <label className="block text-sm font-medium text-zinc-400 mb-1">Agreement Terms (Template Editor)</label>
                <textarea required name="content" value={formData.content} onChange={handleChange} className="w-full h-[300px] bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-sm focus:border-indigo-500 outline-none resize-none font-sans" />
              </div>
              
              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-zinc-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg">Save Document</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Legal Document"
        message="Are you absolutely sure you want to delete this agreement? This action cannot be reversed."
        confirmText="Yes, Delete Document"
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
