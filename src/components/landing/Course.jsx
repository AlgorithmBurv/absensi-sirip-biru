import React, { useEffect, useState } from "react";
import { Check, Droplets, Activity, Medal, Star } from "lucide-react";
import { supabase } from "../../utils/supabaseClient";

// Peta ikon agar nama ikon dari database berubah jadi komponen Lucide
const iconMap = { Droplets, Activity, Medal, Star };

export default function Course() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      const { data } = await supabase
        .from("landing_courses")
        .select("*")
        .eq("is_active", true)
        .order("created_at");
      if (data) setCourses(data);
    };
    fetchCourses();
  }, []);

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
            Siripbiru Programs <span className="text-white/30">^</span>
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
              <div
                key={c.id}
                className="flex flex-col items-center text-center group"
              >
                <div className="mb-6 text-[#00E5FF] transform group-hover:-translate-y-2 transition-transform duration-300">
                  <Icon size={48} strokeWidth={1} />
                </div>
                <h4 className="text-2xl font-serif text-white mb-2">
                  {c.title}
                </h4>
                <div className="flex flex-col items-center gap-2 mb-6 w-full">
                  <span className="text-sm font-bold text-[#00E5FF] uppercase tracking-widest">
                    {c.price} / bln
                  </span>
                  <div className="w-12 h-[1px] bg-white/20 mt-2"></div>
                </div>
                <p className="text-sm text-white/60 mb-8 max-w-xs leading-relaxed">
                  {c.description}
                </p>

                <ul className="space-y-3 text-left w-full max-w-[220px]">
                  {c.features?.map((f, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 text-[13px] text-white/80"
                    >
                      <Check
                        size={16}
                        className="text-[#00E5FF] flex-shrink-0 mt-0.5"
                      />{" "}
                      {f}
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
