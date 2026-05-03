import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import { toast, Toaster } from "react-hot-toast";
import * as XLSX from "xlsx"; // Import library Excel
import {
  ClipboardList,
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  User,
  CalendarDays,
  Clock,
} from "lucide-react";

export default function Recap() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // States untuk Search, Filter, Sort, & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc"); // 'desc' (terbaru) atau 'asc' (terlama)
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      // Mengambil data log beserta relasinya (termasuk full_name dari tabel users)
      const { data, error } = await supabase
        .from("attendance_logs")
        .select(
          `
          id, status, scanned_at,
          students ( nis, users ( full_name ) ),
          sessions ( name, session_date )
        `,
        )
        .order("scanned_at", { ascending: false });

      if (!error && data) {
        setLogs(data);
      } else {
        toast.error("Failed to fetch records");
      }
      setLoading(false);
    };
    fetchLogs();
  }, []);

  // Reset pagination ke halaman 1 jika filter/search berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus, sortOrder]);

  // Memproses Data: Search -> Filter -> Sort
  let processedLogs = [...logs];

  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    processedLogs = processedLogs.filter(
      (log) =>
        log.students?.nis?.toLowerCase().includes(query) ||
        log.students?.users?.full_name?.toLowerCase().includes(query) ||
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

  // Fitur Export ke Asli Excel (.xlsx) menggunakan SheetJS
  const handleExportExcel = () => {
    const loadingToast = toast.loading("Generating Excel file...");
    try {
      // 1. Siapkan format data untuk Excel
      const excelData = processedLogs.map((log) => {
        const dateObj = new Date(log.scanned_at);
        return {
          "Scan Date": dateObj.toLocaleDateString("en-GB"),
          Time: dateObj.toLocaleTimeString("en-GB"),
          NIS: log.students?.nis || "-",
          "Athlete Name": log.students?.users?.full_name || "Unknown",
          Session: log.sessions?.name || "-",
          Status: log.status.toUpperCase().replace("_", " "),
        };
      });

      // 2. Buat Worksheet dari Data JSON
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // (Opsional) Mengatur lebar kolom agar rapi di Excel
      const columnWidths = [
        { wch: 15 }, // Scan Date
        { wch: 12 }, // Time
        { wch: 15 }, // NIS
        { wch: 25 }, // Athlete Name
        { wch: 30 }, // Session
        { wch: 20 }, // Status
      ];
      worksheet["!cols"] = columnWidths;

      // 3. Buat Workbook dan masukkan Worksheet
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Recap");

      // 4. Proses Download file Excel (.xlsx)
      XLSX.writeFile(workbook, `Siripbiru_Recap_${new Date().getTime()}.xlsx`);

      toast.success("Export to Excel successful!", { id: loadingToast });
    } catch (error) {
      console.error(error);
      toast.error("Failed to export data to Excel", { id: loadingToast });
    }
  };

  // Helper untuk Warna Status
  const getStatusStyle = (status) => {
    if (status.includes("hadir"))
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (status === "izin")
      return "bg-amber-100 text-amber-700 border-amber-200";
    if (status === "sakit") return "bg-red-100 text-red-700 border-red-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans">
      <Toaster
        position="top-right"
        toastOptions={{ style: { borderRadius: "16px", fontWeight: "500" } }}
      />

      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <ClipboardList className="text-blue-600" size={32} />
            Attendance Records
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Review, filter, and export overall athlete attendance history.
          </p>
        </div>
        <button
          onClick={handleExportExcel}
          disabled={processedLogs.length === 0}
          title="Download records as .xlsx for Excel"
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-2xl shadow-lg shadow-emerald-600/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={18} />
          Export to Excel
        </button>
      </div>

      {/* Controls Section (Search, Filter, Sort) */}
      <div className="max-w-7xl mx-auto mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative md:col-span-2">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search by name, NIS, or session..."
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
            <option value="hadir_qr">Present (QR)</option>
            <option value="hadir_manual">Present (Manual)</option>
            <option value="izin">Excused (Izin)</option>
            <option value="sakit">Sick (Sakit)</option>
          </select>
        </div>

        <button
          onClick={() =>
            setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))
          }
          title="Toggle sort by date"
          className="flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold py-3 px-4 rounded-2xl shadow-sm transition-all"
        >
          <ArrowUpDown
            size={16}
            className={
              sortOrder === "desc" ? "text-blue-600" : "text-slate-400"
            }
          />
          <span className="text-sm">
            Sort: {sortOrder === "desc" ? "Newest" : "Oldest"}
          </span>
        </button>
      </div>

      {/* Table Section */}
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-100 overflow-hidden flex flex-col min-h-[500px]">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white">
          <h2 className="font-bold text-slate-800">Record Logs</h2>
          <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold">
            {processedLogs.length} Records Found
          </span>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[11px] uppercase tracking-widest font-black">
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Athlete Identity</th>
                <th className="px-6 py-4">Session Context</th>
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
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                          <User size={16} />
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 text-sm">
                            {log.students?.users?.full_name || "Unknown"}
                          </div>
                          <div className="text-xs text-slate-500 font-mono mt-0.5">
                            {log.students?.nis || "-"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-700 text-sm">
                        {log.sessions?.name || "-"}
                      </div>
                      <div className="text-xs text-blue-500 font-medium mt-0.5">
                        {log.sessions?.session_date || "-"}
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

              {paginatedLogs.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-20 text-center text-slate-400"
                  >
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search size={32} className="text-slate-300" />
                    </div>
                    <p className="font-bold text-slate-600">No records found</p>
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
              Showing Page{" "}
              <span className="font-bold text-slate-800">{currentPage}</span> of{" "}
              <span className="font-bold text-slate-800">{totalPages}</span>
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                title="Previous page"
                className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                title="Next page"
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