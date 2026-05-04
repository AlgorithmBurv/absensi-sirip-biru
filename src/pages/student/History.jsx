import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import {
  Search,
  Filter,
  ArrowUpDown,
  CalendarDays,
  Clock,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
} from "lucide-react";

export default function History() {
  const [logs, setLogs] = useState([]);
  const [coachesMap, setCoachesMap] = useState({});
  const [studentClass, setStudentClass] = useState("");
  const [loading, setLoading] = useState(true);

  // States for Search, Filter, Sort, & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const savedUser = localStorage.getItem("user_session");
        if (!savedUser) return;
        const user = JSON.parse(savedUser);

        // 1. Dapatkan student_id dan nama kelas siswa ini
        const { data: student, error: studentError } = await supabase
          .from("students")
          .select("id, classes(name)")
          .eq("user_id", user.id)
          .single();

        if (studentError || !student) throw new Error("Athlete data not found");
        setStudentClass(student.classes?.name || "No Class");

        // 2. Tarik semua data pelatih untuk mapping nama berdasarkan coach_ids
        const { data: coachData } = await supabase
          .from("coaches")
          .select("id, users(full_name)");

        const cMap = {};
        if (coachData) {
          coachData.forEach((c) => {
            cMap[c.id] = c.users?.full_name;
          });
        }
        setCoachesMap(cMap);

        // 3. Tarik riwayat absensi (logs)
        const { data: attendanceLogs, error } = await supabase
          .from("attendance_logs")
          .select(
            `
            id, status, scanned_at,
            sessions ( name, session_date, coach_ids )
          `,
          )
          .eq("student_id", student.id)
          .order("scanned_at", { ascending: false });

        if (error) throw error;
        setLogs(attendanceLogs || []);
      } catch (err) {
        console.error("Error fetching history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // Reset pagination to page 1 if filter/search/sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus, sortOrder]);

  // Process Data: Search -> Filter -> Sort
  let processedLogs = [...logs];

  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    processedLogs = processedLogs.filter((log) =>
      log.sessions?.name?.toLowerCase().includes(query),
    );
  }

  if (filterStatus !== "all") {
    processedLogs = processedLogs.filter((log) => log.status === filterStatus);
  }

  processedLogs.sort((a, b) => {
    const dateA = new Date(a.scanned_at).getTime();
    const dateB = new Date(b.scanned_at).getTime();
    return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
  });

  // Pagination Logic
  const totalPages = Math.ceil(processedLogs.length / ITEMS_PER_PAGE);
  const paginatedLogs = processedLogs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // Helper for Status Badge
  const getStatusStyle = (status) => {
    if (status.includes("hadir"))
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (status === "izin")
      return "bg-amber-100 text-amber-700 border-amber-200";
    if (status === "sakit") return "bg-red-100 text-red-700 border-red-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium animate-pulse">
          Loading your history...
        </p>
      </div>
    );
  }

  return (
    <div className="py-6 font-sans max-w-7xl mx-auto w-full px-2">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <ClipboardList className="text-blue-600" size={32} />
            Attendance History
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Track your swimming practice records and overview.
          </p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-5 py-3 rounded-2xl text-sm font-bold border border-blue-100 shadow-sm w-fit">
          Total Logs: {processedLogs.length}
        </div>
      </div>

      {/* Controls Section (Search, Filter, Sort) */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search Input */}
        <div className="relative md:col-span-2">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search session name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
          />
        </div>

        {/* Filter */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Filter size={18} className="text-slate-400" />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm appearance-none cursor-pointer font-medium text-slate-600"
          >
            <option value="all">All Status</option>
            <option value="hadir_qr">Present (QR)</option>
            <option value="hadir_manual">Present (Manual)</option>
            <option value="izin">Excused</option>
            <option value="sakit">Sick</option>
            <option value="alpa">Absent</option>
          </select>
        </div>

        {/* Sort */}
        <button
          onClick={() =>
            setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))
          }
          className="flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold py-3.5 px-4 rounded-2xl shadow-sm transition-all text-sm"
        >
          <ArrowUpDown
            size={18}
            className={
              sortOrder === "desc" ? "text-blue-600" : "text-slate-400"
            }
          />
          {sortOrder === "desc" ? "Newest" : "Oldest"}
        </button>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-100 overflow-hidden flex flex-col min-h-[400px] mb-8">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[11px] uppercase tracking-widest font-black">
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Session Details</th>
                <th className="px-6 py-4">Class & Instructor</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedLogs.map((log) => {
                const scanDateObj = new Date(log.scanned_at);
                const dateStr = scanDateObj.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });
                const timeStr = scanDateObj.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                // Parse the session_date (TIMESTAMP)
                const sessionDateObj = new Date(log.sessions?.session_date);
                const sessionDateStr = sessionDateObj.toLocaleDateString(
                  "en-US",
                  {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  },
                );
                const sessionTimeStr = sessionDateObj.toLocaleTimeString(
                  "en-US",
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  },
                );

                // Identifikasi nama instruktur dari array coach_ids
                const assignedCoaches =
                  log.sessions?.coach_ids?.map(
                    (id) => coachesMap[id] || "Unknown Coach",
                  ) || [];

                return (
                  <tr
                    key={log.id}
                    className="hover:bg-blue-50/30 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="font-bold text-slate-700 text-sm flex items-center gap-1.5">
                          <CalendarDays size={14} className="text-blue-500" />
                          {dateStr}
                        </div>
                        <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                          <Clock size={14} />
                          {timeStr}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800 text-base">
                        {log.sessions?.name || "Unknown Session"}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {sessionDateStr} • {sessionTimeStr}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-blue-600 text-sm">
                        {studentClass}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        <span className="font-medium">Coach:</span>{" "}
                        {assignedCoaches.length > 0
                          ? assignedCoaches.join(", ")
                          : "To be assigned"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`inline-block px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-wider ${getStatusStyle(log.status)}`}
                      >
                        {log.status.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {/* Empty State */}
              {paginatedLogs.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-20 text-center text-slate-400"
                  >
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search size={32} className="text-slate-300" />
                    </div>
                    <p className="font-bold text-slate-600 text-lg">
                      No records found
                    </p>
                    <p className="text-sm mt-1">
                      Try adjusting your search or filter options.
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
                className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
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