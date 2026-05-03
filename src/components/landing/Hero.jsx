import React from "react";
import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="relative flex flex-col items-center justify-center px-4 pt-40 pb-24 text-center min-h-[90vh]">
      {/* Dekorasi Background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-400/20 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

      <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 font-bold text-sm mb-6 border border-blue-100">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
          </span>
          System v2.0 is Live
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold text-[#0a192f] tracking-tight mb-6 leading-tight">
          Modernize Your <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
            Swim Club
          </span> Management.
        </h1>
        
        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
          The all-in-one digital platform for Siripbiru Swim Club. Seamlessly track attendance with QR passes, manage coach schedules, and monitor athlete progression.
        </p>

        <Link 
          to="/login" 
          className="inline-flex px-8 py-4 bg-[#0a192f] hover:bg-slate-800 text-white font-bold rounded-2xl shadow-xl shadow-slate-900/20 transition-all active:scale-95 text-lg items-center justify-center gap-2"
        >
          Access Portal
        </Link>
      </div>
    </section>
  );
}