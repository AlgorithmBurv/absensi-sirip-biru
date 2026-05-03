import React from "react";
import { ShieldCheck, Trophy, Users } from "lucide-react";

export default function AboutUs() {
  return (
    <section id="about" className="py-24 px-6 bg-white relative z-10 border-t border-slate-100">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-2">About Us</h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6 leading-tight">
              Membangun Juara dari Dalam Air.
            </h3>
            <p className="text-slate-500 leading-relaxed font-medium mb-8 text-lg">
              Siripbiru Swim Club didedikasikan untuk melatih dan mencetak perenang tangguh. Dengan sistem manajemen latihan berbasis digital, kami memastikan setiap perkembangan atlet tercatat dengan akurat.
            </p>
            
            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0"><Trophy size={20}/></div>
                <div>
                  <h4 className="font-bold text-slate-800 text-lg">Prestasi Terukur</h4>
                  <p className="text-sm text-slate-500 mt-1">Kurikulum yang didesain untuk mencetak medali di kejuaraan nasional.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0"><ShieldCheck size={20}/></div>
                <div>
                  <h4 className="font-bold text-slate-800 text-lg">Fasilitas Aman & Modern</h4>
                  <p className="text-sm text-slate-500 mt-1">Lingkungan latihan yang suportif dan terpantau sepenuhnya.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="aspect-square bg-slate-100 rounded-[3rem] overflow-hidden relative shadow-2xl">
              {/* Gambar Placeholder (Ganti dengan foto kolam/klub asli nanti) */}
              <img src="https://images.unsplash.com/photo-1519315901367-f34ff9154487?q=80&w=2070&auto=format&fit=crop" alt="Swimming Pool" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a192f]/80 to-transparent"></div>
            </div>
            
            {/* Floating Card */}
            <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-3xl shadow-xl border border-slate-100 flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white">
                <Users size={24} />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-800">500+</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Athletes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}