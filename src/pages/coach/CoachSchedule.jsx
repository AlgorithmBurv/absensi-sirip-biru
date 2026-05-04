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
  Zap,
  CalendarClock,
  History,
} from "lucide-react";

const TABS = [
  { key: "today", label: "Today", icon: Zap },
  { key: "upcoming", label: "Upcoming", icon: CalendarClock },
  { key: "past", label: "Past", icon: History },
];

export default function CoachSchedule() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("today");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      try {
        // 1. Get logged-in user session
        const savedUser = localStorage.getItem("user_session");
        if (!savedUser) throw new Error("Session expired. Please login again.");
        const user = JSON.parse(savedUser);

        // 2. Get Coach ID based on user_id
        const { data: coachData, error: coachError } = await supabase
          .from("coaches")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (coachError || !coachData) {
          throw new Error("Coach data not found.");
        }

        // 3. Fetch sessions where coach_ids array contains this coach's ID
        // FIX: Added JSON.stringify() to prevent "invalid input syntax for type json" error
        const { data, error } = await supabase
          .from("sessions")
          .select("*")
          .contains("coach_ids", JSON.stringify([coachData.id])) 
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
  }, [searchQuery, filterStatus, activeTab]);

  // ==========================================
  // TIMESTAMP-BASED GROUPING LOGIC
  // ==========================================
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).getTime();

  const grouped = {
    today: sessions.filter((s) => {
      const t = new Date(s.session_date).getTime();
      return t >= todayStart && t <= todayEnd;
    }),
    upcoming: sessions.filter((s) => new Date(s.session_date).getTime() > todayEnd),
    past: sessions.filter((s) => new Date(s.session_date).getTime() < todayStart),
  };

  // Filter & search within the active tab
  let processedSessions = [...grouped[activeTab]];

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

  // Sorting based on the active tab
  if (activeTab === "upcoming" || activeTab === "today") {
    // Today & Upcoming: nearest date on top
    processedSessions.sort((a, b) => new Date(a.session_date).getTime() - new Date(b.session_date).getTime());
  } else {
    // Past: most recently passed date on top
    processedSessions.sort((a, b) => new Date(b.session_date).getTime() - new Date(a.session_date).getTime());
  }

  const totalPages = Math.ceil(processedSessions.length / ITEMS_PER_PAGE);
  const paginatedSessions = processedSessions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getStatusBadge = (session) => {
    if (session.is_active)
      return "bg-emerald-50 text-emerald-600 border-emerald-200";
    return "bg-slate-50 text-slate-400 border-slate-200";
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium animate-pulse">
          Loading coach schedule...
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
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <CalendarDays className="text-blue-600" size={32} />
          My Schedule
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          Training sessions specifically assigned to you as an instructor.
        </p>
      </div>

      {/* Summary Cards */}
      {/* Mengubah grid-cols-2 menjadi grid-cols-1 untuk layar yang sangat sempit, lalu sm:grid-cols-2 */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Total Assignments",
            value: sessions.length,
            color: "text-blue-600",
          },
          {
            label: "Active Gates",
            value: sessions.filter((s) => s.is_active).length,
            color: "text-emerald-600",
          },
          {
            label: "Today's Schedule",
            value: grouped.today.length,
            color: "text-amber-600",
          },
          {
            label: "Upcoming",
            value: grouped.upcoming.length,
            color: "text-indigo-600",
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

      {/* TAB BAR */}
      {/* Memastikan scroll horizontal di mobile menggunakan overflow-x-auto */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex gap-2 p-1.5 bg-white border border-slate-100 rounded-2xl shadow-sm w-full sm:w-fit overflow-x-auto custom-scrollbar">
          {TABS.map(({ key, label, icon: Icon }) => {
            const count = grouped[key].length;
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`relative flex items-center justify-center gap-2 px-4 md:px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 whitespace-nowrap flex-1 sm:flex-none
                  ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                  }`}
              >
                <Icon size={15} className="flex-shrink-0" />
                {label}
                {/* Badge count */}
                <span
                  className={`text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center flex-shrink-0
                  ${isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-7xl mx-auto mb-6 bg-white rounded-3xl border border-slate-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={16} className="text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search session name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
          />
        </div>

        <div className="relative w-full sm:w-52 flex-shrink-0">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Filter size={16} className="text-slate-400" />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer font-medium text-slate-600"
          >
            <option value="all">All Status</option>
            <option value="active">Active (Gate Open)</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Session Cards */}
      <div className="max-w-7xl mx-auto">
        {/* Empty state */}
        {paginatedSessions.length === 0 && !loading ? (
          <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-100 py-20 px-6 text-center text-slate-400">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen size={32} className="text-slate-300" />
            </div>
            <p className="font-bold text-slate-600">
              {activeTab === "today" && "No sessions scheduled for you today."}
              {activeTab === "upcoming" && "No upcoming sessions found."}
              {activeTab === "past" && "No past session history found."}
            </p>
            <p className="text-sm mt-1">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <>
            {/* Small tab labels above the grid */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {activeTab === "today" && (
                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full text-xs font-bold">
                  <Zap size={12} className="flex-shrink-0" />
                  Today's Training Sessions
                </div>
              )}
              {activeTab === "upcoming" && (
                <div className="flex items-center gap-2 text-indigo-600 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-full text-xs font-bold">
                  <CalendarClock size={12} className="flex-shrink-0" />
                  Sorted by nearest date
                </div>
              )}
              {activeTab === "past" && (
                <div className="flex items-center gap-2 text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full text-xs font-bold">
                  <History size={12} className="flex-shrink-0" />
                  Session History
                </div>
              )}
              <span className="text-xs text-slate-400 font-medium ml-auto">
                {processedSessions.length} session(s)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paginatedSessions.map((session) => {
                const dateObj = new Date(session.session_date);
                
                // US English Date & Time Formatting
                // Menyederhanakan format untuk mobile
                const dayName = dateObj.toLocaleDateString("en-US", { weekday: "short" });
                const dateFull = dateObj.toLocaleDateString("en-US", {
                  day: "numeric", month: "short", year: "numeric",
                });
                const timeStr = dateObj.toLocaleTimeString("en-US", {
                  hour: "2-digit", minute: "2-digit",
                });

                return (
                  <div
                    key={session.id}
                    className={`bg-white rounded-3xl border p-5 md:p-6 flex flex-col gap-4 hover:-translate-y-1 transition-all duration-300
                      ${
                        activeTab === "today"
                          ? "border-amber-200 shadow-xl shadow-amber-900/5"
                          : activeTab === "upcoming"
                            ? "border-indigo-100 shadow-xl shadow-indigo-900/5"
                            : "border-slate-100 shadow-md shadow-slate-900/3 opacity-80"
                      }`}
                  >
                    {/* Top Row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div
                          className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center flex-shrink-0
                          ${
                            activeTab === "today"
                              ? "bg-amber-50 text-amber-500"
                              : activeTab === "upcoming"
                                ? "bg-indigo-50 text-indigo-500"
                                : "bg-slate-50 text-slate-400"
                          }`}
                        >
                          <CalendarDays size={20} className="md:w-[22px] md:h-[22px]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-slate-800 text-base md:text-lg leading-tight truncate">
                            {session.name}
                          </h3>
                          <p className="text-xs text-slate-400 font-medium mt-0.5 truncate">
                            {dayName}
                          </p>
                        </div>
                      </div>

                      {/* Gate Status Badge */}
                      <div
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border flex-shrink-0 ${getStatusBadge(session)}`}
                      >
                        {session.is_active ? (
                          <CheckCircle2 size={12} className="flex-shrink-0" />
                        ) : (
                          <XCircle size={12} className="flex-shrink-0" />
                        )}
                        {session.is_active ? "Open" : "Closed"}
                      </div>
                    </div>

                    <div className="border-t border-slate-50" />

                    {/* Bottom Row */}
                    {/* Mengubah layout waktu dan tab badge menjadi wrap agar aman di layar sempit */}
                    <div className="flex flex-wrap items-center justify-between gap-y-2">
                      <div className="flex items-center gap-2 text-xs md:text-sm text-slate-600">
                        <Clock size={12} className="text-slate-400 md:w-3.5 md:h-3.5 flex-shrink-0" />
                        <span className="font-medium truncate">
                          {dateFull} • {timeStr}
                        </span>
                      </div>

                      {/* Tab badge per card */}
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border flex-shrink-0
                        ${
                          activeTab === "today"
                            ? "text-amber-600 bg-amber-50 border-amber-200"
                            : activeTab === "upcoming"
                              ? "text-indigo-600 bg-indigo-50 border-indigo-200"
                              : "text-slate-400 bg-slate-50 border-slate-200"
                        }`}
                      >
                        {activeTab === "today"
                          ? "Today"
                          : activeTab === "upcoming"
                            ? "Upcoming"
                            : "Past"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs font-medium text-slate-500">
              Page{" "}
              <span className="font-bold text-slate-800">{currentPage}</span> of{" "}
              <span className="font-bold text-slate-800">{totalPages}</span>
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 md:p-2.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="p-2 md:p-2.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
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