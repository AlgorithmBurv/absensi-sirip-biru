import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Waves } from "lucide-react";

export default function Navbar() {
  return (
    <header className="fixed top-0 w-full px-6 py-4 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex justify-between items-center bg-white/80 backdrop-blur-md px-6 py-4 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
            <Waves size={24} className="text-white" />
          </div>
          <span className="font-black text-xl tracking-wide text-slate-800">
            Sirip<span className="text-blue-600">biru</span>
          </span>
        </div>
        
        {/* Menu Navigasi Desktop */}
        <nav className="hidden md:flex items-center gap-8 font-bold text-sm text-slate-500">
          <a href="#about" className="hover:text-blue-600 transition-colors">About</a>
          <a href="#course" className="hover:text-blue-600 transition-colors">Programs</a>
          <a href="#coach" className="hover:text-blue-600 transition-colors">Coaches</a>
          <a href="#testimonials" className="hover:text-blue-600 transition-colors">Reviews</a>
        </nav>

        <div>
          <Link 
            to="/login" 
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-600/20 transition-all active:scale-95 flex items-center gap-2 text-sm"
          >
            Portal Login <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </header>
  );
}