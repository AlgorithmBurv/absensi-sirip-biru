import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

export default function LayoutAdmin() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/admin' },
    { name: 'Manajemen Kelas', path: '/admin/classes' },
    { name: 'Manajemen Siswa', path: '/admin/students' },
    { name: 'Sesi Absensi', path: '/admin/sessions' },
    { name: 'Scan QR', path: '/admin/scan' },
    { name: 'Rekap Absensi', path: '/admin/recap' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-20">
        <div className="p-6 bg-slate-950 flex items-center space-x-3">
          <div className="bg-cyan-500 w-8 h-8 rounded-lg flex items-center justify-center rotate-3">
            <svg className="w-5 h-5 text-white -rotate-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold tracking-wider">SIRIP<span className="text-cyan-400">BIRU</span></h2>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`block px-4 py-3 rounded-xl transition-all ${
                  isActive 
                  ? 'bg-cyan-500/20 text-cyan-400 font-semibold border border-cyan-500/30' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
          >
            <span>Berenang Keluar (Logout)</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header Admin */}
        <header className="bg-white shadow-sm border-b border-slate-200 px-8 py-4 flex items-center justify-between z-10">
          <h1 className="text-xl font-semibold text-slate-800 capitalize">
            {location.pathname.replace('/admin/', '').replace('/admin', 'Dashboard') || 'Admin Panel'}
          </h1>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-cyan-100 text-cyan-700 rounded-full flex items-center justify-center font-bold">
              A
            </div>
            <span className="text-sm font-medium text-slate-600">Admin Mode</span>
          </div>
        </header>

        {/* Dynamic Content (Halaman yang di render di dalam layout) */}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-50">
          <Outlet />
        </main>
      </div>

    </div>
  );
}