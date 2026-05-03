import React, { useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { QrCode, History, LogOut, Menu, X, Droplets } from "lucide-react";

export default function LayoutStudent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("user_session");
    navigate("/login");
  };

  const menuItems = [
    { name: "My QR Pass", path: "/student", icon: <QrCode size={22} /> },
    {
      name: "Attendance History",
      path: "/student/history",
      icon: <History size={22} />,
    },
  ];

  return (
    <div className="flex h-screen bg-[#f0f4f8] font-sans overflow-hidden">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          flex flex-col shadow-2xl lg:shadow-none
          bg-[#0a192f] text-white
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? "w-64 translate-x-0" : "-translate-x-full lg:translate-x-0 lg:w-20 lg:hover:w-64 group overflow-hidden"}
        `}
      >
        {/* Logo */}
        <div className="h-20 px-6 flex items-center border-b border-white/10">
          <div className="bg-blue-500 w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30">
            <Droplets size={22} className="text-white" />
          </div>
          <span
            className={`ml-3 font-black text-xl tracking-wide whitespace-nowrap transition-opacity duration-300 ${sidebarOpen ? "opacity-100" : "opacity-0 lg:group-hover:opacity-100"}`}
          >
            Sirip<span className="text-blue-400">biru</span>
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-8 space-y-2">
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
                  className={`font-medium whitespace-nowrap transition-opacity duration-300 ${sidebarOpen ? "opacity-100" : "opacity-0 lg:group-hover:opacity-100"}`}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="w-full flex items-center gap-4 px-4 py-3.5 text-slate-400 hover:bg-red-500/10 hover:text-red-400 rounded-2xl transition-all group"
          >
            <div className="flex-shrink-0 group-hover:scale-110 transition-transform">
              <LogOut size={22} />
            </div>
            <span
              className={`font-medium whitespace-nowrap transition-opacity duration-300 ${sidebarOpen ? "opacity-100" : "opacity-0 lg:group-hover:opacity-100"}`}
            >
              Sign Out
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen min-w-0 relative">
        {/* Mobile Header (Hanya tampil di mobile/tablet) */}
        <header className="lg:hidden bg-[#0a192f] text-white shadow-md sticky top-0 z-30 h-16 flex items-center px-4 justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl hover:bg-white/10 transition-colors"
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-2">
              <Droplets size={20} className="text-blue-400" />
              <span className="font-bold text-lg tracking-wide">Siripbiru</span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold border border-white/20">
            Me
          </div>
        </header>

        {/* Content Wrapper */}
        <main className="flex-1 overflow-y-auto bg-[#f0f4f8] pb-24 lg:pb-0">
          {/* DI SINI PERBAIKANNYA: max-w-md telah dihapus agar konten bisa melebar otomatis */}
          <div className="w-full h-full pt-4 lg:pt-10 px-4 md:px-8 animate-in fade-in duration-500">
            <Outlet />
          </div>
        </main>

        {/* Mobile Bottom Navigation (Floating) */}
        <nav className="lg:hidden fixed bottom-6 left-6 right-6 z-30">
          <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl flex p-2 gap-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-2xl transition-all duration-300 ${
                    isActive
                      ? "bg-[#0a192f] text-white shadow-lg"
                      : "text-slate-400 hover:bg-slate-50"
                  }`}
                >
                  <div
                    className={`mb-1 transition-transform ${isActive ? "scale-110" : ""}`}
                  >
                    {item.icon}
                  </div>
                  <span
                    className={`text-[10px] font-bold tracking-wide ${isActive ? "opacity-100" : "opacity-70"}`}
                  >
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
