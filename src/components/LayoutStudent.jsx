import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

export default function LayoutStudent() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("user_session");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      
      {/* Top Navbar Tema Laut */}
      <header className="bg-gradient-to-r from-blue-900 to-cyan-800 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          
          <div className="flex items-center space-x-2">
            <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
              <svg className="w-6 h-6 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
            </div>
            <span className="font-bold text-lg tracking-wide">Siripbiru</span>
          </div>

          <button 
            onClick={handleLogout}
            className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full border border-white/20 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Konten Halaman Siswa */}
      <main className="flex-1 w-full max-w-md mx-auto p-4 flex flex-col">
        <Outlet />
      </main>

      {/* Bottom Navigation (Opsional, sangat bagus untuk UI Mobile Siswa) */}
      <nav className="bg-white border-t border-slate-200 fixed bottom-0 w-full z-50">
        <div className="max-w-md mx-auto flex">
          <Link 
            to="/student" 
            className={`flex-1 py-4 text-center text-sm font-medium transition-colors ${
              location.pathname === '/student' 
              ? 'text-cyan-600 border-t-2 border-cyan-500' 
              : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Kartu QR Saya
          </Link>
          <Link 
            to="/student/history" 
            className={`flex-1 py-4 text-center text-sm font-medium transition-colors ${
              location.pathname === '/student/history' 
              ? 'text-cyan-600 border-t-2 border-cyan-500' 
              : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Riwayat Absen
          </Link>
        </div>
      </nav>

      {/* Padding bawah agar konten tidak tertutup bottom navigation */}
      <div className="h-16"></div>
      
    </div>
  );
}