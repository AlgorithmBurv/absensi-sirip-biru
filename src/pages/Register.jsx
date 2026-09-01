import React, { useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { useNavigate, Link } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { toast, Toaster } from "react-hot-toast";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  MapPin,
  Loader2,
  CheckCircle2,
} from "lucide-react";

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
    nis: "",
    parent_name: "",
    age: "",
    phone_number: "",
    address: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // Validasi Password
    if (form.password !== form.confirm_password) {
      toast.error("Password dan Konfirmasi Password tidak cocok.");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password minimal terdiri dari 6 karakter.");
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading("Memproses pendaftaran...");

    try {
      // 1. Cek apakah Email sudah terdaftar
      const { data: existingUser } = await supabase
        .from("users")
        .select("id, status")
        .eq("email", form.email)
        .maybeSingle();

      if (existingUser) {
        if (existingUser.status === "pending") {
          throw new Error("Email ini sudah terdaftar dan sedang menunggu persetujuan admin.");
        }
        if (existingUser.status === "active") {
          throw new Error("Email ini sudah terdaftar dan aktif. Silakan login.");
        }
        if (existingUser.status === "rejected") {
          // Menghapus data pendaftar lama yang ditolak agar bisa daftar ulang
          // (Data di tabel students akan otomatis terhapus karena ON DELETE CASCADE)
          const { error: deleteErr } = await supabase
            .from("users")
            .delete()
            .eq("id", existingUser.id);
            
          if (deleteErr) throw new Error("Gagal mereset data pendaftaran lama Anda.");
        }
      }

      // 2. Cek apakah NIS sudah terdaftar (Pencegahan sebelum insert)
      const { data: existingNis } = await supabase
        .from("students")
        .select("id")
        .eq("nis", form.nis)
        .maybeSingle();

      if (existingNis) {
        throw new Error("Nomor Identitas (NIS) ini sudah terdaftar di sistem.");
      }

      // 3. Insert ke tabel users dengan status 'pending'
      const { data: newUser, error: userError } = await supabase
        .from("users")
        .insert([
          {
            email: form.email,
            password: form.password,
            full_name: form.full_name,
            role: "student",
            status: "pending",
          },
        ])
        .select()
        .single();

      if (userError) throw userError;

      // 4. Insert ke tabel students
      const { error: studentError } = await supabase.from("students").insert([
        {
          user_id: newUser.id,
          nis: form.nis,
          parent_name: form.parent_name,
          phone_number: form.phone_number,
          address: form.address,
          age: form.age ? parseInt(form.age) : null,
          qr_token: uuidv4(),
        },
      ]);

      if (studentError) {
        // Rollback user jika gagal insert student
        await supabase.from("users").delete().eq("id", newUser.id);
        throw studentError;
      }

      // Berhasil
      toast.success("Pendaftaran berhasil dicatat!", { id: loadingToast });
      setSuccess(true);
    } catch (error) {
      toast.error(error.message, { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  // Tampilan Sukses
  if (success) {
    return (
      <div className="min-h-screen bg-[#0a192f] flex items-center justify-center p-4 relative overflow-hidden font-sans">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-[120px] opacity-30 animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-400 rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-pulse"></div>
        
        <div className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl relative z-10 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6 ring-8 ring-emerald-50/50">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-3">Registrasi Berhasil!</h2>
          <p className="text-slate-500 font-medium mb-8 leading-relaxed">
            Data Anda telah masuk ke sistem kami dan sedang <span className="font-bold text-blue-600">menunggu persetujuan admin</span>. Kami akan segera memproses pendaftaran Anda.
          </p>
          <Link
            to="/login"
            className="w-full py-4 px-4 bg-slate-900 hover:bg-black text-white font-bold rounded-2xl shadow-lg transition-all active:scale-[0.98]"
          >
            Kembali ke Halaman Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a192f] flex items-center justify-center p-4 md:p-8 relative overflow-hidden font-sans">
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

      <div className="w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden flex flex-col md:flex-row">
        
        {/* Panel Kiri - Info */}
        <div className="hidden md:flex md:w-1/3 bg-blue-600 p-10 flex-col justify-between relative overflow-hidden text-white">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500 to-blue-700 opacity-90"></div>
          
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-lg transform -rotate-3 overflow-hidden">
              <img src="/sirip_biru.webp" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-3xl font-black tracking-tight mb-4">
              Bergabung bersama Siripbiru.
            </h1>
            <p className="text-blue-100 font-medium leading-relaxed">
              Lengkapi formulir pendaftaran atlet untuk membuat akun dan mengakses portal latihan digital Anda.
            </p>
          </div>

          <div className="relative z-10">
            <p className="text-sm font-medium text-blue-200">
              Sudah memiliki akun aktif?
            </p>
            <Link
              to="/login"
              className="inline-block mt-3 px-6 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-bold transition-all backdrop-blur-sm"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Panel Kanan - Form */}
        <div className="w-full md:w-2/3 p-8 md:p-10 flex flex-col justify-center">
          <div className="md:hidden text-center mb-8">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Register Athlete</h1>
            <p className="text-slate-500 text-sm mt-1">Lengkapi data diri Anda di bawah ini</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              {/* Kolom Kiri Form */}
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                  <div className="relative">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input required name="full_name" value={form.full_name} onChange={handleChange} disabled={loading} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-700" placeholder="e.g. Budi Santoso" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input required type="email" name="email" value={form.email} onChange={handleChange} disabled={loading} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-700" placeholder="athlete@mail.com" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input required type={showPassword ? "text" : "password"} name="password" value={form.password} onChange={handleChange} disabled={loading} className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-700" placeholder="Min. 6 karakter" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Konfirmasi Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input required type={showConfirmPassword ? "text" : "password"} name="confirm_password" value={form.confirm_password} onChange={handleChange} disabled={loading} className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-700" placeholder="Ulangi password" />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors">
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Kolom Kanan Form */}
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nomor NIS</label>
                    <input required name="nis" value={form.nis} onChange={handleChange} disabled={loading} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-700" placeholder="e.g. 2024001" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Umur</label>
                    <input required type="number" name="age" value={form.age} onChange={handleChange} disabled={loading} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-700" placeholder="e.g. 15" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nama Wali / Orang Tua</label>
                  <input required name="parent_name" value={form.parent_name} onChange={handleChange} disabled={loading} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-700" placeholder="Nama wali" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">No. Handphone (WA)</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input required name="phone_number" value={form.phone_number} onChange={handleChange} disabled={loading} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-700" placeholder="+62 812..." />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Alamat Lengkap</label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-4 top-4 text-slate-400" />
                    <textarea required name="address" value={form.address} onChange={handleChange} disabled={loading} rows={2} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-700 resize-none" placeholder="Detail alamat rumah..." />
                  </div>
                </div>
              </div>

            </div>

            <div className="pt-4 border-t border-slate-100 mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <p className="text-xs text-slate-400 font-medium md:max-w-xs text-center md:text-left">
                Dengan mendaftar, Anda menyetujui akun Anda akan diverifikasi secara manual oleh admin.
              </p>
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto py-3.5 px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Daftar Sekarang"
                )}
              </button>
            </div>
            
            {/* Tautan Login khusus versi Mobile */}
            <div className="md:hidden text-center mt-6">
               <p className="text-sm text-slate-600 font-medium">
                  Sudah memiliki akun?{" "}
                  <Link to="/login" className="text-blue-600 font-bold hover:underline transition-all">
                    Login di sini
                  </Link>
               </p>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}