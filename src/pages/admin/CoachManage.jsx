import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import { v4 as uuidv4 } from "uuid";
import { toast, Toaster } from "react-hot-toast";
import {
  UserPlus, Edit3, Trash2, X, Phone, Medal,
  User, Search, Shield, Eye, EyeOff, AlertTriangle,
  MinusCircle, Plus, LayoutTemplate, CheckCircle2, XCircle
} from "lucide-react";

const inputCls = "w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium";
const labelCls = "block text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-1.5 ml-1";

export default function CoachManage() {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const initialFormState = {
    full_name: "", email: "", password: "", specialty: "", phone_number: "",
    nickname: "", role_title: "", experience_desc: "", age: "", nationality: "Indonesia",
    photo_url: "", show_on_landing: true, achievements: [""]
  };
  const [form, setForm] = useState(initialFormState);

  const fetchData = async () => {
    setLoading(true);
    const { data: coachData, error } = await supabase
      .from("coaches")
      .select("*, users(full_name, email)")
      .order("created_at", { ascending: false });

    if (coachData) setCoaches(coachData);
    if (error) toast.error("Failed to load coaches: " + error.message);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const filteredCoaches = coaches.filter(c => {
    const q = searchQuery.toLowerCase();
    return (
      c.users?.full_name?.toLowerCase().includes(q) ||
      c.specialty?.toLowerCase().includes(q) ||
      c.role_title?.toLowerCase().includes(q)
    );
  });

  const openAddModal = () => {
    setForm(initialFormState);
    setIsEditing(false);
    setCurrentId(null);
    setCurrentUserId(null);
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const openEditModal = (c) => {
    setForm({
      full_name: c.users?.full_name || "",
      email: c.users?.email || "",
      password: "",
      specialty: c.specialty || "",
      phone_number: c.phone_number || "",
      nickname: c.nickname || "",
      role_title: c.role_title || "",
      experience_desc: c.experience_desc || "",
      age: c.age || "",
      nationality: c.nationality || "Indonesia",
      photo_url: c.photo_url || "",
      show_on_landing: c.show_on_landing ?? true,
      achievements: c.achievements?.length > 0 ? c.achievements : [""]
    });
    setIsEditing(true);
    setCurrentId(c.id);
    setCurrentUserId(c.user_id);
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const handleAchievementChange = (index, value) => {
    const newAch = [...form.achievements];
    newAch[index] = value;
    setForm({ ...form, achievements: newAch });
  };
  const addAchievement = () => setForm({ ...form, achievements: [...form.achievements, ""] });
  const removeAchievement = (index) => setForm({ ...form, achievements: form.achievements.filter((_, i) => i !== index) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const loadingToast = toast.loading(isEditing ? "Updating data..." : "Registering coach...");
    const cleanAchievements = form.achievements.filter(a => a.trim() !== "");

    try {
      if (isEditing) {
        const userUpdateData = { full_name: form.full_name, email: form.email };
        if (form.password) userUpdateData.password = form.password;

        const { error: userError } = await supabase.from("users").update(userUpdateData).eq("id", currentUserId);
        if (userError) throw userError;

        const { error: coachError } = await supabase.from("coaches").update({
          specialty: form.specialty,
          phone_number: form.phone_number,
          nickname: form.nickname,
          role_title: form.role_title,
          experience_desc: form.experience_desc,
          age: form.age ? parseInt(form.age) : null,
          nationality: form.nationality,
          photo_url: form.photo_url,
          show_on_landing: form.show_on_landing,
          achievements: cleanAchievements
        }).eq("id", currentId);

        if (coachError) throw coachError;
        toast.success("Coach data updated!", { id: loadingToast });
      } else {
        const { data: newUser, error: userError } = await supabase
          .from("users")
          .insert([{ email: form.email, password: form.password, full_name: form.full_name, role: "coach" }])
          .select().single();

        if (userError) throw new Error("Failed to create User. Email might already be registered.");

        const { error: coachError } = await supabase.from("coaches").insert([{
          user_id: newUser.id,
          specialty: form.specialty,
          phone_number: form.phone_number,
          qr_token: `token_coach_${uuidv4()}`,
          nickname: form.nickname,
          role_title: form.role_title,
          experience_desc: form.experience_desc,
          age: form.age ? parseInt(form.age) : null,
          nationality: form.nationality,
          photo_url: form.photo_url,
          show_on_landing: form.show_on_landing,
          achievements: cleanAchievements
        }]);

        if (coachError) {
          await supabase.from("users").delete().eq("id", newUser.id);
          throw coachError;
        }
        toast.success("Coach registered successfully!", { id: loadingToast });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.message, { id: loadingToast });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (c) => {
    if (!window.confirm(`Are you sure you want to delete ${c.users?.full_name}? All related data will be permanently lost.`)) return;
    const loadingToast = toast.loading("Deleting data...");

    const { error } = await supabase.from("users").delete().eq("id", c.user_id);
    if (!error) {
      toast.success("Coach deleted successfully", { id: loadingToast });
      fetchData();
    } else {
      toast.error(`Failed to delete: ${error.message}`, { id: loadingToast });
    }
  };

  const toggleLandingStatus = async (id, currentStatus) => {
    const { error } = await supabase.from("coaches").update({ show_on_landing: !currentStatus }).eq("id", id);
    if (!error) {
      setCoaches(coaches.map(c => c.id === id ? { ...c, show_on_landing: !currentStatus } : c));
      toast.success("Publication status updated");
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] p-4 md:p-10 font-sans text-slate-900 relative">
      <Toaster position="top-right" toastOptions={{ style: { borderRadius: "16px", fontWeight: "500" } }} />

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-200">
            <UserPlus size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Coach Registry</h1>
            <p className="text-slate-500 text-sm">Manage instructor data and their public profiles.</p>
          </div>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white font-bold py-3 px-6 rounded-2xl shadow-lg transition-all active:scale-95"
        >
          <Plus size={18} /> Register Coach
        </button>
      </div>

      {/* Search */}
      <div className="max-w-7xl mx-auto mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search size={18} className="text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Search by name, specialty, or title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-[20px] text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm font-medium"
        />
      </div>

      {/* Table */}
      <div className="max-w-7xl mx-auto bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white">
          <h2 className="font-bold text-slate-800">Instructor Directory</h2>
          <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold">{filteredCoaches.length} Coaches</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Identity</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Specialty & Contact</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Landing Publication</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredCoaches.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0 overflow-hidden border border-slate-200">
                        {c.photo_url ? (
                          <img src={c.photo_url} alt={c.users?.full_name} className="w-full h-full object-cover" />
                        ) : (
                          <User size={20} />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 text-base">{c.users?.full_name || "Unknown"}</div>
                        <div className="text-xs text-blue-600 font-bold mt-0.5">{c.role_title || "Coach"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                      <Medal size={14} className="text-amber-500" />
                      {c.specialty || "General Instructor"}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                      <Phone size={14} className="text-slate-400" />
                      {c.phone_number || "No contact"}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-center">
                      <button
                        onClick={() => toggleLandingStatus(c.id, c.show_on_landing)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter transition-all ${
                          c.show_on_landing ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        }`}
                      >
                        {c.show_on_landing ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                        {c.show_on_landing ? "Published" : "Hidden"}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEditModal(c)} className="p-2.5 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm">
                        <Edit3 size={16} />
                      </button>
                      <button onClick={() => handleDelete(c)} className="p-2.5 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-sm">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCoaches.length === 0 && !loading && (
                <tr>
                  <td colSpan="4" className="px-6 py-20 text-center text-slate-400">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search size={32} className="text-slate-300" />
                    </div>
                    <p className="font-bold text-slate-600">No coaches found</p>
                    <p className="text-sm mt-1">No data available or search keyword doesn't match.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 py-10 overflow-y-auto">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200 my-auto flex flex-col max-h-full">

            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 sticky top-0 z-10">
              <div className="flex items-center gap-3 text-blue-600">
                {isEditing ? <Edit3 size={24} /> : <UserPlus size={24} />}
                <h3 className="text-xl font-bold tracking-tight text-slate-800">
                  {isEditing ? "Edit Coach Data" : "New Coach Registration"}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500 shadow-sm border border-slate-100 transition-all">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-8 overflow-y-auto space-y-10">

                {/* SECTION 1: ACCOUNT CREDENTIALS */}
                <div>
                  <div className="flex items-center gap-2 mb-4 text-slate-800">
                    <Shield size={18} className="text-blue-500" />
                    <h4 className="font-bold uppercase tracking-wider text-xs">Account Access (System)</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-6 bg-slate-50/50 rounded-[24px] border border-slate-100">
                    <div className="md:col-span-2">
                      <label className={labelCls}>Full Name (Real)</label>
                      <input required placeholder="e.g. Budi Santoso" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Access Email</label>
                      <input required type="email" placeholder="coach@mail.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>
                        Password {isEditing && <span className="text-slate-400 normal-case ml-1 font-normal">(Leave blank if unchanged)</span>}
                      </label>
                      <div className="relative">
                        <input type={showPassword ? "text" : "password"} required={!isEditing} placeholder="******" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={`${inputCls} pr-12`} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors">
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100"></div>

                {/* SECTION 2: PUBLIC PROFILE */}
                <div>
                  <div className="flex items-center gap-2 mb-4 text-slate-800">
                    <LayoutTemplate size={18} className="text-blue-500" />
                    <h4 className="font-bold uppercase tracking-wider text-xs">Public Profile (Landing Page)</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                    <div>
                      <label className={labelCls}>Nickname (Display Name)</label>
                      <input required placeholder="e.g. Coach Budi" value={form.nickname} onChange={(e) => setForm({ ...form, nickname: e.target.value })} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Role / Title</label>
                      <input required placeholder="e.g. Head Coach" value={form.role_title} onChange={(e) => setForm({ ...form, role_title: e.target.value })} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Swimming Specialty</label>
                      <input required placeholder="e.g. Butterfly & Sprint" value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Contact / Phone</label>
                      <input required placeholder="+62 812..." value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} className={inputCls} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Age</label>
                        <input type="number" placeholder="e.g. 30" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Nationality</label>
                        <input placeholder="Indonesia" value={form.nationality} onChange={(e) => setForm({ ...form, nationality: e.target.value })} className={inputCls} />
                      </div>
                    </div>

                    <div>
                      <label className={labelCls}>Profile Photo URL</label>
                      <input placeholder="https://..." value={form.photo_url} onChange={(e) => setForm({ ...form, photo_url: e.target.value })} className={inputCls} />
                    </div>

                    <div className="md:col-span-2">
                      <label className={labelCls}>Experience Description</label>
                      <textarea required rows={2} placeholder="Briefly describe the coach's experience..." value={form.experience_desc} onChange={(e) => setForm({ ...form, experience_desc: e.target.value })} className={`${inputCls} resize-none`} />
                    </div>

                    {/* Achievements */}
                    <div className="md:col-span-2 mt-2">
                      <div className="flex items-center justify-between mb-3">
                        <label className={labelCls}>Achievements List</label>
                        <button type="button" onClick={addAchievement} className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                          <Plus size={14} /> Add Row
                        </button>
                      </div>
                      <div className="space-y-3">
                        {form.achievements.map((ach, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                              <span className="text-[10px] font-black">{index + 1}</span>
                            </div>
                            <input
                              required
                              placeholder={`Achievement ${index + 1}...`}
                              value={ach}
                              onChange={(e) => handleAchievementChange(index, e.target.value)}
                              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                            />
                            {form.achievements.length > 1 && (
                              <button type="button" onClick={() => removeAchievement(index)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                                <MinusCircle size={20} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Toggle Visibility */}
                    <div className="md:col-span-2 pt-4">
                      <label className="flex items-center gap-3 bg-blue-50/50 rounded-2xl px-5 py-4 cursor-pointer select-none border border-blue-100">
                        <input type="checkbox" checked={form.show_on_landing} onChange={e => setForm({ ...form, show_on_landing: e.target.checked })} className="w-5 h-5 accent-blue-600 rounded" />
                        <span className="text-sm font-bold text-blue-900">Display this coach on the Public Landing Page</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-3 sticky bottom-0 bg-white">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="px-8 py-3 bg-slate-900 hover:bg-black text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50">
                  {submitting ? "Processing..." : (isEditing ? "Save Changes" : "Register Coach")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}