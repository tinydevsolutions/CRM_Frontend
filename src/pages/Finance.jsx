import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../lib/api";
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Loader2, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  IndianRupee, 
  FileText, 
  Banknote,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter,
  Download,
  MoreVertical,
  ChevronRight,
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

export default function Finance() {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingInvoiceId, setEditingInvoiceId] = useState(null);
  
  const [formData, setFormData] = useState({ client: "", amount: "", amountPaid: "0", description: "", dueDate: "", splitPayment: false });
  const [editFormData, setEditFormData] = useState({ id: "", amountPaid: "", totalAmount: 0, isSplit: false });
  
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

  const executeUpdateInvoice = async () => {
    try {
      const { data } = await api.put(`/finance/${editingInvoiceId}`, formData);
      const newInvoices = invoices.map(i => i._id === editingInvoiceId ? data : i);
      setInvoices(newInvoices);
      calculateStats(newInvoices);
      setIsModalOpen(false);
      setEditingInvoiceId(null);
      setFormData({ client: "", amount: "", amountPaid: "0", description: "", dueDate: "" });
    } catch (error) {
      setAlertConfig({ isOpen: true, message: error.response?.data?.message || "Failed to update invoice" });
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingInvoiceId) {
      executeUpdateInvoice();
    } else {
      try {
        const { data } = await api.post("/finance", formData);
        const newInvoices = [data, ...invoices];
        setInvoices(newInvoices);
        calculateStats(newInvoices);
        setIsModalOpen(false);
        setEditingInvoiceId(null);
        setFormData({ client: "", amount: "", amountPaid: "0", description: "", dueDate: "", splitPayment: false });
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
        dueDate: new Date(inv.dueDate).toISOString().split('T')[0],
        splitPayment: inv.splitPayment || false
      });
      setEditingInvoiceId(inv._id);
    } else {
      setFormData({ client: "", amount: "", amountPaid: "0", description: "", dueDate: "", splitPayment: false });
      setEditingInvoiceId(null);
    }
    setIsModalOpen(true);
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
    setEditFormData({ 
      id: inv._id, 
      amountPaid: inv.amountPaid || 0,
      totalAmount: inv.amount,
      isSplit: inv.splitPayment
    });
    setIsEditModalOpen(true);
  };

  const handleUpdatePayment = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put(`/finance/${editFormData.id}`, { amountPaid: Number(editFormData.amountPaid) });
      const newInvoices = invoices.map(inv => inv._id === editFormData.id ? data : inv);
      setInvoices(newInvoices);
      calculateStats(newInvoices);
      setIsEditModalOpen(false);
    } catch (err) {
      setAlertConfig({ isOpen: true, message: err.response?.data?.message || "Failed to update payment" });
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const { data } = await api.put(`/finance/${id}`, { status: newStatus });
      const newInvoices = invoices.map(inv => inv._id === id ? data : inv);
      setInvoices(newInvoices);
      calculateStats(newInvoices);
    } catch (err) {
      setAlertConfig({ isOpen: true, message: err.response?.data?.message || "Failed to update status" });
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-10 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-500 mb-1">
             <div className="h-1 w-8 bg-emerald-500 rounded-full"></div>
             <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Accounting</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white">Finance Ledger</h1>
          <p className="mt-2 text-zinc-400">Track revenue, monitor advances, and manage client settlements.</p>
        </div>
        <div className="flex items-center gap-3">
             <button className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-zinc-400 hover:text-zinc-100 transition-all">
                <Download className="h-5 w-5" />
             </button>
             <button
              onClick={() => openInvoiceModal(null)}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-xl shadow-emerald-500/20 hover:bg-emerald-500 hover:-translate-y-0.5 transition-all active:scale-95"
            >
              <Plus className="h-4 w-4" />
              Issue New Invoice
            </button>
        </div>
      </div>

      {/* Finance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
            { label: 'Total Revenue', value: stats.collected, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-400/10', trend: '+14%', up: true },
            { label: 'Outstanding', value: stats.outstanding, icon: Clock, color: 'text-brand-400', bg: 'bg-brand-400/10', trend: '-2%', up: false },
            { label: 'Overdue Payments', value: stats.overdue, icon: Banknote, color: 'text-red-400', bg: 'bg-red-400/10', trend: '+5%', up: true },
        ].map((s, idx) => (
            <motion.div 
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="glass-card p-6 rounded-3xl group relative overflow-hidden"
            >
                <div className="flex items-start justify-between mb-4">
                    <div className={cn("p-3 rounded-2xl", s.bg, s.color)}>
                        <s.icon className="h-6 w-6" />
                    </div>
                    <div className={cn("flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full", s.up ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400")}>
                        {s.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {s.trend}
                    </div>
                </div>
                <div>
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">{s.label}</p>
                    <p className="text-3xl font-bold text-white">{formatCurrency(s.value)}</p>
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700">
                    <s.icon className="h-24 w-24" />
                </div>
            </motion.div>
        ))}
      </div>

      <div className="flex-1 rounded-3xl glass-card overflow-hidden flex flex-col">
        {/* Table Toolbar */}
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white/[0.02]">
            <div className="flex items-center gap-4">
                <h3 className="font-bold text-lg text-white">Active Transactions</h3>
                <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold text-zinc-500">{invoices.length} TOTAL</span>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative group flex-1 sm:flex-none">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 group-focus-within:text-brand-400 transition-colors" />
                    <input type="text" placeholder="Filter ledger..." className="bg-zinc-950/50 border border-white/5 rounded-xl py-2 pl-9 pr-4 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all w-full sm:w-48 sm:focus:w-64" />
                </div>
                <button className="flex items-center justify-center p-2 bg-white/5 border border-white/10 rounded-xl text-zinc-400 hover:text-white transition-all">
                    <Filter className="h-4 w-4" />
                </button>
            </div>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar">
          <div className="min-w-[1000px]">
          <table className="w-full text-left text-sm whitespace-nowrap border-collapse">
            <thead>
              <tr className="bg-white/[0.01] border-b border-white/5">
                <th className="px-8 py-4 font-bold text-zinc-500 uppercase tracking-wider text-[11px]">Particulars</th>
                <th className="px-8 py-4 font-bold text-zinc-500 uppercase tracking-wider text-[11px]">Beneficiary</th>
                <th className="px-8 py-4 font-bold text-zinc-500 uppercase tracking-wider text-[11px]">Contract Value</th>
                <th className="px-8 py-4 font-bold text-zinc-500 uppercase tracking-wider text-[11px]">Realized</th>
                <th className="px-8 py-4 font-bold text-zinc-500 uppercase tracking-wider text-[11px]">Balance</th>
                <th className="px-8 py-4 font-bold text-zinc-500 uppercase tracking-wider text-[11px]">Maturity</th>
                <th className="px-8 py-4 font-bold text-zinc-500 uppercase tracking-wider text-[11px]">Standing</th>
                <th className="px-8 py-4 font-bold text-zinc-500 uppercase tracking-wider text-[11px] text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-8 py-20 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-brand-500 mb-2" />
                    <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Consolidating Ledger...</span>
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-8 py-20 text-center">
                    <div className="opacity-30 flex flex-col items-center">
                        <FileText className="h-12 w-12 mb-3" />
                        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">No financial records found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                invoices.map((inv, idx) => {
                  const advance = inv.amountPaid || 0;
                  const pending = inv.amount - advance;
                  return (
                    <motion.tr 
                        key={inv._id} 
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="hover:bg-white/[0.03] transition-colors group"
                    >
                      <td className="px-8 py-5">
                          <div className="flex flex-col">
                              <span className="font-bold text-zinc-100 group-hover:text-emerald-400 transition-colors">{inv.description}</span>
                              <span className="text-[10px] text-zinc-500 font-medium">INV-{inv._id.slice(-6).toUpperCase()}</span>
                          </div>
                      </td>
                      <td className="px-8 py-5">
                          <div className="flex items-center gap-2">
                              <div className="h-7 w-7 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold text-zinc-400 border border-white/10">
                                  {inv.client?.name?.charAt(0)}
                              </div>
                              <span className="text-zinc-300 font-medium">{inv.client?.name || "Unknown"}</span>
                          </div>
                      </td>
                      <td className="px-8 py-5 font-bold text-zinc-100">{formatCurrency(inv.amount)}</td>
                      <td className="px-8 py-5">
                          <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg font-bold text-xs">
                              {formatCurrency(advance)}
                          </span>
                      </td>
                      <td className="px-8 py-5">
                          <span className={cn("px-2.5 py-1 rounded-lg font-bold text-xs", pending > 0 ? "bg-amber-500/10 text-amber-400" : "bg-white/5 text-zinc-500")}>
                            {formatCurrency(pending)}
                          </span>
                      </td>
                      <td className="px-8 py-5">
                          <div className="flex flex-col">
                              <span className="text-zinc-300 text-xs font-medium">{new Date(inv.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                              <span className="text-[10px] text-zinc-500">{new Date(inv.dueDate).getFullYear()}</span>
                          </div>
                      </td>
                      <td className="px-8 py-5">
                        <select 
                          value={inv.status}
                          onChange={(e) => handleStatusChange(inv._id, e.target.value)}
                          className={cn(
                            "appearance-none border-0 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase cursor-pointer focus:ring-2 focus:ring-white/10 outline-none transition-all shadow-lg",
                            inv.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                            inv.status === 'Overdue' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                            inv.status === 'Partially Paid' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            'bg-white/5 text-zinc-400 border border-white/10'
                          )}
                        >
                          <option className="bg-zinc-900 text-zinc-100" value="Pending">Pending</option>
                          <option className="bg-zinc-900 text-zinc-100" value="Partially Paid">Partially Paid</option>
                          <option className="bg-zinc-900 text-zinc-100" value="Paid">Settled</option>
                          <option className="bg-zinc-900 text-zinc-100" value="Overdue">Overdue</option>
                          <option className="bg-zinc-900 text-zinc-100" value="Cancelled">Void</option>
                        </select>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => openInvoiceModal(inv)}
                            className="p-2 text-zinc-500 hover:text-brand-400 bg-white/5 border border-white/5 rounded-xl transition-all"
                            title="Edit Ledger Entry"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => openEditModal(inv)}
                            className="p-2 text-zinc-500 hover:text-emerald-400 bg-white/5 border border-white/5 rounded-xl transition-all"
                            title="Update Payment"
                          >
                            <Banknote className="h-4 w-4" />
                          </button>
                          <Link 
                            to={`/invoice/${inv._id}`}
                            target="_blank"
                            className="p-2 text-zinc-500 hover:text-white bg-white/5 border border-white/5 rounded-xl transition-all"
                            title="Generate PDF"
                          >
                            <FileText className="h-4 w-4" />
                          </Link>
                          <button 
                            onClick={() => confirmDelete(inv._id)}
                            className="p-2 text-zinc-500 hover:text-red-400 bg-white/5 border border-white/5 rounded-xl transition-all"
                            title="Delete Entry"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>

       {/* Create Invoice Modal */}
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
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-white bg-white/5 rounded-xl transition-all">
                <X className="h-5 w-5" />
            </button>
            
            <div className="mb-8">
                <div className="h-12 w-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-4 text-emerald-500">
                    <IndianRupee className="h-6 w-6" />
                </div>
                <h2 className="text-3xl font-bold text-white">{editingInvoiceId ? "Edit Ledger Entry" : "Issue New Invoice"}</h2>
                <p className="text-zinc-500 mt-1">Generate a financial transaction record for client services.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Account Holder (Client)</label>
                <select required name="client" value={formData.client} onChange={handleChange} className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none appearance-none cursor-pointer transition-all">
                  <option value="" className="bg-zinc-900 text-zinc-500">- Select a Client -</option>
                  {clients.map(c => <option key={c._id} value={c._id} className="bg-zinc-900 text-white">{c.name}</option>)}
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Total Contract (₹)</label>
                   <input required type="number" name="amount" value={formData.amount} onChange={handleChange} className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none transition-all" placeholder="10000" />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Initial Realization (₹)</label>
                   <input required type="number" name="amountPaid" value={formData.amountPaid} onChange={handleChange} className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none transition-all" placeholder="0" />
                </div>
              </div>
              
              <div className="space-y-1.5">
                 <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Nature of Transaction</label>
                 <input required type="text" name="description" value={formData.description} onChange={handleChange} className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none transition-all" placeholder="e.g. UX Design Sprint" />
              </div>
              
              <div className="space-y-1.5">
                 <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Maturity Date</label>
                 <input required type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none transition-all" />
              </div>

              <div className="flex items-center gap-3 p-4 bg-white/[0.02] rounded-2xl border border-white/5 group hover:border-emerald-500/20 transition-all cursor-pointer">
                <input 
                    type="checkbox" 
                    id="splitPayment"
                    name="splitPayment"
                    checked={formData.splitPayment}
                    onChange={handleChange}
                    className="h-5 w-5 rounded-lg border-white/10 bg-white/5 text-emerald-500 focus:ring-emerald-500/20 transition-all cursor-pointer" 
                />
                <label htmlFor="splitPayment" className="text-xs font-bold text-zinc-400 group-hover:text-zinc-200 transition-colors cursor-pointer">
                    Enable Standard 50/50 Split Schedule
                </label>
              </div>
              
              <div className="mt-8 flex flex-col md:flex-row justify-end gap-3 md:gap-4 pt-6 border-t border-white/5">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-sm font-bold text-zinc-500 hover:text-white transition-colors order-2 md:order-1">Discard</button>
                <button type="submit" className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-xl shadow-emerald-500/20 transition-all active:scale-95 order-1 md:order-2">
                    {editingInvoiceId ? "Commit Changes" : "Create Transaction"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
       )}
       </AnimatePresence>,
       document.body
       )}

      {/* Edit Payment Modal */}
      {createPortal(
      <AnimatePresence>
      {isEditModalOpen && (
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
            className="glass-card w-full max-w-sm rounded-3xl p-6 md:p-8 relative max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl"
          >
            <button onClick={() => setIsEditModalOpen(false)} className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-white bg-white/5 rounded-xl transition-all">
                <X className="h-5 w-5" />
            </button>
            
            <div className="mb-8">
                <div className="h-12 w-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-4 text-emerald-500">
                    <Banknote className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Record Payment</h2>
                <p className="text-zinc-500 text-xs mt-1">Increment the realized value of this transaction.</p>
            </div>
            
            <form onSubmit={handleUpdatePayment} className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Cash Inflow Amount (₹)</label>
                 <div className="relative">
                    <input required type="number" step="0.01" value={editFormData.amountPaid} onChange={(e) => setEditFormData({...editFormData, amountPaid: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-6 text-4xl font-bold focus:border-emerald-500 outline-none text-emerald-400 transition-all shadow-inner" placeholder="0.00" />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-3">
                    <button 
                      type="button"
                      onClick={() => setEditFormData({ ...editFormData, amountPaid: editFormData.totalAmount })}
                      className="px-3 py-3 text-[10px] font-bold bg-white/5 text-zinc-400 border border-white/5 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/20 transition-all uppercase tracking-wider"
                    >
                      Full Value
                    </button>
                    {editFormData.isSplit && (
                      <button 
                        type="button"
                        onClick={() => setEditFormData({ ...editFormData, amountPaid: editFormData.totalAmount / 2 })}
                        className="px-3 py-3 text-[10px] font-bold bg-white/5 text-zinc-400 border border-white/5 rounded-xl hover:bg-brand-500/10 hover:text-brand-400 hover:border-brand-500/20 transition-all uppercase tracking-wider"
                      >
                        50% Advance
                      </button>
                    )}
                 </div>
              </div>
              
              <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-white/5">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-sm font-bold text-zinc-500 hover:text-white transition-colors">Discard</button>
                <button type="submit" className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-xl shadow-emerald-500/20 transition-all">Record Payment</button>
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
        onConfirm={handleDeleteInvoice}
        title="Purge Transaction"
        message="Are you absolutely sure you want to permanently delete this financial record? This action is irreversible."
        confirmText="Yes, Purge Record"
      />

      <SuperAdminModal 
        isOpen={isSuperGateOpen}
        onClose={() => setIsSuperGateOpen(false)}
        onSubmit={(password) => pendingAction && pendingAction(password)}
        targetActionLabel="deleting a financial record"
      />
      
      <AlertModal 
        isOpen={alertConfig.isOpen}
        onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })}
        message={alertConfig.message}
      />

    </div>
  );
}
