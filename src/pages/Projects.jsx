import React, { useState, useEffect } from "react";
import api from "../lib/api";
import { Plus, Search, Trash2, Edit3, Loader2, Briefcase, CheckCircle, Clock } from "lucide-react";
import SuperAdminModal from "../components/SuperAdminModal";
import ConfirmModal from "../components/ConfirmModal";
import AlertModal from "../components/AlertModal";

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

  const getStatusColor = (status) => {
    const colors = {
      "Planning": "bg-blue-500/10 text-blue-400 border-blue-500/20",
      "Design": "bg-purple-500/10 text-purple-400 border-purple-500/20",
      "Development": "bg-amber-500/10 text-amber-400 border-amber-500/20",
      "Testing": "bg-orange-500/10 text-orange-400 border-orange-500/20",
      "Deployment": "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
      "Completed": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      "On Hold": "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
    };
    return colors[status] || "bg-zinc-800 text-zinc-300";
  };

  const filteredProjects = projects.filter(p => 
    p.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Project Pipeline</h1>
          <p className="text-zinc-400">Track and manage development streams from design to deployment.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-brand-500/20"
        >
          <Plus className="h-5 w-5" />
          New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-2xl p-6 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-500/10 rounded-xl"><Briefcase className="h-6 w-6 text-brand-400" /></div>
            <div><p className="text-sm font-medium text-zinc-400">Total Projects</p><h3 className="text-2xl font-bold text-white">{stats.total}</h3></div>
          </div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-2xl p-6 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 rounded-xl"><Clock className="h-6 w-6 text-amber-400" /></div>
            <div><p className="text-sm font-medium text-zinc-400">Active Workflow</p><h3 className="text-2xl font-bold text-white">{stats.active}</h3></div>
          </div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-2xl p-6 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl"><CheckCircle className="h-6 w-6 text-emerald-400" /></div>
            <div><p className="text-sm font-medium text-zinc-400">Completed</p><h3 className="text-2xl font-bold text-white">{stats.completed}</h3></div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl backdrop-blur-xl shadow-2xl overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-5 border-b border-zinc-800/60 flex flex-col sm:flex-row gap-4 justify-between items-center bg-zinc-900/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search projects or clients..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/50 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
             <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 text-brand-500 animate-spin" /></div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-16 px-4">
              <Briefcase className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-zinc-300">No projects found</h3>
              <p className="text-zinc-500 mt-1">Get started by creating a new tracking pipeline.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-900/80 border-b border-zinc-800/80 text-xs uppercase tracking-wider text-zinc-500 font-semibold">
                  <th className="px-6 py-4">Project</th>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Progress</th>
                  <th className="px-6 py-4">Deadline</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredProjects.map((proj) => (
                  <tr key={proj._id} className="hover:bg-zinc-800/20 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-medium text-zinc-100">{proj.projectName}</p>
                    </td>
                    <td className="px-6 py-4 text-zinc-400">{proj.clientName}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(proj.status)}`}>
                        {proj.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-full bg-zinc-800 rounded-full h-2">
                          <div className="bg-brand-500 h-2 rounded-full" style={{ width: `${proj.progress}%` }}></div>
                        </div>
                        <span className="text-xs text-zinc-400 font-medium">{proj.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-400 text-sm">
                      {proj.deadline ? new Date(proj.deadline).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                       <button onClick={() => openModal(proj)} className="p-1.5 text-zinc-400 hover:text-brand-400 bg-zinc-800/50 rounded-md transition-colors" title="Edit"><Edit3 className="h-4 w-4" /></button>
                       <button onClick={() => confirmDelete(proj._id)} className="p-1.5 text-zinc-400 hover:text-red-400 bg-zinc-800/50 rounded-md transition-colors" title="Delete"><Trash2 className="h-4 w-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
              <h2 className="text-xl font-bold text-white">{editingId ? "Update Project Phase" : "New Pipeline Project"}</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-zinc-400 mb-1.5">Project Name</label>
                  <input required type="text" value={formData.projectName} onChange={(e) => setFormData({...formData, projectName: e.target.value})} className="w-full px-4 py-2.5 bg-zinc-950/50 border border-zinc-800 rounded-xl text-zinc-100 focus:outline-none focus:border-brand-500" placeholder="e.g. Website Redesign" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-zinc-400 mb-1.5">Client Name</label>
                  <input required type="text" value={formData.clientName} onChange={(e) => setFormData({...formData, clientName: e.target.value})} className="w-full px-4 py-2.5 bg-zinc-950/50 border border-zinc-800 rounded-xl text-zinc-100 focus:outline-none focus:border-brand-500" placeholder="e.g. TechCorp" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">Phase Status</label>
                <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-2.5 bg-zinc-950/50 border border-zinc-800 rounded-xl text-zinc-100 focus:outline-none focus:border-brand-500">
                  <option value="Planning">Planning</option>
                  <option value="Design">Design</option>
                  <option value="Development">Development</option>
                  <option value="Testing">Testing</option>
                  <option value="Deployment">Deployment</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1.5">Progress (%)</label>
                    <input type="number" min="0" max="100" value={formData.progress} onChange={(e) => setFormData({...formData, progress: Number(e.target.value)})} className="w-full px-4 py-2.5 bg-zinc-950/50 border border-zinc-800 rounded-xl text-zinc-100 focus:outline-none focus:border-brand-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1.5">Deadline</label>
                  <input type="date" value={formData.deadline} onChange={(e) => setFormData({...formData, deadline: e.target.value})} className="w-full px-4 py-2.5 bg-[color-scheme:dark] bg-zinc-950/50 border border-zinc-800 rounded-xl text-zinc-100 focus:outline-none focus:border-brand-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">Description/Notes</label>
                <textarea rows="3" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl text-zinc-100 focus:outline-none focus:border-brand-500 resize-none" placeholder="Project goals and requirements..."></textarea>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="flex-1 py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 px-4 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-medium transition-colors shadow-lg shadow-brand-500/20">{editingId ? "Save Changes" : "Start Tracking"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Project"
        message="Are you absolutely sure you want to permanently delete this project tracker? This prevents all future reporting."
        confirmText="Yes, Delete Project"
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
