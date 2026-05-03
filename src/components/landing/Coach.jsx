import React from "react";

export default function Coach() {
  const coaches = [
    { name: "Coach Budi", role: "Head Coach", exp: "15 Tahun Pengalaman", avatar: "Budi" },
    { name: "Coach Sarah", role: "Intermediate Trainer", exp: "Mantan Atlet Nasional", avatar: "Sarah" },
    { name: "Coach Andi", role: "Beginner Specialist", exp: "Sertifikasi FINA", avatar: "Andi" }
  ];

  return (
    <section id="coach" className="py-24 px-6 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-2">Our Team</h2>
          <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Dilatih Oleh Para Ahli</h3>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {coaches.map((c, i) => (
            <div key={i} className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100 text-center hover:shadow-xl hover:shadow-blue-900/5 transition-all">
              <div className="w-24 h-24 mx-auto bg-white rounded-full border-4 border-white shadow-lg overflow-hidden mb-6">
                <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${c.avatar}&backgroundColor=eff6ff&textColor=2563eb`} alt={c.name} className="w-full h-full object-cover" />
              </div>
              <h4 className="text-xl font-bold text-slate-800">{c.name}</h4>
              <p className="text-sm font-bold text-blue-500 uppercase tracking-widest mt-1 mb-3">{c.role}</p>
              <p className="text-sm text-slate-500 font-medium">{c.exp}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}