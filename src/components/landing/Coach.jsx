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
function CoachCard({ c, isTouch }) {
  const [flipped, setFlipped] = useState(false);
  const imgRef = useRef(null);
  const [imgSrc, setImgSrc] = useState("");

  useEffect(() => {
    // lazy-load image when card is visible
    if (!imgRef.current) return;
    const el = imgRef.current;
    if (el.getAttribute("data-src") && "IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setImgSrc(el.getAttribute("data-src"));
            io.unobserve(el);
          }
        });
      });
      io.observe(el);
      return () => io.disconnect();
    }
    // fallback
    setImgSrc(el.getAttribute("data-src") || el.src);
  }, []);

  const handleToggle = () => setFlipped((v) => !v);

  return (
    <div className="cursor-pointer">
      <div className={`flip-card w-full aspect-[4/5] mb-6 ${flipped ? "is-flipped" : ""}`}>
        <div className="flip-card-inner">
          {/* DEPAN */}
          <div
            className="flip-card-front group"
            onClick={handleToggle}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handleToggle();
            }}
            role="button"
            tabIndex={0}
            aria-label={`Lihat detail ${c.name}`}
          >
            <div className="relative w-full h-full">
              <div className="absolute inset-0 bg-[#00E5FF] translate-x-0 translate-y-0 group-hover:translate-x-4 group-hover:translate-y-4 transition-transform duration-500 ease-out z-0"></div>
              <div className="relative z-10 w-full h-full overflow-hidden bg-slate-100">
                <img
                  ref={imgRef}
                  data-src={c.photo}
                  src={imgSrc || ""}
                  alt={c.name}
                  loading="lazy"
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
                {isTouch && (
                  <div className="absolute top-4 left-4 z-20 bg-black/40 text-white text-xs px-2 py-1 rounded">
                    Tap untuk detail
                  </div>
                )}
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
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(3);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const containerRef = useRef(null);
  const autoplayRef = useRef(null);
  const touchStartX = useRef(null);
  const resizeTimeout = useRef(null);

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

  // note: do not return early here — keep hooks order stable even before data loads

  // ===== CAROUSEL LOGIC =====
  useEffect(() => {
    // detect touch devices
    const touch = ("ontouchstart" in window) || navigator.maxTouchPoints > 0 || window.matchMedia("(hover: none)").matches;
    setIsTouchDevice(Boolean(touch));

    const calc = () => {
      const w = window.innerWidth;
      const v = w >= 1024 ? 3 : w >= 640 ? 2 : 1;
      setVisible(v);
    };
    // debounce resize
    const onResize = () => {
      clearTimeout(resizeTimeout.current);
      resizeTimeout.current = setTimeout(calc, 150);
    };
    calc();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(resizeTimeout.current);
    };
  }, []);

  const n = coaches.length;
  const clones = visible;
  const displayed = n > 0 ? [...coaches.slice(-clones), ...coaches, ...coaches.slice(0, clones)] : [];

  useEffect(() => {
    setIndex(clones);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, n]);

  const getSlideWidth = () => {
    if (!containerRef.current) return 0;
    return containerRef.current.clientWidth / visible;
  };

  const translateX = () => `translateX(${-(index * getSlideWidth())}px)`;

  useEffect(() => {
    if (!isPlaying || isPaused || n === 0) return;
    autoplayRef.current = setInterval(() => setIndex((i) => i + 1), 4500);
    return () => clearInterval(autoplayRef.current);
  }, [isPlaying, isPaused, n]);

  const pauseAndResume = (timeout = 4000) => {
    setIsPaused(true);
    clearInterval(autoplayRef.current);
    setTimeout(() => setIsPaused(false), timeout);
  };

  const handleTransitionEnd = () => {
    const maxIndex = clones + n - 1;
    if (index > maxIndex) {
      setTransitionEnabled(false);
      setIndex(clones);
    } else if (index < clones) {
      setTransitionEnabled(false);
      setIndex(maxIndex);
    }
  };

  useEffect(() => {
    if (!transitionEnabled) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setTransitionEnabled(true));
      });
    }
  }, [transitionEnabled]);

  const prev = () => {
    pauseAndResume();
    setIndex((i) => i - 1);
  };

  const next = () => {
    pauseAndResume();
    setIndex((i) => i + 1);
  };

  const goTo = (realIdx) => {
    pauseAndResume();
    setIndex(clones + realIdx);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    // pause during touch/drag
    setIsPaused(true);
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) setIndex((i) => i + 1);
    if (diff < -50) setIndex((i) => i - 1);
    touchStartX.current = null;
    // resume autoplay after short delay
    setTimeout(() => setIsPaused(false), 1200);
  };

  const togglePlay = () => {
    setIsPlaying((p) => !p);
  };

  const handleKeyDownRoot = (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
    } else if (e.key === " " || e.key === "Spacebar") {
      // Space toggles play/pause
      e.preventDefault();
      togglePlay();
    } else if (e.key === "Home") {
      e.preventDefault();
      goTo(0);
    } else if (e.key === "End") {
      e.preventDefault();
      goTo(n - 1);
    }
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
        @media (hover: hover) {
          .flip-card:hover .flip-card-inner { transform: rotateY(180deg); }
        }
        .flip-card.is-flipped .flip-card-inner { transform: rotateY(180deg); }
        .flip-card-front, .flip-card-back {
          position: absolute; width: 100%; height: 100%;
          backface-visibility: hidden; -webkit-backface-visibility: hidden;
        }
        .flip-card-back { transform: rotateY(180deg); }

        /* Carousel styles (scoped) */
        .coach-carousel{ position:relative; width:100%; margin:20px 0; }
        .cc-viewport{ overflow:hidden; width:100%; }
        .cc-track{ display:flex; align-items:stretch; }
        .cc-slide{ flex:0 0 auto; padding:12px; box-sizing:border-box; display:flex; flex-direction:column; }

        /* Consistent card heights without hard cut: use min-height and flexible layout */
        .cc-slide { min-height:480px; display:flex; flex-direction:column; }
        .flip-card{ flex:1 1 auto; }
        .pr-4{ flex:0 0 120px; }

        /* Ensure images cover the area */
        .flip-card-front .relative.z-10 img, .flip-card-back .relative img { width:100%; height:100%; object-fit:cover; }

        .cc-btn{ position:absolute; top:50%; transform:translateY(-50%); border:none; background:rgba(10,25,47,0.9); color:white; min-width:44px; min-height:44px; width:44px; height:44px; border-radius:999px; display:flex; align-items:center; justify-content:center; cursor:pointer; z-index:10; }
        .cc-btn.prev{ left:8px; }
        .cc-btn.next{ right:8px; }
        .cc-dots{ position:absolute; left:50%; transform:translateX(-50%); bottom:-18px; display:flex; gap:8px; }
        .cc-dots .dot{ width:9px; height:9px; border-radius:50%; background:rgba(15,23,42,0.12); border:none; cursor:pointer; }
        .cc-dots .dot.active{ background:#00E5FF; }

        @media (max-width:1024px){
          .cc-slide{ min-height:420px; }
          .pr-4{ flex:0 0 110px; }
        }

        @media (max-width:640px){
          .cc-btn{ min-width:44px; min-height:44px; }
          .cc-slide{ min-height:360px; }
          .pr-4{ flex:0 0 100px; }
        }

        /* Play/Pause button */
        .cc-play{ position:absolute; top:12px; right:12px; background:#00E5FF; color:#0A192F; border-radius:8px; padding:6px 10px; font-weight:700; z-index:12; min-width:44px; min-height:44px; display:flex; align-items:center; gap:8px; }
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

        {/* Carousel (responsive) */}
        <div
          className="coach-carousel"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          ref={containerRef}
          role="region"
          aria-label="Carousel Pelatih"
          tabIndex={0}
          onKeyDown={handleKeyDownRoot}
          onFocus={() => setIsPaused(true)}
          onBlur={() => setIsPaused(false)}
        >
          <button
            className="cc-play"
            onClick={togglePlay}
            aria-pressed={!isPlaying}
            aria-label={isPlaying ? "Jeda autoplay" : "Putar autoplay"}
          >
            {isPlaying ? "Jeda" : "Putar"}
          </button>
          <div className="cc-viewport">
            <div
              className="cc-track"
              aria-live="polite"
              aria-atomic="true"
              onTransitionEnd={handleTransitionEnd}
              style={{
                transform: translateX(),
                transition: transitionEnabled ? "transform 0.5s ease-in-out" : "none",
              }}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {displayed.map((c, i) => (
                <div
                  key={`slide-${c.id || i}`}
                  className="cc-slide"
                  style={{ width: `${100 / visible}%` }}
                >
                  <CoachCard c={c} isTouch={isTouchDevice} />
                </div>
              ))}
            </div>
          </div>

          <button className="cc-btn prev" onClick={prev} aria-label="Slide sebelumnya">
            ‹
          </button>
          <button className="cc-btn next" onClick={next} aria-label="Slide berikutnya">
            ›
          </button>

          <div className="cc-dots">
            {coaches.map((_, i) => (
              <button
                key={i}
                className={`dot ${index - clones === i ? "active" : ""}`}
                onClick={() => goTo(i)}
                aria-label={`Ke slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
