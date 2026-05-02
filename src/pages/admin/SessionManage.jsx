import React, { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';

export default function SessionManage() {
  const [sessions, setSessions] = useState([]);
  const [form, setForm] = useState({ name: '', session_date: '' });

  const fetchSessions = async () => {
    const { data } = await supabase.from('sessions').select('*').order('created_at', { ascending: false });
    if (data) setSessions(data);
  };

  useEffect(() => { fetchSessions(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('sessions').insert([form]);
    if (!error) fetchSessions();
  };

  const toggleStatus = async (id, currentStatus) => {
    await supabase.from('sessions').update({ is_active: !currentStatus }).eq('id', id);
    fetchSessions();
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <h2 className="text-xl font-bold text-slate-800 mb-4">Sesi Latihan (Absensi)</h2>
      
      <form onSubmit={handleCreate} className="flex gap-4 mb-6">
        <input type="text" placeholder="Nama Sesi" required onChange={e => setForm({...form, name: e.target.value})} className="flex-1 border px-4 py-2 rounded-lg" />
        <input type="date" required onChange={e => setForm({...form, session_date: e.target.value})} className="border px-4 py-2 rounded-lg" />
        <button type="submit" className="bg-cyan-600 text-white px-6 py-2 rounded-lg font-medium">Buka Sesi</button>
      </form>

      <div className="space-y-3">
        {sessions.map(s => (
          <div key={s.id} className="flex justify-between items-center p-4 border rounded-xl">
            <div>
              <p className="font-bold text-slate-800">{s.name}</p>
              <p className="text-sm text-slate-500">{s.session_date}</p>
            </div>
            <button 
              onClick={() => toggleStatus(s.id, s.is_active)}
              className={`px-4 py-1.5 rounded-full text-sm font-bold ${s.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}
            >
              {s.is_active ? 'Aktif' : 'Ditutup'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}