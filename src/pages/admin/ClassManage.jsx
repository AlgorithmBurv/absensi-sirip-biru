import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import { toast, Toaster } from "react-hot-toast";
import { Layers, Plus, Edit2, Trash2, X, Search, Bookmark } from "lucide-react";

export default function ClassManage() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [form, setForm] = useState({ name: "" });

  const fetchClasses = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("classes")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setClasses(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  // Modal Handlers
  const openAddModal = () => {
    setForm({ name: "" });
    setIsEditing(false);
    setCurrentId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (c) => {
    setForm({ name: c.name });
    setIsEditing(true);
    setCurrentId(c.id);
    setIsModalOpen(true);
  };

  // Submit Handler (Add & Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading(
      isEditing ? "Updating class..." : "Creating new class...",
    );

    if (isEditing) {
      const { error } = await supabase
        .from("classes")
        .update({ name: form.name })
        .eq("id", currentId);

      if (!error) {
        toast.success("Class updated successfully", { id: loadingToast });
        setIsModalOpen(false);
        fetchClasses();
      } else {
        toast.error(`Failed to update: ${error.message}`, { id: loadingToast });
      }
    } else {
      const { error } = await supabase
        .from("classes")
        .insert([{ name: form.name }]);

      if (!error) {
        toast.success("Class created successfully", { id: loadingToast });
        setIsModalOpen(false);
        fetchClasses();
      } else {
        toast.error(`Failed to create: ${error.message}`, { id: loadingToast });
      }
    }
  };

  // Delete Handler
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to permanently delete this class?"))
      return;

    const loadingToast = toast.loading("Deleting class...");
    const { error } = await supabase.from("classes").delete().eq("id", id);

    if (!error) {
      toast.success("Class deleted successfully", { id: loadingToast });
      fetchClasses();
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
      <div className="max-w-5xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Class Levels
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Manage training groups and class categories.
          </p>
        </div>
        <button
          onClick={openAddModal}
          title="Click to create a new class"
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-2xl shadow-lg shadow-blue-600/30 transition-all active:scale-95"
        >
          <Plus size={18} />
          New Class
        </button>
      </div>

      {/* Data Section */}
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white">
          <h2 className="font-bold text-slate-800">Class Inventory</h2>
          <span
            title="Total registered classes"
            className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold"
          >
            {classes.length} Classes
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[11px] uppercase tracking-widest font-black">
                <th className="px-8 py-4">Class Details</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {classes.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-blue-50/30 transition-colors group"
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                        <Layers size={20} />
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 text-base">
                          {c.name}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5 font-medium flex items-center gap-1">
                          <Bookmark size={12} /> Registry Group
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => openEditModal(c)}
                        title="Edit class name"
                        className="p-2.5 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        title="Delete class permanently"
                        className="p-2.5 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-sm"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {classes.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan="2"
                    className="px-6 py-16 text-center text-slate-400"
                  >
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search size={32} className="text-slate-300" />
                    </div>
                    <p className="font-bold text-slate-600">No classes found</p>
                    <p className="text-sm mt-1">
                      Start by adding a new class level.
                    </p>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3 text-blue-600">
                {isEditing ? <Edit2 size={24} /> : <Plus size={24} />}
                <h3 className="text-xl font-bold tracking-tight text-slate-800">
                  {isEditing ? "Edit Class" : "New Class"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                title="Close window"
                className="p-2 bg-white rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500 shadow-sm border border-slate-100 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} className="p-8">
              <div className="space-y-2 mb-8">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                  Class / Group Name
                </label>
                <input
                  required
                  autoFocus
                  placeholder="e.g. XII IPA 1 or Beginner Class"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all shadow-inner font-medium text-slate-700"
                />
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  title={isEditing ? "Save updated class" : "Create new class"}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all active:scale-95 flex items-center gap-2"
                >
                  {isEditing ? "Save Changes" : "Create Class"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}