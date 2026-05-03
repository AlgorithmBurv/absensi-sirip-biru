import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import { toast, Toaster } from "react-hot-toast";
import {
  CalendarDays,
  Plus,
  Edit2,
  Trash2,
  X,
  Search,
  Filter,
  Power,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function SessionManage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination, Search, & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // 'all', 'active', 'closed'
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [form, setForm] = useState({ name: "", session_date: "" });

  const fetchSessions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("sessions")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setSessions(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // Reset page ke 1 setiap kali search atau filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus]);

  // Derived Data: Filtering & Searching
  const filteredSessions = sessions.filter((session) => {
    const matchesSearch = session.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === "all"
        ? true
        : filterStatus === "active"
          ? session.is_active === true
          : session.is_active === false;

    return matchesSearch && matchesFilter;
  });

  // Derived Data: Pagination
  const totalPages = Math.ceil(filteredSessions.length / ITEMS_PER_PAGE);
  const paginatedSessions = filteredSessions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // Modal Handlers
  const openAddModal = () => {
    const today = new Date().toISOString().split("T")[0];
    setForm({ name: "", session_date: today });
    setIsEditing(false);
    setCurrentId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (s) => {
    setForm({ name: s.name, session_date: s.session_date });
    setIsEditing(true);
    setCurrentId(s.id);
    setIsModalOpen(true);
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading(
      isEditing ? "Updating session..." : "Creating new session...",
    );

    if (isEditing) {
      const { error } = await supabase
        .from("sessions")
        .update(form)
        .eq("id", currentId);

      if (!error) {
        toast.success("Session updated successfully", { id: loadingToast });
        setIsModalOpen(false);
        fetchSessions();
      } else {
        toast.error(`Update failed: ${error.message}`, { id: loadingToast });
      }
    } else {
      const { error } = await supabase
        .from("sessions")
        .insert([{ ...form, is_active: true }]); // Default selalu aktif saat dibuat

      if (!error) {
        toast.success("Session created successfully", { id: loadingToast });
        setIsModalOpen(false);
        fetchSessions();
      } else {
        toast.error(`Creation failed: ${error.message}`, { id: loadingToast });
      }
    }
  };

  // Delete Handler
  const handleDelete = async (id) => {
    if (
      !confirm(
        "Are you sure you want to permanently delete this session? All related attendance logs will also be deleted.",
      )
    )
      return;

    const loadingToast = toast.loading("Deleting session...");
    const { error } = await supabase.from("sessions").delete().eq("id", id);

    if (!error) {
      toast.success("Session deleted successfully", { id: loadingToast });
      // Cek apakah halaman saat ini menjadi kosong setelah dihapus
      if (paginatedSessions.length === 1 && currentPage > 1)
        setCurrentPage((p) => p - 1);
      fetchSessions();
    } else {
      toast.error(`Failed to delete: ${error.message}`, { id: loadingToast });
    }
  };

  // Toggle Status Handler
  const toggleStatus = async (id, currentStatus) => {
    const loadingToast = toast.loading(
      currentStatus ? "Closing session..." : "Activating session...",
    );
    const { error } = await supabase
      .from("sessions")
      .update({ is_active: !currentStatus })
      .eq("id", id);

    if (!error) {
      toast.success(currentStatus ? "Session closed" : "Session activated", {
        id: loadingToast,
      });
      fetchSessions();
    } else {
      toast.error(`Status update failed: ${error.message}`, {
        id: loadingToast,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans relative">
      <Toaster
        position="top-right"
        toastOptions={{ style: { borderRadius: "16px", fontWeight: "500" } }}
      />

      {/* Header Section */}
      <div className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Training Sessions
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Manage daily swimming practice schedules and attendance gates.
          </p>
        </div>
        <button
          onClick={openAddModal}
          title="Click to open a new attendance session"
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-2xl shadow-lg shadow-blue-600/30 transition-all active:scale-95"
        >
          <Plus size={18} />
          New Session
        </button>
      </div>

      {/* Search & Filter Section */}
      <div className="max-w-6xl mx-auto mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search session by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
          />
        </div>
        <div className="relative min-w-[200px]">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Filter size={18} className="text-slate-400" />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm appearance-none cursor-pointer font-medium text-slate-600"
          >
            <option value="all">All Status</option>
            <option value="active">Active Sessions</option>
            <option value="closed">Closed Sessions</option>
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-100 overflow-hidden flex flex-col min-h-[500px]">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white">
          <h2 className="font-bold text-slate-800">Session Logs</h2>
          <span
            title="Filtered sessions count"
            className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold"
          >
            {filteredSessions.length} Results
          </span>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[11px] uppercase tracking-widest font-black">
                <th className="px-6 py-4">Session Details</th>
                <th className="px-6 py-4">Status Gate</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedSessions.map((s) => (
                <tr
                  key={s.id}
                  className="hover:bg-blue-50/30 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors ${s.is_active ? "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100" : "bg-slate-50 text-slate-400 group-hover:bg-slate-100"}`}
                      >
                        <CalendarDays size={20} />
                      </div>
                      <div>
                        <div
                          className={`font-bold text-base ${s.is_active ? "text-slate-800" : "text-slate-500"}`}
                        >
                          {s.name}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5 font-medium flex items-center gap-1.5">
                          <Clock size={12} />
                          {new Date(s.session_date).toLocaleDateString(
                            "en-US",
                            {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            },
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleStatus(s.id, s.is_active)}
                      title={
                        s.is_active
                          ? "Click to close attendance gate"
                          : "Click to reopen attendance gate"
                      }
                      className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                        s.is_active
                          ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-600 hover:text-white"
                          : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-emerald-500 hover:text-white hover:border-emerald-500"
                      }`}
                    >
                      <Power size={12} />
                      {s.is_active ? "GATE OPEN" : "CLOSED"}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => openEditModal(s)}
                        title="Edit session details"
                        className="p-2.5 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        title="Delete session and its attendance logs"
                        className="p-2.5 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-sm"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {paginatedSessions.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan="3"
                    className="px-6 py-20 text-center text-slate-400"
                  >
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search size={32} className="text-slate-300" />
                    </div>
                    <p className="font-bold text-slate-600">
                      No sessions found
                    </p>
                    <p className="text-sm mt-1">
                      Try adjusting your search or filter criteria.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 0 && (
          <div className="p-4 border-t border-slate-50 flex items-center justify-between bg-slate-50/50">
            <span className="text-xs font-medium text-slate-500 pl-2">
              Page{" "}
              <span className="font-bold text-slate-800">{currentPage}</span> of{" "}
              <span className="font-bold text-slate-800">{totalPages}</span>
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                title="Previous page"
                className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                title="Next page"
                className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
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
                {isEditing ? <Edit2 size={24} /> : <CalendarDays size={24} />}
                <h3 className="text-xl font-bold tracking-tight text-slate-800">
                  {isEditing ? "Edit Session" : "New Session"}
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
              <div className="space-y-5 mb-8">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                    Session Name
                  </label>
                  <input
                    required
                    autoFocus
                    placeholder="e.g. Morning Swim Practice"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all shadow-inner font-medium text-slate-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={form.session_date}
                    onChange={(e) =>
                      setForm({ ...form, session_date: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all shadow-inner font-medium text-slate-700 cursor-text"
                  />
                </div>
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
                  title={
                    isEditing ? "Save updated session" : "Create new session"
                  }
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all active:scale-95 flex items-center gap-2"
                >
                  {isEditing ? "Save Changes" : "Open Session"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}