import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import { toast, Toaster } from "react-hot-toast";
import {
  CreditCard,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  X,
  AlertTriangle,
  Image as ImageIcon,
  Layers,
  User,
  AlertCircle
} from "lucide-react";

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("pending"); // Default view is pending

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("payments")
        .select(`
          *,
          students ( nis, users ( full_name ) ),
          classes ( name, max_capacity )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      toast.error("Gagal memuat pembayaran: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Filter Logic
  const filteredPayments = payments.filter((p) => {
    const studentName = p.students?.users?.full_name?.toLowerCase() || "";
    const className = p.classes?.name?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    
    const matchesSearch = studentName.includes(query) || className.includes(query);
    const matchesStatus = filterStatus === "all" ? true : p.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const counts = {
    pending: payments.filter((p) => p.status === "pending").length,
    approved: payments.filter((p) => p.status === "approved").length,
    rejected: payments.filter((p) => p.status === "rejected").length,
  };

  // Open Modal
  const openReviewModal = (payment) => {
    setSelectedPayment(payment);
    setIsRejecting(false);
    setRejectReason("");
    setIsModalOpen(true);
  };

  // ==========================================
  // ACTION: APPROVE PAYMENT & ENROLL STUDENT
  // ==========================================
  const handleApprove = async () => {
    setActionLoading(true);
    const loadingToast = toast.loading("Memverifikasi kapasitas dan menyetujui...");

    try {
      // 1. Cek Kuota Kelas Aktual (Mencegah Race Condition)
      const { count: enrolledCount, error: countError } = await supabase
        .from("student_enrollments")
        .select("*", { count: "exact", head: true })
        .eq("class_id", selectedPayment.class_id)
        .in("status", ["active", "completed"]);

      if (countError) throw countError;

      const maxCapacity = selectedPayment.classes?.max_capacity || 0;
      if (enrolledCount >= maxCapacity) {
        throw new Error(`Kelas penuh! Kuota maksimal (${maxCapacity}) telah tercapai.`);
      }

      // 2. Dapatkan Admin ID dari sesi lokal
      const admin = JSON.parse(localStorage.getItem("user_session"));

      // 3. Update Status Payment
      const { error: updateError } = await supabase
        .from("payments")
        .update({
          status: "approved",
          processed_by: admin.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedPayment.id);

      if (updateError) throw updateError;

      // 4. Insert Student ke tabel Enrollments
      const { error: enrollError } = await supabase
        .from("student_enrollments")
        .insert([{
          student_id: selectedPayment.student_id,
          class_id: selectedPayment.class_id,
          status: "active"
        }]);

      if (enrollError) throw enrollError;

      toast.success("Pembayaran disetujui & Atlet berhasil masuk ke kelas!", { id: loadingToast });
      setIsModalOpen(false);
      fetchPayments();

    } catch (error) {
      toast.error(error.message, { id: loadingToast });
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // ACTION: REJECT PAYMENT
  // ==========================================
  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Mohon isi alasan penolakan.");
      return;
    }

    setActionLoading(true);
    const loadingToast = toast.loading("Menolak pengajuan...");

    try {
      const admin = JSON.parse(localStorage.getItem("user_session"));

      const { error } = await supabase
        .from("payments")
        .update({
          status: "rejected",
          reject_reason: rejectReason.trim(),
          processed_by: admin.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedPayment.id);

      if (error) throw error;

      toast.success("Pembayaran ditolak.", { id: loadingToast });
      setIsModalOpen(false);
      fetchPayments();

    } catch (error) {
      toast.error(error.message, { id: loadingToast });
    } finally {
      setActionLoading(false);
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
    if (status === "approved") return <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-black uppercase tracking-wider border border-emerald-200">Approved</span>;
    if (status === "rejected") return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-[10px] font-black uppercase tracking-wider border border-red-200">Ditolak</span>;
    return <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-[10px] font-black uppercase tracking-wider border border-amber-200">Pending</span>;
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans relative">
      <Toaster position="top-right" toastOptions={{ style: { borderRadius: "16px", fontWeight: "500" } }} />

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <CreditCard className="text-blue-600" size={32} />
            Payment Verification
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Review dan kelola bukti pembayaran pendaftaran kelas atlet.
          </p>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="max-w-7xl mx-auto mb-6 flex gap-2 p-1.5 bg-white border border-slate-100 rounded-2xl shadow-sm w-full sm:w-fit overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setFilterStatus('pending')}
          className={`relative flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 whitespace-nowrap flex-1 sm:flex-none
            ${filterStatus === 'pending' ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"}
          `}
        >
          <Clock size={16} /> Needs Review
          {counts.pending > 0 && (
            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center flex-shrink-0 ${filterStatus === 'pending' ? "bg-white/20 text-white" : "bg-amber-100 text-amber-600"}`}>
              {counts.pending}
            </span>
          )}
        </button>
        <button
          onClick={() => setFilterStatus('approved')}
          className={`relative flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 whitespace-nowrap flex-1 sm:flex-none
            ${filterStatus === 'approved' ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"}
          `}
        >
          <CheckCircle2 size={16} /> Approved
          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center flex-shrink-0 ${filterStatus === 'approved' ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
            {counts.approved}
          </span>
        </button>
        <button
          onClick={() => setFilterStatus('all')}
          className={`relative flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 whitespace-nowrap flex-1 sm:flex-none
            ${filterStatus === 'all' ? "bg-slate-800 text-white shadow-lg shadow-slate-800/30" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"}
          `}
        >
          All History
        </button>
      </div>

      {/* Controls Card */}
      <div className="max-w-7xl mx-auto mb-6 bg-white rounded-3xl border border-slate-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={16} className="text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search by student or class name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-100 overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[11px] uppercase tracking-widest font-black border-b border-slate-100">
                <th className="px-6 py-4">Transaction Info</th>
                <th className="px-6 py-4">Athlete Details</th>
                <th className="px-6 py-4">Class Target</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredPayments.map((p) => {
                const dateObj = new Date(p.created_at);
                const dateStr = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                const timeStr = dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

                return (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-black text-slate-800 text-base">{formatRupiah(p.amount)}</div>
                      <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 font-medium">
                        <Clock size={12} /> {dateStr} {timeStr}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                          <User size={16} />
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 text-sm">{p.students?.users?.full_name || "Unknown Athlete"}</div>
                          <div className="text-xs text-slate-500 font-mono mt-0.5">NIS: {p.students?.nis}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Layers size={16} className="text-indigo-400" />
                        <span className="font-bold text-slate-700 text-sm">{p.classes?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(p.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openReviewModal(p)}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl font-bold text-xs transition-colors shadow-sm"
                      >
                        <Eye size={14} /> Review
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredPayments.length === 0 && !loading && (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center text-slate-400">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertTriangle size={32} className={filterStatus === 'pending' ? 'text-amber-300' : 'text-slate-300'} />
                    </div>
                    <p className="font-bold text-slate-600">Tidak ada data ditemukan</p>
                    <p className="text-sm mt-1">Antrean {filterStatus} saat ini kosong.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================== */}
      {/* MODAL REVIEW PEMBAYARAN                    */}
      {/* ========================================== */}
      {isModalOpen && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200 py-6 overflow-y-auto">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row my-auto max-h-full animate-in zoom-in-95 duration-200">
            
            {/* KIRI: Preview Gambar Bukti */}
            <div className="w-full md:w-1/2 bg-slate-100 p-6 flex flex-col items-center justify-center border-r border-slate-200 min-h-[300px] relative">
              <div className="absolute top-4 left-4 z-10">
                <span className="px-3 py-1 bg-white/80 backdrop-blur-md text-slate-700 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                  <ImageIcon size={14} /> Bukti Transfer
                </span>
              </div>
              <a href={selectedPayment.receipt_url} target="_blank" rel="noopener noreferrer" className="relative group w-full h-full max-h-[60vh] flex items-center justify-center">
                <img 
                  src={selectedPayment.receipt_url} 
                  alt="Receipt" 
                  className="max-w-full max-h-full object-contain rounded-xl shadow-md border border-slate-200"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-sm bg-black/50 px-4 py-2 rounded-full backdrop-blur-md">Klik untuk perbesar</span>
                </div>
              </a>
            </div>

            {/* KANAN: Detail & Actions */}
            <div className="w-full md:w-1/2 p-8 flex flex-col bg-white">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Review Payment</h3>
                  <p className="text-sm text-slate-500 font-medium mt-1">ID: {selectedPayment.id.split("-")[0]}</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-50 rounded-full text-slate-400 hover:bg-slate-100 transition-all">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-5 flex-1">
                {/* Info Block */}
                <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-500 uppercase">Athlete Name</span>
                    <span className="text-sm font-bold text-slate-800">{selectedPayment.students?.users?.full_name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-500 uppercase">Target Class</span>
                    <span className="text-sm font-bold text-indigo-600">{selectedPayment.classes?.name}</span>
                  </div>
                  <div className="border-t border-blue-100 my-2 pt-2"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-500 uppercase">Amount Paid</span>
                    <span className="text-lg font-black text-emerald-600">{formatRupiah(selectedPayment.amount)}</span>
                  </div>
                </div>

                {/* Status Indicator */}
                {selectedPayment.status !== 'pending' && (
                  <div className={`p-4 rounded-xl border ${selectedPayment.status === 'approved' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                    <div className="flex items-center gap-2 font-bold text-sm mb-1">
                      {selectedPayment.status === 'approved' ? <CheckCircle2 size={18}/> : <XCircle size={18}/>}
                      This payment is already {selectedPayment.status}
                    </div>
                    {selectedPayment.status === 'rejected' && selectedPayment.reject_reason && (
                      <p className="text-xs mt-1 font-medium opacity-80">Reason: {selectedPayment.reject_reason}</p>
                    )}
                  </div>
                )}

                {/* Reject Reason Input (Jika sedang proses reject) */}
                {isRejecting && selectedPayment.status === 'pending' && (
                  <div className="animate-in slide-in-from-top-2 fade-in">
                    <label className="block text-[10px] font-bold text-red-500 uppercase tracking-wider mb-2 ml-1">
                      Alasan Penolakan (Wajib)
                    </label>
                    <textarea
                      autoFocus
                      rows={3}
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Tulis alasan spesifik (misal: Bukti transfer buram, nominal tidak sesuai...)"
                      className="w-full bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-400 outline-none transition-all resize-none text-red-900 placeholder-red-300"
                    />
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              {selectedPayment.status === 'pending' && (
                <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col gap-3">
                  {!isRejecting ? (
                    <>
                      <button
                        onClick={handleApprove}
                        disabled={actionLoading}
                        className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 size={18} /> Approve & Enroll Student
                      </button>
                      <button
                        onClick={() => setIsRejecting(true)}
                        disabled={actionLoading}
                        className="w-full py-3 text-red-600 hover:bg-red-50 font-bold rounded-xl transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 border border-transparent hover:border-red-100"
                      >
                        <XCircle size={18} /> Reject Payment
                      </button>
                    </>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={() => setIsRejecting(false)}
                        disabled={actionLoading}
                        className="flex-1 py-3 text-slate-500 bg-slate-100 hover:bg-slate-200 font-bold rounded-xl transition-all active:scale-[0.98]"
                      >
                        Batal
                      </button>
                      <button
                        onClick={handleReject}
                        disabled={actionLoading}
                        className="flex-[2] py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-500/30 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
                      >
                        {actionLoading ? "Processing..." : "Konfirmasi Tolak"}
                      </button>
                    </div>
                  )}
                  
                  {/* Warning Note */}
                  <div className="flex items-start gap-2 mt-2 px-1 text-slate-400">
                    <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] font-medium leading-tight">
                      Menerima pembayaran (Approve) akan langsung mendaftarkan atlet ke kelas terkait dan mengurangi kuota kelas.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}