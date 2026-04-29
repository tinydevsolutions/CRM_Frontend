import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  Users, 
  LogOut, 
  Settings,
  Bell,
  CreditCard,
  FileSignature,
  Briefcase,
  Search,
  ChevronRight,
  Menu,
  X
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

import logo from '../../public/tdsLogo.png'

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("crm_user"));

  // Close sidebar on route change for mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("crm_user");
    navigate("/login");
  };

  const navLinks = [
    { name: "Overview", path: "/dashboard", icon: LayoutDashboard },
    { name: "Clients", path: "/leads", icon: Users },
    { name: "Projects", path: "/projects", icon: Briefcase },
    { name: "Finance", path: "/finance", icon: CreditCard },
    { name: "Agreements", path: "/agreements", icon: FileSignature },
    ...(user?.role === "superadmin" ? [{ name: "Settings", path: "/settings", icon: Settings }] : []),
  ];

  const SidebarContent = () => (
    <>
        <div className="p-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute -inset-2 bg-brand-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <img src={logo} alt="Logo" className="h-10 w-auto relative grayscale group-hover:grayscale-0 transition-all duration-500" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white group-hover:text-brand-400 transition-colors duration-300">CRM<span className="text-brand-500">.</span></span>
          </Link>
          <button className="lg:hidden p-2 text-zinc-500 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
              <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          <div className="px-4 py-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Main Menu</span>
          </div>
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
                  isActive
                    ? "bg-brand-500/10 text-brand-400 shadow-[inset_0_0_20px_rgba(14,145,233,0.05)]"
                    : "text-zinc-500 hover:text-zinc-100 hover:bg-white/5"
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="active-pill"
                    className="absolute left-0 w-1 h-6 bg-brand-500 rounded-r-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon className={cn(
                  "h-5 w-5 transition-all duration-300",
                  isActive ? "text-brand-400 scale-110" : "group-hover:scale-110 group-hover:text-zinc-100"
                )} />
                <span className="font-medium text-sm flex-1">{link.name}</span>
                {isActive && (
                  <ChevronRight className="h-4 w-4 text-brand-400/50" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 mt-auto">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-white/5 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-tr from-brand-600 to-brand-400 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-500"></div>
                <div className="relative h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-bold text-white border border-white/10 overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-tr from-brand-600 to-brand-400 opacity-20"></div>
                   {user?.name?.charAt(0).toUpperCase() || "A"}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-zinc-100 truncate">{user?.name || "Admin User"}</p>
                <p className="text-[10px] text-zinc-500 truncate">{user?.email || "admin@tinydev.com"}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="mt-4 w-full flex items-center gap-2 justify-center px-4 py-2.5 text-xs font-semibold text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all duration-300 border border-transparent hover:border-red-400/20"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        </div>
    </>
  );

  return (
    <div className="flex bg-zinc-950 h-screen w-full overflow-hidden text-zinc-100 font-sans selection:bg-brand-500/30">
      
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 flex-col border-r border-white/5 bg-zinc-900/20 backdrop-blur-3xl z-20">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-[40] lg:hidden"
            />
            <motion.aside 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 flex flex-col border-r border-white/5 bg-zinc-900/90 backdrop-blur-3xl z-[50] lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content View */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-zinc-950 w-full">
        {/* Background Ambient Glows */}
        <div className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-brand-500/10 blur-[80px] md:blur-[120px] rounded-full -mr-32 -mt-32 md:-mr-64 md:-mt-64 pointer-events-none animate-pulse duration-[10s]"></div>
        <div className="absolute bottom-0 left-0 w-[250px] md:w-[400px] h-[250px] md:h-[400px] bg-brand-600/5 blur-[70px] md:blur-[100px] rounded-full -ml-32 -mb-32 md:-ml-48 md:-mb-48 pointer-events-none"></div>
        
        {/* Top Header */}
        <header className="h-20 px-4 md:px-10 flex items-center justify-between border-b border-white/5 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-[30]">
          <div className="flex items-center gap-4 flex-1">
             <button 
               className="lg:hidden p-2 text-zinc-500 hover:text-white"
               onClick={() => setIsSidebarOpen(true)}
             >
                <Menu className="h-6 w-6" />
             </button>
             <div className="relative w-full max-w-xs md:max-w-md group hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-brand-400 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search everything..." 
                  className="w-full bg-white/5 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/40 transition-all"
                />
             </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <button className="p-2.5 bg-white/5 border border-white/5 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-white/10 transition-all relative group">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-brand-500 border-2 border-zinc-950 group-hover:scale-125 transition-transform"></span>
            </button>
            <div className="h-8 w-[1px] bg-white/5 mx-1 md:mx-2"></div>
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-full bg-white/5 border border-white/5">
                <div className="h-7 w-7 rounded-full bg-brand-500/20 flex items-center justify-center text-[10px] font-bold text-brand-400">
                    {user?.role?.charAt(0).toUpperCase() || "A"}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 pr-2 hidden xs:block">{user?.role || "Admin"}</span>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-auto p-4 md:p-10 relative z-0 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="max-w-7xl mx-auto w-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;


