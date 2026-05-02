import React, { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { QRCodeSVG } from 'qrcode.react';

export default function Profile() {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStudentProfile = async () => {
      try {
        // 1. Ambil data user dari localStorage (Hasil login manual)
        const savedUser = localStorage.getItem('user_session');
        if (!savedUser) throw new Error("Sesi berakhir, silakan login kembali.");
        
        const user = JSON.parse(savedUser);

        // 2. Ambil data siswa berdasarkan user_id (Bukan profile_id)
        const { data, error: fetchError } = await supabase
          .from('students')
          .select(`
            nis,
            qr_token,
            users ( full_name ),
            classes ( name )
          `)
          .eq('user_id', user.id) // Sesuai kolom baru di tabel students
          .single();

        if (fetchError) throw fetchError;
        setStudentData(data);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Profil belum disetup. Hubungi Admin untuk mendaftarkan NIS & Kelas Anda.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentProfile();
  }, []);

  if (loading) return <div className="text-center py-10 text-cyan-600 animate-pulse">Memuat ID Card...</div>;
  if (error) return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="bg-red-50 p-4 rounded-2xl mb-4">
        <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <p className="text-slate-600 font-medium">{error}</p>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center py-6">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Kartu Perenang</h2>
      
      {/* ID Card (Glassmorphism + Tema Laut) */}
      <div className="w-full bg-gradient-to-br from-blue-900 to-cyan-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        
        {/* Dekorasi Card */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400 rounded-full mix-blend-screen filter blur-[40px] opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500 rounded-full mix-blend-screen filter blur-[40px] opacity-20"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          {/* Header Card */}
          <div className="flex items-center space-x-2 mb-6 w-full justify-center border-b border-cyan-500/30 pb-4">
            <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
            <span className="text-white font-bold tracking-widest text-sm uppercase">Club Siripbiru</span>
          </div>

          {/* Area QR Code */}
          <div className="bg-white p-4 rounded-2xl shadow-inner mb-6">
            {studentData?.qr_token ? (
              <QRCodeSVG 
                value={studentData.qr_token} 
                size={200} 
                level={"H"}
                includeMargin={false}
              />
            ) : (
              <div className="w-[200px] h-[200px] flex items-center justify-center text-slate-400 text-sm">QR Tidak Tersedia</div>
            )}
          </div>

          {/* Info Siswa - Menggunakan relasi tabel 'users' */}
          <div className="text-center text-white space-y-1 w-full">
            <h3 className="text-xl font-bold text-cyan-50 truncate">
              {studentData?.users?.full_name || 'Nama Tidak Ditemukan'}
            </h3>
            <p className="text-cyan-200 font-medium tracking-wide">
              NIS: {studentData?.nis}
            </p>
            <div className="inline-block mt-2 px-3 py-1 bg-cyan-500/20 border border-cyan-400/30 rounded-full text-cyan-100 text-sm">
              Kelas: {studentData?.classes?.name || 'Belum ada kelas'}
            </div>
          </div>
        </div>
      </div>
      
      <p className="mt-8 text-sm text-slate-500 text-center px-4">
        Tunjukkan QR Code ini ke layar kamera Admin untuk melakukan absensi kehadiran.
      </p>
    </div>
  );
}