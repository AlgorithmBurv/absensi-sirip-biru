import React, { useState, useEffect, useCallback } from "react";
import { Quote, ChevronLeft, ChevronRight } from "lucide-react";

export default function Testimonials() {
  const reviews = [
    {
      name: "Ibu Dina",
      role: "Orang Tua Atlet",
      text: "Sistem QR pass-nya sangat memudahkan saya memantau kehadiran anak. Laporannya real-time dan pelatihnya sangat profesional!",
    },
    {
      name: "Reza Aditya",
      role: "Atlet Kelas Elite",
      text: "Fokus latihan jadi maksimal karena jadwal dan sesi terorganisir rapi. Evaluasi yang mendetail sangat membantu memperbaiki waktu renang saya.",
    },
    {
      name: "Pak Hendra",
      role: "Orang Tua Atlet",
      text: "Fasilitas kelas dunia dan sistem yang transparan. Progres anak saya sangat terlihat jelas sejak bulan pertama bergabung dengan Siripbiru.",
    },
  ];

  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const goTo = useCallback(
    (index) => {
      if (isAnimating) return;
      setIsAnimating(true);
      setTimeout(() => {
        setCurrent((index + reviews.length) % reviews.length);
        setIsAnimating(false);
      }, 300);
    },
    [isAnimating, reviews.length],
  );

  const prev = () => goTo(current - 1);
  const next = () => goTo(current + 1);

  // Auto-play setiap 5 detik
  useEffect(() => {
    const timer = setInterval(() => {
      goTo(current + 1);
    }, 5000);
    return () => clearInterval(timer);
  }, [current, goTo]);

  return (
    <section
      id="testimonials"
      className="py-24 lg:py-32 px-6 bg-[#0A192F] relative overflow-hidden"
    >
      {/* Ornamen Latar Belakang */}
      <div className="absolute -right-20 top-10 opacity-5 pointer-events-none">
        <Quote size={400} className="text-white" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="text-center mb-20">
          <h2 className="text-[10px] font-bold text-[#00E5FF] uppercase tracking-[0.2em] mb-4">
            Success Stories
          </h2>
          <h3 className="text-4xl md:text-5xl font-serif text-white mb-6">
            Cerita <span className="font-light opacity-80">Mereka.</span>
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

        {/* ===== CAROUSEL ===== */}
        <div className="relative">
          {/* Card Utama */}
          <div
            className={`transition-opacity duration-300 ${
              isAnimating ? "opacity-0" : "opacity-100"
            }`}
          >
            {/* Desktop: tampil 3 sekaligus | Mobile: 1 card */}
            <div className="hidden md:grid md:grid-cols-3 gap-8">
              {[0, 1, 2].map((offset) => {
                const index = (current + offset) % reviews.length;
                const r = reviews[index];
                const isActive = offset === 0;
                return (
                  <div
                    key={index}
                    className={`p-10 border-t-2 relative group transition-all duration-300 ${
                      isActive
                        ? "bg-white/10 border-[#00E5FF] scale-[1.02]"
                        : "bg-white/5 border-white/10 opacity-60"
                    }`}
                  >
                    <Quote
                      size={32}
                      className={`mb-8 transition-all duration-300 ${
                        isActive
                          ? "text-[#00E5FF] opacity-100"
                          : "text-[#00E5FF] opacity-20"
                      }`}
                      strokeWidth={1.5}
                    />
                    <p className="text-white/70 leading-loose font-medium mb-10 text-sm">
                      "{r.text}"
                    </p>
                    <div>
                      <h4 className="text-xl font-serif font-bold text-white mb-1">
                        {r.name}
                      </h4>
                      <p className="text-[#00E5FF] text-[10px] uppercase tracking-[0.2em] font-bold">
                        {r.role}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile: 1 card */}
            <div className="md:hidden">
              <div className="bg-white/10 p-8 border-t-2 border-[#00E5FF]">
                <Quote
                  size={28}
                  className="text-[#00E5FF] mb-6"
                  strokeWidth={1.5}
                />
                <p className="text-white/70 leading-loose font-medium mb-8 text-sm">
                  "{reviews[current].text}"
                </p>
                <div>
                  <h4 className="text-xl font-serif font-bold text-white mb-1">
                    {reviews[current].name}
                  </h4>
                  <p className="text-[#00E5FF] text-[10px] uppercase tracking-[0.2em] font-bold">
                    {reviews[current].role}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Kontrol Navigasi */}
          <div className="flex items-center justify-between mt-10">
            {/* Dots Indicator */}
            <div className="flex items-center gap-2">
              {reviews.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`transition-all duration-300 rounded-full ${
                    i === current
                      ? "w-8 h-2 bg-[#00E5FF]"
                      : "w-2 h-2 bg-white/20 hover:bg-white/40"
                  }`}
                />
              ))}
            </div>

            {/* Tombol Prev / Next */}
            <div className="flex items-center gap-3">
              <button
                onClick={prev}
                className="w-11 h-11 border border-white/20 flex items-center justify-center text-white/60 hover:border-[#00E5FF] hover:text-[#00E5FF] transition-colors duration-200"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={next}
                className="w-11 h-11 border border-white/20 flex items-center justify-center text-white/60 hover:border-[#00E5FF] hover:text-[#00E5FF] transition-colors duration-200"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
