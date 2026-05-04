import React, { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "../../utils/supabaseClient";
import { QRCodeSVG } from "qrcode.react";
import { toast, Toaster } from "react-hot-toast";
import { 
  Download, User, Phone, Medal,
  ShieldCheck, Contact, Edit3, X, Save,
  Mail, Lock, Eye, EyeOff, LayoutTemplate, Plus, MinusCircle
} from "lucide-react";

// PRIMITIVES & STYLES
const inputCls = "w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium shadow-sm";
const labelCls = "block text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-1.5 ml-1";

export default function CoachProfile() {
  const [coachData, setCoachData] = useState(null);
  const [loading, setLoading] = useState(true);
  const qrRef = useRef(null);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [editForm, setEditForm] = useState({
    full_name: '', email: '', password: '', specialty: '', phone_number: '',
    nickname: '', role_title: '', experience_desc: '', age: '', nationality: 'Indonesia',
    photo_url: '', achievements: ['']
  });

  const fetchProfile = useCallback(async () => {
    try {
      const savedUser = localStorage.getItem("user_session");
      if (!savedUser) throw new Error("Session expired. Please login again.");
      const user = JSON.parse(savedUser);

      const { data, error } = await supabase
        .from("coaches")
        .select(`
          id, qr_token, specialty, phone_number,
          nickname, role_title, experience_desc, age, nationality, photo_url, achievements,
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

  // Download QR — sama persis dengan Student
  const handleDownloadQR = () => {
    const loadingToast = toast.loading("Preparing your Digital Pass...");
    const svgElement = qrRef.current?.querySelector("svg");
    
    if (!svgElement) {
      toast.error("QR Code not ready yet.", { id: loadingToast });
      return;
    }

    try {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        const padding = 32;
        canvas.width = img.width + padding * 2;
        canvas.height = img.height + padding * 2;
        
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, padding, padding);

        const pngUrl = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.download = `Siripbiru_Coach_${coachData?.users?.full_name?.replace(/\s+/g, '_') || "Pass"}.png`;
        link.href = pngUrl;
        link.click();
        
        toast.success("Instructor Pass downloaded successfully!", { id: loadingToast });
      };
      
      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    } catch (error) {
      toast.error("Failed to download image.", { id: loadingToast });
    }
  };

  const openEditModal = () => {
    setEditForm({
      full_name: coachData.users?.full_name || '',
      email: coachData.users?.email || '',
      password: '',
      specialty: coachData.specialty || '',
      phone_number: coachData.phone_number || '',
      nickname: coachData.nickname || '',
      role_title: coachData.role_title || '',
      experience_desc: coachData.experience_desc || '',
      age: coachData.age || '',
      nationality: coachData.nationality || 'Indonesia',
      photo_url: coachData.photo_url || '',
      achievements: coachData.achievements?.length > 0 ? coachData.achievements : ['']
    });
    setShowPassword(false);
    setIsEditModalOpen(true);
  };

  const handleAchievementChange = (index, value) => {
    const newAch = [...editForm.achievements];
    newAch[index] = value;
    setEditForm({ ...editForm, achievements: newAch });
  };
  const addAchievement = () => setEditForm({ ...editForm, achievements: [...editForm.achievements, ""] });
  const removeAchievement = (index) => setEditForm({ ...editForm, achievements: editForm.achievements.filter((_, i) => i !== index) });

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const loadingToast = toast.loading("Saving changes...");

    const cleanAchievements = editForm.achievements.filter(a => a.trim() !== "");

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
          phone_number: editForm.phone_number,
          nickname: editForm.nickname,
          role_title: editForm.role_title,
          experience_desc: editForm.experience_desc,
          age: editForm.age ? parseInt(editForm.age) : null,
          nationality: editForm.nationality,
          photo_url: editForm.photo_url,
          achievements: cleanAchievements
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

  return (
    <div className="py-6 flex flex-col items-center pb-24 lg:pb-6 font-sans relative">
      <Toaster position="top-center" toastOptions={{ style: { borderRadius: '16px', fontWeight: '500' } }} />

      <div className="text-center mb-8 flex flex-col items-center">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Instructor Pass</h1>
        <p className="text-slate-500 text-sm mt-1">Present this card for attendance scanning.</p>
      </div>

      <div className="w-full max-w-sm relative group">
        <div className="absolute -inset-1 bg-gradient-to-b from-blue-600 to-emerald-400 rounded-[2.5rem] blur-lg opacity-20 group-hover:opacity-40 transition duration-500"></div>
        
        <div className="relative bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col">
          <div className="bg-[#0a192f] p-6 relative overflow-hidden">
            <ShieldCheck size={120} className="absolute -right-6 -top-6 text-white/5 rotate-12" />
            
            <div className="relative z-10 flex flex-col items-center text-center">
              {coachData.photo_url ? (
                <img 
                  src={coachData.photo_url} 
                  alt="Profile" 
                  className="w-16 h-16 rounded-xl object-cover shadow-lg mb-3 border border-white/10" 
                />
              ) : (
                <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg mb-3 border border-white/10">
                  <span className="font-black text-xl">SB</span>
                </div>
              )}
              <h2 className="text-white font-bold tracking-[0.2em] text-[10px] uppercase mb-4">
                Siripbiru Swim Club
              </h2>
              
              <h3 className="text-xl font-bold text-white mb-1 leading-tight">
                {coachData.users?.full_name || "Unknown Instructor"}
              </h3>
              <div className="text-cyan-300 text-[10px] font-medium tracking-widest uppercase mb-2">
                {coachData.users?.email}
              </div>
              <div className="inline-block px-4 py-1 bg-emerald-500/20 backdrop-blur-sm border border-emerald-500/30 rounded-full text-emerald-300 text-[10px] font-bold tracking-wider uppercase mt-1">
                {coachData.role_title || "INSTRUCTOR"}
              </div>
            </div>
          </div>

          <div className="p-8 flex flex-col items-center bg-white relative z-10">
            <div 
              ref={qrRef}
              className="p-3 bg-white rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.08)] border border-slate-50 transform group-hover:scale-105 transition-transform duration-500"
            >
              {coachData.qr_token ? (
                <QRCodeSVG
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
            <p className="mt-5 font-mono text-slate-400 text-xs tracking-widest font-bold uppercase">
              Scan to Check-in
            </p>
          </div>

          <div className="bg-slate-50 p-6 border-t border-slate-100 flex flex-col gap-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                <Medal size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Specialty</p>
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
          Account & Profile Settings
        </button>
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 py-10 overflow-y-auto">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200 my-auto flex flex-col max-h-full">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 sticky top-0 z-10">
              <div className="flex items-center gap-3 text-blue-600">
                <Edit3 size={24} />
                <h3 className="text-xl font-bold tracking-tight text-slate-800">Account & Profile Settings</h3>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 bg-white rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500 shadow-sm border border-slate-100 transition-all">
                <X size={20} />
              </button>
            </div>
            <form id="editProfileForm" onSubmit={handleEditSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-8 overflow-y-auto space-y-10 custom-scrollbar">
                {/* ACCOUNT CREDENTIALS */}
                <div>
                  <div className="flex items-center gap-2 mb-4 text-slate-800">
                    <ShieldCheck size={18} className="text-blue-500" />
                    <h4 className="font-bold uppercase tracking-wider text-xs">Login Credentials</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-6 bg-blue-50/50 rounded-[24px] border border-blue-100">
                    <div className="md:col-span-2">
                      <label className={labelCls}>Full Name (System & Card)</label>
                      <input required value={editForm.full_name} onChange={e => setEditForm({...editForm, full_name: e.target.value})} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Email Address</label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input required type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className={`${inputCls} pl-11`} />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Password <span className="text-slate-400 normal-case font-normal">(Leave blank to keep)</span></label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type={showPassword ? "text" : "password"} value={editForm.password} onChange={e => setEditForm({...editForm, password: e.target.value})} placeholder="******" className={`${inputCls} pl-11 pr-12`} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors">
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="border-t border-slate-100"></div>
                {/* PROFESSIONAL & PUBLIC PROFILE */}
                <div>
                  <div className="flex items-center gap-2 mb-4 text-slate-800">
                    <LayoutTemplate size={18} className="text-blue-500" />
                    <h4 className="font-bold uppercase tracking-wider text-xs">Public Profile (Landing Page)</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                    <div>
                      <label className={labelCls}>Nickname (Display Name)</label>
                      <input required placeholder="e.g. Coach Budi" value={editForm.nickname} onChange={e => setEditForm({...editForm, nickname: e.target.value})} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Role / Title</label>
                      <input required placeholder="e.g. Head Coach" value={editForm.role_title} onChange={e => setEditForm({...editForm, role_title: e.target.value})} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Swimming Specialty</label>
                      <input required placeholder="e.g. Butterfly & Sprint" value={editForm.specialty} onChange={e => setEditForm({...editForm, specialty: e.target.value})} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Contact Phone</label>
                      <input required placeholder="+62 812..." value={editForm.phone_number} onChange={e => setEditForm({...editForm, phone_number: e.target.value})} className={inputCls} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Age</label>
                        <input type="number" placeholder="e.g. 30" value={editForm.age} onChange={e => setEditForm({...editForm, age: e.target.value})} className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Nationality</label>
                        <input placeholder="Indonesia" value={editForm.nationality} onChange={e => setEditForm({...editForm, nationality: e.target.value})} className={inputCls} />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Profile Photo URL</label>
                      <input placeholder="https://..." value={editForm.photo_url} onChange={e => setEditForm({...editForm, photo_url: e.target.value})} className={inputCls} />
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelCls}>Experience Description</label>
                      <textarea required rows={2} placeholder="Brief bio and experience..." value={editForm.experience_desc} onChange={e => setEditForm({...editForm, experience_desc: e.target.value})} className={`${inputCls} resize-none`} />
                    </div>
                    <div className="md:col-span-2 mt-2">
                      <div className="flex items-center justify-between mb-3">
                        <label className={labelCls}>Achievements List</label>
                        <button type="button" onClick={addAchievement} className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                          <Plus size={14}/> Add Row
                        </button>
                      </div>
                      <div className="space-y-3">
                        {editForm.achievements.map((ach, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0">
                              <span className="text-[10px] font-black">{index + 1}</span>
                            </div>
                            <input required placeholder={`Achievement ${index + 1}...`} value={ach} onChange={(e) => handleAchievementChange(index, e.target.value)} className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium shadow-sm" />
                            {editForm.achievements.length > 1 && (
                              <button type="button" onClick={() => removeAchievement(index)} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><MinusCircle size={20} /></button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-3 sticky bottom-0 bg-white">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-6 py-3 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                <button type="submit" form="editProfileForm" disabled={isSubmitting} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2">
                  <Save size={18}/>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}