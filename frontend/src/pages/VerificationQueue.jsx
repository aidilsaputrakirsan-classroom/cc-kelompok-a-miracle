import { useState, useEffect } from 'react';
import { 
  X,
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText,
  User,
  ArrowLeft,
  Droplets
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import Swal from 'sweetalert2';

export const VerificationQueue = () => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const res = await apiService.getPendingVerifications();
        setQueue(res.data.riwayat_donor);
      } catch (err) {
        console.error('Gagal mengambil antrean verifikasi:', err);
      } finally {
        setLoading(false);
      }
    };
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
      setQueue(prev => prev.filter(item => item.id_riwayat !== id));
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

  const openDetail = async (item) => {
    setSelectedItem(item);
    setSelectedDonor(null);
    setDetailLoading(true);

    try {
      const donorRes = await apiService.getPendonorById(item.id_pendonor);
      setSelectedDonor(donorRes.data);
    } catch (err) {
      console.error('Gagal mengambil detail pendonor:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setSelectedItem(null);
    setSelectedDonor(null);
  };

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          to="/admin" 
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500 dark:text-slate-400"
          title="Kembali ke Dashboard"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white transition-colors">Antrean Verifikasi</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Validasi laporan donor darah dari pendonor untuk memberikan point.</p>
        </div>
      </div>

      <div className="grid gap-4">
        {queue.map((item) => (
          <div key={item.id_riwayat} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400 transition-colors">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-slate-900 dark:text-white">Laporan Donor #{item.id_riwayat}</span>
                  <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[10px] font-bold uppercase rounded-md border border-amber-100 dark:border-amber-800">
                    Pending
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>ID Pendonor: {item.id_pendonor}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5" />
                    <span>Golongan Darah: {item.golongan_darah}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 border-t md:border-t-0 pt-4 md:pt-0 dark:border-slate-800">
              <button
                onClick={() => openDetail(item)}
                disabled={verifying}
                className="flex-1 md:flex-none px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <FileText className="w-4 h-4" />
                <span>Tinjau</span>
              </button>
              <button 
                onClick={() => handleVerify(item.id_riwayat, 'rejected')}
                disabled={verifying}
                className="flex-1 md:flex-none px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                <span>Tolak</span>
              </button>
              <button 
                onClick={() => handleVerify(item.id_riwayat, 'approved')}
                disabled={verifying}
                className="flex-1 md:flex-none px-4 py-2 bg-emerald-600 dark:bg-emerald-700 text-white rounded-xl hover:bg-emerald-700 dark:hover:bg-emerald-800 transition-colors flex items-center justify-center gap-2 shadow-sm shadow-emerald-100 dark:shadow-none disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Setujui</span>
              </button>
            </div>
          </div>
        ))}

        {queue.length === 0 && !loading && (
          <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center transition-colors">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
              <CheckCircle2 className="w-8 h-8 text-slate-200 dark:text-slate-700" />
            </div>
            <h3 className="text-slate-900 dark:text-white font-medium">Semua Bersih!</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Tidak ada laporan donor yang menunggu verifikasi saat ini.</p>
          </div>
        )}
      </div>

      {selectedItem && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={closeDetail}
          />

          <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-slate-100 dark:border-slate-800 transition-colors">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-[#660000] to-[#7d0f0f] dark:from-red-950 dark:to-red-900 text-white transition-colors">
              <div>
                <h2 className="text-xl font-black">Detail Laporan Donor #{selectedItem.id_riwayat}</h2>
                <p className="text-sm text-white/80 mt-1 dark:text-slate-300">Tinjau data sebelum verifikasi.</p>
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
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">ID Riwayat</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{selectedItem.id_riwayat}</p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-2xl border border-amber-100 dark:border-amber-800 shadow-sm transition-colors">
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">Status</p>
                  <p className="font-semibold text-amber-700 dark:text-amber-500">Pending Verifikasi</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">ID Pendonor</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{selectedItem.id_pendonor}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">Golongan Darah Laporan</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{selectedItem.golongan_darah}</p>
                </div>
              </div>

              {detailLoading ? (
                <div className="text-sm text-slate-500 dark:text-slate-400">Memuat detail pendonor...</div>
              ) : selectedDonor ? (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Data Pendonor</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 transition-colors">
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">Nama Lengkap</p>
                      <p className="font-semibold text-slate-900 dark:text-white">{selectedDonor.nama_lengkap || '-'}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 transition-colors">
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">Jenis Kelamin</p>
                      <p className="font-semibold text-slate-900 dark:text-white">{selectedDonor.jenis_kelamin || '-'}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 transition-colors">
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">Usia</p>
                      <p className="font-semibold text-slate-900 dark:text-white">{selectedDonor.umur || '-'} Tahun</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 transition-colors">
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">Tanggal Lahir</p>
                      <p className="font-semibold text-slate-900 dark:text-white">{selectedDonor.tanggal_lahir || '-'}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 transition-colors">
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">Berat Badan</p>
                      <p className="font-semibold text-slate-900 dark:text-white">{selectedDonor.berat_badan || '-'} kg</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 transition-colors">
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">Tinggi Badan</p>
                      <p className="font-semibold text-slate-900 dark:text-white">{selectedDonor.tinggi_badan || '-'} cm</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 transition-colors">
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">No. Telepon</p>
                      <p className="font-semibold text-slate-900 dark:text-white">{selectedDonor.no_telepon || '-'}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 transition-colors">
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">Email</p>
                      <p className="font-semibold text-slate-900 dark:text-white">{selectedDonor.email || '-'}</p>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-sm transition-colors">
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">Alamat</p>
                    <p className="font-semibold text-slate-900 dark:text-white">{selectedDonor.alamat || '-'}</p>
                  </div>

                  <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-sm transition-colors">
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">Riwayat Kesehatan</p>
                    <p className="font-semibold text-slate-900 dark:text-white">{selectedDonor.riwayat_kesehatan || '-'}</p>
                  </div>

                  {selectedItem.bukti_donor && (
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-sm transition-colors">
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mb-3">Bukti Donor (Sertifikat/Kartu)</p>
                      <div className="relative group overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                        <img 
                          src={selectedItem.bukti_donor} 
                          alt="Bukti Donor" 
                          className="w-full h-auto max-h-[400px] object-contain transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                           <ImageIcon className="w-10 h-10 text-white" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-slate-500 dark:text-slate-400 transition-colors">Detail pendonor tidak ditemukan.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};