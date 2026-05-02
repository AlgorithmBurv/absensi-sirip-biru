import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { supabase } from '../../utils/supabaseClient';

export default function ScanQR() {
  const [activeSessions, setActiveSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [scanResult, setScanResult] = useState('');

  useEffect(() => {
    const fetchActive = async () => {
      const { data } = await supabase.from('sessions').select('*').eq('is_active', true);
      if (data) setActiveSessions(data);
    };
    fetchActive();
  }, []);

  useEffect(() => {
    if (!selectedSession) return;
    
    // Inisialisasi Scanner Kamera
    const scanner = new Html5QrcodeScanner("reader", { qrbox: { width: 250, height: 250 }, fps: 5 });
    
    scanner.render(async (decodedText) => {
      setScanResult('Memproses QR...');
      scanner.pause(true); // Jeda kamera saat proses insert
      
      try {
        // Cari siswa berdasarkan QR
        const { data: student } = await supabase.from('students').select('id').eq('qr_token', decodedText).single();
        if (!student) throw new Error("QR Tidak Dikenali");

        // Masukkan ke log
        const { error } = await supabase.from('attendance_logs').insert([{
          session_id: selectedSession, student_id: student.id, status: 'hadir_qr'
        }]);

        if (error) throw error;
        setScanResult("Berhasil Absen!");
        
      } catch (err) {
        setScanResult("Gagal: " + err.message);
      } finally {
        setTimeout(() => {
          setScanResult('');
          scanner.resume(); // Nyalakan kamera lagi setelah 2 detik
        }, 2000);
      }
    }, (err) => { /* Abaikan error frame kosong */ });

    return () => scanner.clear(); // Bersihkan memori saat pindah halaman
  }, [selectedSession]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 max-w-xl mx-auto">
      <h2 className="text-xl font-bold text-slate-800 mb-4 text-center">Scanner Kehadiran</h2>
      
      <select onChange={(e) => setSelectedSession(e.target.value)} className="w-full border p-3 rounded-xl mb-6 bg-slate-50 font-medium">
        <option value="">-- Pilih Sesi Aktif Dulu --</option>
        {activeSessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>

      {selectedSession && (
        <div className="overflow-hidden rounded-2xl border-4 border-cyan-100">
          <div id="reader" className="w-full"></div>
        </div>
      )}

      {scanResult && (
        <div className="mt-4 p-4 rounded-xl text-center font-bold bg-cyan-100 text-cyan-800">
          {scanResult}
        </div>
      )}
    </div>
  );
}