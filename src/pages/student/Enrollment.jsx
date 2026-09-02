import React, { useEffect, useState, useRef } from "react";
import { supabase } from "../../utils/supabaseClient";
import { toast, Toaster } from "react-hot-toast";
import {
  BookOpen,
  UploadCloud,
  CheckCircle2,
  XCircle,
  Clock,
  Image as ImageIcon,
  CreditCard,
  Layers,
  AlertCircle,
  FileText,
  Trash2
} from "lucide-react";

export default function Enrollment() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [studentId, setStudentId] = useState(null);
  const [classes, setClasses] = useState([]);
  const [payments, setPayments] = useState([]);

  // Form State
  const [selectedClassId, setSelectedClassId] = useState("");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const fileInputRef = useRef(null);

  // Fetch Data
  const loadData = async () => {
    setLoading(true);
    try {
      const savedUser = localStorage.getItem("user_session");
      if (!savedUser) throw new Error("Sesi berakhir. Silakan login kembali.");
      const user = JSON.parse(savedUser);

      // 1. Dapatkan student_id
      const { data: student, error: studentError } = await supabase
        .from("students")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (studentError || !student) throw new Error("Data atlet tidak ditemukan.");
      setStudentId(student.id);

      // 2. Ambil riwayat pembayaran student ini
      const { data: paymentData, error: payError } = await supabase
        .from("payments")
        .select(`
          id, amount, status, reject_reason, created_at, receipt_url,
          classes ( name )
        `)
        .eq("student_id", student.id)
        .order("created_at", { ascending: false });

      if (payError) throw payError;
      setPayments(paymentData || []);

      // 3. Ambil data kelas aktif yang belum diikuti & tidak ada pending payment
      const { data: enrollments } = await supabase
        .from("student_enrollments")
        .select("class_id")
        .eq("student_id", student.id)
        .in("status", ["active", "completed"]);

      const enrolledIds = enrollments?.map((e) => e.class_id) || [];
      const pendingPayIds = paymentData
        ?.filter((p) => p.status === "pending")
        .map((p) => p.class_id) || [];

      const excludedClassIds = [...enrolledIds, ...pendingPayIds];

      const { data: classData, error: classError } = await supabase
        .from("classes")
        .select("id, name, price, max_capacity");

      if (classError) throw classError;

      // Filter kelas yang bisa dipilih
      const availableClasses = classData.filter(
        (c) => !excludedClassIds.includes(c.id)
      );
      setClasses(availableClasses);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedClassDetails = classes.find((c) => c.id === selectedClassId);

  // Handle File Input
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validasi Ukuran (Max 2MB)
    if (selectedFile.size > 2 * 1024 * 1024) {
      toast.error("Ukuran file tidak boleh melebihi 2MB.");
      fileInputRef.current.value = "";
      return;
    }

    // Validasi Tipe (JPEG, PNG)
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(selectedFile.type)) {
      toast.error("Hanya file JPG dan PNG yang diizinkan.");
      fileInputRef.current.value = "";
      return;
    }

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  const clearFile = () => {
    setFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Handle Submit Payment
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClassId) return toast.error("Silakan pilih kelas.");
    if (!file) return toast.error("Silakan unggah bukti pembayaran.");

    setSubmitting(true);
    const loadingToast = toast.loading("Mengirim permintaan pembayaran...");

    try {
      // 1. Upload File ke Supabase Storage (Bucket: images)
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `receipts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(filePath, file);

      if (uploadError) throw new Error("Gagal mengunggah gambar bukti.");

      // Ambil Public URL
      const { data: urlData } = supabase.storage
        .from("images")
        .getPublicUrl(filePath);

      const receiptUrl = urlData.publicUrl;

      // 2. Insert Data ke Tabel payments
      const { error: insertError } = await supabase.from("payments").insert([
        {
          student_id: studentId,
          class_id: selectedClassId,
          amount: selectedClassDetails.price,
          receipt_url: receiptUrl,
          status: "pending",
        },
      ]);

      if (insertError) throw insertError;

      toast.success("Pembayaran dikirim! Menunggu verifikasi admin.", {
        id: loadingToast,
      });

      // Reset Form & Reload Data
      setSelectedClassId("");
      clearFile();
      loadData();
    } catch (error) {
      toast.error(error.message, { id: loadingToast });
    } finally {
      setSubmitting(false);
    }
  };

  // Helper Formatting
  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  const getStatusBadge = (status) => {
    if (status === "approved")
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-black uppercase tracking-wider border border-emerald-200">
          <CheckCircle2 size={14} /> Disetujui
        </span>
      );
    if (status === "rejected")
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 rounded-lg text-[10px] font-black uppercase tracking-wider border border-red-200">
          <XCircle size={14} /> Ditolak
        </span>
      );
    return (
      <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-[10px] font-black uppercase tracking-wider border border-amber-200">
        <Clock size={14} /> Menunggu
      </span>
    );
  };

  if (loading && payments.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium animate-pulse">Memuat data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans">
      <Toaster position="top-right" toastOptions={{ style: { borderRadius: "16px", fontWeight: "500" } }} />

      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <CreditCard className="text-blue-600" size={32} />
          Pendaftaran Kelas
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          Daftar kelas baru dan lacak riwayat pembayaran Anda.
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* KOLOM KIRI: Form Pendaftaran */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-100 p-6 md:p-8">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6 flex items-center gap-2">
              <BookOpen size={18} className="text-blue-600" /> Pendaftaran Baru
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                  Kelas Tersedia
                </label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-700 cursor-pointer shadow-inner appearance-none"
                >
                  <option value="">-- Pilih Kelas --</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {classes.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1 ml-1 font-medium">
                    Anda sudah terdaftar atau memiliki permintaan tertunda untuk semua kelas yang tersedia.
                  </p>
                )}
              </div>

              {selectedClassDetails && (
                <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-3 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-500">Harga</span>
                    <span className="font-black text-blue-700 text-lg">
                      {formatRupiah(selectedClassDetails.price)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-t border-blue-100 pt-3">
                    <span className="text-xs font-bold text-slate-500">Kapasitas</span>
                    <span className="text-xs font-bold bg-white px-2.5 py-1 rounded-full text-slate-700 border border-slate-100">
                      Maks {selectedClassDetails.max_capacity} Siswa
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-2 pt-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                  Unggah Bukti Pembayaran
                </label>
                {!previewUrl ? (
                  <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-slate-200 bg-slate-50 rounded-2xl hover:bg-slate-100 hover:border-blue-400 transition-all cursor-pointer group">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <UploadCloud size={30} className="text-slate-400 group-hover:text-blue-500 mb-3 transition-colors" />
                      <p className="mb-1 text-sm text-slate-500 font-medium">
                        <span className="font-bold text-blue-600">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-slate-400">JPG or PNG (MAX. 2MB)</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/jpeg, image/png, image/jpg"
                    />
                  </label>
                ) : (
                  <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-slate-200 shadow-sm group">
                    <img src={previewUrl} alt="Receipt Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={clearFile}
                        className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 transition-transform active:scale-95"
                        title="Hapus Gambar"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting || !selectedClassId || !file}
                className="w-full py-4 bg-slate-900 hover:bg-black text-white font-bold rounded-2xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  "Submit Payment"
                )}
              </button>
            </form>
          </div>
        </div>

        {/* KOLOM KANAN: Tabel Riwayat Pembayaran */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-100 overflow-hidden flex flex-col h-full min-h-[500px]">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <FileText size={18} className="text-blue-600" /> Riwayat Pembayaran
              </h2>
              <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold">
                {payments.length} Records
              </span>
            </div>

            <div className="overflow-x-auto flex-1 p-2 md:p-6">
              {payments.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 py-10">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <FileText size={32} className="text-slate-300" />
                  </div>
                  <p className="font-bold text-slate-600 text-lg">No payments yet</p>
                  <p className="text-sm mt-1 max-w-xs text-center">
                    Purchase a class from the enrollment form to see your history here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {payments.map((p) => {
                    const dateObj = new Date(p.created_at);
                    const dateStr = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                    const timeStr = dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

                    return (
                      <div key={p.id} className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                              <Layers size={20} />
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-800">{p.classes?.name || "Unknown Class"}</h3>
                              <p className="text-xs text-slate-400 font-medium mt-0.5">{dateStr} • {timeStr}</p>
                            </div>
                          </div>
                          <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto">
                            <span className="font-black text-slate-800 text-lg">{formatRupiah(p.amount)}</span>
                            <div className="mt-1">{getStatusBadge(p.status)}</div>
                          </div>
                        </div>

                        {/* Expandable Info untuk Reject atau Preview Receipt */}
                        <div className="pt-4 border-t border-slate-50 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                          <a
                            href={p.receipt_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 transition-colors bg-blue-50 px-3 py-1.5 rounded-lg"
                          >
                            <ImageIcon size={14} /> View Receipt
                          </a>

                          {p.status === "rejected" && p.reject_reason && (
                            <div className="flex items-start gap-2 p-3 bg-red-50 text-red-700 rounded-xl text-xs w-full sm:max-w-sm">
                              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                              <span className="font-medium">Alasan: {p.reject_reason}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}