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
  ArrowUpDown,
  AlertTriangle,
} from "lucide-react";

function ConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
  title,
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center pt-8 pb-4 px-8">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4 ring-8 ring-red-50/60">
            <AlertTriangle size={28} className="text-red-500" strokeWidth={2} />
          </div>
          <h3 className="text-lg font-extrabold text-slate-900 text-center tracking-tight">
            {title}
          </h3>
          <p className="text-sm text-slate-500 text-center mt-2 leading-relaxed">
            {description}
          </p>
        </div>
        <div className="flex gap-3 px-8 pb-8 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 py-3 px-4 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all active:scale-95 text-sm"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 px-4 font-bold text-white bg-red-500 hover:bg-red-600 rounded-2xl shadow-lg shadow-red-500/30 transition-all active:scale-95 text-sm"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SessionManage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [form, setForm] = useState({ name: "", session_date: "" });

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: null,
  });

  const openConfirm = ({ title, description, onConfirm }) =>
    setConfirmModal({ isOpen: true, title, description, onConfirm });

  const closeConfirm = () =>
    setConfirmModal({
      isOpen: false,
      title: "",
      description: "",
      onConfirm: null,
    });

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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus, sortOrder, dateFrom, dateTo]);

  const filteredSessions = sessions
    .filter((s) => {
      const matchSearch = s.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchStatus =
        filterStatus === "all"
          ? true
          : filterStatus === "active"
            ? s.is_active === true
            : s.is_active === false;
      const matchFrom = dateFrom
        ? new Date(s.session_date) >= new Date(dateFrom)
        : true;
      const matchTo = dateTo
        ? new Date(s.session_date) <= new Date(dateTo)
        : true;

      return matchSearch && matchStatus && matchFrom && matchTo;
    })
    .sort((a, b) => {
      const da = new Date(a.session_date).getTime();
      const db = new Date(b.session_date).getTime();
      return sortOrder === "desc" ? db - da : da - db;
    });

  const totalPages = Math.ceil(filteredSessions.length / ITEMS_PER_PAGE);
  const paginatedSessions = filteredSessions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const hasActiveFilters =
    searchQuery || filterStatus !== "all" || dateFrom || dateTo;

  const clearFilters = () => {
    setSearchQuery("");
    setFilterStatus("all");
    setDateFrom("");
    setDateTo("");
  };

  const openAddModal = () => {
    setForm({ name: "", session_date: new Date().toISOString().split("T")[0] });
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
      } else
        toast.error(`Update failed: ${error.message}`, { id: loadingToast });
    } else {
      const { error } = await supabase
        .from("sessions")
        .insert([{ ...form, is_active: true }]);

      if (!error) {
        toast.success("Session created successfully", { id: loadingToast });
        setIsModalOpen(false);
        fetchSessions();
      } else
        toast.error(`Creation failed: ${error.message}`, { id: loadingToast });
    }
  };

  const handleDelete = (id) => {
    openConfirm({
      title: "Delete This Session?",
      description:
        "This action is permanent. All attendance logs related to this session will also be deleted.",
      onConfirm: async () => {
        closeConfirm();
        const loadingToast = toast.loading("Deleting session...");
        const { error } = await supabase.from("sessions").delete().eq("id", id);
        if (!error) {
          toast.success("Session deleted successfully", { id: loadingToast });
          if (paginatedSessions.length === 1 && currentPage > 1)
            setCurrentPage((p) => p - 1);
          fetchSessions();
        } else
          toast.error(`Failed to delete: ${error.message}`, {
            id: loadingToast,
          });
      },
    });
  };

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
    } else
      toast.error(`Status update failed: ${error.message}`, {
        id: loadingToast,
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
            Training Sessions
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Manage daily swimming practice schedules and attendance gates.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-2xl shadow-lg shadow-blue-600/30 transition-all active:scale-95"
        >
          <Plus size={18} /> New Session
        </button>
      </div>

      {/* Controls Card */}
      <div className="max-w-7xl mx-auto mb-6 bg-white rounded-3xl border border-slate-100 shadow-sm p-4 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={16} className="text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search session by name..."
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
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer font-medium text-slate-600"
            >
              <option value="all">All Status</option>
              <option value="active">Active Sessions</option>
              <option value="closed">Closed Sessions</option>
            </select>
          </div>
          <button
            onClick={() => setSortOrder((p) => (p === "desc" ? "asc" : "desc"))}
            className="flex items-center justify-center gap-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold py-3 px-4 rounded-2xl transition-all text-sm flex-shrink-0"
          >
            <ArrowUpDown
              size={15}
              className={
                sortOrder === "desc" ? "text-blue-600" : "text-slate-400"
              }
            />
            {sortOrder === "desc" ? "Newest" : "Oldest"}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">
            <CalendarDays size={14} />
            <span>Date</span>
          </div>
          <input
            type="date"
            value={dateFrom}
            max={dateTo || undefined}
            onChange={(e) => setDateFrom(e.target.value)}
            className="flex-1 py-3 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-600 cursor-pointer"
          />
          <span className="text-slate-300 font-bold hidden sm:block"> </span>
          <input
            type="date"
            value={dateTo}
            min={dateFrom || undefined}
            onChange={(e) => setDateTo(e.target.value)}
            className="flex-1 py-3 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-600 cursor-pointer"
          />

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center justify-center gap-1.5 bg-red-50 border border-red-200 hover:bg-red-100 text-red-500 font-bold py-3 px-4 rounded-2xl transition-all text-sm flex-shrink-0"
            >
              <X size={15} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-100 overflow-hidden flex flex-col min-h-[500px]">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white">
          <h2 className="font-bold text-slate-800">Session Logs</h2>
          <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold">
            {filteredSessions.length} / {sessions.length} Results
          </span>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[600px]">
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
                      className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${s.is_active ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-600 hover:text-white" : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-emerald-500 hover:text-white hover:border-emerald-500"}`}
                    >
                      <Power size={12} />
                      {s.is_active ? "GATE OPEN" : "CLOSED"}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => openEditModal(s)}
                        className="p-2.5 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
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
                      {hasActiveFilters
                        ? "Try adjusting your search, filter, or date range."
                        : "Start by creating a new session."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 0 && (
          <div className="p-4 border-t border-slate-50 flex items-center justify-between bg-slate-50/50">
            <span className="text-xs font-medium text-slate-500 pl-2">
              Page <span className="font-bold text-slate-800">{currentPage}</span> of <span className="font-bold text-slate-800">{totalPages}</span>
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3 text-blue-600">
                {isEditing ? <Edit2 size={24} /> : <CalendarDays size={24} />}
                <h3 className="text-xl font-bold tracking-tight text-slate-800">
                  {isEditing ? "Edit Session" : "New Session"}
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
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all active:scale-95"
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