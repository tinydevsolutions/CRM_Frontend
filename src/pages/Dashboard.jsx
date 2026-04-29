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
  MoreVertical
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';



export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, new: 0, won: 0 });
  const [trends, setTrends] = useState({ total: "+0%", new: "+0%", won: "+0%" });
  const [recentLeads, setRecentLeads] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetchDashData();
  }, []);

  const fetchDashData = async () => {
    try {
      const { data } = await api.get("/dashboard");
      setStats(data.stats);
      if (data.stats.trends) setTrends(data.stats.trends);
      setRecentLeads(data.recentLeads);
      setChartData(data.chartData);
    } catch (err) {
      console.error(err);
    }
  };

  const statCards = [
    { title: "Total Clients", value: stats.total, icon: Users, color: "text-blue-400", bg: "bg-blue-400/10", trend: trends.total },
    { title: "New Prospects", value: stats.new, icon: UserPlus, color: "text-amber-400", bg: "bg-amber-400/10", trend: trends.new },
    { title: "Deals Won", value: stats.won, icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-400/10", trend: trends.won },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-10">
      
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white">Dashboard Overview</h1>
          <p className="mt-2 text-zinc-400">Welcome back. Your business performance is looking <span className="text-emerald-400 font-medium">strong today</span>.</p>
        </div>
        <div className="flex items-center gap-3">
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-zinc-300 hover:bg-white/10 transition-all">
                <Calendar className="h-4 w-4" />
                Last 30 Days
            </button>
            <button className="p-2.5 bg-brand-500 rounded-xl text-white hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/20">
                <Filter className="h-5 w-5" />
            </button>
        </div>
      </div>

      {/* Stats Cluster */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-6 sm:grid-cols-3"
      >
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              key={stat.title} 
              variants={item}
              className="group relative overflow-hidden rounded-3xl glass-card p-8 transition-all hover:-translate-y-1 duration-300"
            >
              <div className="flex items-start justify-between">
                <div className={stat.bg + " " + stat.color + " p-4 rounded-2xl transition-transform group-hover:scale-110 duration-500"}>
                  <Icon className="h-7 w-7" />
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 bg-emerald-400/10 px-2 py-1 rounded-full">
                        <ArrowUpRight className="h-3 w-3" />
                        {stat.trend}
                    </span>
                </div>
              </div>
              <div className="mt-6">
                <p className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">{stat.title}</p>
                <p className="text-4xl font-bold text-white mt-1">{stat.value}</p>
              </div>
              
              {/* Decorative Element */}
              <div className="absolute -right-8 -bottom-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-700 pointer-events-none">
                 <Icon className="h-40 w-40" />
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 rounded-3xl glass-card overflow-hidden flex flex-col"
        >
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-white">Revenue Growth</h3>
                    <p className="text-sm text-zinc-500">Monthly overview of generated leads value</p>
                </div>
                <button className="text-zinc-500 hover:text-white transition-colors">
                    <MoreVertical className="h-5 w-5" />
                </button>
            </div>
            <div className="p-8 h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0e91e9" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#0e91e9" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#71717a', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#71717a', fontSize: 12 }}
                        />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                            itemStyle={{ color: '#0e91e9' }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#0e91e9" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorValue)" 
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-3xl glass-card overflow-hidden flex flex-col"
        >
            <div className="p-8 border-b border-white/5 flex items-center gap-3">
                <div className="p-2 bg-brand-500/10 text-brand-400 rounded-lg">
                    <Activity className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-xl text-white">Recent Clients</h3>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {recentLeads.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                            <Users className="h-6 w-6 text-zinc-700" />
                        </div>
                        <p className="text-zinc-500 text-sm">No recent activity found.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {recentLeads.map((lead, idx) => (
                            <motion.div 
                                key={lead._id} 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors group cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-900 border border-white/10 flex items-center justify-center font-bold text-zinc-300 text-xs">
                                        {lead.name.charAt(0)}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-zinc-100 group-hover:text-brand-400 transition-colors">{lead.name}</span>
                                        <span className="text-[11px] text-zinc-500 uppercase tracking-tighter">{lead.company || "Individual"}</span>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider 
                                    ${lead.status === 'Won' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                                      lead.status === 'New' ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20' : 
                                      'bg-zinc-800 text-zinc-500 border border-white/5'}`}>
                                    {lead.status}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
            <div className="p-6 border-t border-white/5">
                <button className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold text-zinc-300 hover:bg-white/10 transition-all">
                    View All Activity
                </button>
            </div>
        </motion.div>
      </div>
    </div>
  );
}

