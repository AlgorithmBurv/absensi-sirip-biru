import React, { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

export default function StudentManage() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [form, setForm] = useState({ nis: '', class_id: '' });

  const fetchData = async () => {
    const { data: cls } = await supabase.from('classes').select('*');
    if (cls) setClasses(cls);

    const { data: std } = await supabase.from('students').select('*, classes(name)');
    if (std) setStudents(std);
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    // Generate Token Unik untuk QR Code
    const qrToken = uuidv4(); 
    
    // Catatan: Pada implementasi nyata, profile_id harus didapat dari Supabase Auth
    // Di sini kita anggap profile_id null sementara atau diisi manual
    const { error } = await supabase.from('students').insert([{ 
      nis: form.nis, class_id: form.class_id, qr_token: qrToken 
    }]);

    if (!error) {
      alert('Siswa berhasil ditambah dengan QR Token unik!');
      fetchData();
    } else {
      alert('Gagal: ' + error.message);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <h2 className="text-xl font-bold text-slate-800 mb-4">Manajemen Atlet</h2>
      
      <form onSubmit={handleAddStudent} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input type="text" placeholder="NIS / No Anggota" required onChange={e => setForm({...form, nis: e.target.value})} className="border px-4 py-2 rounded-lg" />
        <select required onChange={e => setForm({...form, class_id: e.target.value})} className="border px-4 py-2 rounded-lg bg-white">
          <option value="">Pilih Kelas</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button type="submit" className="bg-cyan-600 text-white rounded-lg py-2 font-medium">Tambah Atlet</button>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 border-b">
              <th className="p-3">NIS</th>
              <th className="p-3">Kelas</th>
              <th className="p-3">QR Token (Hidden)</th>
            </tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s.id} className="border-b">
                <td className="p-3 font-medium">{s.nis}</td>
                <td className="p-3 text-slate-600">{s.classes?.name}</td>
                <td className="p-3 text-xs text-slate-400 font-mono truncate max-w-[150px]">{s.qr_token}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}