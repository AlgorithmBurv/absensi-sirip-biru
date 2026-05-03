import React, { useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import {
  QrCode,
  CalendarDays,
  LogOut,
  Menu,
  ClipboardList,
} from "lucide-react";

export default function LayoutCoach() {
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("user_session");
    navigate("/login");
  };

  const menuItems = [
    { name: "My QR Pass", path: "/coach", icon: <QrCode size={22} /> },
    {
      name: "My Schedule",
      path: "/coach/schedule",
      icon: <CalendarDays size={22} />,
    },
    {
      name: "Attendance Logs",
      path: "/coach/logs",
      icon: <ClipboardList size={22} />,
    },
  ];

  const pageTitle =
    location.pathname === "/coach"
      ? "My QR Pass"
      : location.pathname.replace("/coach/", "").replace(/-/g, " ");

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-sans">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          flex flex-col shadow-2xl lg:shadow-none
          bg-[#0a192f] text-white
          transition-all duration-300 ease-in-out
          ${
            sidebarOpen
              ? "w-64 translate-x-0"
              : "-translate-x-full lg:translate-x-0 lg:w-20 lg:hover:w-64 group overflow-hidden"
          }
        `}
      >
        {/* Logo Area */}
        <div className="h-20 px-6 flex items-center border-b border-white/10">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30 overflow-hidden">
            <img
              src="/sirip_biru.webp"
              alt="Siripbiru Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <span
            className={`ml-3 font-black text-xl tracking-wide whitespace-nowrap transition-opacity duration-300 ${
              sidebarOpen
                ? "opacity-100"
                : "opacity-0 lg:group-hover:opacity-100"
            }`}
          >
            Sirip<span className="text-blue-400">biru</span>
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <p
            className={`px-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 transition-opacity duration-300 ${
              sidebarOpen
                ? "opacity-100"
                : "opacity-0 lg:group-hover:opacity-100"
            }`}
          >
            Coach Portal
          </p>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() =>
                  window.innerWidth < 1024 && setSidebarOpen(false)
                }
                title={item.name}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <div className="flex-shrink-0">{item.icon}</div>
                <span
                  className={`font-medium whitespace-nowrap transition-opacity duration-300 ${
                    sidebarOpen
                      ? "opacity-100"
                      : "opacity-0 lg:group-hover:opacity-100"
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Area */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="w-full flex items-center gap-4 px-4 py-3.5 text-slate-400 hover:bg-red-500/10 hover:text-red-400 rounded-2xl transition-all group/logout"
          >
            <div className="flex-shrink-0 group-hover/logout:scale-110 transition-transform">
              <LogOut size={22} />
            </div>
            <span
              className={`font-medium whitespace-nowrap transition-opacity duration-300 ${
                sidebarOpen
                  ? "opacity-100"
                  : "opacity-0 lg:group-hover:opacity-100"
              }`}
            >
              Sign Out
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 lg:px-8 flex items-center justify-between z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2.5 rounded-xl hover:bg-slate-50 text-slate-500 transition-colors border border-transparent hover:border-slate-100 lg:hidden"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-xl font-bold text-slate-800 capitalize tracking-tight hidden sm:block">
              {pageTitle}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-slate-800 leading-tight">
                Swim Coach
              </p>
              <p className="text-xs text-slate-500 font-medium">Instructor</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center text-blue-600 font-bold overflow-hidden">
              <img
                src={`https://api.dicebear.com/7.x/initials/svg?seed=Coach&backgroundColor=eff6ff&textColor=2563eb`}
                alt="Coach avatar"
              />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-[#f8fafc] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="animate-in fade-in duration-300 h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}