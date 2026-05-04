import React from "react";
import { ArrowRight } from "lucide-react";

export default function AboutUs() {
  return (
    <>
      {/* ===== ABOUT SECTION ===== */}
      <section id="about" className="py-24 lg:py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* Bagian Gambar (Kiri) */}
            <div className="relative w-full min-h-[500px] order-2 lg:order-1">
              <div className="absolute top-12 left-4 md:left-8 w-[70%] h-[320px] bg-[#00E5FF]"></div>
              <img
                src="https://images.unsplash.com/photo-1519315901367-f34ff9154487?q=80&w=2070&auto=format&fit=crop"
                alt="Swimmer in action"
                className="absolute top-0 right-0 w-[85%] h-[350px] object-cover shadow-md"
              />
              <img
                src="https://images.unsplash.com/photo-1530549387789-4c1017266635?q=80&w=2070&auto=format&fit=crop"
                alt="Swimming underwater"
                className="absolute bottom-0 left-0 w-[65%] h-[240px] object-cover border-8 border-white shadow-2xl"
              />
            </div>

            {/* Bagian Teks (Kanan) */}
            <div className="order-1 lg:order-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">
                Swimming Glory
              </p>

              <h3 className="text-4xl md:text-5xl font-light text-slate-900 mb-4">
                About{" "}
                <span className="font-serif font-bold text-[#0A192F]">
                  Siripbiru
                </span>
              </h3>

              <svg
                width="50"
                height="8"
                viewBox="0 0 60 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="mb-8"
              >
                <path
                  d="M0 5C5 5 5 0 10 0C15 0 15 5 20 5C25 5 25 10 30 10C35 10 35 5 40 5C45 5 45 0 50 0C55 0 55 5 60 5"
                  stroke="#00E5FF"
                  strokeWidth="2"
                />
              </svg>

              <p className="text-slate-500 leading-relaxed font-medium mb-8">
                Lebih dari sekadar klub renang. Kami memadukan dedikasi
                pelatihan fisik dengan presisi teknologi digital.{" "}
                <span className="font-bold text-[#0A192F]">
                  Siripbiru Swim Club
                </span>{" "}
                memastikan setiap metrik perkembangan atlet tercatat sempurna
                untuk mencetak juara masa depan.
              </p>

              <div className="space-y-6 mb-10">
                <div className="border-l-2 border-[#00E5FF] pl-4">
                  <h4 className="font-bold text-[#0A192F] text-sm uppercase tracking-wider">
                    Prestasi Terukur
                  </h4>
                  <p className="text-slate-500 mt-1 text-sm">
                    Kurikulum terstruktur yang didesain untuk mencetak atlet
                    tangguh di tingkat nasional.
                  </p>
                </div>

                <div className="border-l-2 border-[#00E5FF] pl-4">
                  <h4 className="font-bold text-[#0A192F] text-sm uppercase tracking-wider">
                    Fasilitas &amp; Data Pintar
                  </h4>
                  <p className="text-slate-500 mt-1 text-sm">
                    Pemantauan kehadiran dan progres latihan yang terintegrasi
                    langsung dalam portal digital.
                  </p>
                </div>
              </div>

              {/* FIXED BUTTON */}
              <a
                href="#course"
                className="inline-flex items-center gap-3 px-8 py-3.5 border-2 border-slate-200 rounded-full text-xs font-bold text-slate-800 uppercase tracking-[0.15em] hover:border-[#00E5FF] hover:text-[#00E5FF] transition-colors"
              >
                Find out more <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== GALLERY SECTION ===== */}
      <section id="gallery" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Header Galeri */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-3">
                Momen Terbaik
              </p>

              <h3 className="text-4xl md:text-5xl font-light text-slate-900">
                Our{" "}
                <span className="font-serif font-bold text-[#00E5FF]">
                  Gallery
                </span>
              </h3>
            </div>

            {/* FIXED LINK */}
            <a
              href="#"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-[0.15em] hover:text-[#00E5FF] transition-colors self-start md:self-auto"
            >
              Lihat semua <ArrowRight size={13} />
            </a>
          </div>

          {/* Grid Galeri */}
          <div className="grid grid-cols-2 md:grid-cols-3 grid-rows-3 gap-3 h-[520px] md:h-[560px]">
            <div className="relative col-span-1 row-span-2 overflow-hidden group">
              <img
                src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=800&auto=format&fit=crop"
                alt="Training session"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-[#00E5FF]/0 group-hover:bg-[#00E5FF]/20 transition-all duration-300" />
            </div>

            <div className="relative col-span-1 row-span-1 overflow-hidden group">
              <img
                src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=800&auto=format&fit=crop"
                alt="Competition"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-[#00E5FF]/0 group-hover:bg-[#00E5FF]/20 transition-all duration-300" />
            </div>

            <div className="relative col-span-1 row-span-1 overflow-hidden group">
              <img
                src="https://images.unsplash.com/photo-1519315901367-f34ff9154487?q=80&w=800&auto=format&fit=crop"
                alt="Swimmer in action"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-[#00E5FF]/0 group-hover:bg-[#00E5FF]/20 transition-all duration-300" />
            </div>

            <div className="relative col-span-2 row-span-1 overflow-hidden group">
              <img
                src="https://images.unsplash.com/photo-1530549387789-4c1017266635?q=80&w=1200&auto=format&fit=crop"
                alt="Swimming underwater"
                className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-[#00E5FF]/0 group-hover:bg-[#00E5FF]/20 transition-all duration-300" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}