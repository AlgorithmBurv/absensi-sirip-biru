import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Loader2, ShieldCheck } from "lucide-react";

export default function AuthGuard({ children, allowedRole }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      try {
        // 1. Ambil data user dari localStorage
        const savedUser = localStorage.getItem("user_session");

        if (!savedUser) {
          setIsAuthorized(false);
          setIsLoading(false);
          return;
        }

        const user = JSON.parse(savedUser);

        // 2. Validasi apakah role user sesuai dengan yang diizinkan untuk rute ini
        if (user && user.role === allowedRole) {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false); // Role tidak sesuai (misal: siswa mencoba buka menu admin)
        }
      } catch (error) {
        console.error("Error checking auth guard:", error);
        setIsAuthorized(false);
      } finally {
        // Menambahkan sedikit delay (opsional) agar animasi loading terlihat halus
        setTimeout(() => {
          setIsLoading(false);
        }, 400);
      }
    };

    checkAuth();
  }, [allowedRole]);

  // Tampilan loading tema Minimalist Modern Premium
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center font-sans">
        <div className="relative flex items-center justify-center mb-6">
          {/* Ambient Glow */}
          <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 rounded-full animate-pulse"></div>

          {/* Spinner Card */}
          <div className="w-20 h-20 bg-white rounded-[1.5rem] shadow-xl shadow-blue-900/10 border border-slate-100 flex flex-col items-center justify-center relative z-10">
            <Loader2 size={32} className="text-blue-600 animate-spin" />
          </div>

          {/* Shield Icon Overlay */}
          <ShieldCheck
            size={16}
            className="absolute bottom-[-8px] right-[-8px] text-emerald-500 bg-white rounded-full z-20"
          />
        </div>

        <h2 className="text-xl font-bold text-slate-800 tracking-tight mb-2">
          Verifying Access
        </h2>
        <p className="text-sm font-medium text-slate-400 animate-pulse">
          Establishing secure connection...
        </p>
      </div>
    );
  }

  // Jika tidak punya akses atau belum login, kembalikan ke login
  if (!isAuthorized) {
    return <Navigate to="/login" replace />;
  }

  // Jika aman, render komponen halaman (children)
  return children;
}