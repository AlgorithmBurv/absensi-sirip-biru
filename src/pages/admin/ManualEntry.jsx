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
} from "lucide-react";

export default function ManualEntry() {
  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [attendeeType, setAttendeeType] = useState("student"); // "student" | "coach"
  const [form, setForm] = useState({
    session_id: "",
    attendee_id: "",
    status: "hadir_manual",
  });
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
          .select("id, nis, users(full_name), classes(name)")
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

  // Reset attendee_id setiap kali tipe berubah
  const handleTypeChange = (type) => {
    setAttendeeType(type);
    setForm((prev) => ({ ...prev, attendee_id: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.session_id || !form.attendee_id) {
      toast.error("Please select both session and attendee.");
      return;
    }

    setSubmitting(true);
    const loadingToast = toast.loading("Saving attendance record...");

    try {
      if (attendeeType === "student") {
        // --- ALUR STUDENT (sama seperti sebelumnya) ---
        const { data: existingLog, error: checkError } = await supabase
          .from("attendance_logs")
          .select("id")
          .eq("session_id", form.session_id)
          .eq("student_id", form.attendee_id)
          .maybeSingle();

        if (checkError) throw checkError;

        if (existingLog) {
          const { error: updateError } = await supabase
            .from("attendance_logs")
            .update({ status: form.status, scanned_at: new Date().toISOString() })
            .eq("id", existingLog.id);
          if (updateError) throw updateError;
          toast.success("Attendance updated (Overwritten)!", { id: loadingToast });
        } else {
          const { error: insertError } = await supabase
            .from("attendance_logs")
            .insert([{ session_id: form.session_id, student_id: form.attendee_id, status: form.status }]);
          if (insertError) throw insertError;
          toast.success("Attendance saved successfully!", { id: loadingToast });
        }
      } else {
        // --- ALUR COACH ---
        const { data: existingLog, error: checkError } = await supabase
          .from("attendance_logs")
          .select("id")
          .eq("session_id", form.session_id)
          .eq("coach_id", form.attendee_id)
          .maybeSingle();

        if (checkError) throw checkError;

        if (existingLog) {
          const { error: updateError } = await supabase
            .from("attendance_logs")
            .update({ status: form.status, scanned_at: new Date().toISOString() })
            .eq("id", existingLog.id);
          if (updateError) throw updateError;
          toast.success("Coach attendance updated (Overwritten)!", { id: loadingToast });
        } else {
          const { error: insertError } = await supabase
            .from("attendance_logs")
            .insert([{ session_id: form.session_id, coach_id: form.attendee_id, status: form.status }]);
          if (insertError) throw insertError;
          toast.success("Coach attendance saved!", { id: loadingToast });
        }
      }

      setForm((prev) => ({ ...prev, attendee_id: "" }));
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
        <p className="text-slate-500 font-medium animate-pulse">Loading data...</p>
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
      <div className="max-w-3xl mx-auto mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <ClipboardEdit className="text-blue-600" size={32} />
          Manual Entry
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          Record or overwrite attendance manually for Athletes or Coaches.
        </p>
      </div>

      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-100 overflow-hidden p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* No active session warning */}
          {sessions.length === 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-700">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium">
                No active sessions found. Please open a session first in the <b>Sessions</b> menu.
              </p>
            </div>
          )}

          {/* Toggle: Athlete / Coach */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
              Attendee Type
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
                Athlete
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
                Coach
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Session Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-1.5">
                <CalendarDays size={14} /> Active Session
              </label>
              <select
                required
                value={form.session_id}
                onChange={(e) => setForm({ ...form, session_id: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-700 cursor-pointer shadow-inner"
              >
                <option value="">-- Select Gate / Session --</option>
                {sessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.session_date})
                  </option>
                ))}
              </select>
            </div>

            {/* Status Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-1.5">
                <Activity size={14} /> Attendance Status
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
          </div>

          {/* Athlete / Coach Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-1.5">
              <UserCheck size={14} /> {attendeeType === "student" ? "Athlete Profile" : "Coach Profile"}
            </label>
            <select
              required
              value={form.attendee_id}
              onChange={(e) => setForm({ ...form, attendee_id: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-700 cursor-pointer shadow-inner"
            >
              <option value="">
                -- Select {attendeeType === "student" ? "Athlete" : "Coach"} --
              </option>
              {attendeeType === "student"
                ? students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.users?.full_name || "Unknown"} — NIS: {s.nis} ({s.classes?.name || "No Class"})
                    </option>
                  ))
                : coaches.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.users?.full_name || "Unknown"} — {c.specialty || "General Instructor"}
                    </option>
                  ))}
            </select>
            <p className="text-xs text-slate-400 font-medium ml-1 mt-1">
              *If already checked in, submitting will overwrite their previous status.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={submitting || sessions.length === 0}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-2xl shadow-lg shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto"
            >
              <Save size={18} />
              {submitting ? "Processing..." : "Save Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}