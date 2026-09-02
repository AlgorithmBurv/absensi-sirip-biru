import React, { useEffect, useRef, useState } from "react";
import { Check, Droplets, Activity, Medal, Star } from "lucide-react";
import { supabase } from "../../utils/supabaseClient";

// Peta ikon agar nama ikon dari database berubah jadi komponen Lucide
const iconMap = { Droplets, Activity, Medal, Star };

export default function Course() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchCourses = async () => {
      try {
        const { data } = await supabase
          .from("landing_courses")
          .select("*")
          .eq("is_active", true)
          .order("created_at");
        if (mounted) setCourses(data || []);
      } catch (e) {
        console.error(e);
        if (mounted) setCourses([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchCourses();
    return () => (mounted = false);
  }, []);

  // Responsive visible count
  const [visible, setVisible] = useState(3);
  const resizeTimeout = useRef(null);
  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      setVisible(w >= 1024 ? 3 : w >= 640 ? 2 : 1);
    };
    calc();
    const onResize = () => {
      clearTimeout(resizeTimeout.current);
      resizeTimeout.current = setTimeout(calc, 150);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(resizeTimeout.current);
    };
  }, []);

  // If not enough items to need carousel, render static grid (edge case)
  if (!loading && courses.length <= visible) {
    return (
      <section
        id="course"
        className="relative py-24 px-6 bg-[#0A192F] overflow-hidden border-t border-[#00E5FF]/20"
      >
        <div className="absolute inset-0 z-0 opacity-10 mix-blend-overlay">
          <img
            src="https://images.unsplash.com/photo-1519315901367-f34ff9154487?q=80&w=2070&auto=format&fit=crop"
            alt="Water background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-[10px] font-bold text-[#00E5FF] uppercase tracking-[0.2em] mb-4 flex items-center justify-center gap-2">
              Program Siripbiru <span className="text-white/30">^</span>
            </h2>
            <svg
              width="60"
              height="10"
              viewBox="0 0 60 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mx-auto mb-6"
            >
              <path
                d="M0 5C5 5 5 0 10 0C15 0 15 5 20 5C25 5 25 10 30 10C35 10 35 5 40 5C45 5 45 0 50 0C55 0 55 5 60 5"
                stroke="#00E5FF"
                strokeWidth="2"
              />
            </svg>
          </div>

          <div className="grid md:grid-cols-3 gap-16 md:gap-8">
            {courses.map((c) => {
              const Icon = iconMap[c.icon_name] || Star; // Tentukan Ikon
              return (
                <div key={c.id} className="flex flex-col items-center text-center group">
                  <div className="mb-6 text-[#00E5FF] transform group-hover:-translate-y-2 transition-transform duration-300">
                    <Icon size={48} strokeWidth={1} />
                  </div>
                  <h4 className="text-2xl font-serif text-white mb-2">{c.title}</h4>
                  <div className="flex flex-col items-center gap-2 mb-6 w-full">
                    <span className="text-sm font-bold text-[#00E5FF] uppercase tracking-widest">{c.price} / bln</span>
                    <div className="w-12 h-[1px] bg-white/20 mt-2"></div>
                  </div>
                  <p className="text-sm text-white/60 mb-8 max-w-xs leading-relaxed line-clamp-3">{c.description}</p>
                  <ul className="space-y-3 text-left w-full max-w-[220px]">
                    {c.features?.map((f, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-[13px] text-white/80">
                        <Check size={16} className="text-[#00E5FF] flex-shrink-0 mt-0.5" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  // CAROUSEL STATE
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const [index, setIndex] = useState(0);
  const dragging = useRef(false);
  const startX = useRef(0);
  const currentTranslate = useRef(0);
  const prevTranslate = useRef(0);
  const lastTime = useRef(0);
  const velocity = useRef(0);
  const cardWidthRef = useRef(0);
  const gapRef = useRef(20);
  const lastVisibleRef = useRef(visible);

  const maxIndex = Math.max(0, courses.length - visible);

  const getSlideWidth = () => {
    // return full step including gap
    return (cardWidthRef.current || 0) + (gapRef.current || 0);
  };

  // update transform
  const setTrackTransform = (value, withTransition = false) => {
    const t = trackRef.current;
    if (!t) return;
    t.style.transition = withTransition ? "transform 350ms ease-in-out" : "none";
    t.style.transform = `translateX(${value}px)`;
  };

  // set to index
  const goToIndex = (i) => {
    const clamped = Math.max(0, Math.min(i, maxIndex));
    setIndex(clamped);
    const sw = getSlideWidth();
    prevTranslate.current = -clamped * sw;
    currentTranslate.current = prevTranslate.current;
    setTrackTransform(currentTranslate.current, true);
  };

  useEffect(() => {
    // initialize to index 0
    // compute card width and gap then set index within bounds
    const computeLayout = () => {
      const vp = viewportRef.current;
      if (!vp) return;
      const cw = vp.clientWidth;
      // gap per breakpoint
      const gap = visible === 3 ? 24 : visible === 2 ? 20 : 12;
      gapRef.current = gap;
      let cardW;
      // mobile peek behavior (only when visible===1)
      if (visible === 1 && cw < 640) {
        const peek = 0.12; // 12% peek of viewport
        cardW = Math.round(cw * (1 - peek));
      } else {
        // distribute remaining width after gaps evenly
        cardW = Math.round((cw - gap * (visible - 1)) / visible);
      }
      cardWidthRef.current = cardW;
      // clamp index to valid range
      const maxIdx = Math.max(0, courses.length - visible);
      const newIdx = Math.max(0, Math.min(index, maxIdx));
      // reset previous translate and apply
      prevTranslate.current = -newIdx * (cardW + gap);
      currentTranslate.current = prevTranslate.current;
      setIndex(newIdx);
      setTrackTransform(currentTranslate.current, false);
    };

    computeLayout();
    lastVisibleRef.current = visible;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, courses.length]);

  // pointer handlers for drag (mouse & touch unified)
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;

    const onPointerDown = (e) => {
      dragging.current = true;
      vp.setPointerCapture(e.pointerId);
      startX.current = e.clientX;
      lastTime.current = performance.now();
      velocity.current = 0;
      prevTranslate.current = currentTranslate.current;
      setTrackTransform(currentTranslate.current, false);
      // pause autoplay if any (not implemented here)
    };

    const onPointerMove = (e) => {
      if (!dragging.current) return;
      const dx = e.clientX - startX.current;
      const now = performance.now();
      const dt = now - lastTime.current || 16;
      const newTranslate = prevTranslate.current + dx;
      currentTranslate.current = newTranslate;
      setTrackTransform(currentTranslate.current, false);
      velocity.current = (e.clientX - (startX.current + (prevTranslate.current - currentTranslate.current))) / dt; // approximate
      lastTime.current = now;
    };

    const onPointerUp = (e) => {
      if (!dragging.current) return;
      dragging.current = false;
      try { vp.releasePointerCapture(e.pointerId); } catch (err) {}
      // compute swipe distance and velocity
      const dx = currentTranslate.current - prevTranslate.current;
      const step = getSlideWidth() || 1;
      // determine target index using velocity + position
      const movedSlides = -currentTranslate.current / step;
      let target = Math.round(movedSlides);
      // momentum: if velocity significant, push further
      const v = (e.velocityX || velocity.current) || 0;
      const veloThreshold = 0.3; // px/ms approx
      if (Math.abs(v) > veloThreshold) {
        target += v < 0 ? 1 : -1;
      } else {
        // also threshold by pixel
        const pxDiff = (currentTranslate.current - prevTranslate.current);
        if (Math.abs(pxDiff) > 80) target += pxDiff < 0 ? 1 : -1;
      }
      target = Math.max(0, Math.min(target, maxIndex));
      goToIndex(target);
    };

    vp.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);

    return () => {
      vp.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, courses.length]);

  // navigation handlers
  const prev = () => goToIndex(index - 1);
  const next = () => goToIndex(index + 1);

  // keyboard
  const onKeyDown = (e) => {
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
  };

  // render skeleton when loading
  const skeletonCount = 3;

  return (
    <section id="course" className="relative py-24 px-6 bg-[#0A192F] overflow-hidden border-t border-[#00E5FF]/20">
      <div className="absolute inset-0 z-0 opacity-10 mix-blend-overlay">
        <img
          src="https://images.unsplash.com/photo-1519315901367-f34ff9154487?q=80&w=2070&auto=format&fit=crop"
          alt="Water background"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-[10px] font-bold text-[#00E5FF] uppercase tracking-[0.2em] mb-4 flex items-center justify-center gap-2">
            Siripbiru Programs <span className="text-white/30">^</span>
          </h2>
          <svg width="60" height="10" viewBox="0 0 60 10" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-6">
            <path d="M0 5C5 5 5 0 10 0C15 0 15 5 20 5C25 5 25 10 30 10C35 10 35 5 40 5C45 5 45 0 50 0C55 0 55 5 60 5" stroke="#00E5FF" strokeWidth="2" />
          </svg>
        </div>

        {/* Carousel viewport */}
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div />
            <div className="hidden md:flex items-center gap-3">
              <button aria-label="Slide sebelumnya" onClick={prev} className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-white/6 text-white flex items-center justify-center">‹</button>
              <button aria-label="Slide berikutnya" onClick={next} className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-white/6 text-white flex items-center justify-center">›</button>
            </div>
          </div>

          <div
            ref={viewportRef}
            className="course-viewport relative"
            style={{ overflow: "hidden" }}
            onKeyDown={onKeyDown}
            tabIndex={0}
            role="region"
            aria-label="Carousel program"
          >
            <div
              ref={trackRef}
              className="course-track flex"
              style={{
                willChange: "transform",
                touchAction: "pan-y",
                display: "flex",
                flexWrap: "nowrap",
                alignItems: "flex-start",
              }}
              aria-live="polite"
            >
              {loading
                ? Array.from({ length: skeletonCount }).map((_, i, arr) => {
                    const cw = cardWidthRef.current || (viewportRef.current ? Math.round(viewportRef.current.clientWidth / visible) : 0);
                    const gap = gapRef.current || 20;
                    const isLast = i === arr.length - 1;
                    const style = { width: cw ? `${cw}px` : `${100 / visible}%`, padding: 12, boxSizing: "border-box", marginRight: isLast ? 0 : `${gap}px`, flex: '0 0 auto' };
                    return (
                      <div key={i} style={style}>
                        <div className="bg-white/6 rounded-xl p-6 min-h-[320px] animate-pulse"></div>
                      </div>
                    );
                  })
                : courses.map((c, idx) => {
                    const Icon = iconMap[c.icon_name] || Star;
                    const cw = cardWidthRef.current || (viewportRef.current ? Math.round(viewportRef.current.clientWidth / visible) : 0);
                    const gap = gapRef.current || 20;
                    const isLast = idx === courses.length - 1;
                    const outerStyle = { width: cw ? `${cw}px` : `${100 / visible}%`, padding: 12, boxSizing: "border-box", marginRight: isLast ? 0 : `${gap}px`, flex: '0 0 auto' };
                    return (
                      <div key={c.id} style={outerStyle}>
                        <div className="flex flex-col items-center text-center group bg-[#0A192F] rounded-xl p-6" style={{ minHeight: 320 }}>
                          <div className="mb-6 text-[#00E5FF] transition-transform duration-300 group-hover:-translate-y-2">
                            <Icon size={48} strokeWidth={1} />
                          </div>
                          <h4 className="text-2xl font-serif text-white mb-2">{c.title}</h4>
                          <div className="flex flex-col items-center gap-2 mb-6 w-full">
                            <span className="text-sm font-bold text-[#00E5FF] uppercase tracking-widest">{c.price} / bln</span>
                            <div className="w-12 h-[1px] bg-white/20 mt-2"></div>
                          </div>
                          <p className="text-sm text-white/60 mb-6 max-w-xs leading-relaxed line-clamp-3">{c.description}</p>
                          <ul className="space-y-3 text-left w-full max-w-[220px] mt-auto">
                            {c.features?.map((f, idx) => (
                              <li key={idx} className="flex items-start gap-3 text-[13px] text-white/80">
                                <Check size={16} className="text-[#00E5FF] flex-shrink-0 mt-0.5" /> {f}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    );
                  })}
            </div>
          </div>

          {/* dots */}
          {!loading && (
            <div className="flex items-center justify-center gap-3 mt-6">
              {Array.from({ length: courses.length - visible + 1 > 0 ? courses.length - visible + 1 : 1 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToIndex(i)}
                  aria-label={`Ke program ${i + 1}`}
                  className={`w-3 h-3 rounded-full ${i === index ? 'bg-[#00E5FF]' : 'bg-white/30'}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
