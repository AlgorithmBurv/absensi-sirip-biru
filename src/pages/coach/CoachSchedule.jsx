import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import { toast, Toaster } from "react-hot-toast";
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from "lucide-react";

export default function CoachSchedule() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("sessions")
          .select("*")
          .order("session_date", { ascending: false });

        if (error) throw error;
        setSessions(data || []);
      } catch (err) {
        toast.error("Failed to load schedule: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus]);

  let processedSessions = [...sessions];

  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    processedSessions = processedSessions.filter((s) =>
      s.name.toLowerCase().includes(query)
    );
  }

  if (filterStatus !== "all") {
    processedSessions = processedSessions.filter((s) =>
      filterStatus === "active" ? s.is_active === true : s.is_active === false
    );
  }

  const totalPages = Math.ceil(processedSessions.length / ITEMS_PER_PAGE);
  const paginatedSessions = processedSessions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const today = new Date().toISOString().split("T")[0];

  const getDateStyle = (sessionDate) => {
    if (sessionDate === today) return "text-blue-600 bg-blue-50 border-blue-200";
    if (sessionDate < today) return "text-slate-400 bg-slate-50 border-slate-200";
    return "text-emerald-600 bg-emerald-50 border-emerald-200";
  };

  const getDateLabel = (sessionDate) => {
    if (sessionDate === today) return "Today";
    if (sessionDate < today) return "Past";
    return "Upcoming";
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium animate-pulse">
          Loading schedule...
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
          <CalendarDays className="text-blue-600" size={32} />
          My Schedule
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          View all training sessions and their current status.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Total Sessions",
            value: sessions.length,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Active Gates",
            value: sessions.filter((s) => s.is_active).length,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
          },
          {
            label: "Today",
            value: sessions.filter((s) => s.session_date === today).length,
            color: "text-amber-600",
            bg: "bg-amber-50",
          },
          {
            label: "Upcoming",
            value: sessions.filter((s) => s.session_date > today).length,
            color: "text-indigo-600",
            bg: "bg-indigo-50",
          },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-3xl p-5 shadow-xl shadow-blue-900/5 border border-slate-100 flex flex-col gap-1"
          >
            <div className={`text-3xl font-black ${card.color}`}>
              {card.value}
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {card.label}
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="max-w-5xl mx-auto mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative md:col-span-2">
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
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Filter size={18} className="text-slate-400" />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm appearance-none cursor-pointer font-medium text-slate-600"
          >
            <option value="all">All Sessions</option>
            <option value="active">Active (Gate Open)</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Session Cards Grid */}
      <div className="max-w-5xl mx-auto">
        {paginatedSessions.length === 0 && !loading ? (
          <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-100 py-20 text-center text-slate-400">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen size={32} className="text-slate-300" />
            </div>
            <p className="font-bold text-slate-600">No sessions found</p>
            <p className="text-sm mt-1">Try adjusting your search or filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginatedSessions.map((session) => {
              const dateObj = new Date(session.session_date);
              const dayName = dateObj.toLocaleDateString("en-US", { weekday: "long" });
              const dateFull = dateObj.toLocaleDateString("en-US", {
                day: "numeric",
                month: "long",
                year: "numeric",
              });

              return (
                <div
                  key={session.id}
                  className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-100 p-6 flex flex-col gap-4 hover:-translate-y-1 transition-transform duration-300"
                >
                  {/* Top Row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                          session.is_active
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-slate-50 text-slate-400"
                        }`}
                      >
                        <CalendarDays size={22} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-base leading-tight">
                          {session.name}
                        </h3>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">
                          {dayName}
                        </p>
                      </div>
                    </div>

                    {/* Gate Status Badge */}
                    <div
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border flex-shrink-0 ${
                        session.is_active
                          ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                          : "bg-slate-50 text-slate-400 border-slate-200"
                      }`}
                    >
                      {session.is_active ? (
                        <CheckCircle2 size={12} />
                      ) : (
                        <XCircle size={12} />
                      )}
                      {session.is_active ? "Open" : "Closed"}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-slate-50" />

                  {/* Bottom Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock size={14} className="text-slate-400" />
                      <span className="font-medium">{dateFull}</span>
                    </div>

                    {/* Date label: Today / Past / Upcoming */}
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border ${getDateStyle(
                        session.session_date
                      )}`}
                    >
                      {getDateLabel(session.session_date)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
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