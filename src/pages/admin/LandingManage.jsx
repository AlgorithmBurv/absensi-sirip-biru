import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import { toast, Toaster } from "react-hot-toast";
import {
  LayoutTemplate, Save, Plus, Trash2, Edit3, Type, Star, Layers,
  CheckCircle2, XCircle, X, MinusCircle, Image as ImageIcon,
  Activity, Droplets, Medal, Upload, Eye, EyeOff, MapPin, Phone,
  Mail, FileText, ChevronRight, AlertCircle, Loader2
} from "lucide-react";

// ─────────────────────────────────────────────
// ICON MAP for course icons
// ─────────────────────────────────────────────
const ICON_MAP = { Droplets, Activity, Medal, Star };

const ICON_OPTIONS = [
  { value: "Droplets", label: "Droplets — Beginner" },
  { value: "Activity", label: "Activity — Intermediate" },
  { value: "Medal",    label: "Medal — Elite" },
  { value: "Star",     label: "Star — General" },
];

// ─────────────────────────────────────────────
// SMALL REUSABLE COMPONENTS
// ─────────────────────────────────────────────
const Field = ({ label, children }) => (
  <div className="space-y-1.5">
    <label className="block text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400">{label}</label>
    {children}
  </div>
);

const inputCls = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";

const Btn = ({ children, variant = "primary", loading, className = "", ...props }) => {
  const base = "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  const styles = {
    primary: "bg-slate-900 hover:bg-black text-white px-6 py-3 shadow-sm active:scale-[0.98]",
    blue:    "bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 shadow-sm shadow-blue-200 active:scale-[0.98]",
    ghost:   "text-slate-500 hover:text-slate-800 px-4 py-3",
    danger:  "p-2 text-slate-300 hover:text-red-500",
    outline: "border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2.5 text-sm",
  };
  return (
    <button className={`${base} ${styles[variant]} ${className}`} disabled={loading} {...props}>
      {loading ? <Loader2 size={16} className="animate-spin" /> : null}
      {children}
    </button>
  );
};

const Modal = ({ open, onClose, title, icon: Icon, children, maxWidth = "max-w-lg" }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${maxWidth} flex flex-col max-h-[90vh]`}>
        <div className="flex items-center justify-between px-5 py-4 md:px-7 md:py-5 border-b border-slate-100 flex-shrink-0">
          <h3 className="text-base font-bold flex items-center gap-2.5 text-slate-800">
            {Icon && <Icon size={18} className="text-blue-600" />} {title}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto p-5 md:p-7 flex-1">{children}</div>
      </div>
    </div>
  );
};

const EmptyState = ({ icon: Icon, message }) => (
  <div className="flex flex-col items-center justify-center py-14 text-slate-400 gap-3">
    <Icon size={32} className="opacity-30" />
    <p className="text-sm text-center px-4">{message}</p>
  </div>
);

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function LandingManage() {
  const [activeTab, setActiveTab] = useState("hero");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // ── DATA STATES ──────────────────────────────
  const [hero, setHero] = useState({ id: null, title: "", subtitle: "", action_url: "" });
  const [about, setAbout] = useState({ id: null, title: "", subtitle: "" });
  const [footerContact, setFooterContact] = useState({ id: null, address: "", phone: "", email: "" });
  const [courses, setCourses] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [gallery, setGallery] = useState([]);

  // ── COURSE MODAL ─────────────────────────────
  const [courseModal, setCourseModal] = useState(false);
  const [courseEditing, setCourseEditing] = useState(null); // null = new
  const [courseForm, setCourseForm] = useState({ title: "", price: "", description: "", icon_name: "Droplets", features: [""] });
  const [courseSaving, setCourseSaving] = useState(false);

  // ── TESTIMONIAL MODAL ────────────────────────
  const [testiModal, setTestiModal] = useState(false);
  const [testiEditing, setTestiEditing] = useState(null);
  const [testiForm, setTestiForm] = useState({ name: "", role: "", text: "", is_published: true });
  const [testiSaving, setTestiSaving] = useState(false);

  // ── GALLERY ADD MODAL ─────────────────────────
  const [galleryModal, setGalleryModal] = useState(false);
  const [galleryForm, setGalleryForm] = useState({ image_url: "", alt_text: "", sort_order: 0 });
  const [gallerySaving, setGallerySaving] = useState(false);

  // ─────────────────────────────────────────────
  // FETCH
  // ─────────────────────────────────────────────
  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [{ data: settings }, { data: courseData }, { data: testiData }, { data: galleryData }] = await Promise.all([
        supabase.from("landing_settings").select("*"),
        supabase.from("landing_courses").select("*").order("created_at", { ascending: true }),
        supabase.from("landing_testimonials").select("*").order("created_at", { ascending: false }),
        supabase.from("landing_gallery").select("*").order("sort_order", { ascending: true }),
      ]);

      if (settings) {
        const heroD   = settings.find(s => s.section === "hero");
        const aboutD  = settings.find(s => s.section === "about");
        const footerD = settings.find(s => s.section === "footer_contact");
        if (heroD)   setHero(heroD);
        if (aboutD)  setAbout(aboutD);
        if (footerD) {
          const [phone = "", email = ""] = (footerD.action_url || "").split("|");
          setFooterContact({ id: footerD.id, address: footerD.subtitle || "", phone, email });
        }
      }
      if (courseData) setCourses(courseData);
      if (testiData)  setTestimonials(testiData);
      if (galleryData) setGallery(galleryData);
    } catch (err) {
      toast.error("Failed to load data");
    }
    setLoading(false);
  };

  // ─────────────────────────────────────────────
  // HERO SAVE
  // ─────────────────────────────────────────────
  const saveHero = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("landing_settings")
      .update({ title: hero.title, subtitle: hero.subtitle, action_url: hero.action_url })
      .eq("section", "hero");
    if (error) toast.error("Failed to update Hero section");
    else toast.success("Hero section updated");
    setSaving(false);
  };

  // ─────────────────────────────────────────────
  // ABOUT + FOOTER SAVE
  // ─────────────────────────────────────────────
  const saveInfo = async () => {
    setSaving(true);
    const [r1, r2] = await Promise.all([
      supabase.from("landing_settings").update({ title: about.title, subtitle: about.subtitle }).eq("section", "about"),
      supabase.from("landing_settings").update({
        subtitle: footerContact.address,
        action_url: `${footerContact.phone}|${footerContact.email}`,
      }).eq("section", "footer_contact"),
    ]);
    if (r1.error || r2.error) toast.error("Failed to save info");
    else toast.success("About & contact info saved");
    setSaving(false);
  };

  // ─────────────────────────────────────────────
  // COURSES CRUD
  // ─────────────────────────────────────────────
  const openNewCourse = () => {
    setCourseEditing(null);
    setCourseForm({ title: "", price: "", description: "", icon_name: "Droplets", features: [""] });
    setCourseModal(true);
  };
  const openEditCourse = (course) => {
    setCourseEditing(course.id);
    setCourseForm({
      title: course.title || "",
      price: course.price || "",
      description: course.description || "",
      icon_name: course.icon_name || "Droplets",
      features: course.features?.length ? course.features : [""],
    });
    setCourseModal(true);
  };
  const saveCourse = async (e) => {
    e.preventDefault();
    setCourseSaving(true);
    const payload = { ...courseForm, features: courseForm.features.filter(f => f.trim()) };
    const { error } = courseEditing
      ? await supabase.from("landing_courses").update(payload).eq("id", courseEditing)
      : await supabase.from("landing_courses").insert([payload]);
    if (error) toast.error(error.message);
    else { toast.success(courseEditing ? "Course updated" : "Course added"); setCourseModal(false); fetchAll(); }
    setCourseSaving(false);
  };
  const deleteCourse = async (id) => {
    if (!window.confirm("Delete this course?")) return;
    const { error } = await supabase.from("landing_courses").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { setCourses(prev => prev.filter(c => c.id !== id)); toast.success("Course deleted"); }
  };

  const addFeature = () => setCourseForm(p => ({ ...p, features: [...p.features, ""] }));
  const removeFeature = (i) => setCourseForm(p => ({ ...p, features: p.features.filter((_, idx) => idx !== i) }));
  const changeFeature = (i, v) => setCourseForm(p => { const f = [...p.features]; f[i] = v; return { ...p, features: f }; });

  // ─────────────────────────────────────────────
  // TESTIMONIALS CRUD
  // ─────────────────────────────────────────────
  const openNewTesti = () => {
    setTestiEditing(null);
    setTestiForm({ name: "", role: "", text: "", is_published: true });
    setTestiModal(true);
  };
  const openEditTesti = (t) => {
    setTestiEditing(t.id);
    setTestiForm({ name: t.name, role: t.role, text: t.text, is_published: t.is_published });
    setTestiModal(true);
  };
  const saveTesti = async (e) => {
    e.preventDefault();
    setTestiSaving(true);
    const { error } = testiEditing
      ? await supabase.from("landing_testimonials").update(testiForm).eq("id", testiEditing)
      : await supabase.from("landing_testimonials").insert([testiForm]);
    if (error) toast.error(error.message);
    else { toast.success(testiEditing ? "Testimonial updated" : "Testimonial added"); setTestiModal(false); fetchAll(); }
    setTestiSaving(false);
  };
  const deleteTesti = async (id) => {
    if (!window.confirm("Delete this testimonial?")) return;
    const { error } = await supabase.from("landing_testimonials").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { setTestimonials(prev => prev.filter(t => t.id !== id)); toast.success("Testimonial deleted"); }
  };
  const toggleTesti = async (id, current) => {
    const { error } = await supabase.from("landing_testimonials").update({ is_published: !current }).eq("id", id);
    if (error) toast.error(error.message);
    else setTestimonials(prev => prev.map(t => t.id === id ? { ...t, is_published: !current } : t));
  };

  // ─────────────────────────────────────────────
  // GALLERY CRUD
  // ─────────────────────────────────────────────
  const openAddGallery = () => {
    setGalleryForm({ image_url: "", alt_text: "", sort_order: gallery.length });
    setGalleryModal(true);
  };
  const saveGallery = async (e) => {
    e.preventDefault();
    setGallerySaving(true);
    const { error } = await supabase.from("landing_gallery").insert([galleryForm]);
    if (error) toast.error(error.message);
    else { toast.success("Image added to gallery"); setGalleryModal(false); fetchAll(); }
    setGallerySaving(false);
  };
  const deleteGallery = async (id) => {
    if (!window.confirm("Remove this image from the gallery?")) return;
    const { error } = await supabase.from("landing_gallery").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { setGallery(prev => prev.filter(g => g.id !== id)); toast.success("Image removed"); }
  };

  // ─────────────────────────────────────────────
  // TABS CONFIG
  // ─────────────────────────────────────────────
  const TABS = [
    { id: "hero",         label: "Hero",         icon: Type },
    { id: "info",         label: "Info & Gallery",icon: ImageIcon },
    { id: "courses",      label: "Courses",       icon: Layers },
    { id: "testimonials", label: "Testimonials",  icon: Star },
  ];

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    // Menggunakan bg-[#f8fafc] agar identik dengan halaman admin lainnya
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900">
      <Toaster position="top-right" toastOptions={{ style: { borderRadius: "12px", fontSize: "14px", fontWeight: "500" } }} />

      {/* TOP BAR */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        {/* Menggunakan max-w-7xl agar identik dengan halaman admin lainnya */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg text-white">
            <LayoutTemplate size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold leading-none truncate">Landing Page Manager</h1>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">Siripbiru Athletics</p>
          </div>
          {loading && <Loader2 size={16} className="text-slate-400 animate-spin flex-shrink-0" />}
        </div>
      </header>

      {/* TABS - Added horizontal scrolling for mobile */}
      <div className="bg-white border-b border-slate-200 overflow-x-auto custom-scrollbar">
        {/* Menggunakan max-w-7xl agar identik dengan halaman admin lainnya */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-1 min-w-max">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-4 text-sm font-semibold border-b-2 transition-all duration-200 whitespace-nowrap ${
                  active
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                }`}
              >
                <Icon size={15} /> {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN */}
      {/* Menggunakan max-w-7xl agar identik dengan halaman admin lainnya */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">

        {/* ── HERO TAB ── */}
        {activeTab === "hero" && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-100 p-5 md:p-7 space-y-5">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Edit3 size={16} className="text-blue-600" /> Hero Section Content
              </h2>
              <Field label="Main Headline">
                <input value={hero.title} onChange={e => setHero({ ...hero, title: e.target.value })}
                  className={inputCls} placeholder="e.g. Train Like a Champion" />
              </Field>
              <Field label="Subtitle / Tagline">
                <textarea value={hero.subtitle} onChange={e => setHero({ ...hero, subtitle: e.target.value })}
                  rows={3} className={inputCls} placeholder="A short sentence describing your program's benefit..." />
              </Field>
              <Field label="CTA Button URL">
                <input value={hero.action_url} onChange={e => setHero({ ...hero, action_url: e.target.value })}
                  className={inputCls} placeholder="https://wa.me/62..." />
              </Field>
              <div className="pt-2">
                 <Btn variant="primary" loading={saving} onClick={saveHero} className="w-full sm:w-auto">
                  <Save size={15} /> Save Changes
                </Btn>
              </div>
            </div>

            {/* Preview Card */}
            <div className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-5 md:p-7 text-white flex flex-col justify-between">
              <div>
                <p className="text-[10px] font-bold tracking-widest opacity-60 uppercase mb-4">Live Preview</p>
                <h2 className="text-xl md:text-2xl font-extrabold leading-tight mb-3 break-words">
                  {hero.title || <span className="opacity-40 italic">No headline yet...</span>}
                </h2>
                <p className="text-blue-100 text-sm leading-relaxed">
                  {hero.subtitle || <span className="opacity-40 italic">No subtitle yet...</span>}
                </p>
              </div>
              <div className="mt-8 border-t border-white/20 pt-5">
                <p className="text-[11px] opacity-60 mb-2">Tip</p>
                <p className="text-blue-100 text-xs leading-relaxed">Keep headlines under 10 words. Focus on the parent's benefit, not the sport.</p>
              </div>
            </div>
          </div>
        )}

        {/* ── INFO & GALLERY TAB ── */}
        {activeTab === "info" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* About + Footer */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-100 p-5 md:p-7 space-y-5">
                <h2 className="text-sm font-bold text-slate-800">About Section</h2>
                <Field label="Section Title">
                  <input value={about.title} onChange={e => setAbout({ ...about, title: e.target.value })}
                    className={inputCls} placeholder="About Us" />
                </Field>
                <Field label="Description">
                  <textarea value={about.subtitle} onChange={e => setAbout({ ...about, subtitle: e.target.value })}
                    rows={4} className={inputCls} placeholder="Describe your organization..." />
                </Field>
              </div>

              <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-100 p-5 md:p-7 space-y-5">
                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2"><MapPin size={15} className="text-blue-600"/>Footer Contact</h2>
                <Field label="Full Address">
                  <textarea value={footerContact.address} onChange={e => setFooterContact({ ...footerContact, address: e.target.value })}
                    rows={2} className={inputCls} placeholder="Jl. ..." />
                </Field>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Phone Number">
                    <input value={footerContact.phone} onChange={e => setFooterContact({ ...footerContact, phone: e.target.value })}
                      className={inputCls} placeholder="+62..." />
                  </Field>
                  <Field label="Email">
                    <input value={footerContact.email} onChange={e => setFooterContact({ ...footerContact, email: e.target.value })}
                      className={inputCls} placeholder="hello@..." />
                  </Field>
                </div>
                <Btn variant="primary" loading={saving} onClick={saveInfo} className="w-full">
                  <Save size={15} /> Save About & Contact
                </Btn>
              </div>
            </div>

            {/* Gallery */}
            <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-100 p-5 md:p-7">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <h2 className="text-sm font-bold text-slate-800">Gallery Images</h2>
                <Btn variant="blue" onClick={openAddGallery} className="py-2 px-4 text-xs w-full sm:w-auto">
                  <Plus size={14} /> Add Image
                </Btn>
              </div>
              {gallery.length === 0 ? (
                <EmptyState icon={ImageIcon} message="No gallery images yet. Add one to get started." />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                  {gallery.map(img => (
                    <div key={img.id} className="relative group rounded-xl overflow-hidden aspect-[4/3] bg-slate-100 border border-slate-200">
                      <img src={img.image_url} alt={img.alt_text || "Gallery"} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                        {img.alt_text && <p className="text-white text-xs font-medium px-2 text-center line-clamp-2">{img.alt_text}</p>}
                        <button onClick={() => deleteGallery(img.id)} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── COURSES TAB ── */}
        {activeTab === "courses" && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="text-base font-bold text-slate-800">Course Programs</h2>
                <p className="text-xs text-slate-400 mt-0.5">{courses.length} program{courses.length !== 1 ? "s" : ""} listed</p>
              </div>
              <Btn variant="blue" onClick={openNewCourse} className="w-full sm:w-auto">
                <Plus size={16} /> Add Course
              </Btn>
            </div>

            {courses.length === 0 ? (
              <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-100 p-8">
                <EmptyState icon={Layers} message="No courses yet. Create your first program." />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {courses.map(course => {
                  const Icon = ICON_MAP[course.icon_name] || Star;
                  return (
                    <div key={course.id} className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-100 p-5 md:p-6 flex flex-col hover:-translate-y-1 transition-all duration-300">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 flex items-center justify-center bg-blue-50 rounded-2xl text-blue-600">
                          <Icon size={20} />
                        </div>
                        <button onClick={() => deleteCourse(course.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <h3 className="font-bold text-slate-800 mb-1">{course.title}</h3>
                      <p className="text-blue-600 font-semibold text-sm mb-2">{course.price}</p>
                      <p className="text-xs text-slate-500 mb-4 line-clamp-2 flex-1">{course.description}</p>
                      {course.features?.length > 0 && (
                        <ul className="mb-6 space-y-2">
                          {course.features.slice(0, 3).map((f, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                              <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" /> {f}
                            </li>
                          ))}
                          {course.features.length > 3 && (
                            <li className="text-xs text-slate-400 pl-6">+{course.features.length - 3} more</li>
                          )}
                        </ul>
                      )}
                      <Btn variant="outline" onClick={() => openEditCourse(course)} className="w-full mt-auto py-3 rounded-2xl">
                        <Edit3 size={14} /> Edit Details
                      </Btn>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TESTIMONIALS TAB ── */}
        {activeTab === "testimonials" && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="text-base font-bold text-slate-800">Testimonials</h2>
                <p className="text-xs text-slate-400 mt-0.5">{testimonials.filter(t => t.is_published).length} published · {testimonials.filter(t => !t.is_published).length} draft</p>
              </div>
              <Btn variant="blue" onClick={openNewTesti} className="w-full sm:w-auto">
                <Plus size={16} /> Add Testimonial
              </Btn>
            </div>

            <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-100 overflow-hidden">
              {testimonials.length === 0 ? (
                <EmptyState icon={Star} message="No testimonials yet." />
              ) : (
                <div className="divide-y divide-slate-100">
                  {testimonials.map(t => (
                    <div key={t.id} className="flex flex-col sm:flex-row sm:items-start gap-4 px-6 py-5 hover:bg-slate-50/50 transition-colors">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {t.name?.[0]?.toUpperCase() || "?"}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-sm text-slate-800">{t.name}</span>
                          <span className="text-xs text-slate-400">·</span>
                          <span className="text-xs text-slate-400 font-medium truncate">{t.role}</span>
                        </div>
                        <p className="text-sm text-slate-600 italic line-clamp-2 md:line-clamp-none">"{t.text}"</p>
                      </div>

                      {/* Status + Actions */}
                      <div className="flex items-center gap-2 sm:flex-shrink-0 mt-3 sm:mt-0 ml-16 sm:ml-0">
                        <button
                          onClick={() => toggleTesti(t.id, t.is_published)}
                          title={t.is_published ? "Click to unpublish" : "Click to publish"}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide transition-all ${
                            t.is_published
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-600 hover:text-white"
                              : "bg-slate-50 text-slate-500 border border-slate-200 hover:bg-emerald-500 hover:text-white"
                          }`}
                        >
                          {t.is_published ? <Eye size={12} /> : <EyeOff size={12} />}
                          <span className="hidden xs:inline">{t.is_published ? "Published" : "Draft"}</span>
                        </button>
                        <button onClick={() => openEditTesti(t)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors rounded-xl hover:bg-blue-50">
                          <Edit3 size={16} />
                        </button>
                        <button onClick={() => deleteTesti(t.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-xl hover:bg-red-50">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ══════════════════════════════════════════ */}
      {/* MODALS                                     */}
      {/* ══════════════════════════════════════════ */}

      {/* COURSE MODAL */}
      <Modal open={courseModal} onClose={() => setCourseModal(false)} title={courseEditing ? "Edit Course" : "New Course"} icon={Layers} maxWidth="max-w-2xl">
        <form onSubmit={saveCourse} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Field label="Course Name">
                <input required value={courseForm.title} onChange={e => setCourseForm({ ...courseForm, title: e.target.value })} className={inputCls} placeholder="e.g. Beginner Swimming" />
              </Field>
            </div>
            <Field label="Price / Label">
              <input required value={courseForm.price} onChange={e => setCourseForm({ ...courseForm, price: e.target.value })} className={inputCls} placeholder="e.g. Rp 350.000/month" />
            </Field>
            <Field label="Icon">
              <select value={courseForm.icon_name} onChange={e => setCourseForm({ ...courseForm, icon_name: e.target.value })} className={inputCls}>
                {ICON_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
            <div className="md:col-span-2">
              <Field label="Short Description">
                <textarea required rows={2} value={courseForm.description} onChange={e => setCourseForm({ ...courseForm, description: e.target.value })} className={inputCls} placeholder="Describe this course in 1-2 sentences..." />
              </Field>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400">Features / Bullet Points</span>
              <button type="button" onClick={addFeature} className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                <Plus size={13} /> Add Feature
              </button>
            </div>
            <div className="space-y-2.5">
              {courseForm.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black flex items-center justify-center flex-shrink-0">{i + 1}</span>
                  <input
                    value={feature}
                    onChange={e => changeFeature(i, e.target.value)}
                    className={`${inputCls} flex-1`}
                    placeholder={`Feature ${i + 1}...`}
                  />
                  {courseForm.features.length > 1 && (
                    <button type="button" onClick={() => removeFeature(i)} className="text-slate-300 hover:text-red-500 transition-colors p-2 bg-slate-50 hover:bg-red-50 rounded-xl">
                      <MinusCircle size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-slate-100">
            <Btn type="button" variant="ghost" onClick={() => setCourseModal(false)} className="w-full sm:w-auto">Cancel</Btn>
            <Btn type="submit" variant="blue" loading={courseSaving} className="w-full sm:w-auto">
              <Save size={15} /> {courseEditing ? "Save Changes" : "Add Course"}
            </Btn>
          </div>
        </form>
      </Modal>

      {/* TESTIMONIAL MODAL */}
      <Modal open={testiModal} onClose={() => setTestiModal(false)} title={testiEditing ? "Edit Testimonial" : "New Testimonial"} icon={Star}>
        <form onSubmit={saveTesti} className="space-y-4">
          <Field label="Sender Name">
            <input required value={testiForm.name} onChange={e => setTestiForm({ ...testiForm, name: e.target.value })} className={inputCls} placeholder="Full name" />
          </Field>
          <Field label="Role / Title">
            <input required value={testiForm.role} onChange={e => setTestiForm({ ...testiForm, role: e.target.value })} className={inputCls} placeholder="e.g. Parent of Athlete" />
          </Field>
          <Field label="Testimonial Text">
            <textarea required rows={4} value={testiForm.text} onChange={e => setTestiForm({ ...testiForm, text: e.target.value })} className={`${inputCls} resize-none`} placeholder="What did they say about the program?" />
          </Field>
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
            <input type="checkbox" id="testi-published" checked={testiForm.is_published} onChange={e => setTestiForm({ ...testiForm, is_published: e.target.checked })} className="w-4 h-4 accent-blue-600 cursor-pointer flex-shrink-0" />
            <label htmlFor="testi-published" className="text-sm text-slate-700 font-medium cursor-pointer select-none">Publish immediately</label>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-slate-100">
            <Btn type="button" variant="ghost" onClick={() => setTestiModal(false)} className="w-full sm:w-auto">Cancel</Btn>
            <Btn type="submit" variant="blue" loading={testiSaving} className="w-full sm:w-auto">
              <Save size={15} /> {testiEditing ? "Save Changes" : "Add Testimonial"}
            </Btn>
          </div>
        </form>
      </Modal>

      {/* GALLERY ADD MODAL */}
      <Modal open={galleryModal} onClose={() => setGalleryModal(false)} title="Add Gallery Image" icon={ImageIcon}>
        <form onSubmit={saveGallery} className="space-y-4">
          <Field label="Image URL">
            <input required value={galleryForm.image_url} onChange={e => setGalleryForm({ ...galleryForm, image_url: e.target.value })} className={inputCls} placeholder="https://..." />
          </Field>
          {galleryForm.image_url && (
            <div className="rounded-xl overflow-hidden aspect-video bg-slate-100 border border-slate-200">
              <img src={galleryForm.image_url} alt="preview" className="w-full h-full object-cover" onError={e => { e.target.style.display = "none"; }} />
            </div>
          )}
          <Field label="Alt Text (optional)">
            <input value={galleryForm.alt_text} onChange={e => setGalleryForm({ ...galleryForm, alt_text: e.target.value })} className={inputCls} placeholder="Describe the image for accessibility..." />
          </Field>
          <Field label="Sort Order">
            <input type="number" value={galleryForm.sort_order} onChange={e => setGalleryForm({ ...galleryForm, sort_order: parseInt(e.target.value) || 0 })} className={inputCls} min={0} />
          </Field>
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-slate-100">
            <Btn type="button" variant="ghost" onClick={() => setGalleryModal(false)} className="w-full sm:w-auto">Cancel</Btn>
            <Btn type="submit" variant="blue" loading={gallerySaving} className="w-full sm:w-auto">
              <Plus size={15} /> Add to Gallery
            </Btn>
          </div>
        </form>
      </Modal>
    </div>
  );
}