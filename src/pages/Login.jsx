import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      // Ambil user berdasarkan email saja dulu
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (userError || !userData) {
        throw new Error("Email atau password salah.");
      }

      // Verifikasi password via fungsi pgcrypto di Supabase
      const { data: verified, error: verifyError } = await supabase
        .rpc('verify_password', { 
          input_password: password, 
          stored_hash: userData.password 
        });

      if (verifyError || !verified) {
        throw new Error("Email atau password salah.");
      }

      // Jangan simpan password hash ke localStorage!
      const { password: _, ...safeUser } = userData;
      localStorage.setItem('user_session', JSON.stringify(safeUser));

      if (userData.role === 'admin') navigate('/admin');
      else if (userData.role === 'student') navigate('/student');
      else throw new Error("Role tidak dikenali.");

    } catch (error) {
      setErrorMsg('Gagal masuk: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-cyan-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Dekorasi Background */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-cyan-400 rounded-full mix-blend-screen filter blur-[80px] opacity-30 animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-pulse"></div>

      {/* Card Form Login */}
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-[0_8px_32px_0_rgba(0,36,90,0.37)] z-10">
        
        {/* Header & Logo */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-br from-cyan-400 to-blue-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg rotate-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white -rotate-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-wide">
            SIRIP<span className="text-cyan-400">BIRU</span>
          </h1>
          <p className="text-cyan-100/70 mt-2 text-sm font-medium">Portal Absensi Perenang</p>
        </div>

        {/* Notifikasi Error */}
        {errorMsg && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-100 px-4 py-3 rounded-xl mb-6 text-sm text-center backdrop-blur-sm">
            {errorMsg}
          </div>
        )}

        {/* Form Input */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-cyan-100 mb-2">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-cyan-500/30 text-white placeholder-cyan-100/30 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
              placeholder="atlet@siripbiru.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-cyan-100 mb-2">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-cyan-500/30 text-white placeholder-cyan-100/30 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/30 transform transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Memproses...' : 'Masuk (Dive In)'}
          </button>
        </form>
      </div>
    </div>
  );
}