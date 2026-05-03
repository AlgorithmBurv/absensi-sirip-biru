import React from "react";
import { Waves } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#050d18] text-slate-400 py-12 px-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-3">
          <Waves size={24} className="text-blue-500" />
          <span className="font-black text-xl tracking-wide text-white">
            Sirip<span className="text-blue-500">biru</span>
          </span>
        </div>
        <div className="text-sm font-medium text-slate-500 text-center md:text-right">
          <p>&copy; {new Date().getFullYear()} Siripbiru Swim Club. All rights reserved.</p>
          <p className="mt-1">Built with React & Supabase</p>
        </div>
      </div>
    </footer>
  );
}