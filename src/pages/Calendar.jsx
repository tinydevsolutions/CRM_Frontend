import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../lib/api";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Video, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle,
  ExternalLink,
  Plus,
  Compass,
  Zap
} from "lucide-react";

export default function Calendar() {
  const [meetings, setMeetings] = useState([]);
  const [activeTab, setActiveTab] = useState("scheduler");

  // Fetch dynamic meetings on load
  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const { data } = await api.get("/meetings");
      setMeetings(data);
    } catch (error) {
      console.error("Failed to fetch meetings from server:", error);
    }
  };

  // Listen to Calendly postMessage events to track new meetings
  useEffect(() => {
    const handleCalendlyMessage = async (e) => {
      // Check if message is from Calendly
      if (e.data.event && e.data.event.indexOf("calendly") === 0) {
        console.log("Calendly Event Detected:", e.data.event);
        
        // When an event is scheduled
        if (e.data.event === "calendly.event_scheduled") {
          const newMeeting = {
            title: "30-Minute Discovery Session",
            invitee: "Potential Client",
            email: "Details in Calendly dashboard",
            date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
            status: "Scheduled",
            location: "Google Meet / Calendly"
          };

          // Post to database to persist
          try {
            await api.post("/meetings", newMeeting);
            fetchMeetings();
          } catch (err) {
            console.error("Failed to persist scheduled meeting:", err);
            // Fallback to local array
            setMeetings(prev => [newMeeting, ...prev]);
          }

          // Switch tab to tracking to show the scheduled meeting
          setActiveTab("tracking");
        }
      }
    };

    window.addEventListener("message", handleCalendlyMessage);
    return () => window.removeEventListener("message", handleCalendlyMessage);
  }, []);

  return (
    <div className="space-y-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <div className="flex items-center gap-2 text-brand-500 mb-1">
             <div className="h-1 w-8 bg-brand-500 rounded-full"></div>
             <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Meetings & Schedules</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-2">
            Meeting Coordinator
          </h1>
          <p className="mt-2 text-zinc-400">Book, coordinate, and track client consulting sessions directly inside your workspace.</p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex bg-white/5 border border-white/5 rounded-2xl p-1.5 self-start md:self-end">
          <button 
            onClick={() => setActiveTab("scheduler")}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "scheduler" 
                ? "bg-brand-500 text-white shadow-lg shadow-brand-500/20" 
                : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
            }`}
          >
            Inline Scheduler
          </button>
          <button 
            onClick={() => setActiveTab("tracking")}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 relative ${
              activeTab === "tracking" 
                ? "bg-brand-500 text-white shadow-lg shadow-brand-500/20" 
                : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
            }`}
          >
            Meetings Ledger
            <span className="h-4 w-4 bg-white/10 rounded-full flex items-center justify-center text-[9px] font-bold text-zinc-200">
              {meetings.length}
            </span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        {activeTab === "scheduler" ? (
          <motion.div 
            key="scheduler"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="rounded-3xl glass-card border border-white/5 overflow-hidden flex flex-col h-[700px] shadow-2xl relative"
          >
            {/* Embedded Calendly scheduling page */}
            <div className="flex-1 w-full h-full relative z-10 bg-zinc-950">
              <iframe 
                src="https://calendly.com/tinydevsolutions/30min?background_color=09090b&text_color=ffffff&primary_color=0e91e9"
                width="100%" 
                height="100%" 
                frameBorder="0"
                className="w-full h-full border-0 rounded-3xl"
                title="Calendly Scheduler"
              />
            </div>
            
            {/* Live postMessage Tracking Indicator banner */}
            <div className="p-4 bg-brand-500/10 border-t border-brand-500/20 flex items-center justify-between px-8 text-xs font-bold text-brand-400 relative z-20">
              <span className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-brand-400 animate-pulse" />
                Live Scheduling Tracking Active
              </span>
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">
                Saves automatically on scheduling confirmation
              </span>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="tracking"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="rounded-3xl glass-card border border-white/5 overflow-hidden flex flex-col shadow-2xl"
          >
            <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-white">Tracked Sessions</h3>
                <p className="text-xs text-zinc-500 mt-1">Timeline of consultation calls, requirements workshops, and client strategy sessions.</p>
              </div>
              <button 
                onClick={() => window.open('https://calendly.com/tinydevsolutions/30min', '_blank')}
                className="flex items-center gap-2 text-xs font-bold text-brand-400 hover:text-brand-300 transition-colors"
              >
                Open Dashboard
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6">
              {meetings.length === 0 ? (
                <div className="text-center py-20 opacity-75">
                  <div className="h-16 w-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 text-zinc-600">
                    <CalendarIcon className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-bold text-white">No Consultations Scheduled</h3>
                  <p className="text-zinc-500 text-sm mt-1">Book a Strategy Session to begin coordinate meetings.</p>
                </div>
              ) : (
                <div className="relative border-l border-white/5 ml-4 pl-8 space-y-8 py-2">
                  {meetings.map((meet, idx) => (
                    <motion.div 
                      key={meet.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="relative group"
                    >
                      {/* Timeline dot */}
                      <span className={`absolute -left-[41px] top-1.5 h-6 w-6 rounded-full border-4 border-zinc-950 flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-115 ${
                        meet.status === 'Completed' 
                          ? 'bg-emerald-500 border-zinc-950 text-white' 
                          : meet.status === 'Cancelled'
                            ? 'bg-red-500 border-zinc-950 text-white'
                            : 'bg-brand-500 border-zinc-950 text-white animate-pulse'
                      }`}>
                        {meet.status === 'Completed' ? (
                          <CheckCircle2 className="h-3 w-3 text-white" />
                        ) : meet.status === 'Cancelled' ? (
                          <AlertCircle className="h-3 w-3 text-white" />
                        ) : (
                          <Clock className="h-3 w-3 text-white" />
                        )}
                      </span>

                      {/* Card block */}
                      <div className="glass-card p-6 rounded-2xl border border-white/5 group-hover:border-white/10 transition-all max-w-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="space-y-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            meet.status === 'Completed' 
                              ? 'bg-emerald-500/10 text-emerald-400' 
                              : meet.status === 'Cancelled'
                                ? 'bg-red-500/10 text-red-400'
                                : 'bg-brand-500/10 text-brand-400'
                          }`}>
                            {meet.status}
                          </span>
                          <h4 className="text-base font-bold text-white group-hover:text-brand-400 transition-colors">{meet.title}</h4>
                          
                          <div className="flex flex-wrap gap-4 text-xs text-zinc-400 font-semibold pt-1">
                            <span className="flex items-center gap-1.5">
                              <User className="h-3.5 w-3.5 text-zinc-500" />
                              {meet.invitee}
                            </span>
                            <span className="text-zinc-700">•</span>
                            <span className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5 text-zinc-500" />
                              {meet.time}
                            </span>
                            <span className="text-zinc-700">•</span>
                            <span className="flex items-center gap-1.5">
                              <Video className="h-3.5 w-3.5 text-zinc-500" />
                              {meet.location}
                            </span>
                          </div>
                        </div>

                        <div className="text-right self-end md:self-center">
                          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Scheduled Date</p>
                          <p className="text-sm font-bold text-white mt-1">{meet.date}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
