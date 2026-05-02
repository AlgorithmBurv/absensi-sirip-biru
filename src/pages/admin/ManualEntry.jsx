import React, { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';

export default function ManualEntry() {
  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({ session_id: '', student_id: '', status: 'hadir_manual' });

  useEffect(() => {
    const loadData = async () => {
      const { data: sess } = await supabase.from('sessions').select('*').eq('is_active', true);
      const { data: std } = await supabase.from('students').select('id, nis');
      if (sess) setSessions(sess);
      if (std) setStudents(std);
    };
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('attendance_logs').insert([form]);
    if (error) alert("Gagal: Mungkin siswa sudah diabsen di sesi ini.");
    else alert("Absen Manual Berhasil!");
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 max-w-lg">
      <h2 className="text-xl font-bold text-slate-800 mb-4">Input Kehadiran Darurat</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-slate-500 mb-1">Sesi Latihan</label>
          <select required onChange={e => setForm({...form, session_id: e.target.value})} className="w-full border p-2 rounded-lg bg-slate-50">
            <option value="">Pilih Sesi</option>
            {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm text-slate-500 mb-1">Pilih Atlet (Berdasarkan NIS)</label>
          <select required onChange={e => setForm({...form, student_id: e.target.value})} className="w-full border p-2 rounded-lg bg-slate-50">
            <option value="">Pilih Atlet</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.nis}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm text-slate-500 mb-1">Status</label>
          <select onChange={e => setForm({...form, status: e.target.value})} className="w-full border p-2 rounded-lg bg-slate-50">
            <option value="hadir_manual">Hadir (Tanpa QR)</option>
            <option value="izin">Izin</option>
            <option value="sakit">Sakit</option>
          </select>
        </div>

        <button type="submit" className="w-full bg-cyan-600 text-white p-3 rounded-xl font-bold mt-4 hover:bg-cyan-700">
          Simpan Kehadiran
        </button>
      </form>
    </div>
  );
}