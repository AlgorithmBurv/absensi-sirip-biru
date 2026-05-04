import React, { useEffect, useState, useRef } from "react";
import { supabase } from "../../utils/supabaseClient";

// ===== ICON COMPONENTS =====
const InstagramIcon = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const TwitterIcon = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const LinkedinIcon = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" rx="1" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

// ===== COACH CARD COMPONENT =====
function CoachCard({ c }) {
  return (
    <div className="cursor-pointer">
      <div className="flip-card w-full aspect-[4/5] mb-6">
        <div className="flip-card-inner">
          {/* DEPAN */}
          <div className="flip-card-front group">
            <div className="relative w-full h-full">
              <div className="absolute inset-0 bg-[#00E5FF] translate-x-0 translate-y-0 group-hover:translate-x-4 group-hover:translate-y-4 transition-transform duration-500 ease-out z-0"></div>
              <div className="relative z-10 w-full h-full overflow-hidden bg-slate-100">
                <img
                  src={c.photo}
                  alt={c.name}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A192F]/80 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-5 z-20">
                  <p className="text-[10px] font-bold text-[#00E5FF] uppercase tracking-[0.2em] mb-1">
                    {c.role}
                  </p>
                  <h4 className="text-2xl font-serif font-bold text-white">
                    {c.nickname}
                  </h4>
                </div>
                <div className="absolute top-4 right-4 z-20 bg-[#00E5FF]/90 px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-[9px] font-bold text-[#0A192F] uppercase tracking-widest">
                    Lihat Profil
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* BELAKANG */}
          <div className="flip-card-back bg-[#0A192F] border-t-2 border-[#00E5FF] p-8 flex flex-col justify-between">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#00E5FF] flex-shrink-0">
                <img
                  src={c.photo}
                  alt={c.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="text-lg font-serif font-bold text-white leading-tight">
                  {c.name}
                </h4>
                <p className="text-[#00E5FF] text-[10px] uppercase tracking-[0.2em] font-bold">
                  {c.role}
                </p>
              </div>
            </div>

            <div className="w-full h-px bg-white/10 mb-6"></div>

            <div className="space-y-3 mb-6 flex-1">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
                  Usia
                </span>
                <span className="text-sm font-bold text-white">
                  {c.age} Tahun
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
                  Asal
                </span>
                <span className="text-sm font-bold text-white">
                  {c.nationality}
                </span>
              </div>
              <div className="flex justify-between items-start gap-4">
                <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold flex-shrink-0">
                  Spesialis
                </span>
                <span className="text-sm font-bold text-white text-right">
                  {c.speciality}
                </span>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-3">
                Pencapaian
              </p>
              <ul className="space-y-2">
                {c.achievements.map((a, j) => (
                  <li key={j} className="flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-[#00E5FF] mt-2 flex-shrink-0"></span>
                    <span className="text-xs text-white/70 font-medium">
                      {a}
                    </span>
                  </li>
                ))}
                {c.achievements.length === 0 && (
                  <li className="text-xs text-white/50 italic">
                    Belum ada pencapaian.
                  </li>
                )}
              </ul>
            </div>

            <div className="flex items-center gap-4 text-white/30 pt-4 border-t border-white/10">
              <a href="#" className="hover:text-[#00E5FF] transition-colors">
                <InstagramIcon size={15} />
              </a>
              <a href="#" className="hover:text-[#00E5FF] transition-colors">
                <TwitterIcon size={15} />
              </a>
              <a href="#" className="hover:text-[#00E5FF] transition-colors">
                <LinkedinIcon size={15} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Info bawah card */}
      <div className="pr-4">
        <p className="text-[10px] font-bold text-[#00E5FF] uppercase tracking-[0.2em] mb-2">
          {c.role}
        </p>
        <h4 className="text-2xl font-serif font-bold text-[#0A192F] mb-3">
          {c.name}
        </h4>
        <p className="text-sm text-slate-500 font-medium leading-relaxed line-clamp-3">
          {c.exp}
        </p>
      </div>
    </div>
  );
}

// ===== MAIN COMPONENT =====
export default function Coach() {
  const [coaches, setCoaches] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef(null);

  useEffect(() => {
    const fetchCoaches = async () => {
      const { data, error } = await supabase
        .from("coaches")
        .select(
          `
          id,
          specialty,
          nickname,
          role_title,
          experience_desc,
          age,
          nationality,
          achievements,
          photo_url,
          users ( full_name )
        `,
        )
        .eq("show_on_landing", true)
        .order("created_at", { ascending: true });

      if (data && !error) {
        const formattedCoaches = data.map((c) => ({
          id: c.id,
          name: c.users?.full_name || "Instruktur",
          nickname: c.nickname || "Coach",
          role: c.role_title || "Pelatih",
          exp: c.experience_desc || "Pelatih renang profesional.",
          age: c.age || "-",
          nationality: c.nationality || "Indonesia",
          speciality: c.specialty || "Berenang Umum",
          achievements: Array.isArray(c.achievements) ? c.achievements : [],
          photo:
            c.photo_url ||
            "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1470&auto=format&fit=crop",
        }));
        setCoaches(formattedCoaches);
      }
    };

    fetchCoaches();
  }, []);

  if (coaches.length === 0) return null;

  // ===== SWIPE HANDLERS =====
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) setActiveIndex((i) => Math.min(i + 1, coaches.length - 1));
    if (diff < -50) setActiveIndex((i) => Math.max(i - 1, 0));
    touchStartX.current = null;
  };

  return (
    <section id="coach" className="py-24 lg:py-32 px-6 bg-white relative">
      <style>{`
        .flip-card { perspective: 1000px; }
        .flip-card-inner {
          position: relative; width: 100%; height: 100%;
          transition: transform 0.7s cubic-bezier(0.4, 0.2, 0.2, 1);
          transform-style: preserve-3d;
        }
        .flip-card:hover .flip-card-inner { transform: rotateY(180deg); }
        .flip-card-front, .flip-card-back {
          position: absolute; width: 100%; height: 100%;
          backface-visibility: hidden; -webkit-backface-visibility: hidden;
        }
        .flip-card-back { transform: rotateY(180deg); }
      `}</style>

      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="text-center mb-20">
          <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">
            Meet The Team
          </h2>
          <h3 className="text-4xl md:text-5xl font-serif font-bold text-[#0A192F] mb-6">
            Pelatih <span className="font-light">Terbaik.</span>
          </h3>
          <svg
            width="60"
            height="10"
            viewBox="0 0 60 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mx-auto"
          >
            <path
              d="M0 5C5 5 5 0 10 0C15 0 15 5 20 5C25 5 25 10 30 10C35 10 35 5 40 5C45 5 45 0 50 0C55 0 55 5 60 5"
              stroke="#00E5FF"
              strokeWidth="2"
            />
          </svg>
        </div>

        {/* DESKTOP: grid 3 kolom */}
        <div className="hidden md:grid md:grid-cols-3 gap-12 lg:gap-16">
          {coaches.map((c) => (
            <CoachCard key={c.id} c={c} />
          ))}
        </div>

        {/* MOBILE: 1 card + swipe */}
        <div className="md:hidden">
          <div
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="select-none"
          >
            <CoachCard c={coaches[activeIndex]} />
          </div>

          {/* Navigasi dots + tombol */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => setActiveIndex((i) => Math.max(i - 1, 0))}
              disabled={activeIndex === 0}
              className="w-9 h-9 rounded-full border border-[#00E5FF] text-[#00E5FF] flex items-center justify-center text-xl disabled:opacity-30 transition-opacity"
            >
              ‹
            </button>

            <div className="flex items-center gap-2">
              {coaches.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === activeIndex
                      ? "w-4 h-2 bg-[#00E5FF]"
                      : "w-2 h-2 bg-[#00E5FF]/30"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() =>
                setActiveIndex((i) => Math.min(i + 1, coaches.length - 1))
              }
              disabled={activeIndex === coaches.length - 1}
              className="w-9 h-9 rounded-full border border-[#00E5FF] text-[#00E5FF] flex items-center justify-center text-xl disabled:opacity-30 transition-opacity"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
