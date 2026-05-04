import React, { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { supabase } from "../../utils/supabaseClient";

export default function AboutUs() {
  const [aboutData, setAboutData] = useState({
    title: "About Siripbiru",
    subtitle: "Loading...",
  });
  const [gallery, setGallery] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch data teks
      const { data: settings } = await supabase
        .from("landing_settings")
        .select("*")
        .eq("section", "about")
        .single();

      // Fetch gambar galeri
      const { data: images } = await supabase
        .from("landing_gallery")
        .select("*")
        .order("sort_order", { ascending: true });

      if (settings) setAboutData(settings);
      if (images) setGallery(images);
    };
    fetchData();
  }, []);

  return (
    <>
      {/* ===== ABOUT SECTION ===== */}
      <section id="about" className="py-24 lg:py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* Bagian Gambar (Kiri) - Menggunakan 2 gambar pertama dari galeri jika ada */}
            <div className="relative w-full min-h-[500px] order-2 lg:order-1">
              <div className="absolute top-12 left-4 md:left-8 w-[70%] h-[320px] bg-[#00E5FF]"></div>
              <img
                src={
                  gallery.length > 0
                    ? gallery[0].image_url
                    : "https://images.unsplash.com/photo-1519315901367-f34ff9154487?q=80&w=2070&auto=format&fit=crop"
                }
                alt={
                  gallery.length > 0 ? gallery[0].alt_text : "Swimmer in action"
                }
                className="absolute top-0 right-0 w-[85%] h-[350px] object-cover shadow-md"
              />
              <img
                src={
                  gallery.length > 1
                    ? gallery[1].image_url
                    : "https://images.unsplash.com/photo-1530549387789-4c1017266635?q=80&w=2070&auto=format&fit=crop"
                }
                alt={
                  gallery.length > 1
                    ? gallery[1].alt_text
                    : "Swimming underwater"
                }
                className="absolute bottom-0 left-0 w-[65%] h-[240px] object-cover border-8 border-white shadow-2xl"
              />
            </div>

            {/* Bagian Teks (Kanan) */}
            <div className="order-1 lg:order-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">
                Swimming Glory
              </p>

              <h3 className="text-4xl md:text-5xl font-light text-slate-900 mb-4">
                {/* Memisahkan kata pertama untuk styling */}
                {aboutData.title.split(" ")[0]}{" "}
                <span className="font-serif font-bold text-[#0A192F]">
                  {aboutData.title.split(" ").slice(1).join(" ")}
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

              <p className="text-slate-500 leading-relaxed font-medium mb-8 whitespace-pre-wrap">
                {aboutData.subtitle}
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

      {/* ===== GALLERY SECTION DINAMIS ===== */}
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
          </div>

          {/* Grid Galeri Dinamis */}
          <div className="grid grid-cols-2 md:grid-cols-3 grid-rows-3 gap-3 h-[520px] md:h-[560px]">
            {gallery.length >= 4 ? (
              <>
                <div className="relative col-span-1 row-span-2 overflow-hidden group">
                  <img
                    src={gallery[0].image_url}
                    alt={gallery[0].alt_text}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-[#00E5FF]/0 group-hover:bg-[#00E5FF]/20 transition-all duration-300" />
                </div>
                <div className="relative col-span-1 row-span-1 overflow-hidden group">
                  <img
                    src={gallery[1].image_url}
                    alt={gallery[1].alt_text}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-[#00E5FF]/0 group-hover:bg-[#00E5FF]/20 transition-all duration-300" />
                </div>
                <div className="relative col-span-1 row-span-1 overflow-hidden group">
                  <img
                    src={gallery[2].image_url}
                    alt={gallery[2].alt_text}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-[#00E5FF]/0 group-hover:bg-[#00E5FF]/20 transition-all duration-300" />
                </div>
                <div className="relative col-span-2 row-span-1 overflow-hidden group">
                  <img
                    src={gallery[3].image_url}
                    alt={gallery[3].alt_text}
                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-[#00E5FF]/0 group-hover:bg-[#00E5FF]/20 transition-all duration-300" />
                </div>
              </>
            ) : (
              <div className="col-span-3 row-span-3 flex items-center justify-center text-slate-400 bg-slate-50 border border-slate-100 rounded-2xl">
                Belum cukup gambar untuk menampilkan galeri (Butuh min. 4)
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
