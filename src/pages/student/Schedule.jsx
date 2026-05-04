import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import { toast, Toaster } from "react-hot-toast";
import {
  CalendarDays,
  Clock,
  Search,
  BookOpen,
  Zap,
  CalendarClock,
  History as HistoryIcon,
  UserCheck,
  Phone,
  Copy // <-- Tambahan ikon Copy
} from "lucide-react";

const TABS = [
  { key: "upcoming", label: "Upcoming", icon: CalendarClock },
  { key: "today", label: "Today", icon: Zap },
  { key: "past", label: "Past", icon: HistoryIcon },
];

export default function Schedule() {
  const [sessions, setSessions] = useState([]);
  const [coachesMap, setCoachesMap] = useState({});
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("upcoming");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const savedUser = localStorage.getItem("user_session");
        if (!savedUser) throw new Error("Session expired. Please login again.");
        const user = JSON.parse(savedUser);

        // 1. Dapatkan class_id milik student ini
        const { data: studentData, error: studentError } = await supabase
          .from("students")
          .select("class_id")
          .eq("user_id", user.id)
          .single();

        if (studentError || !studentData) throw new Error("Athlete class data not found.");

        // 2. Tarik jadwal sesi yang mengikutsertakan class_id ini
        const { data: sessionData, error: sessionError } = await supabase
          .from("sessions")
          .select("*")
          .contains("class_ids", JSON.stringify([studentData.class_id]))
          .order("session_date", { ascending: true });

        if (sessionError) throw sessionError;

        // 3. Tarik semua data pelatih (TAMBAHKAN phone_number)
        const { data: coachData, error: coachError } = await supabase
          .from("coaches")
          .select("id, specialty, phone_number, users(full_name)");

        if (coachError) throw coachError;

        // Buat map dictionary agar mudah mengambil detail pelatih berdasarkan ID-nya
        const cMap = {};
        coachData.forEach(c => {
          cMap[c.id] = { 
            name: c.users?.full_name, 
            specialty: c.specialty,
            phone: c.phone_number // <-- Simpan nomor telepon
          };
        });

        setCoachesMap(cMap);
        setSessions(sessionData || []);
      } catch (err) {
        toast.error("Failed to load schedule: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handler untuk Copy Nomor Telepon
  const handleCopyPhone = (phoneNumber) => {
    if (!phoneNumber) return;
    navigator.clipboard.writeText(phoneNumber);
    toast.success("Phone number copied to clipboard!");
  };

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

  // Filter & search
  let processedSessions = [...grouped[activeTab]];

  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    processedSessions = processedSessions.filter((s) =>
      s.name.toLowerCase().includes(query)
    );
  }

  // Sorting
  if (activeTab === "upcoming" || activeTab === "today") {
    processedSessions.sort((a, b) => new Date(a.session_date).getTime() - new Date(b.session_date).getTime());
  } else {
    processedSessions.sort((a, b) => new Date(b.session_date).getTime() - new Date(a.session_date).getTime());
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium animate-pulse">
          Loading your schedule...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans">
      <Toaster position="top-right" toastOptions={{ style: { borderRadius: "16px", fontWeight: "500" } }} />

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <CalendarDays className="text-blue-600" size={32} />
          My Training Schedule
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          View your upcoming swimming sessions and assigned instructors.
        </p>
      </div>

      {/* TAB BAR & SEARCH CONTROLS */}
      {/* Diubah menjadi flex-col sepenuhnya di mobile agar tab bisa digulir horizontal dan search bar berada di bawahnya */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        
        {/* Tab Bar - Menambahkan custom-scrollbar jika ingin styling ekstra, dan memastikan bisa di-scroll horizontal */}
        <div className="flex gap-2 p-1.5 bg-white border border-slate-100 rounded-2xl shadow-sm w-full sm:w-auto overflow-x-auto custom-scrollbar">
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

        {/* Search Bar - Mengambil lebar penuh di mobile */}
        <div className="relative w-full sm:w-72 flex-shrink-0">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={16} className="text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search session..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-100 shadow-sm rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
          />
        </div>
      </div>

      {/* Session Cards */}
      <div className="max-w-7xl mx-auto">
        {processedSessions.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-100 py-20 px-6 text-center text-slate-400">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen size={32} className="text-slate-300" />
            </div>
            <p className="font-bold text-slate-600">
              {activeTab === "today" && "No training scheduled for you today."}
              {activeTab === "upcoming" && "No upcoming training sessions."}
              {activeTab === "past" && "No past training history."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {processedSessions.map((session) => {
              const dateObj = new Date(session.session_date);
              
              const dayName = dateObj.toLocaleDateString("en-US", { weekday: "short" }); // Singkat hari untuk mobile
              const dateFull = dateObj.toLocaleDateString("en-US", {
                day: "numeric", month: "short", year: "numeric", // Singkat bulan
              });
              const timeStr = dateObj.toLocaleTimeString("en-US", {
                hour: "2-digit", minute: "2-digit",
              });

              // Map coach_ids ke object pelatih lengkap
              const assignedCoaches = session.coach_ids?.map(id => coachesMap[id] || { name: "Unknown Coach", phone: "" }) || [];

              return (
                <div
                  key={session.id}
                  className={`bg-white rounded-3xl border p-5 md:p-6 flex flex-col gap-4 hover:-translate-y-1 transition-all duration-300
                    ${activeTab === "today" ? "border-amber-200 shadow-xl shadow-amber-900/5" : "border-slate-100 shadow-sm"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center flex-shrink-0
                        ${activeTab === "today" ? "bg-amber-50 text-amber-500" : "bg-blue-50 text-blue-500"}`}>
                        <CalendarDays size={20} className="md:w-[22px] md:h-[22px]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-base md:text-lg leading-tight">
                          {session.name}
                        </h3>
                        {/* Waktu dibungkus agar responsif */}
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-xs md:text-sm text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <Clock size={12} className="text-slate-400 md:w-3.5 md:h-3.5" />
                            <span className="font-semibold">{dayName}, {dateFull}</span>
                          </div>
                          <span className="text-blue-500 font-bold">• {timeStr}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-50" />

                  {/* Bagian Pelatih (Coaches) & Kontak */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <UserCheck size={14} className="text-indigo-400" /> Instructors
                    </span>
                    {assignedCoaches.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {assignedCoaches.map((coach, i) => (
                          <div key={i} className="flex flex-col bg-indigo-50/70 text-indigo-700 px-3 py-2 rounded-xl border border-indigo-100/50 flex-1 min-w-[140px] sm:flex-none">
                            <span className="text-xs font-bold truncate">{coach.name}</span>
                            
                            {/* Tombol Copy Nomor HP */}
                            {coach.phone ? (
                              <button 
                                onClick={() => handleCopyPhone(coach.phone)}
                                className="text-[10px] font-medium flex items-center gap-1.5 opacity-80 hover:opacity-100 mt-0.5 transition-all w-fit cursor-pointer active:scale-95 group"
                                title="Click to copy phone number"
                              >
                                <Phone size={10} className="group-hover:text-indigo-900 flex-shrink-0" /> 
                                <span className="group-hover:underline group-hover:text-indigo-900 truncate">{coach.phone}</span>
                                <Copy size={10} className="ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                              </button>
                            ) : (
                              <span className="text-[10px] font-medium flex items-center gap-1 opacity-60 mt-0.5">
                                <Phone size={10} className="flex-shrink-0" /> No Contact
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400 font-medium">To be assigned</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}