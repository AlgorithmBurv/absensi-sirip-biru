import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

export default function AuthGuard({ children, allowedRole }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      try {
        // 1. Ambil data user dari localStorage
        const savedUser = localStorage.getItem('user_session');
        
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
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [allowedRole]);

  // Tampilan loading tema laut
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-cyan-400 mt-4 font-medium animate-pulse">Memverifikasi akses...</p>
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