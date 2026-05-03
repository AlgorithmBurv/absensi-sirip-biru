import React, { useEffect, useState, useRef, useCallback } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { supabase } from "../../utils/supabaseClient";
import { toast, Toaster } from "react-hot-toast";
import {
  ScanLine,
  Video,
  CheckCircle2,
  XCircle,
  Info,
  CalendarDays,
  Camera,
} from "lucide-react";

// ============================================================
// AUDIO ENGINE - Web Audio API (no file needed)
// ============================================================
function useAudioFeedback() {
  const audioCtx = useRef(null);

  const getCtx = useCallback(() => {
    if (!audioCtx.current) {
      audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Resume jika suspended (browser autoplay policy)
    if (audioCtx.current.state === "suspended") {
      audioCtx.current.resume();
    }
    return audioCtx.current;
  }, []);

  const playSuccess = useCallback(() => {
    try {
      const ctx = getCtx();
      // Dua nada naik = "ding-ding" sukses
      [0, 0.18].forEach((startOffset, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = "sine";
        osc.frequency.setValueAtTime(i === 0 ? 880 : 1100, ctx.currentTime + startOffset);

        gain.gain.setValueAtTime(0.35, ctx.currentTime + startOffset);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startOffset + 0.25);

        osc.start(ctx.currentTime + startOffset);
        osc.stop(ctx.currentTime + startOffset + 0.25);
      });
    } catch (_) {}
  }, [getCtx]);

  const playError = useCallback(() => {
    try {
      const ctx = getCtx();
      // Buzz rendah = "bzzz" error
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(160, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } catch (_) {}
  }, [getCtx]);

  return { playSuccess, playError };
}

// ============================================================
// HAPTIC ENGINE - Vibration API
// ============================================================
function useHapticFeedback() {
  const vibrate = useCallback((pattern) => {
    if ("vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);

  const successVibrate = useCallback(() => vibrate([80, 60, 120]), [vibrate]);   // dua ketuk cepat
  const errorVibrate   = useCallback(() => vibrate([300, 100, 300]), [vibrate]); // dua buzz panjang

  return { successVibrate, errorVibrate };
}

// ============================================================
// KOMPONEN UTAMA
// ============================================================
export default function ScanQR() {
  const [activeSessions, setActiveSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState("");
  const [scanStatus, setScanStatus] = useState({ type: "idle", message: "" });
  const scannerRef = useRef(null);

  const { playSuccess, playError } = useAudioFeedback();
  const { successVibrate, errorVibrate } = useHapticFeedback();

  // Fetch sesi aktif
  useEffect(() => {
    const fetchActiveSessions = async () => {
      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) toast.error("Failed to load active sessions.");
      else if (data) setActiveSessions(data);
    };
    fetchActiveSessions();
  }, []);

  // Inisialisasi / cleanup scanner
  useEffect(() => {
    if (!selectedSession) {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
      return;
    }

    const timeout = setTimeout(() => {
      const readerEl = document.getElementById("reader");
      if (!readerEl) return;

      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }

      const scanner = new Html5QrcodeScanner(
        "reader",
        { qrbox: { width: 280, height: 280 }, fps: 10, aspectRatio: 1.0, showTorchButtonIfSupported: true },
        false,
      );

      scanner.render(
        async (decodedText) => {
          // Pause camera immediately
          scanner.pause(true);
          setScanStatus({ type: "info", message: "Verifying QR Code..." });

          try {
            const { data: student, error: studentError } = await supabase
              .from("students")
              .select("id, users(full_name)")
              .eq("qr_token", decodedText)
              .single();

            if (studentError || !student)
              throw new Error("Invalid or Unregistered QR Pass");

            const { error: logError } = await supabase
              .from("attendance_logs")
              .insert([{ session_id: selectedSession, student_id: student.id, status: "hadir_qr" }]);

            if (logError) {
              if (logError.code === "23505")
                throw new Error(`${student.users?.full_name || "Athlete"} is already checked in!`);
              throw logError;
            }

            // -> SUKSES (suara + haptic + overlay)
            playSuccess();
            successVibrate();
            setScanStatus({
              type: "success",
              message: `Check-in Success: ${student.users?.full_name || "Athlete"}`,
            });
          } catch (err) {
            // -> ERROR (suara + haptic + overlay)
            playError();
            errorVibrate();
            setScanStatus({ type: "error", message: err.message });
          } finally {
            // Cooldown selama tepat 2.5 detik
            setTimeout(() => {
              setScanStatus({ type: "idle", message: "" });
              scanner.resume(); // Kamera hidup lagi
            }, 2500);
          }
        },
        () => {},
      );

      scannerRef.current = scanner;
    }, 150);

    return () => {
      clearTimeout(timeout);
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [selectedSession, playSuccess, playError, successVibrate, errorVibrate]);

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans">
      <Toaster position="top-right" toastOptions={{ style: { borderRadius: "16px", fontWeight: "500" } }} />

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <ScanLine className="text-blue-600" size={32} />
          QR Access Gate
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          Scan athlete digital passes to record attendance.
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Panel Kiri */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-100 p-6">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <CalendarDays size={16} /> Gate Control
            </h2>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500">Active Session</label>
              <select
                value={selectedSession}
                onChange={(e) => {
                  setSelectedSession(e.target.value);
                  setScanStatus({ type: "idle", message: "" });
                }}
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-700 cursor-pointer shadow-inner"
              >
                <option value="">-- Select Active Gate --</option>
                {activeSessions.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {activeSessions.length === 0 && (
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-700">
                <Info size={18} className="flex-shrink-0 mt-0.5" />
                <p className="text-xs font-medium">
                  No active sessions found. Please create or open a session first in the <b>Sessions</b> menu.
                </p>
              </div>
            )}
          </div>

          {/* System Status */}
          <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-100 p-6">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">System Status</h2>
            {selectedSession ? (
              <div className="flex items-center gap-3 text-emerald-600 bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="text-sm font-bold">Scanner Active & Ready</span>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-slate-500 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="h-3 w-3 rounded-full bg-slate-300"></div>
                <span className="text-sm font-bold">Scanner Offline</span>
              </div>
            )}

            {/* Feedback Info */}
   
          </div>
        </div>

        {/* Panel Kanan: Kamera */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-100 p-6 h-full min-h-[500px] flex flex-col relative overflow-hidden">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2 relative z-10">
              <Camera size={16} /> Viewfinder
            </h2>

            <div className={`flex-1 flex flex-col justify-center items-center relative z-10 ${!selectedSession ? "hidden" : "flex"}`}>
              
              {/* ==================================================== */}
              {/* OVERLAY NOTIFIKASI SCAN + COOLDOWN INDICATOR         */}
              {/* ==================================================== */}
              {scanStatus.type !== "idle" && (
                <div className="absolute inset-x-0 top-2 z-20 flex justify-center px-4 animate-in slide-in-from-top-4 fade-in duration-300">
                  <div className={`px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-4 w-full max-w-sm font-bold border backdrop-blur-md
                    ${scanStatus.type === "success" ? "bg-emerald-500/95 text-white border-emerald-400" : ""}
                    ${scanStatus.type === "error"   ? "bg-red-500/95 text-white border-red-400" : ""}
                    ${scanStatus.type === "info"    ? "bg-blue-600/95 text-white border-blue-400" : ""}
                  `}>
                    {/* ICON KIRI */}
                    {scanStatus.type === "success" && <CheckCircle2 size={28} className="flex-shrink-0 animate-in zoom-in" />}
                    {scanStatus.type === "error"   && <XCircle      size={28} className="flex-shrink-0 animate-in zoom-in" />}
                    {scanStatus.type === "info"    && <ScanLine     size={28} className="flex-shrink-0 animate-pulse" />}

                    {/* TEKS TENGAH */}
                    <div className="flex-1 flex flex-col min-w-0">
                      <span className="text-sm leading-tight truncate">{scanStatus.message}</span>
                      
                      {/* Sub-text Cooldown */}
                      {(scanStatus.type === "success" || scanStatus.type === "error") && (
                        <span className="text-[11px] font-medium opacity-80 mt-0.5 font-mono">
                          Camera pausing...
                        </span>
                      )}
                      {scanStatus.type === "info" && (
                        <span className="text-[11px] font-medium opacity-80 mt-0.5">
                          Authenticating pass...
                        </span>
                      )}
                    </div>

                    {/* CIRCULAR PROGRESS BAR (KANAN) */}
                    {(scanStatus.type === "success" || scanStatus.type === "error") && (
                      <div className="relative flex items-center justify-center w-8 h-8 flex-shrink-0">
                        {/* Lingkaran Background */}
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" className="opacity-20" />
                          {/* Lingkaran Animasi (Berkurang) */}
                          <circle 
                            cx="12" 
                            cy="12" 
                            r="10" 
                            stroke="currentColor" 
                            strokeWidth="3" 
                            fill="none"
                            strokeDasharray="63"
                            strokeLinecap="round"
                            style={{ animation: 'cooldown-dash 2.5s linear forwards' }} 
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tempat Render Kamera */}
              <div className="w-full max-w-sm mx-auto overflow-hidden rounded-[2rem] border-8 border-slate-50 shadow-inner bg-black relative">
                <div id="reader" className="w-full"></div>
              </div>
              <p className="text-center text-xs text-slate-400 font-medium mt-6">
                Position the athlete's QR Code within the frame to scan.
              </p>
            </div>

            {/* Belum pilih sesi */}
            {!selectedSession && (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-center animate-in fade-in">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <Video size={40} className="text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-700">Awaiting Gate Selection</h3>
                <p className="text-sm mt-2 max-w-xs">
                  Please select an active session on the left panel to initialize the camera system.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CSS injection: Styling Html5-Qrcode & Keyframe Progress Bar */}
      <style dangerouslySetInnerHTML={{ __html: `
        #reader { border: none !important; }
        #reader button { 
           background-color: #2563eb !important; color: white !important; border: none !important; 
           padding: 8px 16px !important; border-radius: 8px !important; font-weight: bold !important; 
           cursor: pointer !important; margin-top: 10px !important; transition: background 0.3s;
        }
        #reader button:hover { background-color: #1d4ed8 !important; }
        #reader a { color: #60a5fa !important; text-decoration: none !important; }
        #reader__dashboard_section_csr span { color: white !important; }

        /* KEYFRAME ANIMASI COOLDOWN: Garis lingkaran berkurang hingga habis */
        @keyframes cooldown-dash {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: 63; }
        }
      `}} />
    </div>
  );
}