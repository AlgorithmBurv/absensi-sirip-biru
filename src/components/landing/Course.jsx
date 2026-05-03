import React from "react";
import { CheckCircle2 } from "lucide-react";

export default function Course() {
  const courses = [
    {
      title: "Beginner Class",
      price: "Rp 350.000",
      desc: "Pengenalan air, pernapasan dasar, dan teknik mengapung untuk pemula.",
      features: ["Pengenalan Air", "Teknik Pernapasan", "Gaya Bebas Dasar", "Pelatih Pendamping 1:5"],
      color: "blue"
    },
    {
      title: "Intermediate Class",
      price: "Rp 500.000",
      desc: "Penguasaan 4 gaya renang dan peningkatan stamina berenang.",
      features: ["Penyempurnaan 4 Gaya", "Latihan Stamina", "Teknik Pembalikan", "Evaluasi Video Mingguan"],
      color: "emerald",
      popular: true
    },
    {
      title: "Athlete / Elite",
      price: "Rp 850.000",
      desc: "Program intensif untuk persiapan kompetisi dan turnamen.",
      features: ["Program Latihan Harian", "Nutrisi & Fisik", "Simulasi Lomba", "Analisis Data Digital"],
      color: "purple"
    }
  ];

  return (
    <section id="course" className="py-24 px-6 bg-[#f8fafc] border-t border-slate-100">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-2">Programs</h2>
          <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Pilih Kelas Sesuai Targetmu</h3>
          <p className="text-slate-500 font-medium">Dari pemula hingga atlet profesional, kami punya program yang tepat.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {courses.map((c, i) => (
            <div key={i} className={`bg-white rounded-[2.5rem] p-8 border hover:-translate-y-2 transition-transform duration-300 relative ${c.popular ? 'border-blue-200 shadow-xl shadow-blue-900/10' : 'border-slate-100 shadow-lg shadow-slate-200/50'}`}>
              {c.popular && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">
                  Paling Diminati
                </span>
              )}
              <h4 className="text-xl font-bold text-slate-800 mb-2">{c.title}</h4>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-black text-slate-900">{c.price}</span>
                <span className="text-sm font-bold text-slate-400">/bulan</span>
              </div>
              <p className="text-sm text-slate-500 mb-8 pb-8 border-b border-slate-100">{c.desc}</p>
              
              <ul className="space-y-4 mb-8">
                {c.features.map((f, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-sm font-medium text-slate-700">
                    <CheckCircle2 size={18} className={`text-${c.color}-500 flex-shrink-0`} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}