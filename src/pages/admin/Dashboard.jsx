import React, { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';

export default function Dashboard() {
  const [stats, setStats] = useState({ classes: 0, students: 0, activeSessions: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const { count: classCount } = await supabase.from('classes').select('*', { count: 'exact', head: true });
      const { count: studentCount } = await supabase.from('students').select('*', { count: 'exact', head: true });
      const { count: sessionCount } = await supabase.from('sessions').select('*', { count: 'exact', head: true }).eq('is_active', true);
      
      setStats({
        classes: classCount || 0,
        students: studentCount || 0,
        activeSessions: sessionCount || 0
      });
    };
    fetchStats();
  }, []);

  const Card = ({ title, value, icon }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
      <div className="p-4 bg-cyan-50 text-cyan-600 rounded-xl">{icon}</div>
      <div>
        <p className="text-slate-500 text-sm font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      </div>
    </div>
  );

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Dashboard Admin Siripbiru</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Total Kelas / Kelompok" value={stats.classes} icon={"🏊‍♂️"} />
        <Card title="Total Atlet / Siswa" value={stats.students} icon={"👥"} />
        <Card title="Sesi Latihan Aktif" value={stats.activeSessions} icon={"⏱️"} />
      </div>
    </div>
  );
}