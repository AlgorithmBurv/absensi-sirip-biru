import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Menu, X } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-[#0A192F] shadow-lg py-4" : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center relative">
        {/* Logo */}
        <div className="flex items-center gap-2 z-50">
          <img
            src="/sirip_biru.webp"
            alt="Sirip Biru Logo"
            className="h-8 w-auto object-contain"
          />
          <span className="font-bold text-2xl tracking-widest text-white uppercase">
            SIRIP<span className="text-[#00E5FF]">BIRU</span>
          </span>
        </div>

        {/* NAVIGASI DESKTOP */}
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

        {/* Action Button Desktop */}
        <div className="hidden md:block z-50">
          <Link
            to="/login"
            className="text-xs uppercase font-bold text-white hover:text-[#00E5FF] transition-colors flex items-center gap-2"
          >
            Access Portal <ArrowRight size={14} />
          </Link>
        </div>

        {/* TOMBOL TOGGLE MOBILE MENU */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden text-white z-50 p-2 -mr-2"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* MOBILE MENU */}
      <div
        className={`md:hidden absolute top-full left-0 w-full bg-[#0A192F]/95 backdrop-blur-md border-t border-white/10 transition-all duration-300 origin-top overflow-hidden shadow-2xl ${
          isMobileMenuOpen ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0"
        }`}
      >
        <div className="flex flex-col px-6 py-6 gap-6">
          <a
            href="#about"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-sm font-bold uppercase tracking-widest text-white/80 hover:text-[#00E5FF] transition-colors"
          >
            About
          </a>

          <a
            href="#course"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-sm font-bold uppercase tracking-widest text-white/80 hover:text-[#00E5FF] transition-colors"
          >
            Programs
          </a>

          <a
            href="#coach"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-sm font-bold uppercase tracking-widest text-white/80 hover:text-[#00E5FF] transition-colors"
          >
            Coaches
          </a>

          <a
            href="#testimonials"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-sm font-bold uppercase tracking-widest text-white/80 hover:text-[#00E5FF] transition-colors"
          >
            Reviews
          </a>

          <div className="h-px w-full bg-white/10 my-2"></div>

          <Link
            to="/login"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#00E5FF]"
          >
            Access Portal <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </header>
  );
}