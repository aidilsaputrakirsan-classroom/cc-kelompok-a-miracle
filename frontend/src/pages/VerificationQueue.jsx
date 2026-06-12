import { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  User,
  ArrowLeft,
  Droplets,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import Swal from 'sweetalert2';
import { ServiceUnavailable } from '../components/ServiceUnavailable';

export const VerificationQueue = () => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [donorDetailsMap, setDonorDetailsMap] = useState({});

  const fetchQueue = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const res = await apiService.getPendingVerifications({ limit: 500 });
      const queueData = res.data.riwayat_donor;
      setQueue(queueData);

      // Fetch donor name & gender for all unique pendonor IDs in parallel
      const uniqueIds = [...new Set(queueData.map(r => r.id_pendonor))];
      const results = await Promise.allSettled(
        uniqueIds.map(id => apiService.getPendonorById(id))
      );
      const map = {};
      results.forEach((result, idx) => {
        if (result.status === 'fulfilled') {
          map[uniqueIds[idx]] = result.value.data;
        }
      });
      setDonorDetailsMap(map);
    } catch (err) {
      console.error('Gagal mengambil antrean verifikasi:', err);
      setError(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleVerify = async (id, status) => {
    const isApproved = status === 'approved';
    const result = await Swal.fire({
      title: isApproved ? 'Setujui Laporan?' : 'Tolak Laporan?',
      text: isApproved 
        ? "Apakah Anda yakin ingin menyetujui laporan donor ini?" 
        : "Apakah Anda yakin ingin menolak laporan donor ini?",
      icon: isApproved ? 'question' : 'warning',
      showCancelButton: true,
      confirmButtonColor: isApproved ? '#10b981' : '#dc2626',
      cancelButtonColor: '#64748b',
      confirmButtonText: isApproved ? 'Ya, Setujui' : 'Ya, Tolak',
      cancelButtonText: 'Batal'
    });

    if (!result.isConfirmed) return;

    setVerifying(true);
    try {
      await apiService.verifyRiwayatDonor(id, { 
        status_verifikasi: isApproved
      });
      setQueue(prev => prev.filter(report => report.id_riwayat !== id));
      Swal.fire({
        title: 'Berhasil!',
        text: isApproved ? 'Laporan berhasil disetujui.' : 'Laporan telah ditolak.',
        icon: 'success',
        confirmButtonColor: '#660000'
      });
    } catch (err) {
      console.error('Gagal memverifikasi:', err);
      Swal.fire({
        title: 'Error!',
        text: 'Gagal memproses verifikasi.',
        icon: 'error',
        confirmButtonColor: '#660000'
      });
    } finally {
      setVerifying(false);
    }
  };

  const openDetail = async (report) => {
    setSelectedReport(report);
    setSelectedDonor(null);
    setDetailLoading(true);

    try {
      const donorRes = await apiService.getPendonorById(report.id_pendonor);
      setSelectedDonor(donorRes.data);
    } catch (err) {
      console.error('Gagal mengambil detail pendonor:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setSelectedReport(null);
    setSelectedDonor(null);
  };

  if (loading && !error) {
    return <LoadingSpinner fullPage />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 -m-6 lg:-m-10 p-6 lg:p-10 pb-10 text-white rounded-b-[3rem] shadow-lg shadow-indigo-900/20 dark:from-indigo-950 dark:via-indigo-900 dark:to-slate-950 transition-colors">
        <div className="flex items-center gap-3 mb-4">
          <Link
            to="/admin"
            className="p-2 hover:bg-white/20 rounded-full transition-colors text-white/60 hover:text-white"
            title="Kembali ke Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="text-white/50 text-sm font-medium">Dashboard Admin</span>
        </div>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-black mb-1">Antrean Verifikasi</h1>
            <p className="text-white/70 font-medium text-sm">Validasi laporan donor darah dari pendonor untuk memberikan poin.</p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => fetchQueue(true)}
              disabled={refreshing || loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-xs font-semibold transition-all disabled:opacity-50"
              title="Perbarui antrean"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Memperbarui...' : 'Perbarui'}
            </button>
            {!loading && (
              <div className={`px-4 py-2 rounded-2xl font-black text-2xl leading-none shadow-lg ${
                queue.length > 0
                  ? 'bg-amber-400 text-amber-900'
                  : 'bg-white/10 text-white/50'
              }`}>
                {queue.length}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {error ? (
          <ServiceUnavailable onRetry={fetchQueue} error={error} />
        ) : (
          <>
            {queue.map((report) => {
              const donor = donorDetailsMap[report.id_pendonor];
              return (
                <div key={report.id_riwayat} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                    {/* Left — donor info */}
                    <div className="flex items-center gap-4 p-5 flex-1 min-w-0">
                      {/* Avatar / initials */}
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/30 flex items-center justify-center flex-shrink-0">
                        {donor ? (
                          <span className="text-base font-black text-indigo-700 dark:text-indigo-400">
                            {donor.nama_lengkap.charAt(0).toUpperCase()}
                          </span>
                        ) : (
                          <User className="w-5 h-5 text-indigo-400 dark:text-indigo-500" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        {/* Name & pending badge */}
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-bold text-slate-900 dark:text-white truncate">
                            {donor ? donor.nama_lengkap : `Pendonor #${report.id_pendonor}`}
                          </span>
                          <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-[10px] font-black uppercase rounded-lg border border-amber-200 dark:border-amber-900/40 flex items-center gap-1 flex-shrink-0">
                            <Clock className="w-3 h-3" />
                            Menunggu
                          </span>
                        </div>

                        {/* Gender · Blood type · Report ID */}
                        <div className="flex items-center flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400">
                          {donor && (
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {donor.jenis_kelamin} · {donor.umur} th
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Droplets className="w-3 h-3 text-[#660000]/60 dark:text-red-400/60" />
                            <span className="font-semibold text-[#660000] dark:text-red-400">{report.golongan_darah}</span>
                          </span>
                          <span className="text-slate-400 dark:text-slate-500">Laporan #{report.id_riwayat}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right — actions */}
                    <div className="flex items-center gap-2 px-5 pb-5 sm:pb-0 sm:border-l sm:border-slate-100 sm:dark:border-slate-800 flex-shrink-0">
                      <button
                        onClick={() => openDetail(report)}
                        disabled={verifying}
                        className="px-3.5 py-2 border border-indigo-200 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-400 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors flex items-center gap-1.5 text-sm font-medium disabled:opacity-50 whitespace-nowrap"
                      >
                        <FileText className="w-4 h-4" />
                        Tinjau
                      </button>
                      <button
                        onClick={() => handleVerify(report.id_riwayat, 'rejected')}
                        disabled={verifying}
                        className="px-3.5 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-200 dark:hover:border-red-900/40 hover:text-red-600 dark:hover:text-red-400 transition-colors flex items-center gap-1.5 text-sm font-medium disabled:opacity-50 whitespace-nowrap"
                      >
                        <XCircle className="w-4 h-4" />
                        Tolak
                      </button>
                      <button
                        onClick={() => handleVerify(report.id_riwayat, 'approved')}
                        disabled={verifying}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors flex items-center gap-1.5 text-sm font-medium shadow-sm disabled:opacity-50 whitespace-nowrap"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Setujui
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {queue.length === 0 && !loading && (
              <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-center">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-slate-200 dark:text-slate-700" />
                </div>
                <h3 className="text-slate-900 dark:text-white font-medium">Semua Bersih!</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Tidak ada laporan donor yang menunggu verifikasi saat ini.</p>
              </div>
            )}
          </>
        )}
      </div>

      {selectedReport && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={closeDetail}
          />

          <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-slate-100 dark:border-slate-800">
            <div className="p-6 border-b border-indigo-900/30 flex items-center justify-between bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-900 text-white">
              <div>
                <h2 className="text-xl font-black">Detail Laporan Donor #{selectedReport.id_riwayat}</h2>
                <p className="text-sm text-white/80 mt-1">Tinjau data sebelum verifikasi.</p>
              </div>
              <button
                onClick={closeDetail}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm">
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">ID Riwayat</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{selectedReport.id_riwayat}</p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/30 shadow-sm">
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">Status</p>
                  <p className="font-semibold text-amber-700 dark:text-amber-400">Pending Verifikasi</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm">
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">ID Pendonor</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{selectedReport.id_pendonor}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm">
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">Golongan Darah Laporan</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{selectedReport.golongan_darah}</p>
                </div>
              </div>

              {detailLoading ? (
                <div className="text-sm text-slate-500 dark:text-slate-400">Memuat detail pendonor...</div>
              ) : selectedDonor ? (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Data Pendonor</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="bg-white dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">Nama Lengkap</p>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{selectedDonor.nama_lengkap || '-'}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">Jenis Kelamin</p>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{selectedDonor.jenis_kelamin || '-'}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">Usia</p>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{selectedDonor.umur || '-'} Tahun</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">Tanggal Lahir</p>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{selectedDonor.tanggal_lahir || '-'}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">Berat Badan</p>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{selectedDonor.berat_badan || '-'} kg</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">Tinggi Badan</p>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{selectedDonor.tinggi_badan || '-'} cm</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">No. Telepon</p>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{selectedDonor.no_telepon || '-'}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">Email</p>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{selectedDonor.email || '-'}</p>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 text-sm">
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">Alamat</p>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{selectedDonor.alamat || '-'}</p>
                  </div>

                  <div className="bg-white dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 text-sm">
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">Riwayat Kesehatan</p>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{selectedDonor.riwayat_kesehatan || '-'}</p>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-slate-500 dark:text-slate-400">Detail pendonor tidak ditemukan.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};