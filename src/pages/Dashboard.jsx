import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../lib/api";
import { 
  Users, 
  UserPlus, 
  TrendingUp, 
  Activity, 
  ArrowUpRight, 
  Calendar,
  Filter,
  MoreVertical,
  Briefcase,
  ClipboardList,
  DollarSign,
  ChevronDown
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalLeads: 0,
    totalDeals: 0,
    totalRevenue: 0,
    tasksPending: 0
  });
  const [chartData, setChartData] = useState([]);
  const [leadSources, setLeadSources] = useState([
    { name: "Website", value: 0, color: "#38aef7" },
    { name: "Referral", value: 0, color: "#a855f7" },
    { name: "Social Media", value: 0, color: "#f97316" },
    { name: "Others", value: 0, color: "#06b6d4" }
  ]);
  const [recentDeals, setRecentDeals] = useState([]);

  useEffect(() => {
    fetchDashData();

    const handleNewLead = () => {
      fetchDashData();
    };

    window.addEventListener("newLeadEvent", handleNewLead);
    return () => window.removeEventListener("newLeadEvent", handleNewLead);
  }, []);

  const fetchDashData = async () => {
    try {
      const { data } = await api.get("/dashboard");
      
      // Update dynamic states from backend
      if (data.stats) {
        setStats(data.stats);
      }
      
      if (data.chartData) {
        setChartData(data.chartData);
      }

      if (data.leadSources) {
        // Map the backend colors to the client slices
        const colorMap = {
          "Website": "#38aef7",
          "Referral": "#a855f7",
          "Social Media": "#f97316",
          "Others": "#06b6d4"
        };
        const mappedSources = data.leadSources.map(item => ({
          ...item,
          color: colorMap[item.name] || "#38aef7"
        }));
        setLeadSources(mappedSources);
      }

      if (data.recentDeals) {
        setRecentDeals(data.recentDeals);
      }

      if (data.upcomingTasks) {
        setTasks(data.upcomingTasks);
      }
    } catch (err) {
      console.error("Failed to fetch dynamic dashboard stats:", err);
      setChartData([]);
      setRecentDeals([]);
      setTasks([]);
    }
  };

  // Bind dynamic stats to the grid
  const statCards = [
    { 
      title: "Total Leads", 
      value: stats.totalLeads.toLocaleString('en-IN'), 
      icon: Users, 
      color: "text-blue-400", 
      bg: "bg-blue-600/10 border-blue-500/10", 
      iconBg: "bg-blue-600 shadow-blue-500/20",
      trend: stats.trends?.leads || "No change this month" 
    },
    { 
      title: "Total Deals", 
      value: stats.totalDeals.toLocaleString('en-IN'), 
      icon: DollarSign, 
      color: "text-emerald-400", 
      bg: "bg-emerald-600/10 border-emerald-500/10", 
      iconBg: "bg-emerald-600 shadow-emerald-500/20",
      trend: stats.trends?.deals || "No change this month" 
    },
    { 
      title: "Total Revenue", 
      value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, 
      icon: Briefcase, 
      color: "text-purple-400", 
      bg: "bg-purple-600/10 border-purple-500/10", 
      iconBg: "bg-purple-600 shadow-purple-500/20",
      trend: stats.trends?.revenue || "No revenue this month" 
    },
    { 
      title: "Tasks Pending", 
      value: stats.tasksPending.toLocaleString('en-IN'), 
      icon: ClipboardList, 
      color: "text-amber-500", 
      bg: "bg-amber-600/10 border-amber-500/10", 
      iconBg: "bg-amber-600 shadow-amber-500/20",
      trend: stats.trends?.tasks || "All caught up!" 
    },
  ];

  // Checklist tasks
  const [tasks, setTasks] = useState([]);

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-10">
      
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-2">
            Welcome back, Navaneetha 👋
          </h1>
          <p className="mt-2 text-zinc-400">Here's what's happening with your business today.</p>
        </div>
        <div className="flex items-center gap-3">
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-zinc-300 hover:bg-white/10 transition-all">
                <Calendar className="h-4 w-4 text-zinc-400" />
                Last 30 Days
            </button>
            <button className="p-2.5 bg-brand-500 rounded-xl text-white hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/20">
                <Filter className="h-5 w-5" />
            </button>
        </div>
      </div>

      {/* 4 Column Stats Grid */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              key={stat.title} 
              variants={item}
              className="group relative overflow-hidden rounded-3xl glass-card p-8 border border-white/5 transition-all duration-300 hover:-translate-y-1 hover:border-white/15"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">{stat.title}</p>
                  <p className="text-4xl font-bold text-white mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.iconBg} p-4 rounded-2xl text-white shadow-lg shadow-black/30 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-5 flex items-center gap-1.5 text-xs font-bold">
                <span className={`${stat.title === "Tasks Pending" ? "text-amber-500" : "text-emerald-400"}`}>
                  {stat.trend}
                </span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Charts Section: Revenue Overview (2/3) + Lead Sources (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Revenue Overview Glowing Area Chart */}
        <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 rounded-3xl glass-card overflow-hidden flex flex-col border border-white/5"
        >
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-white">Revenue Overview</h3>
                    <p className="text-sm text-zinc-500 mt-1">Total revenue this month</p>
                    <div className="flex items-baseline gap-2.5 mt-2">
                        <span className="text-3xl font-bold text-white">₹{stats.totalRevenue.toLocaleString('en-IN')}</span>
                        {stats.trends?.revenue && stats.trends.revenue !== "No revenue this month" && (
                          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            {stats.trends.revenue}
                          </span>
                        )}
                    </div>
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-zinc-300 hover:bg-white/10 transition-all">
                    This Month
                    <ChevronDown className="h-3 w-3 text-zinc-500" />
                </button>
            </div>
            
            <div className="p-8 h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorRevenueGlow" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0e91e9" stopOpacity={0.25}/>
                                <stop offset="95%" stopColor="#0e91e9" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#71717a', fontSize: 12, fontWeight: 500 }}
                            dy={10}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tickFormatter={(v) => v === 0 ? "₹0" : `₹${v/1000}K`}
                            tick={{ fill: '#71717a', fontSize: 12, fontWeight: 500 }}
                        />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                            itemStyle={{ color: '#0e91e9', fontSize: '13px' }}
                            labelStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                            formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#0e91e9" 
                            strokeWidth={3.5}
                            dot={{ stroke: '#0e91e9', strokeWidth: 2, r: 5, fill: '#18181b' }}
                            activeDot={{ r: 7, strokeWidth: 0, fill: '#0e91e9' }}
                            fillOpacity={1} 
                            fill="url(#colorRevenueGlow)" 
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </motion.div>

        {/* Lead Sources Donut Chart */}
        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-3xl glass-card overflow-hidden flex flex-col border border-white/5"
        >
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Lead Sources</h3>
                <button className="text-zinc-500 hover:text-white transition-colors">
                    <MoreVertical className="h-5 w-5" />
                </button>
            </div>
            
            <div className="p-8 flex flex-row items-center justify-between h-[340px]">
                {stats.totalLeads === 0 ? (
                    <div className="w-full flex flex-col items-center justify-center text-center py-6 opacity-75">
                        <Users className="h-10 w-10 text-zinc-600 mb-3" />
                        <p className="text-zinc-400 text-sm font-semibold">No leads yet</p>
                        <p className="text-zinc-600 text-xs mt-1 max-w-[200px]">Lead sources will populate automatically as clients are onboarded.</p>
                    </div>
                ) : (
                    <>
                        {/* Donut Container */}
                        <div className="relative w-1/2 h-full flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={leadSources}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={65}
                                        outerRadius={82}
                                        paddingAngle={3}
                                        dataKey="value"
                                    >
                                        {leadSources.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            
                            {/* Centered details */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-3xl font-bold text-white tracking-tight">{stats.totalLeads}</span>
                                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Total Leads</span>
                            </div>
                        </div>

                        {/* Customized Bulleted Legend list */}
                        <div className="w-1/2 flex flex-col justify-center pl-6 space-y-4">
                            {leadSources.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="text-xs font-semibold text-zinc-300">{item.name}</span>
                                    </div>
                                    <span className="text-xs font-bold text-zinc-100">{item.value}%</span>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </motion.div>
      </div>

      {/* Row 2: Recent Deals (2/3) + Upcoming Tasks (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Deals Table with high-fidelity badges */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 rounded-3xl glass-card overflow-hidden flex flex-col border border-white/5"
        >
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Recent Deals</h3>
                <button className="text-zinc-500 hover:text-white transition-colors">
                    <MoreVertical className="h-5 w-5" />
                </button>
            </div>
            
            <div className="p-8 overflow-x-auto flex-1 custom-scrollbar">
                {recentDeals.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center opacity-75">
                        <Briefcase className="h-10 w-10 text-zinc-600 mb-3 animate-pulse" />
                        <p className="text-zinc-400 text-sm font-semibold">No recent deals recorded</p>
                        <p className="text-zinc-600 text-xs mt-1 max-w-[280px]">Add clients or start new projects to see your pipeline and closed deals here.</p>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                                <th className="pb-4 font-semibold">Service</th>
                                <th className="pb-4 font-semibold">Client</th>
                                <th className="pb-4 font-semibold">Amount</th>
                                <th className="pb-4 font-semibold text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {recentDeals.map((deal) => (
                                <tr key={deal.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="py-5 text-sm font-bold text-zinc-100 group-hover:text-brand-400 transition-colors">{deal.service}</td>
                                    <td className="py-5 text-sm text-zinc-400">{deal.client}</td>
                                    <td className="py-5 text-sm font-bold text-zinc-100">
                                      {typeof deal.amount === 'number' ? `₹${deal.amount.toLocaleString('en-IN')}` : deal.amount}
                                    </td>
                                    <td className="py-5 text-right">
                                        <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
                                          deal.status === 'Won' 
                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                            : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                        }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${deal.status === 'Won' ? 'bg-emerald-400' : 'bg-orange-400'}`}></span>
                                            {deal.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </motion.div>

        {/* Upcoming Tasks Checklist */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl glass-card overflow-hidden flex flex-col border border-white/5"
        >
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Upcoming Tasks</h3>
                <ChevronDown className="h-5 w-5 text-zinc-500 cursor-pointer hover:text-white transition-colors" />
            </div>

            <div className="p-8 flex-1 flex flex-col justify-start space-y-4">
                {tasks.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-10 text-center opacity-75">
                        <ClipboardList className="h-10 w-10 text-zinc-600 mb-3" />
                        <p className="text-zinc-400 text-sm font-semibold">All caught up! 🎉</p>
                        <p className="text-zinc-600 text-xs mt-1 max-w-[220px]">No upcoming actions or deadlines detected in your pipeline.</p>
                    </div>
                ) : (
                    tasks.map((task) => (
                        <div 
                          key={task.id} 
                          onClick={() => toggleTask(task.id)}
                          className="flex items-start gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl cursor-pointer hover:bg-white/10 hover:border-white/10 transition-all select-none group"
                        >
                            <div className="mt-0.5">
                                <div className={`h-5 w-5 rounded border flex items-center justify-center transition-all ${
                                  task.completed 
                                    ? 'bg-brand-500 border-brand-500 text-white' 
                                    : 'border-zinc-600 bg-transparent group-hover:border-zinc-400'
                                }`}>
                                    {task.completed && (
                                        <svg className="h-3 w-3 fill-current" viewBox="0 0 20 20">
                                            <path d="M0 11l2-2 5 5L18 3l2 2L7 18z"/>
                                        </svg>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className={`text-sm font-semibold transition-all ${
                                  task.completed ? 'text-zinc-500 line-through' : 'text-zinc-200'
                                }`}>
                                    {task.text}
                                </span>
                                <span className="text-[10px] text-zinc-500 font-semibold mt-1 uppercase tracking-tighter">
                                    {task.date}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </motion.div>
      </div>
    </div>
  );
}
