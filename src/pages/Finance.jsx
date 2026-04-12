import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { Plus, Search, Trash2, Edit3, Loader2, DollarSign, Clock, CheckCircle, IndianRupee, FileText, Banknote } from "lucide-react";
import SuperAdminModal from "../components/SuperAdminModal";
import ConfirmModal from "../components/ConfirmModal";
import AlertModal from "../components/AlertModal";

export default function Finance() {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingInvoiceId, setEditingInvoiceId] = useState(null);
  
  const [formData, setFormData] = useState({ client: "", amount: "", amountPaid: "0", description: "", dueDate: "" });
  const [editFormData, setEditFormData] = useState({ id: "", amountPaid: "" });
  
  const [stats, setStats] = useState({ collected: 0, outstanding: 0, overdue: 0 });

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
      const [invRes, leadRes] = await Promise.all([
        api.get("/finance"),
        api.get("/leads")
      ]);
      
      setInvoices(invRes.data);
      setClients(leadRes.data);
      calculateStats(invRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (invData) => {
    let collected = 0;
    let outstanding = 0;
    let overdue = 0;

    invData.forEach(inv => {
      const paid = inv.amountPaid || 0;
      collected += paid;
      
      if (inv.status === "Pending" || inv.status === "Partially Paid") {
        outstanding += (inv.amount - paid);
      }
      if (inv.status === "Overdue") {
        overdue += (inv.amount - paid);
      }
    });

    setStats({ collected, outstanding, overdue });
  };

  const triggerSecuredAction = (actionFn) => {
    if (user?.role !== "superadmin") {
      setPendingAction(() => actionFn);
      setIsSuperGateOpen(true);
    } else {
      actionFn(null);
    }
  };

  const executeUpdateInvoice = async (password = null) => {
    try {
      const config = password ? { headers: { 'x-superadmin-password': password } } : {};
      const { data } = await api.put(`/finance/${editingInvoiceId}`, formData, config);
      const newInvoices = invoices.map(i => i._id === editingInvoiceId ? data : i);
      setInvoices(newInvoices);
      calculateStats(newInvoices);
      setIsModalOpen(false);
      setEditingInvoiceId(null);
      setFormData({ client: "", amount: "", amountPaid: "0", description: "", dueDate: "" });
      setIsSuperGateOpen(false);
    } catch (error) {
      setAlertConfig({ isOpen: true, message: error.response?.data?.message || "Failed to update invoice" });
    }
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    if (editingInvoiceId) {
      triggerSecuredAction(executeUpdateInvoice);
    } else {
      try {
        const { data } = await api.post("/finance", formData);
        const newInvoices = [data, ...invoices];
        setInvoices(newInvoices);
        calculateStats(newInvoices);
        setIsModalOpen(false);
        setEditingInvoiceId(null);
        setFormData({ client: "", amount: "", amountPaid: "0", description: "", dueDate: "" });
      } catch (error) {
        setAlertConfig({ isOpen: true, message: "Failed to create invoice" });
      }
    }
  };

  const openInvoiceModal = (inv = null) => {
    if (inv) {
      setFormData({ 
        client: inv.client?._id || "", 
        amount: inv.amount, 
        amountPaid: inv.amountPaid || 0,
        description: inv.description, 
        dueDate: new Date(inv.dueDate).toISOString().split('T')[0] 
      });
      setEditingInvoiceId(inv._id);
    } else {
      setFormData({ client: "", amount: "", amountPaid: "0", description: "", dueDate: "" });
      setEditingInvoiceId(null);
    }
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const confirmDelete = (id) => {
    setConfirmId(id);
    setIsConfirmOpen(true);
  };

  const executeDelete = async (id, password = null) => {
    try {
      const config = password ? { headers: { 'x-superadmin-password': password } } : {};
      await api.delete(`/finance/${id}`, config);
      const newInvoices = invoices.filter(i => i._id !== id);
      setInvoices(newInvoices);
      calculateStats(newInvoices);
      setIsConfirmOpen(false);
      setIsSuperGateOpen(false);
    } catch (err) {
      setAlertConfig({ isOpen: true, message: err.response?.data?.message || "Failed to delete invoice" });
    }
  };

  const handleDeleteInvoice = () => {
    triggerSecuredAction((password) => executeDelete(confirmId, password));
  };

  const openEditModal = (inv) => {
    setEditFormData({ id: inv._id, amountPaid: inv.amountPaid || 0 });
    setIsEditModalOpen(true);
  };

  const handleUpdatePayment = (e) => {
    e.preventDefault();
    triggerSecuredAction(async (password = null) => {
      try {
        const config = password ? { headers: { 'x-superadmin-password': password } } : {};
        const { data } = await api.put(`/finance/${editFormData.id}`, { amountPaid: Number(editFormData.amountPaid) }, config);
        const newInvoices = invoices.map(inv => inv._id === editFormData.id ? data : inv);
        setInvoices(newInvoices);
        calculateStats(newInvoices);
        setIsEditModalOpen(false);
        setIsSuperGateOpen(false);
      } catch (err) {
        setAlertConfig({ isOpen: true, message: err.response?.data?.message || "Failed to update payment" });
      }
    });
  };

  const handleStatusChange = (id, newStatus) => {
    triggerSecuredAction(async (password = null) => {
      try {
        const config = password ? { headers: { 'x-superadmin-password': password } } : {};
        const { data } = await api.put(`/finance/${id}`, { status: newStatus }, config);
        const newInvoices = invoices.map(inv => inv._id === id ? data : inv);
        setInvoices(newInvoices);
        calculateStats(newInvoices);
        setIsSuperGateOpen(false);
      } catch (err) {
        setAlertConfig({ isOpen: true, message: err.response?.data?.message || "Failed to update status" });
      }
    });
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-full flex flex-col">
      <div className="flex sm:items-center sm:justify-between flex-col sm:flex-row gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Finance Ledger</h1>
          <p className="mt-1 text-zinc-400">Track agency revenue, advances, and pending balances.</p>
        </div>
        <button
          onClick={() => openInvoiceModal(null)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-green-500/20 hover:bg-green-500 transition-all"
        >
          <Plus className="h-4 w-4" />
          Create Invoice
        </button>
      </div>

      {/* Finance Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/60 p-6 flex items-center gap-4">
          <div className="p-3 bg-green-500/10 text-green-400 rounded-xl"><IndianRupee className="h-6 w-6" /></div>
          <div>
            <p className="text-sm font-medium text-zinc-400">Total Collected</p>
            <p className="text-2xl font-bold">{formatCurrency(stats.collected)}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/60 p-6 flex items-center gap-4">
          <div className="p-3 bg-brand-500/10 text-brand-400 rounded-xl"><Clock className="h-6 w-6" /></div>
          <div>
            <p className="text-sm font-medium text-zinc-400">Total Pending</p>
             <p className="text-2xl font-bold">{formatCurrency(stats.outstanding)}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/60 p-6 flex items-center gap-4">
          <div className="p-3 bg-red-500/10 text-red-400 rounded-xl"><CheckCircle className="h-6 w-6" /></div>
          <div>
            <p className="text-sm font-medium text-zinc-400">Total Overdue</p>
             <p className="text-2xl font-bold">{formatCurrency(stats.overdue)}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 rounded-2xl border border-zinc-800/60 bg-zinc-900/60 overflow-hidden flex flex-col shadow-sm">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-900 border-b border-zinc-800/60 text-zinc-400 sticky top-0 z-10 backdrop-blur-md">
              <tr>
                <th className="px-6 py-3 font-medium">Description</th>
                <th className="px-6 py-3 font-medium">Client</th>
                <th className="px-6 py-3 font-medium">Total</th>
                <th className="px-6 py-3 font-medium">Advance Paid</th>
                <th className="px-6 py-3 font-medium">Pending</th>
                <th className="px-6 py-3 font-medium">Due Date</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-zinc-500"><Loader2 className="h-6 w-6 animate-spin mx-auto text-brand-500" /></td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-zinc-500">No invoices found.</td>
                </tr>
              ) : (
                invoices.map((inv) => {
                  const advance = inv.amountPaid || 0;
                  const pending = inv.amount - advance;
                  return (
                    <tr key={inv._id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-zinc-100">{inv.description}</td>
                      <td className="px-6 py-4 text-zinc-400">{inv.client?.name || "Unknown"}</td>
                      <td className="px-6 py-4 font-bold text-zinc-300">{formatCurrency(inv.amount)}</td>
                      <td className="px-6 py-4 font-semibold text-green-400">{formatCurrency(advance)}</td>
                      <td className="px-6 py-4 font-semibold text-brand-400">{formatCurrency(pending)}</td>
                      <td className="px-6 py-4 text-zinc-500">{new Date(inv.dueDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <select 
                          value={inv.status}
                          onChange={(e) => handleStatusChange(inv._id, e.target.value)}
                          className={`bg-transparent border-0 px-2.5 py-1 rounded-full text-xs font-bold font-sans cursor-pointer focus:ring-0 outline-none
                            ${inv.status === 'Paid' ? 'text-green-400 bg-green-500/10' : 
                              inv.status === 'Overdue' ? 'text-red-400 bg-red-500/10' : 
                              inv.status === 'Partially Paid' ? 'text-yellow-400 bg-yellow-500/10' :
                              'text-brand-400 bg-brand-500/10'}`}
                        >
                          <option className="bg-zinc-900 text-zinc-100" value="Pending">Pending</option>
                          <option className="bg-zinc-900 text-zinc-100" value="Partially Paid">Partially Paid</option>
                          <option className="bg-zinc-900 text-zinc-100" value="Paid">Paid</option>
                          <option className="bg-zinc-900 text-zinc-100" value="Overdue">Overdue</option>
                          <option className="bg-zinc-900 text-zinc-100" value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <button 
                          onClick={() => openInvoiceModal(inv)}
                          className="inline-flex items-center justify-center p-1.5 text-zinc-400 hover:text-indigo-400 bg-zinc-800/50 rounded-md hover:bg-indigo-500/10 transition-colors"
                          title="Edit Invoice Details"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => confirmDelete(inv._id)}
                          className="inline-flex items-center justify-center p-1.5 text-zinc-400 hover:text-red-400 bg-zinc-800/50 rounded-md hover:bg-red-500/10 transition-colors"
                          title="Delete Invoice"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => openEditModal(inv)}
                          className="inline-flex items-center justify-center p-1.5 text-zinc-400 hover:text-green-400 bg-zinc-800/50 rounded-md hover:bg-green-500/10 transition-colors"
                          title="Update Tracking Amount"
                        >
                          <Banknote className="h-4 w-4" />
                        </button>
                        <Link 
                          to={`/invoice/${inv._id}`}
                          target="_blank"
                          className="inline-flex items-center justify-center p-1.5 text-zinc-400 hover:text-brand-400 bg-zinc-800/50 rounded-md hover:bg-brand-500/10 transition-colors"
                          title="Print Invoice"
                        >
                          <FileText className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

       {/* Create Invoice Modal */}
       {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold mb-4">{editingInvoiceId ? "Edit Invoice" : "Create Invoice"}</h2>
            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Select Client</label>
                <select required name="client" value={formData.client} onChange={handleInputChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:border-brand-500 outline-none text-zinc-100">
                  <option value="">- Select a Client -</option>
                  {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                   <label className="block text-sm font-medium text-zinc-400 mb-1">Total Amount (₹)</label>
                   <input required type="number" step="0.01" name="amount" value={formData.amount} onChange={handleInputChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:border-brand-500 outline-none" placeholder="1000.00" />
                </div>
                <div className="flex-1">
                   <label className="block text-sm font-medium text-zinc-400 mb-1">Advance Paid (₹)</label>
                   <input type="number" step="0.01" name="amountPaid" value={formData.amountPaid} onChange={handleInputChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:border-brand-500 outline-none text-green-400" placeholder="0.00" />
                </div>
              </div>
              <div>
                 <label className="block text-sm font-medium text-zinc-400 mb-1">Description</label>
                 <input required type="text" name="description" value={formData.description} onChange={handleInputChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:border-brand-500 outline-none" placeholder="Website Development" />
              </div>
              <div>
                 <label className="block text-sm font-medium text-zinc-400 mb-1">Due Date</label>
                 <input required type="date" name="dueDate" value={formData.dueDate} onChange={handleInputChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:border-brand-500 outline-none invert dark:invert-0" />
              </div>
              
              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-zinc-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors">{editingInvoiceId ? "Update Invoice" : "Issue Invoice"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Payment Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-sm rounded-2xl shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold mb-4 text-green-400">Update Advance / Payment</h2>
            <p className="text-sm text-zinc-400 mb-6">Enter the total amount paid so far by this client for this invoice.</p>
            <form onSubmit={handleUpdatePayment} className="space-y-4">
              <div>
                 <label className="block text-sm font-medium text-zinc-400 mb-1">Amount Paid (₹)</label>
                 <input required type="number" step="0.01" value={editFormData.amountPaid} onChange={(e) => setEditFormData({...editFormData, amountPaid: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-2xl font-bold focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none text-green-400" placeholder="0.00" />
              </div>
              
              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-zinc-800">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors">Save Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDeleteInvoice}
        title="Delete Invoice"
        message="Are you absolutely sure you want to permanently delete this invoice?"
        confirmText="Yes, Delete Invoice"
      />

      <SuperAdminModal 
        isOpen={isSuperGateOpen}
        onClose={() => setIsSuperGateOpen(false)}
        onSubmit={(password) => pendingAction && pendingAction(password)}
        targetActionLabel="Modifying or deleting a financial record"
      />
      
      <AlertModal 
        isOpen={alertConfig.isOpen}
        onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })}
        message={alertConfig.message}
      />

    </div>
  );
}
