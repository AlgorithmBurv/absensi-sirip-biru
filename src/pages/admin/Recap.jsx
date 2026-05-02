import React, { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';

export default function Recap() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      const { data } = await supabase
        .from('attendance_logs')
        .select(`
          id, status, scanned_at,
          students ( nis ),
          sessions ( name, session_date )
        `)
        .order('scanned_at', { ascending: false });
      
      if (data) setLogs(data);
    };
    fetchLogs();
  }, []);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">Rekap Riwayat Absensi</h2>
        <button className="text-sm bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-lg font-medium">
          Export Excel (TODO)
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-slate-50 text-slate-500 border-b">
              <th className="p-3">Waktu</th>
              <th className="p-3">NIS Atlet</th>
              <th className="p-3">Sesi</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id} className="border-b hover:bg-slate-50">
                <td className="p-3 text-sm text-slate-600">
                  {new Date(log.scanned_at).toLocaleString('id-ID')}
                </td>
                <td className="p-3 font-medium text-slate-800">{log.students?.nis}</td>
                <td className="p-3 text-slate-600">{log.sessions?.name}</td>
                <td className="p-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold
                    ${log.status.includes('hadir') ? 'bg-emerald-100 text-emerald-700' : 
                      log.status === 'izin' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}
                  `}>
                    {log.status.toUpperCase().replace('_', ' ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}