import React, { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';

export default function ClassManage() {
  const [classes, setClasses] = useState([]);
  const [newClass, setNewClass] = useState('');

  const fetchClasses = async () => {
    const { data } = await supabase.from('classes').select('*').order('created_at', { ascending: false });
    if (data) setClasses(data);
  };

  useEffect(() => { fetchClasses(); }, []);

  const handleAddClass = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('classes').insert([{ name: newClass }]);
    if (!error) {
      setNewClass('');
      fetchClasses();
      alert('Kelas berhasil ditambahkan!');
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <h2 className="text-xl font-bold text-slate-800 mb-4">Manajemen Kelas</h2>
      
      <form onSubmit={handleAddClass} className="flex gap-4 mb-6">
        <input 
          type="text" value={newClass} onChange={(e) => setNewClass(e.target.value)}
          placeholder="Nama Kelas (Contoh: Pemula A)" required
          className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
        />
        <button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg font-medium">
          Tambah
        </button>
      </form>

      <ul className="divide-y divide-slate-100 border-t">
        {classes.map((c) => (
          <li key={c.id} className="py-3 text-slate-700 flex justify-between">
            <span>{c.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}