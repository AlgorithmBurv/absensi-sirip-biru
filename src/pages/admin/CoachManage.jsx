import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import { v4 as uuidv4 } from "uuid";
import { toast, Toaster } from "react-hot-toast";
import {
  UserPlus,
  Edit2,
  Trash2,
  X,
  Phone,
  Medal,
  User,
  Search,
  Shield,
  Eye,
  EyeOff,
} from "lucide-react";

export default function CoachManage() {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);

  // State untuk Modal & Toggle Password
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const initialFormState = {
    full_name: "",
    email: "",
    password: "",
    specialty: "",
    phone_number: "",
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

  useEffect(() => {
    fetchData();
  }, []);

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
      password: "", // Dikosongkan agar admin tidak bingung
      specialty: c.specialty || "",
      phone_number: c.phone_number || "",
    });
    setIsEditing(true);
    setCurrentId(c.id);
    setCurrentUserId(c.user_id);
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading(
      isEditing ? "Updating coach..." : "Registering new coach..."
    );

    try {
      if (isEditing) {
        // 1. UPDATE USER (Nama Lengkap & Email)
        const userUpdateData = {
          full_name: form.full_name,
          email: form.email,
        };
        // Jika form password diisi, ikut diupdate
        if (form.password) userUpdateData.password = form.password;

        const { error: userError } = await supabase
          .from("users")
          .update(userUpdateData)
          .eq("id", currentUserId);

        if (userError) throw userError;

        // 2. UPDATE COACH
        const { error: coachError } = await supabase
          .from("coaches")
          .update({
            specialty: form.specialty,
            phone_number: form.phone_number,
          })
          .eq("id", currentId);

        if (coachError) throw coachError;

        toast.success("Coach information updated!", { id: loadingToast });
      } else {
        // 1. INSERT USER BARU (Role: coach)
        const { data: newUser, error: userError } = await supabase
          .from("users")
          .insert([
            {
              email: form.email,
              password: form.password,
              full_name: form.full_name,
              role: "coach",
            },
          ])
          .select()
          .single();

        if (userError)
          throw new Error("Gagal membuat User. Mungkin email sudah terdaftar.");

        // 2. INSERT COACH BARU
        const { error: coachError } = await supabase.from("coaches").insert([
          {
            user_id: newUser.id,
            specialty: form.specialty,
            phone_number: form.phone_number,
            qr_token: `token_coach_${uuidv4()}`,
          },
        ]);

        if (coachError) {
          // Rollback jika gagal
          await supabase.from("users").delete().eq("id", newUser.id);
          throw coachError;
        }

        toast.success("Coach registered successfully!", { id: loadingToast });
      }

      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.message, { id: loadingToast });
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm("Are you sure you want to permanently delete this coach?"))
      return;

    const loadingToast = toast.loading("Deleting record...");
    // Menghapus user akan otomatis menghapus data coach karena ON DELETE CASCADE di SQL
    const { error } = await supabase.from("users").delete().eq("id", userId);

    if (!error) {
      toast.success("Coach deleted successfully", { id: loadingToast });
      fetchData();
    } else {
      toast.error(`Failed to delete: ${error.message}`, { id: loadingToast });
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans relative">
      <Toaster
        position="top-right"
        toastOptions={{ style: { borderRadius: "16px", fontWeight: "500" } }}
      />

      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Coach Registry
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Manage swimming instructors and their contact information.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-2xl shadow-lg shadow-blue-600/30 transition-all active:scale-95"
        >
          <UserPlus size={18} />
          Register Coach
        </button>
      </div>

      {/* Table Section */}
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white">
          <h2 className="font-bold text-slate-800">Instructors List</h2>
          <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold">
            {coaches.length} Coaches
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[11px] uppercase tracking-widest font-black">
                <th className="px-6 py-4">Identity</th>
                <th className="px-6 py-4">Specialty & Contact</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {coaches.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-blue-50/30 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                        <User size={18} />
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">
                          {c.users?.full_name || "Unknown Name"}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {c.users?.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                      <Medal size={14} className="text-amber-500" />
                      {c.specialty || "General Instructor"}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Phone size={14} className="text-slate-400" />
                      {c.phone_number || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => openEditModal(c)}
                        title="Edit coach info"
                        className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(c.user_id)}
                        title="Delete coach"
                        className="p-2 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-sm"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {coaches.length === 0 && !loading && (
                <tr>
                  <td colSpan="3" className="px-6 py-16 text-center text-slate-400">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search size={32} className="text-slate-300" />
                    </div>
                    <p className="font-bold text-slate-600">No coaches found</p>
                    <p className="text-sm mt-1">Register a coach to get started.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================= */}
      {/* MODAL FORM (Add & Edit) */}
      {/* ========================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 py-10 overflow-y-auto">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 sticky top-0 z-10">
              <div className="flex items-center gap-3 text-blue-600">
                {isEditing ? <Edit2 size={24} /> : <UserPlus size={24} />}
                <h3 className="text-xl font-bold tracking-tight text-slate-800">
                  {isEditing ? "Edit Coach Data" : "New Coach Registration"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 bg-white rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500 shadow-sm border border-slate-100 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8">
              {/* SECTION 1: ACCOUNT CREDENTIALS */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4 text-slate-800">
                  <Shield size={16} className="text-blue-500" />
                  <h4 className="font-bold uppercase tracking-wider text-xs">
                    Account Credentials
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                      Coach Full Name
                    </label>
                    <input
                      required
                      placeholder="e.g. Coach Budi"
                      value={form.full_name}
                      onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                      Email Address
                    </label>
                    <input
                      required
                      type="email"
                      placeholder="coach@mail.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                      Password {isEditing && <span className="text-slate-400 normal-case ml-1 font-normal">(Leave blank to keep)</span>}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required={!isEditing}
                        placeholder="••••••••"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 pr-10 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: COACH DETAILS */}
              <div>
                <div className="flex items-center gap-2 mb-4 text-slate-800">
                  <User size={16} className="text-blue-500" />
                  <h4 className="font-bold uppercase tracking-wider text-xs">
                    Professional Profile
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                      Specialty / Role
                    </label>
                    <input
                      required
                      placeholder="e.g. Senior Freestyle Coach"
                      value={form.specialty}
                      onChange={(e) => setForm({ ...form, specialty: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all shadow-inner"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                      Contact Number
                    </label>
                    <input
                      required
                      placeholder="+62 812..."
                      value={form.phone_number}
                      onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all shadow-inner"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-end gap-3 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all active:scale-95"
                >
                  {isEditing ? "Save Changes" : "Register Coach"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}