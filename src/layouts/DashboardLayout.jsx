import React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  LogOut, 
  Settings,
  Bell,
  CreditCard,
  FileSignature
} from "lucide-react";

import logo from '../../public/tdsLogo.png'

const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("crm_user"));

  const handleLogout = () => {
    localStorage.removeItem("crm_user");
    navigate("/login");
  };

  const navLinks = [
    { name: "Overview", path: "/dashboard", icon: LayoutDashboard },
    { name: "Clients", path: "/leads", icon: Users },
    { name: "Finance", path: "/finance", icon: CreditCard },
    { name: "Agreements", path: "/agreements", icon: FileSignature },
    ...(user?.role === "superadmin" ? [{ name: "Settings", path: "/settings", icon: Settings }] : []),
  ];

  return (
    <div className="flex bg-zinc-950 h-screen w-full overflow-hidden text-zinc-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col border-r border-zinc-800/60 bg-zinc-900/40 backdrop-blur-xl">
        <div className="p-6 flex items-center gap-3">
          <div className="rounded-lg flex items-center justify-center font-bold text-white shadow-lg">
            <img src={logo} alt="Logo" />
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? "bg-brand-500/10 text-brand-400"
                    : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-brand-400" : "group-hover:text-zinc-100 transition-colors"}`} />
                <span className="font-medium text-sm">{link.name}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-800/60">
          <div className="flex items-center gap-3 px-3 py-3 rounded-lg border border-zinc-800/50 bg-zinc-900/50">
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-sm font-bold text-white shadow-inner">
              {user?.name?.charAt(0).toUpperCase() || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-100 truncate">{user?.name || "Admin User"}</p>
              <p className="text-xs text-zinc-500 truncate">{user?.email || "admin@tinydev.com"}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="mt-3 w-full flex items-center gap-2 justify-center px-4 py-2 text-sm font-medium text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content View */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-zinc-900/40 via-zinc-950 to-zinc-950">
        
        {/* Top Header */}
        <header className="h-16 px-8 flex items-center justify-between border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10">
          <h2 className="text-lg font-medium text-zinc-100 capitalize">
            {location.pathname.replace("/", "")}
          </h2>
          <div className="flex items-center gap-4">
            <button className="p-2 text-zinc-400 hover:text-zinc-100 transition-colors relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500 border-2 border-zinc-950"></span>
            </button>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-auto p-8 relative z-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
