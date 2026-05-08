import React, { useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const loadingToast = toast.loading("Authenticating...");

    try {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .eq("password", password)
        .single();

      if (userError || !userData) {
        throw new Error("Invalid email address or password.");
      }

      const { password: _, ...safeUser } = userData;
      localStorage.setItem("user_session", JSON.stringify(safeUser));

      toast.success("Welcome back!", { id: loadingToast });

      setTimeout(() => {
        if (userData.role === "admin") navigate("/admin");
        else if (userData.role === "student") navigate("/student");
        else if (userData.role === "coach") navigate("/coach");
        else throw new Error("Unrecognized user role.");
      }, 500);
    } catch (error) {
      toast.error(error.message, { id: loadingToast });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a192f] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <Toaster
        position="top-center"
        toastOptions={{ style: { borderRadius: "16px", fontWeight: "500" } }}
      />

      {/* Ambient Background Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-[120px] opacity-30 animate-pulse"></div>
      <div
        className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-cyan-400 rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-pulse"
        style={{ animationDelay: "2s" }}
      ></div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative z-10">
        {/* Header/Logo */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-600/30 transform -rotate-3 hover:rotate-0 transition-transform duration-300 overflow-hidden">
            <img
              src="/sirip_biru.webp"
              alt="Siripbiru Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-1">
            Sirip<span className="text-blue-600">biru</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium tracking-wide">
            Athlete Attendance Portal
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail size={18} className="text-slate-400" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-700 font-medium"
                placeholder="athlete@siripbiru.com"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5 pb-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock size={18} className="text-slate-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-700 font-medium"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/30 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Signing In...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400">
            Having trouble accessing your account?
            <br />
            {/* LINK YANG SUDAH DIAKTIFKAN MENGGUNAKAN WA ATAU MAILTO */}
            <a
              href="https://wa.me/6281234567890?text=Halo%20Admin,%20saya%20kesulitan%20login%20ke%20portal%20Siripbiru"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 font-medium cursor-pointer hover:underline"
            >
              Contact Club Administrator
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}