import React from "react";
import { MapPin, Phone, Mail, ArrowRight } from "lucide-react";

/* ===== SVG ICONS (pengganti lucide brand icons) ===== */
const InstagramIcon = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const FacebookIcon = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const TwitterIcon = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

export default function Footer() {
  return (
    <footer className="bg-[#060D1A] pt-20 pb-10 px-6 border-t border-[#00E5FF]/10 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Top Grid Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Column 1: Brand & Socials */}
          <div className="lg:pr-6">
            <span className="font-bold text-2xl tracking-widest text-white uppercase mb-6 block">
              SIRIP<span className="text-[#00E5FF]">BIRU</span>
            </span>
            <p className="text-white/50 text-sm leading-relaxed mb-8">
              Klub renang profesional yang memadukan dedikasi pelatihan fisik
              dengan presisi teknologi digital untuk mencetak juara masa depan.
            </p>

            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/70 hover:bg-[#00E5FF] hover:text-[#0A192F] transition-all"
              >
                <InstagramIcon size={18} />
              </a>

              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/70 hover:bg-[#00E5FF] hover:text-[#0A192F] transition-all"
              >
                <FacebookIcon size={18} />
              </a>

              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/70 hover:bg-[#00E5FF] hover:text-[#0A192F] transition-all"
              >
                <TwitterIcon size={18} />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-white font-serif text-xl mb-6">Explore</h4>
            <ul className="space-y-4">
              <li>
                <a
                  href="#about"
                  className="text-white/50 hover:text-[#00E5FF] text-sm transition-colors flex items-center gap-3 group"
                >
                  <ArrowRight
                    size={14}
                    className="text-[#00E5FF] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
                  />
                  <span className="-ml-6 group-hover:ml-0 transition-all">
                    About Us
                  </span>
                </a>
              </li>

              <li>
                <a
                  href="#course"
                  className="text-white/50 hover:text-[#00E5FF] text-sm transition-colors flex items-center gap-3 group"
                >
                  <ArrowRight
                    size={14}
                    className="text-[#00E5FF] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
                  />
                  <span className="-ml-6 group-hover:ml-0 transition-all">
                    Programs
                  </span>
                </a>
              </li>

              <li>
                <a
                  href="#coach"
                  className="text-white/50 hover:text-[#00E5FF] text-sm transition-colors flex items-center gap-3 group"
                >
                  <ArrowRight
                    size={14}
                    className="text-[#00E5FF] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
                  />
                  <span className="-ml-6 group-hover:ml-0 transition-all">
                    Coaches
                  </span>
                </a>
              </li>

              <li>
                <a
                  href="#testimonials"
                  className="text-white/50 hover:text-[#00E5FF] text-sm transition-colors flex items-center gap-3 group"
                >
                  <ArrowRight
                    size={14}
                    className="text-[#00E5FF] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
                  />
                  <span className="-ml-6 group-hover:ml-0 transition-all">
                    Reviews
                  </span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3 & 4: Contact Info */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-serif text-xl mb-6">Get in Touch</h4>

            <div className="grid sm:grid-cols-2 gap-8">
              {/* Address */}
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#00E5FF] flex-shrink-0">
                  <MapPin size={18} />
                </div>

                <div>
                  <p className="text-white/80 text-sm font-bold mb-2 tracking-wide">
                    HEADQUARTERS
                  </p>

                  <p className="text-white/50 text-sm leading-relaxed">
                    Gelora Bung Karno Aquatic Stadium
                    <br />
                    Senayan, Jakarta Pusat 10270
                    <br />
                    Indonesia
                  </p>
                </div>
              </div>

              {/* Phone & Email */}
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#00E5FF] flex-shrink-0">
                    <Phone size={18} />
                  </div>

                  <div>
                    <p className="text-white/80 text-sm font-bold mb-1 tracking-wide">
                      PHONE
                    </p>

                    <p className="text-white/50 text-sm">+62 812 3456 7890</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#00E5FF] flex-shrink-0">
                    <Mail size={18} />
                  </div>

                  <div>
                    <p className="text-white/80 text-sm font-bold mb-1 tracking-wide">
                      EMAIL
                    </p>

                    <p className="text-white/50 text-sm">hello@siripbiru.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-xs font-medium">
            © {new Date().getFullYear()} Siripbiru Swim Club. All rights
            reserved.
          </p>

          <svg
            width="40"
            height="6"
            viewBox="0 0 60 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="opacity-50 hidden md:block"
          >
            <path
              d="M0 5C5 5 5 0 10 0C15 0 15 5 20 5C25 5 25 10 30 10C35 10 35 5 40 5C45 5 45 0 50 0C55 0 55 5 60 5"
              stroke="#00E5FF"
              strokeWidth="2"
            />
          </svg>

          <div className="flex items-center gap-6 text-white/40 text-xs font-medium">
            <a href="#" className="hover:text-[#00E5FF] transition-colors">
              Privacy Policy
            </a>

            <a href="#" className="hover:text-[#00E5FF] transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}