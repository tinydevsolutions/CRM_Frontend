import React, { useEffect, useState } from "react";
import api from "../lib/api";
import { Users, UserPlus, TrendingUp, Activity } from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, new: 0, won: 0 });
  const [recentLeads, setRecentLeads] = useState([]);

  useEffect(() => {
    fetchDashData();
  }, []);

  const fetchDashData = async () => {
    try {
      const { data } = await api.get("/leads");
      
      // Calculate basic stats
      const total = data.length;
      const newLeads = data.filter(l => l.status === "New").length;
      const wonLeads = data.filter(l => l.status === "Won").length;
      
      setStats({ total, new: newLeads, won: wonLeads });
      setRecentLeads(data.slice(0, 5)); // First 5
    } catch (err) {
      console.error(err);
    }
  };

  const statCards = [
    { title: "Total Clients", value: stats.total, icon: Users, color: "text-blue-400", bg: "bg-blue-400/10" },
    { title: "New Prospects", value: stats.new, icon: UserPlus, color: "text-amber-400", bg: "bg-amber-400/10" },
    { title: "Deals Won", value: stats.won, icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-400/10" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="mt-1 text-zinc-400">Welcome back. Here's what's happening with your clients today.</p>
      </div>

      {/* Stats Cluster */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="relative overflow-hidden rounded-2xl bg-zinc-900/60 p-6 shadow-sm border border-zinc-800/60 transition-all hover:bg-zinc-800/50 group">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110 duration-300`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-400">{stat.title}</p>
                  <p className="text-3xl font-bold text-zinc-50 mt-1">{stat.value}</p>
                </div>
              </div>
              <div className="absolute -right-6 -bottom-6 opacity-5 pointer-events-none transition-transform group-hover:scale-150 duration-700">
                 <Icon className="h-32 w-32" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/60 overflow-hidden">
        <div className="px-6 py-5 border-b border-zinc-800/60 flex items-center gap-3">
          <Activity className="h-5 w-5 text-brand-400" />
          <h3 className="font-semibold text-lg">Recent Client Onboards</h3>
        </div>
        <div className="divide-y divide-zinc-800/60">
          {recentLeads.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">
              No recent activity. Start by adding clients.
            </div>
          ) : (
            recentLeads.map((lead) => (
              <div key={lead._id} className="p-6 flex items-center justify-between hover:bg-zinc-800/30 transition-colors">
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-zinc-100">{lead.name}</span>
                  <span className="text-sm text-zinc-500">{lead.company || lead.email}</span>
                </div>
                <div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                    ${lead.status === 'Won' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                      lead.status === 'New' ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20' : 
                      'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'}`}>
                    {lead.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
