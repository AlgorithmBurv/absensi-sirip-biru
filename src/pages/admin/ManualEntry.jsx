import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import { toast, Toaster } from "react-hot-toast";
import {
  ClipboardEdit,
  UserCheck,
  CalendarDays,
  AlertCircle,
  Save,
  Activity,
  Users,
  UserPlus,
  Search,
  CheckSquare,
  Square,
  CheckCircle2,
} from "lucide-react";

export default function ManualEntry() {
  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [attendeeType, setAttendeeType] = useState("student"); // "student" | "coach"
  const [form, setForm] = useState({
    session_id: "",
    status: "hadir_manual",
  });

  // State untuk Fitur Bulk Actions
  const [selectedAttendees, setSelectedAttendees] = useState([]);
  const [localSearch, setLocalSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const { data: sess, error: sessError } = await supabase
          .from("sessions")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        const { data: std, error: stdError } = await supabase
          .from("students")
          .select("id, nis, class_id, users(full_name), classes(name)") // Memastikan class_id ditarik
          .order("nis");

        const { data: cch, error: cchError } = await supabase
          .from("coaches")
          .select("id, specialty, users(full_name)")
          .order("created_at");

        if (sessError) throw sessError;
        if (stdError) throw stdError;
        if (cchError) throw cchError;

        if (sess) setSessions(sess);
        if (std) setStudents(std);
        if (cch) setCoaches(cch);
      } catch (error) {
        toast.error("Failed to load data: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Reset pilihan jika tipe berubah
  const handleTypeChange = (type) => {
    setAttendeeType(type);
    setSelectedAttendees([]);
    setLocalSearch("");
  };

  // Cari data sesi yang sedang dipilih
  const activeSessionData = sessions.find((s) => s.id === form.session_id);

  // Filter awal: Tampilkan hanya yang terdaftar di sesi yang dipilih
  let baseList = [];
  if (activeSessionData) {
    if (attendeeType === "student") {
      // Filter siswa: cek apakah class_id siswa ada di dalam array class_ids sesi
      baseList = students.filter((std) =>
        activeSessionData.class_ids?.includes(std.class_id)
      );
    } else {
      // Filter pelatih: cek apakah id pelatih ada di dalam array coach_ids sesi
      baseList = coaches.filter((cch) =>
        activeSessionData.coach_ids?.includes(cch.id)
      );
    }
  }

  // Filter kedua: Terapkan pencarian dari search bar
  const filteredList = baseList.filter((item) => {
    const name = item.users?.full_name?.toLowerCase() || "";
    const identifier = attendeeType === "student" ? item.nis : item.specialty;
    const search = localSearch.toLowerCase();
    return (
      name.includes(search) ||
      (identifier && identifier.toLowerCase().includes(search))
    );
  });

  // Handle Toggle Satu Item
  const toggleSelection = (id) => {
    setSelectedAttendees((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  // Handle Select All (Hanya yang tampil di filter)
  const toggleSelectAll = () => {
    const filteredIds = filteredList.map((i) => i.id);
    const allSelected = filteredIds.length > 0 && filteredIds.every((id) =>
      selectedAttendees.includes(id),
    );

    if (allSelected) {
      // Unselect all filtered
      setSelectedAttendees((prev) =>
        prev.filter((id) => !filteredIds.includes(id)),
      );
    } else {
      // Select all filtered (gabungkan tanpa duplikat)
      setSelectedAttendees((prev) =>
        Array.from(new Set([...prev, ...filteredIds])),
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.session_id) {
      toast.error("Please select an active session.");
      return;
    }
    if (selectedAttendees.length === 0) {
      toast.error("Please select at least one attendee.");
      return;
    }

    setSubmitting(true);
    const loadingToast = toast.loading(
      `Saving ${selectedAttendees.length} records...`,
    );

    try {
      // Eksekusi semua proses ke database secara paralel
      const promises = selectedAttendees.map(async (attendeeId) => {
        const idField = attendeeType === "student" ? "student_id" : "coach_id";

        // Cek apakah log sudah ada
        const { data: existingLog, error: checkError } = await supabase
          .from("attendance_logs")
          .select("id")
          .eq("session_id", form.session_id)
          .eq(idField, attendeeId)
          .maybeSingle();

        if (checkError) throw checkError;

        if (existingLog) {
          // Update (Timpa status)
          const { error: updateError } = await supabase
            .from("attendance_logs")
            .update({
              status: form.status,
              scanned_at: new Date().toISOString(),
            })
            .eq("id", existingLog.id);

          if (updateError) throw updateError;
        } else {
          // Insert Baru
          const { error: insertError } = await supabase
            .from("attendance_logs")
            .insert([
              {
                session_id: form.session_id,
                [idField]: attendeeId,
                status: form.status,
              },
            ]);

          if (insertError) throw insertError;
        }
      });

      await Promise.all(promises);

      toast.success(
        `Successfully saved attendance for ${selectedAttendees.length} ${attendeeType}s!`,
        { id: loadingToast },
      );

      // Reset form pilihan
      setSelectedAttendees([]);
      setLocalSearch("");
    } catch (error) {
      toast.error(error.message, { id: loadingToast });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium animate-pulse">
          Loading data...
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
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <ClipboardEdit className="text-blue-600" size={32} />
          Manual Entry
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          Bulk record or overwrite attendance manually for Athletes or Coaches.
        </p>
      </div>

      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-100 overflow-hidden p-6 md:p-8">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col md:flex-row gap-8"
        >
          {/* KOLOM KIRI: Pengaturan Sesi & Status */}
          <div className="flex-1 space-y-6">
            {sessions.length === 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-700">
                <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium">
                  No active sessions found. Please open a session first in the{" "}
                  <b>Sessions</b> menu.
                </p>
              </div>
            )}

            {/* Toggle: Athlete / Coach */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                Target Group
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handleTypeChange("student")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm border transition-all ${
                    attendeeType === "student"
                      ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20"
                      : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <Users size={18} />
                  Athletes
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange("coach")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm border transition-all ${
                    attendeeType === "coach"
                      ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20"
                      : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <UserPlus size={18} />
                  Coaches
                </button>
              </div>
            </div>

            {/* Session Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-1.5">
                <CalendarDays size={14} /> Active Session
              </label>
              <select
                required
                value={form.session_id}
                onChange={(e) => {
                  setForm({ ...form, session_id: e.target.value });
                  setSelectedAttendees([]); // Reset pilihan saat sesi diganti
                  setLocalSearch("");
                }}
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-700 cursor-pointer shadow-inner"
              >
                <option value="">-- Select Session --</option>
                {sessions.map((s) => {
                  // Format ke angka DD/MM/YYYY HH:mm
                  const dateObj = new Date(s.session_date);
                  const day = String(dateObj.getDate()).padStart(2, '0');
                  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                  const year = dateObj.getFullYear();
                  const hours = String(dateObj.getHours()).padStart(2, '0');
                  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
                  
                  const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}`;

                  return (
                    <option key={s.id} value={s.id}>
                      {s.name} ({formattedDate} WIB)
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Status Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-1.5">
                <Activity size={14} /> Assignment Status
              </label>
              <select
                required
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-700 cursor-pointer shadow-inner"
              >
                <option value="hadir_manual">Present (Hadir Manual)</option>
                <option value="izin">Excused (Izin)</option>
                <option value="sakit">Sick (Sakit)</option>
                <option value="alpa">Absent (Alpa)</option>
              </select>
            </div>

            <div className="pt-6 border-t border-slate-100 hidden md:block">
              <button
                type="submit"
                disabled={
                  submitting ||
                  sessions.length === 0 ||
                  selectedAttendees.length === 0
                }
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-2xl shadow-lg shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed w-full"
              >
                <Save size={18} />
                {submitting
                  ? "Processing..."
                  : `Save ${selectedAttendees.length > 0 ? selectedAttendees.length : ""} Records`}
              </button>
            </div>
          </div>

          {/* KOLOM KANAN: Bulk Attendee Selector */}
          <div className="flex-[1.5] bg-slate-50 border border-slate-200 rounded-3xl flex flex-col overflow-hidden h-[500px]">
            {/* Box Header & Search */}
            <div className="p-4 border-b border-slate-200 bg-white">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck size={14} /> Bulk Selection
                </label>
                <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-blue-600 rounded-full">
                  {selectedAttendees.length} Selected
                </span>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    disabled={!form.session_id}
                    placeholder={`Search ${attendeeType}...`}
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium disabled:opacity-50"
                  />
                </div>
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  disabled={!form.session_id}
                  className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle2
                    size={16}
                    className={
                      filteredList.length > 0 &&
                      filteredList.every((i) =>
                        selectedAttendees.includes(i.id),
                      )
                        ? "text-blue-600"
                        : "text-slate-400"
                    }
                  />
                  Select All
                </button>
              </div>
            </div>

            {/* List Box (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-2">
              {!form.session_id ? (
                // State 1: Sesi belum dipilih
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <CalendarDays size={32} className="text-slate-300 mb-2" />
                  <p className="text-sm font-medium">
                    Please select an active session first.
                  </p>
                </div>
              ) : filteredList.length === 0 ? (
                // State 2: Sesi sudah dipilih, tapi data kosong / tidak ditemukan
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <Search size={32} className="text-slate-300 mb-2" />
                  <p className="text-sm font-medium">
                    No {attendeeType} found for this session.
                  </p>
                </div>
              ) : (
                // State 3: Data ditemukan, render grid
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {filteredList.map((item) => {
                    const isSelected = selectedAttendees.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleSelection(item.id)}
                        className={`flex items-center gap-3 p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                          isSelected
                            ? "border-blue-500 bg-blue-50/50 shadow-sm"
                            : "border-transparent hover:bg-white hover:shadow-sm"
                        }`}
                      >
                        {isSelected ? (
                          <CheckSquare
                            size={20}
                            className="text-blue-600 flex-shrink-0"
                          />
                        ) : (
                          <Square
                            size={20}
                            className="text-slate-300 flex-shrink-0"
                          />
                        )}
                        <div className="overflow-hidden">
                          <p
                            className={`text-sm font-bold truncate ${isSelected ? "text-blue-900" : "text-slate-700"}`}
                          >
                            {item.users?.full_name || "Unknown"}
                          </p>
                          <p className="text-xs text-slate-500 truncate mt-0.5">
                            {attendeeType === "student"
                              ? `NIS: ${item.nis} • ${item.classes?.name || "No Class"}`
                              : item.specialty || "Instructor"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Tombol Submit Khusus Mobile (Muncul di bawah) */}
          <div className="pt-4 border-t border-slate-100 md:hidden">
            <button
              type="submit"
              disabled={
                submitting ||
                sessions.length === 0 ||
                selectedAttendees.length === 0
              }
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-2xl shadow-lg shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed w-full"
            >
              <Save size={18} />
              {submitting
                ? "Processing..."
                : `Save ${selectedAttendees.length > 0 ? selectedAttendees.length : ""} Records`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}