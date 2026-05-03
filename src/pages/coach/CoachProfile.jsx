import React, { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "../../utils/supabaseClient";
import { QRCodeCanvas } from "qrcode.react";
import { toast, Toaster } from "react-hot-toast";
import html2canvas from "html2canvas";
import { 
  Download, User, Phone, Medal,
  ShieldCheck, Contact, Edit3, X, Save,
  Mail, Lock, Eye, EyeOff
} from "lucide-react";

export default function CoachProfile() {
  const [coachData, setCoachData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const cardRef = useRef(null);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '', email: '', password: '', specialty: '', phone_number: ''
  });

  const fetchProfile = useCallback(async () => {
    try {
      const savedUser = localStorage.getItem("user_session");
      if (!savedUser) throw new Error("Session expired. Please login again.");

      const user = JSON.parse(savedUser);

      // Ambil data dari tabel coaches dan gabungkan dengan users
      const { data, error } = await supabase
        .from("coaches")
        .select(`
          id, qr_token, specialty, phone_number, 
          users ( full_name, email )
        `)
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      setCoachData(data);
    } catch (err) {
      toast.error("Failed to load profile data. Please contact admin.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Handle Download Seluruh Card
  const handleDownloadQR = async () => {
    const loadingToast = toast.loading("Preparing your Digital Pass...");
    
    if (!cardRef.current) {
      toast.error("Digital Pass is not ready.", { id: loadingToast });
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(cardRef.current, {
        scale: 2, 
        useCORS: true, 
        backgroundColor: null, 
        logging: false
      });

      const pngUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `Siripbiru_Coach_${coachData.users?.full_name?.replace(/\s+/g, '_') || "Pass"}.png`;
      link.href = pngUrl;
      link.click();
      
      toast.success("Instructor Pass downloaded successfully!", { id: loadingToast });
    } catch (error) {
      console.error("html2canvas error:", error);
      toast.error("Failed to capture image. Please try again.", { id: loadingToast });
    }
  };

  const openEditModal = () => {
    setEditForm({
      full_name: coachData.users?.full_name || '',
      email: coachData.users?.email || '',
      password: '',
      specialty: coachData.specialty || '',
      phone_number: coachData.phone_number || ''
    });
    setShowPassword(false);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const loadingToast = toast.loading("Saving changes...");

    try {
      const user = JSON.parse(localStorage.getItem("user_session"));

      const userUpdateData = { 
        full_name: editForm.full_name,
        email: editForm.email
      };
      if (editForm.password) {
        userUpdateData.password = editForm.password;
      }

      const { error: userError } = await supabase
        .from("users")
        .update(userUpdateData)
        .eq("id", user.id);
      
      if (userError) throw userError;

      const { error: coachError } = await supabase
        .from("coaches")
        .update({
          specialty: editForm.specialty,
          phone_number: editForm.phone_number
        })
        .eq("user_id", user.id);

      if (coachError) throw coachError;

      toast.success("Profile updated successfully!", { id: loadingToast });
      setIsEditModalOpen(false);
      
      fetchProfile();
      
      user.full_name = editForm.full_name;
      user.email = editForm.email;
      localStorage.setItem("user_session", JSON.stringify(user));

    } catch (error) {
      toast.error(`Update failed: ${error.message}`, { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium animate-pulse">Loading Instructor Pass...</p>
      </div>
    );
  }

  if (!coachData) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
          <Contact size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Profile Not Found</h2>
        <p className="text-slate-500 text-sm max-w-xs">Your account has not been linked to a coach profile. Please contact the administrator.</p>
      </div>
    );
  }

  return (
    <div className="py-6 flex flex-col items-center pb-24 lg:pb-6 font-sans relative">
      <Toaster position="top-center" toastOptions={{ style: { borderRadius: '16px', fontWeight: '500' } }} />

      <div className="text-center mb-8 flex flex-col items-center">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Instructor Pass</h1>
        <p className="text-slate-500 text-sm mt-1">Present this card for attendance scanning.</p>
      </div>

      {/* ============================================== */}
      {/* KARTU IDENTITAS DIGITAL COACH                  */}
      {/* ============================================== */}
      <div className="w-full max-w-sm relative group">
        <div className="absolute -inset-1 bg-gradient-to-b from-blue-600 to-emerald-400 rounded-[2.5rem] blur-lg opacity-20 group-hover:opacity-40 transition duration-500"></div>
        
        <div 
          ref={cardRef} 
          className="relative bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col"
        >
          
          <div className="bg-[#0a192f] p-6 relative overflow-hidden">
            <ShieldCheck size={120} className="absolute -right-6 -top-6 text-white/5 rotate-12" />
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg mb-3 border border-white/10">
                <span className="font-black text-lg">SB</span>
              </div>
              <h2 className="text-white font-bold tracking-[0.2em] text-[10px] uppercase mb-5">
                Siripbiru Swim Club
              </h2>
              
              <h3 className="text-xl font-bold text-white mb-1 leading-tight">
                {coachData.users?.full_name || "Unknown Instructor"}
              </h3>
              <div className="text-cyan-300 text-[10px] font-medium tracking-widest uppercase mb-2">
                {coachData.users?.email}
              </div>
              <div className="inline-block px-4 py-1 bg-emerald-500/20 backdrop-blur-sm border border-emerald-500/30 rounded-full text-emerald-300 text-xs font-bold tracking-wider uppercase mt-1">
                INSTRUCTOR
              </div>
            </div>
          </div>

          <div className="p-8 flex flex-col items-center bg-white relative z-10">
            <div className="p-3 bg-white rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.08)] border border-slate-50">
              {coachData.qr_token ? (
                <QRCodeCanvas
                  value={coachData.qr_token}
                  size={180}
                  level={"H"}
                  includeMargin={false}
                  fgColor="#0a192f"
                />
              ) : (
                <div className="w-[180px] h-[180px] flex items-center justify-center text-slate-400 bg-slate-50 rounded-2xl text-xs font-medium">
                  QR Not Available
                </div>
              )}
            </div>
            <p className="mt-5 font-mono text-slate-400 text-xs tracking-widest font-bold">
              SCAN TO CHECK-IN
            </p>
          </div>

          <div className="bg-slate-50 p-6 border-t border-slate-100 flex flex-col gap-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                <Medal size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Specialty / Role</p>
                <p className="text-slate-700 font-medium truncate">
                  {coachData.specialty || "-"} 
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                <Phone size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Contact Number</p>
                <p className="text-slate-700 font-medium truncate">{coachData.phone_number || "-"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 w-full max-w-sm px-4 flex flex-col gap-3">
        <button
          onClick={handleDownloadQR}
          className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/30 transition-all active:scale-95"
        >
          <Download size={20} />
          Save Digital Pass
        </button>
        <button
          onClick={openEditModal}
          className="w-full flex items-center justify-center gap-2 py-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-2xl shadow-sm transition-all active:scale-95"
        >
          <Edit3 size={18} />
          Account & Settings
        </button>
      </div>

      {/* ============================================== */}
      {/* EDIT PROFILE MODAL                             */}
      {/* ============================================== */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 sticky top-0 z-10">
              <div className="flex items-center gap-3 text-blue-600">
                <Edit3 size={20} />
                <h3 className="text-lg font-bold tracking-tight text-slate-800">Account Settings</h3>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(false)} 
                className="p-2 bg-white rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500 shadow-sm border border-slate-100 transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto p-6 custom-scrollbar">
              <form id="editProfileForm" onSubmit={handleEditSubmit} className="space-y-6">
                
                <div className="space-y-4 p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
                  <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <ShieldCheck size={16} /> Login Credentials
                  </h4>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input required type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className="w-full pl-9 pr-4 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Password <span className="text-slate-400 normal-case font-normal">(Leave blank to keep current)</span></label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type={showPassword ? "text" : "password"} value={editForm.password} onChange={e => setEditForm({...editForm, password: e.target.value})} placeholder="••••••••" className="w-full pl-9 pr-10 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2 ml-1">
                    <User size={16} /> Professional Info
                  </h4>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
                    <input required value={editForm.full_name} onChange={e => setEditForm({...editForm, full_name: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Specialty / Role</label>
                    <input required value={editForm.specialty} onChange={e => setEditForm({...editForm, specialty: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Phone Number</label>
                    <input required placeholder="+62..." value={editForm.phone_number} onChange={e => setEditForm({...editForm, phone_number: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm" />
                  </div>
                </div>
              </form>
            </div>

            <div className="p-4 border-t border-slate-100 bg-white sticky bottom-0 z-10 flex gap-3">
              <button 
                type="button" 
                onClick={() => setIsEditModalOpen(false)} 
                className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="editProfileForm"
                disabled={isSubmitting}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                <Save size={18} />
                {isSubmitting ? 'Saving...' : 'Save Settings'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}