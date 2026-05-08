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
  Users,
  UserCheck,
  Eye,
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

const formatForInput = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// Helper untuk format waktu absensi saja
const formatTimeOnly = (iso) => {
  if (!iso) return "-";
  return new Date(iso).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// HELPER UNTUK WARNA STATUS ABSENSI
const getStatusBadgeStyle = (status) => {
  if (!status) return "bg-slate-100 text-slate-500 border-slate-200";
  
  const s = status.toLowerCase();
  if (s.includes("hadir_qr")) return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (s.includes("hadir_manual")) return "bg-teal-100 text-teal-700 border-teal-200";
  if (s.includes("izin")) return "bg-blue-100 text-blue-700 border-blue-200";
  if (s.includes("sakit")) return "bg-amber-100 text-amber-700 border-amber-200";
  if (s.includes("alpa")) return "bg-rose-100 text-rose-700 border-rose-200";
  
  return "bg-slate-100 text-slate-500 border-slate-200"; // Default (Belum absen)
};

export default function SessionManage() {
  const [sessions, setSessions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [coaches, setCoaches] = useState([]);
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
  const [form, setForm] = useState({
    name: "",
    session_date: "",
    class_ids: [],
    coach_ids: [],
  });

  // STATE UNTUK MODAL DETAIL ABSENSI
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedSessionDetail, setSelectedSessionDetail] = useState(null);
  const [sessionDetails, setSessionDetails] = useState({
    students: [],
    coaches: [],
  });
  const [detailLoading, setDetailLoading] = useState(false);

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

  const loadDependencies = async () => {
    const [clsRes, cchRes] = await Promise.all([
      supabase.from("classes").select("id, name").order("name"),
      supabase
        .from("coaches")
        .select("id, users(full_name)")
        .order("created_at"),
    ]);
    if (clsRes.data) setClasses(clsRes.data);
    if (cchRes.data) setCoaches(cchRes.data);
  };

  const fetchSessions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("sessions")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      const now = new Date();
      const twelveHoursMs = 12 * 60 * 60 * 1000;
      const expiredIds = [];

      const updatedData = data.map((s) => {
        if (s.is_active) {
          const sessionTime = new Date(s.session_date);
          if (now.getTime() - sessionTime.getTime() > twelveHoursMs) {
            expiredIds.push(s.id);
            return { ...s, is_active: false };
          }
        }
        return s;
      });

      if (expiredIds.length > 0) {
        supabase
          .from("sessions")
          .update({ is_active: false })
          .in("id", expiredIds)
          .then();
      }

      setSessions(updatedData);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDependencies();
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
        ? new Date(s.session_date) <= new Date(dateTo + "T23:59:59")
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
    setForm({
      name: "",
      session_date: formatForInput(new Date().toISOString()),
      class_ids: [],
      coach_ids: [],
    });
    setIsEditing(false);
    setCurrentId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (s) => {
    setForm({
      name: s.name,
      session_date: formatForInput(s.session_date),
      class_ids: s.class_ids || [],
      coach_ids: s.coach_ids || [],
    });
    setIsEditing(true);
    setCurrentId(s.id);
    setIsModalOpen(true);
  };

  const openDetailModal = async (s) => {
    setSelectedSessionDetail(s);
    setIsDetailModalOpen(true);
    setDetailLoading(true);

    try {
      const { data: logs } = await supabase
        .from("attendance_logs")
        .select("student_id, coach_id, status, scanned_at") 
        .eq("session_id", s.id);

      let expectedStudents = [];
      if (s.class_ids && s.class_ids.length > 0) {
        const { data: stdData } = await supabase
          .from("students")
          .select("id, nis, users(full_name), classes(name)")
          .in("class_id", s.class_ids);
        if (stdData) expectedStudents = stdData;
      }

      let expectedCoaches = [];
      if (s.coach_ids && s.coach_ids.length > 0) {
        const { data: coachData } = await supabase
          .from("coaches")
          .select("id, users(full_name)")
          .in("id", s.coach_ids);
        if (coachData) expectedCoaches = coachData;
      }

      const logMapStudent = {};
      const logMapCoach = {};
      logs?.forEach((log) => {
        if (log.student_id) logMapStudent[log.student_id] = { status: log.status, time: log.scanned_at }; 
        if (log.coach_id) logMapCoach[log.coach_id] = { status: log.status, time: log.scanned_at };
      });

      const mappedStudents = expectedStudents.map((std) => ({
        ...std,
        status: logMapStudent[std.id]?.status || "belum absen",
        scanned_at: logMapStudent[std.id]?.time || null, 
        is_present: !!logMapStudent[std.id],
      }));

      const mappedCoaches = expectedCoaches.map((c) => ({
        ...c,
        status: logMapCoach[c.id]?.status || "belum absen",
        scanned_at: logMapCoach[c.id]?.time || null, 
        is_present: !!logMapCoach[c.id],
      }));

      mappedStudents.sort((a, b) =>
        b.is_present === a.is_present ? 0 : a.is_present ? -1 : 1,
      );
      mappedCoaches.sort((a, b) =>
        b.is_present === a.is_present ? 0 : a.is_present ? -1 : 1,
      );

      setSessionDetails({
        students: mappedStudents,
        coaches: mappedCoaches,
      });
    } catch (error) {
      toast.error("Failed to load attendance details.");
    } finally {
      setDetailLoading(false);
    }
  };

  const toggleCheckbox = (type, id) => {
    setForm((prev) => {
      const list = prev[type];
      if (list.includes(id))
        return { ...prev, [type]: list.filter((item) => item !== id) };
      return { ...prev, [type]: [...list, id] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.class_ids.length === 0)
      return toast.error("Select at least one class.");
    if (form.coach_ids.length === 0)
      return toast.error("Select at least one coach.");

    const loadingToast = toast.loading(
      isEditing ? "Updating session..." : "Creating new session...",
    );

    const payload = {
      name: form.name,
      session_date: new Date(form.session_date).toISOString(),
      class_ids: form.class_ids,
      coach_ids: form.coach_ids,
    };

    if (isEditing) {
      const { error } = await supabase
        .from("sessions")
        .update(payload)
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
        .insert([{ ...payload, is_active: true }]);
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
          <span className="text-slate-300 font-bold hidden sm:block">-</span>
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
              {paginatedSessions.map((s) => {
                const dateObj = new Date(s.session_date);
                const timeStr = dateObj.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const dateStr = dateObj.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                });

                return (
                  <tr
                    key={s.id}
                    className="hover:bg-blue-50/30 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors ${s.is_active ? "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100" : "bg-rose-50 text-rose-500 group-hover:bg-rose-100"}`}
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
                            <Clock size={12} /> {timeStr} • {dateStr}
                          </div>
                          <div className="flex gap-2 mt-1.5">
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-600 rounded">
                              {s.class_ids?.length || 0} Classes
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded">
                              {s.coach_ids?.length || 0} Coaches
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleStatus(s.id, s.is_active)}
                        className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                          s.is_active 
                            ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-rose-500 hover:text-white hover:border-rose-500" 
                            : "bg-rose-50 text-rose-600 border-rose-200 hover:bg-emerald-500 hover:text-white hover:border-emerald-500"
                        }`}
                      >
                        <Power size={12} />
                        {s.is_active ? "GATE OPEN" : "CLOSED"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {/* TOMBOL EYE UNTUK LIHAT DETAIL */}
                        <button
                          onClick={() => openDetailModal(s)}
                          className="p-2.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-xl transition-all shadow-sm"
                          title="View Attendance Details"
                        >
                          <Eye size={16} />
                        </button>
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
                );
              })}
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
              Page{" "}
              <span className="font-bold text-slate-800">{currentPage}</span> of{" "}
              <span className="font-bold text-slate-800">{totalPages}</span>
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

      {/* MODAL DETAIL ABSENSI */}
      {isDetailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-full animate-in zoom-in-95 duration-200">
            <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 flex-shrink-0">
              <div className="flex items-center gap-3 text-indigo-600">
                <Eye size={24} />
                <h3 className="text-xl font-bold tracking-tight text-slate-800">
                  Attendance Info: {selectedSessionDetail?.name}
                </h3>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-2 bg-white rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500 shadow-sm border border-slate-100 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/50">
              {detailLoading ? (
                <div className="flex flex-col justify-center items-center h-40">
                  <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                  <p className="text-slate-500 font-medium">
                    Memuat data absensi...
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Tabel Atlet */}
                  <div>
                    <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Users size={16} className="text-blue-500" /> Attendance Athlete
                    </h4>
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-100">
                          <tr>
                            <th className="px-4 py-3 font-bold text-slate-500">
                              Name
                            </th>
                            <th className="px-4 py-3 font-bold text-slate-500">
                              Class
                            </th>
                            <th className="px-4 py-3 font-bold text-slate-500 text-center">
                              Time
                            </th>
                            <th className="px-4 py-3 font-bold text-slate-500 text-right">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {sessionDetails.students.map((std) => (
                            <tr
                              key={std.id}
                              className="hover:bg-slate-50 transition-colors"
                            >
                              <td className="px-4 py-3 font-medium text-slate-800">
                                {std.users?.full_name}
                                <div className="text-xs text-slate-400 font-mono mt-0.5">
                                  {std.nis}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-slate-600 font-medium">
                                {std.classes?.name}
                              </td>
                              <td className="px-4 py-3 text-center text-slate-500 font-medium font-mono text-xs">
                                {formatTimeOnly(std.scanned_at)}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${getStatusBadgeStyle(std.status)}`}>
                                  {std.status.replace("_", " ")}
                                </span>
                              </td>
                            </tr>
                          ))}
                          {sessionDetails.students.length === 0 && (
                            <tr>
                              <td
                                colSpan="4"
                                className="px-4 py-8 text-center text-slate-400 font-medium"
                              >
                                Tidak ada atlet yang ditugaskan ke sesi ini.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Tabel Pelatih */}
                  <div>
                    <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <UserCheck size={16} className="text-indigo-500" />{" "}
                      Attendance Coach
                    </h4>
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-100">
                          <tr>
                            <th className="px-4 py-3 font-bold text-slate-500">
                              Coach
                            </th>
                            <th className="px-4 py-3 font-bold text-slate-500 text-center">
                              Time
                            </th>
                            <th className="px-4 py-3 font-bold text-slate-500 text-right">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {sessionDetails.coaches.map((coach) => (
                            <tr
                              key={coach.id}
                              className="hover:bg-slate-50 transition-colors"
                            >
                              <td className="px-4 py-3 font-medium text-slate-800">
                                {coach.users?.full_name}
                              </td>
                              <td className="px-4 py-3 text-center text-slate-500 font-medium font-mono text-xs">
                                {formatTimeOnly(coach.scanned_at)}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${getStatusBadgeStyle(coach.status)}`}>
                                  {coach.status.replace("_", " ")}
                                </span>
                              </td>
                            </tr>
                          ))}
                          {sessionDetails.coaches.length === 0 && (
                            <tr>
                              <td
                                colSpan="3"
                                className="px-4 py-8 text-center text-slate-400 font-medium"
                              >
                                Tidak ada pelatih yang ditugaskan ke sesi ini.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 flex items-center justify-end bg-white flex-shrink-0">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all active:scale-95"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-full animate-in zoom-in-95 duration-200">
            <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 flex-shrink-0">
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

            <form
              onSubmit={handleSubmit}
              className="flex flex-col overflow-hidden flex-1"
            >
              <div className="p-8 overflow-y-auto space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                      Session Name
                    </label>
                    <input
                      required
                      autoFocus
                      placeholder="e.g. Morning Swim Practice"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all shadow-inner font-medium text-slate-700"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                      Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={form.session_date}
                      onChange={(e) =>
                        setForm({ ...form, session_date: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all shadow-inner font-medium text-slate-700 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-100"></div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Users size={14} className="text-blue-500" /> Target
                      Classes
                    </label>
                    <div className="grid grid-cols-2 gap-3 p-4 border border-slate-100 bg-slate-50 rounded-2xl">
                      {classes.map((c) => (
                        <label
                          key={c.id}
                          className="flex items-center gap-2.5 text-sm font-medium text-slate-700 cursor-pointer hover:text-blue-600 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={form.class_ids.includes(c.id)}
                            onChange={() => toggleCheckbox("class_ids", c.id)}
                            className="w-4 h-4 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                          />
                          {c.name}
                        </label>
                      ))}
                      {classes.length === 0 && (
                        <span className="text-xs text-slate-400 col-span-2">
                          No classes available.
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <UserCheck size={14} className="text-indigo-500" />{" "}
                      Assigned Coaches
                    </label>
                    <div className="grid grid-cols-1 gap-3 p-4 border border-slate-100 bg-slate-50 rounded-2xl">
                      {coaches.map((c) => (
                        <label
                          key={c.id}
                          className="flex items-center gap-2.5 text-sm font-medium text-slate-700 cursor-pointer hover:text-indigo-600 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={form.coach_ids.includes(c.id)}
                            onChange={() => toggleCheckbox("coach_ids", c.id)}
                            className="w-4 h-4 text-indigo-600 bg-white border-slate-300 rounded focus:ring-indigo-500 focus:ring-2 cursor-pointer"
                          />
                          {c.users?.full_name}
                        </label>
                      ))}
                      {coaches.length === 0 && (
                        <span className="text-xs text-slate-400">
                          No coaches available.
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-3 bg-white flex-shrink-0">
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