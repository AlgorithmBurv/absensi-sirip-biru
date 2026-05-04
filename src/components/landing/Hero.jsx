import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { supabase } from "../../utils/supabaseClient";

export default function Hero() {
  const [heroData, setHeroData] = useState({
    title: "Bangun kekuatan. Tingkatkan rekor. Jadilah juara.",
    subtitle: "Siripbiru Athletics",
    action_url: "/login",
    image_url:
      "https://images.unsplash.com/photo-1530549387789-4c1017266635?q=80&w=2070&auto=format&fit=crop",
  });

  useEffect(() => {
    const fetchHero = async () => {
      const { data } = await supabase
        .from("landing_settings")
        .select("*")
        .eq("section", "hero")
        .single();

      if (data) setHeroData(data);
    };

    fetchHero();
  }, []);

  return (
    <section className="relative w-full min-h-screen flex items-center justify-end overflow-hidden px-6 lg:px-24">
      {/* Background Image & Overlays */}
      <div className="absolute inset-0 z-0">
        <img
          src={
            heroData.image_url ||
            "https://images.unsplash.com/photo-1530549387789-4c1017266635?q=80&w=2070&auto=format&fit=crop"
          }
          alt="Professional Swimmer"
          className="w-full h-full object-cover object-center"
        />
        {/* Dark Navy Overlay to match the design */}
        <div className="absolute inset-0 bg-[#0A192F]/60 mix-blend-multiply"></div>
        {/* Gradient for text readability on the right */}
        <div className="absolute inset-0 bg-gradient-to-l from-[#0A192F]/90 via-[#0A192F]/40 to-transparent"></div>
      </div>

      {/* Main Content (Right Aligned) */}
      <div className="relative z-10 w-full max-w-2xl text-right pt-20">
        {/* Small subtitle */}
        <p className="text-[#00E5FF] text-xs font-bold uppercase tracking-[0.3em] mb-4 animate-in fade-in slide-in-from-right-8 duration-700">
          {heroData.subtitle}
        </p>

        {/* Render Judul secara dinamis */}
        <h1 className="text-5xl md:text-7xl font-serif text-white mb-8 leading-[1.2] animate-in fade-in slide-in-from-right-10 duration-700 delay-100">
          {heroData.title}
        </h1>

        {/* Cyan Button */}
        <div className="flex justify-end animate-in fade-in slide-in-from-right-12 duration-700 delay-300">
          <Link
            to={heroData.action_url || "/login"}
            className="px-8 py-4 bg-[#00E5FF] hover:bg-[#00B8CC] text-[#0A192F] text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-3"
          >
            <ArrowRight size={16} /> Mulai Berlatih
          </Link>
        </div>

        {/* Decorative Wave element */}
        <div className="flex justify-end mt-16 animate-in fade-in duration-1000 delay-500">
          <svg
            width="60"
            height="10"
            viewBox="0 0 60 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 5C5 5 5 0 10 0C15 0 15 5 20 5C25 5 25 10 30 10C35 10 35 5 40 5C45 5 45 0 50 0C55 0 55 5 60 5"
              stroke="#00E5FF"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}
