import React, { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';

export default function History() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // 1. Ambil data user dari localStorage (Hasil login manual)
        const savedUser = localStorage.getItem('user_session');
        if (!savedUser) return;
        
        const user = JSON.parse(savedUser);

        // 2. Cari student_id berdasarkan user_id (Bukan profile_id)
        const { data: student } = await supabase
          .from('students')
          .select('id')
          .eq('user_id', user.id) // Sesuai kolom di tabel students yang baru
          .single();

        if (!student) throw new Error("Data siswa tidak ditemukan");

        // 3. Ambil riwayat absen berdasarkan student_id
        const { data: attendanceLogs, error } = await supabase
          .from('attendance_logs')
          .select(`
            id,
            status,
            scanned_at,
            sessions ( name, session_date )
          `)
          .eq('student_id', student.id)
          .order('scanned_at', { ascending: false });

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

  // Fungsi helper untuk menerjemahkan status dan warna badge
  const formatStatus = (status) => {
    switch (status) {
      case 'hadir_qr': return { label: 'Hadir (QR)', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
      case 'hadir_manual': return { label: 'Hadir (Manual)', color: 'bg-blue-100 text-blue-700 border-blue-200' };
      case 'izin': return { label: 'Izin', color: 'bg-amber-100 text-amber-700 border-amber-200' };
      case 'sakit': return { label: 'Sakit', color: 'bg-red-100 text-red-700 border-red-200' };
      default: return { label: status, color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  if (loading) return <div className="text-center py-10 text-cyan-600 animate-pulse">Memuat riwayat menyelam...</div>;

  return (
    <div className="py-6">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Riwayat Latihan</h2>
      <p className="text-slate-500 text-sm mb-6">Catatan kehadiran kamu di kolam renang.</p>

      {logs.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-slate-100">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-slate-600 font-medium">Belum ada riwayat absensi</p>
          <p className="text-slate-400 text-sm mt-1">Kamu belum pernah melakukan scan kehadiran.</p>
        </div>
      ) : (
        <div className="space-y-4 mb-20"> {/* Tambah margin bawah agar tidak tertutup nav */}
          {logs.map((log) => {
            const statusStyle = formatStatus(log.status);
            const scanDate = new Date(log.scanned_at);
            const timeString = scanDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            const dateString = new Date(log.sessions?.session_date).toLocaleDateString('id-ID', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            });

            return (
              <div key={log.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                
                {/* Info Sesi */}
                <div>
                  <h3 className="font-semibold text-slate-800">{log.sessions?.name || 'Sesi Tidak Diketahui'}</h3>
                  <div className="flex items-center text-xs text-slate-500 mt-1 space-x-2">
                    <span className="flex items-center">
                      <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {dateString}
                    </span>
                    <span className="flex items-center">
                      <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {timeString} WIB
                    </span>
                  </div>
                </div>

                {/* Badge Status */}
                <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold text-center w-fit ${statusStyle.color}`}>
                  {statusStyle.label}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}