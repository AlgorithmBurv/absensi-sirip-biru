import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  // Efek transparan saat di atas, dan solid navy saat di-scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-colors duration-300 ${scrolled ? "bg-[#0A192F] shadow-lg" : "bg-transparent"}`}
    >
      <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
        {/* Logo Text */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-2xl tracking-widest text-white uppercase">
            SIRIP<span className="text-[#00E5FF]">BIRU</span>
          </span>
        </div>

        {/* Navigasi Desktop */}
        <nav className="hidden md:flex items-center gap-10 text-xs font-bold uppercase tracking-widest text-white/80">
          <a
            href="#about"
            className="hover:text-[#00E5FF] transition-colors pb-1 border-b-2 border-transparent hover:border-[#00E5FF]"
          >
            About
          </a>
          <a
            href="#course"
            className="hover:text-[#00E5FF] transition-colors pb-1 border-b-2 border-transparent hover:border-[#00E5FF]"
          >
            Programs
          </a>
          <a
            href="#coach"
            className="hover:text-[#00E5FF] transition-colors pb-1 border-b-2 border-transparent hover:border-[#00E5FF]"
          >
            Coaches
          </a>
          <a
            href="#testimonials"
            className="hover:text-[#00E5FF] transition-colors pb-1 border-b-2 border-transparent hover:border-[#00E5FF]"
          >
            Reviews
          </a>
        </nav>

        {/* Action Button */}
        <div>
          <Link
            to="/login"
            className="text-xs uppercase font-bold text-white hover:text-[#00E5FF] transition-colors flex items-center gap-2"
          >
            Access Portal <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </header>
  );
}
