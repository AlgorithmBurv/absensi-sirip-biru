import React from "react";
import { Star, Quote } from "lucide-react";

export default function Testimonials() {
  const reviews = [
    { name: "Ibu Dina", role: "Orang Tua Atlet", text: "Sistem QR pass-nya sangat memudahkan saya memantau kehadiran anak. Laporannya real-time!" },
    { name: "Reza Aditya", role: "Atlet Kelas Elite", text: "Fokus latihan jadi maksimal karena jadwal dan sesi terorganisir rapi di portal Siripbiru." },
    { name: "Pak Hendra", role: "Orang Tua Atlet", text: "Coach-nya sangat profesional dan progres anak saya sangat terlihat jelas sejak bulan pertama." }
  ];

  return (
    <section id="testimonials" className="py-24 px-6 bg-[#0a192f] text-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-2">Testimonials</h2>
          <h3 className="text-3xl md:text-4xl font-extrabold mb-4">Apa Kata Mereka?</h3>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map((r, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-[2rem] p-8 backdrop-blur-sm relative">
              <Quote size={40} className="text-white/10 absolute top-6 right-6" />
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, idx) => <Star key={idx} size={16} className="text-amber-400 fill-amber-400" />)}
              </div>
              <p className="text-slate-300 leading-relaxed mb-6 font-medium">"{r.text}"</p>
              <div>
                <h4 className="font-bold text-white">{r.name}</h4>
                <p className="text-xs text-blue-400 uppercase tracking-widest mt-1 font-bold">{r.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}