import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import { toast, Toaster } from "react-hot-toast";
import {
  ClipboardList,
  Search,
  Filter,
  CalendarDays,
  Clock,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
} from "lucide-react";

export default function CoachLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const savedUser = localStorage.getItem("user_session");
        if (!savedUser) throw new Error("Session expired.");
        const user = JSON.parse(savedUser);

        // Ambil coach_id berdasarkan user_id
        const { data: coachData, error: coachError } = await supabase
          .from("coaches")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (coachError || !coachData) throw new Error("Coach profile not found.");

        // Ambil attendance logs milik coach ini
        const { data, error } = await supabase
          .from("attendance_logs")
          .select(`
            id, status, scanned_at,
            sessions ( name, session_date )
          `)
          .eq("coach_id", coachData.id)
          .order("scanned_at", { ascending: false });

        if (error) throw error;
        setLogs(data || []);
      } catch (err) {
        toast.error("Failed to load logs: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus, sortOrder, dateFrom, dateTo]);

  let processedLogs = [...logs];

  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    processedLogs = processedLogs.filter((log) =>
      log.sessions?.name?.toLowerCase().includes(query)
    );
  }

  if (filterStatus !== "all") {
    processedLogs = processedLogs.filter((log) => log.status === filterStatus);
  }

  if (dateFrom) {
    processedLogs = processedLogs.filter(
      (log) => new Date(log.scanned_at) >= new Date(dateFrom + "T00:00:00")
    );
  }
  if (dateTo) {
    processedLogs = processedLogs.filter(
      (log) => new Date(log.scanned_at) <= new Date(dateTo + "T23:59:59")
    );
  }

  processedLogs.sort((a, b) => {
    const dateA = new Date(a.scanned_at).getTime();
    const dateB = new Date(b.scanned_at).getTime();
    return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
  });

  const totalPages = Math.ceil(processedLogs.length / ITEMS_PER_PAGE);
  const paginatedLogs = processedLogs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getStatusStyle = (status) => {
    if (status.includes("hadir")) return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (status === "izin") return "bg-amber-100 text-amber-700 border-amber-200";
    if (status === "sakit") return "bg-red-100 text-red-700 border-red-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  // Summary counts
  const totalHadir = logs.filter((l) => l.status.includes("hadir")).length;
  const totalIzin = logs.filter((l) => l.status === "izin").length;
  const totalSakit = logs.filter((l) => l.status === "sakit").length;
  const totalAlpa = logs.filter((l) => l.status === "alpa").length;

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium animate-pulse">
          Loading attendance logs...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans">
      <Toaster
        position="top-right"
        toastOptions={{ style: { borderRadius: "16px", fontWeight: "500" } }}
      />

      {/* Header */}
      <div className="max-w-5xl mx-auto mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <ClipboardList className="text-blue-600" size={32} />
          Attendance Logs
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          Your personal attendance history across all sessions.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Present", value: totalHadir, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Excused", value: totalIzin, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Sick", value: totalSakit, color: "text-red-500", bg: "bg-red-50" },
          { label: "Absent", value: totalAlpa, color: "text-slate-500", bg: "bg-slate-50" },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-3xl p-5 shadow-xl shadow-blue-900/5 border border-slate-100 flex flex-col gap-1"
          >
            <div className={`text-3xl font-black ${card.color}`}>{card.value}</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="max-w-5xl mx-auto mb-6 flex flex-col gap-4">
        {/* Row 1: Search, Filter, Sort */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={18} className="text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search session name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Filter size={18} className="text-slate-400" />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm appearance-none cursor-pointer font-medium text-slate-600"
            >
              <option value="all">All Status</option>
              <option value="hadir_manual">Present (Manual)</option>
              <option value="izin">Excused (Izin)</option>
              <option value="sakit">Sick (Sakit)</option>
              <option value="alpa">Absent (Alpa)</option>
            </select>
          </div>

          <button
            onClick={() => setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))}
            className="flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold py-3 px-4 rounded-2xl shadow-sm transition-all"
          >
            <ArrowUpDown size={16} className={sortOrder === "desc" ? "text-blue-600" : "text-slate-400"} />
            <span className="text-sm">Sort: {sortOrder === "desc" ? "Newest" : "Oldest"}</span>
          </button>
        </div>

        {/* Row 2: Date Range */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">
            <CalendarDays size={15} />
            Date Range
          </div>
          <div className="flex flex-1 flex-col sm:flex-row gap-3 w-full">
            <input
              type="date"
              value={dateFrom}
              max={dateTo || undefined}
              onChange={(e) => setDateFrom(e.target.value)}
              className="flex-1 py-3 px-4 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm font-medium text-slate-600 cursor-pointer"
            />
            <div className="hidden sm:flex items-center text-slate-300 font-bold shrink-0 self-center">—</div>
            <input
              type="date"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(e) => setDateTo(e.target.value)}
              className="flex-1 py-3 px-4 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm font-medium text-slate-600 cursor-pointer"
            />
            {(dateFrom || dateTo) && (
              <button
                onClick={() => { setDateFrom(""); setDateTo(""); }}
                className="shrink-0 px-4 py-3 bg-slate-100 hover:bg-red-50 hover:text-red-500 text-slate-500 font-bold rounded-2xl text-sm transition-all border border-slate-200 hover:border-red-200"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-100 overflow-hidden flex flex-col min-h-[400px]">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white">
          <h2 className="font-bold text-slate-800">Log History</h2>
          <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold">
            {processedLogs.length} Records Found
          </span>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[11px] uppercase tracking-widest font-black">
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Session</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedLogs.map((log) => {
                const scanDateObj = new Date(log.scanned_at);
                const dateStr = scanDateObj.toLocaleDateString("en-US", {
                  month: "short", day: "numeric", year: "numeric",
                });
                const timeStr = scanDateObj.toLocaleTimeString("en-US", {
                  hour: "2-digit", minute: "2-digit",
                });
                const sessionDate = new Date(log.sessions?.session_date).toLocaleDateString("en-US", {
                  month: "short", day: "numeric", year: "numeric",
                });

                return (
                  <tr key={log.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-700 text-sm flex items-center gap-1.5">
                        <CalendarDays size={14} className="text-blue-500" />
                        {dateStr}
                      </div>
                      <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                        <Clock size={14} />
                        {timeStr}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800 text-sm">
                        {log.sessions?.name || "Unknown Session"}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">{sessionDate}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-block px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-wider ${getStatusStyle(log.status)}`}>
                        {log.status.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {paginatedLogs.length === 0 && !loading && (
                <tr>
                  <td colSpan="3" className="px-6 py-20 text-center text-slate-400">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search size={32} className="text-slate-300" />
                    </div>
                    <p className="font-bold text-slate-600">No records found</p>
                    <p className="text-sm mt-1">Try adjusting your search or filter options.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-50 flex items-center justify-between bg-slate-50/50">
            <span className="text-xs font-medium text-slate-500 pl-2">
              Showing Page{" "}
              <span className="font-bold text-slate-800">{currentPage}</span> of{" "}
              <span className="font-bold text-slate-800">{totalPages}</span>
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}