import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import { v4 as uuidv4 } from "uuid";
import { toast, Toaster } from "react-hot-toast";
import {
  UserPlus, Edit2, Trash2, X, Phone, MapPin, User, Search,
  Shield, Eye, EyeOff, ArrowUpDown, Filter, AlertTriangle,
} from "lucide-react";

function ConfirmModal({ isOpen, onConfirm, onCancel, title, description, confirmLabel = "Delete", cancelLabel = "Cancel" }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center pt-8 pb-4 px-8">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4 ring-8 ring-red-50/60">
            <AlertTriangle size={28} className="text-red-500" strokeWidth={2} />
          </div>
          <h3 className="text-lg font-extrabold text-slate-900 text-center tracking-tight">{title}</h3>
          <p className="text-sm text-slate-500 text-center mt-2 leading-relaxed">{description}</p>
        </div>
        <div className="flex gap-3 px-8 pb-8 pt-2">
          <button onClick={onCancel} className="flex-1 py-3 px-4 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all active:scale-95 text-sm">
            {cancelLabel}
          </button>
          <button onClick={onConfirm} className="flex-1 py-3 px-4 font-bold text-white bg-red-500 hover:bg-red-600 rounded-2xl shadow-lg shadow-red-500/30 transition-all active:scale-95 text-sm">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StudentManage() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterClass, setFilterClass] = useState("all");
  const [sortOrder, setSortOrder] = useState("asc");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: "", description: "", onConfirm: null });

  const openConfirm = ({ title, description, onConfirm }) => setConfirmModal({ isOpen: true, title, description, onConfirm });
  const closeConfirm = () => setConfirmModal({ isOpen: false, title: "", description: "", onConfirm: null });

  const initialFormState = {
    full_name: "", password: "", email: "", nis: "", class_id: "",
    parent_name: "", age: "", address: "", phone_number: "",
  };
  const [form, setForm] = useState(initialFormState);

  const fetchData = async () => {
    setLoading(true);
    const { data: cls } = await supabase.from("classes").select("*");
    if (cls) setClasses(cls);

    const { data: std } = await supabase.from("students").select("*, classes(name), users(full_name, email)");
    if (std) setStudents(std);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const processedStudents = students
    .filter((s) => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || s.users?.full_name?.toLowerCase().includes(q) || s.nis?.toLowerCase().includes(q) || s.parent_name?.toLowerCase().includes(q) || s.phone_number?.toLowerCase().includes(q);
      const matchClass = filterClass === "all" || s.class_id === filterClass;
      return matchSearch && matchClass;
    })
    .sort((a, b) => {
      const nameA = a.users?.full_name?.toLowerCase() || "";
      const nameB = b.users?.full_name?.toLowerCase() || "";
      return sortOrder === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });

  const hasActiveFilters = searchQuery || filterClass !== "all";
  const clearFilters = () => { setSearchQuery(""); setFilterClass("all"); };

  const openAddModal = () => {
    setForm(initialFormState);
    setIsEditing(false); setCurrentId(null); setCurrentUserId(null); setShowPassword(false); setIsModalOpen(true);
  };

  const openEditModal = (s) => {
    setForm({ full_name: s.users?.full_name || "", email: s.users?.email || "", password: "", nis: s.nis, class_id: s.class_id, parent_name: s.parent_name || "", age: s.age || "", address: s.address || "", phone_number: s.phone_number || "" });
    setIsEditing(true); setCurrentId(s.id); setCurrentUserId(s.user_id); setShowPassword(false); setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading(isEditing ? "Updating record..." : "Creating account & athlete profile...");
    try {
      if (isEditing) {
        const userUpdateData = { full_name: form.full_name, email: form.email };
        if (form.password) userUpdateData.password = form.password;
        const { error: userError } = await supabase.from("users").update(userUpdateData).eq("id", currentUserId);
        if (userError) throw userError;

        const { error: studentError } = await supabase.from("students").update({ nis: form.nis, class_id: form.class_id, parent_name: form.parent_name, phone_number: form.phone_number, address: form.address, age: form.age ? parseInt(form.age) : null }).eq("id", currentId);
        if (studentError) throw studentError;

        toast.success("Information updated successfully", { id: loadingToast });
      } else {
        const { data: newUser, error: userError } = await supabase.from("users").insert([{ email: form.email, password: form.password, full_name: form.full_name, role: "student" }]).select().single();
        if (userError) throw new Error("Failed to create User. Email might already be registered. (" + userError.message + ")");

        const { error: studentError } = await supabase.from("students").insert([{ nis: form.nis, class_id: form.class_id, parent_name: form.parent_name, phone_number: form.phone_number, address: form.address, qr_token: uuidv4(), user_id: newUser.id, age: form.age ? parseInt(form.age) : null }]);
        if (studentError) { await supabase.from("users").delete().eq("id", newUser.id); throw studentError; }

        toast.success("Account & Athlete registered successfully", { id: loadingToast });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.message, { id: loadingToast });
    }
  };

  const handleDelete = (id) => {
    openConfirm({
      title: "Delete This Athlete?",
      description: "This action is permanent and cannot be undone. All athlete profile data will be removed.",
      onConfirm: async () => {
        closeConfirm();
        const loadingToast = toast.loading("Deleting record...");
        const { error } = await supabase.from("students").delete().eq("id", id);
        if (!error) { toast.success("Record deleted successfully", { id: loadingToast }); fetchData(); }
        else toast.error(`Failed to delete: ${error.message}`, { id: loadingToast });
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans relative">
      <Toaster
        position="top-right"
        toastOptions={{ style: { borderRadius: "16px", fontWeight: "500" } }}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        description={confirmModal.description}
        onConfirm={confirmModal.onConfirm}
        onCancel={closeConfirm}
      />

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Athlete Registry
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Manage student profiles, parent contact, and QR identifiers.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-2xl shadow-lg shadow-blue-600/30 transition-all active:scale-95"
        >
          <UserPlus size={18} /> New Registration
        </button>
      </div>

      {/* Controls Card */}
      <div className="max-w-7xl mx-auto mb-6 bg-white rounded-3xl border border-slate-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={16} className="text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search by name, NIS, or parent..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
          />
        </div>
        <div className="relative flex-shrink-0 sm:w-48">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter size={15} className="text-slate-400" />
          </div>
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer font-medium text-slate-600"
          >
            <option value="all">All Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setSortOrder((p) => (p === "asc" ? "desc" : "asc"))}
          className="flex items-center justify-center gap-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold py-3 px-4 rounded-2xl transition-all text-sm flex-shrink-0"
        >
          <ArrowUpDown
            size={15}
            className={sortOrder === "asc" ? "text-blue-600" : "text-slate-400"}
          />
          Name: {sortOrder === "asc" ? "A - Z" : "Z - A"}
        </button>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center justify-center gap-1.5 bg-red-50 border border-red-200 hover:bg-red-100 text-red-500 font-bold py-3 px-4 rounded-2xl transition-all text-sm flex-shrink-0"
          >
            <X size={15} /> Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white">
          <h2 className="font-bold text-slate-800">Data Inventory</h2>
          <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold">
            {processedStudents.length} / {students.length} Athletes
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[11px] uppercase tracking-widest font-black">
                <th className="px-6 py-4">Identity</th>
                <th className="px-6 py-4">Parent / Guardian</th>
                <th className="px-6 py-4">Contact & Address</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {processedStudents.map((s) => (
                <tr
                  key={s.id}
                  className="hover:bg-blue-50/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                        <User size={18} />
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">
                          {s.users?.full_name || "No Name Found"}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          NIS:{" "}
                          <span className="font-mono bg-slate-100 px-1 rounded">
                            {s.nis}
                          </span>
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-blue-500 mt-1">
                          {s.classes?.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-slate-700">
                      {s.parent_name || "N/A"}
                    </div>
                    <div className="text-xs text-slate-400">
                      {s.age ? `${s.age} yrs old` : ""}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-1.5">
                      <Phone size={14} className="text-slate-400" />
                      {s.phone_number || "-"}
                    </div>
                    <div
                      className="flex items-center gap-1.5 text-xs text-slate-500 truncate max-w-[200px]"
                      title={s.address}
                    >
                      <MapPin size={14} className="text-slate-400" />
                      {s.address || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEditModal(s)}
                        className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="p-2 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-sm"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {processedStudents.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-16 text-center text-slate-400"
                  >
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search size={32} className="text-slate-300" />
                    </div>
                    <p className="font-bold text-slate-600">
                      No athletes found
                    </p>
                    <p className="text-sm mt-1">
                      {hasActiveFilters
                        ? "Try adjusting your search or filter."
                        : "Start by adding a new registration."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 py-10 overflow-y-auto">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 sticky top-0 z-10">
              <div className="flex items-center gap-3 text-blue-600">
                {isEditing ? <Edit2 size={24} /> : <UserPlus size={24} />}
                <h3 className="text-xl font-bold tracking-tight text-slate-800">
                  {isEditing ? "Edit Athlete Data" : "New Registration"}
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                      Student Full Name
                    </label>
                    <input
                      required
                      placeholder="e.g. John Doe"
                      value={form.full_name}
                      onChange={(e) =>
                        setForm({ ...form, full_name: e.target.value })
                      }
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
                      placeholder="student@mail.com"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                      Password{" "}
                      {isEditing && (
                        <span className="text-slate-400 normal-case ml-1 font-normal">
                          (Leave blank to keep)
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required={!isEditing}
                        placeholder=" "
                        value={form.password}
                        onChange={(e) =>
                          setForm({ ...form, password: e.target.value })
                        }
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 pr-10 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: ATHLETE PROFILE */}
              <div>
                <div className="flex items-center gap-2 mb-4 text-slate-800">
                  <User size={16} className="text-blue-500" />
                  <h4 className="font-bold uppercase tracking-wider text-xs">
                    Athlete Profile
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                      Identity Number (NIS)
                    </label>
                    <input
                      required
                      placeholder="e.g. 2024001"
                      value={form.nis}
                      onChange={(e) =>
                        setForm({ ...form, nis: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all shadow-inner"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                      Class Level
                    </label>
                    <select
                      required
                      value={form.class_id}
                      onChange={(e) =>
                        setForm({ ...form, class_id: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all shadow-inner"
                    >
                      <option value="">-- Select Class --</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                      Parent / Guardian Name
                    </label>
                    <input
                      placeholder="Guardian full name"
                      value={form.parent_name}
                      onChange={(e) =>
                        setForm({ ...form, parent_name: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all shadow-inner"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                      Age (Years)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 15"
                      value={form.age}
                      onChange={(e) =>
                        setForm({ ...form, age: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all shadow-inner"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                      Contact Number
                    </label>
                    <input
                      placeholder="+62 812..."
                      value={form.phone_number}
                      onChange={(e) =>
                        setForm({ ...form, phone_number: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all shadow-inner"
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                      Complete Home Address
                    </label>
                    <input
                      placeholder="Street name, building, city..."
                      value={form.address}
                      onChange={(e) =>
                        setForm({ ...form, address: e.target.value })
                      }
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
                  {isEditing ? "Save Changes" : "Confirm Registration"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}