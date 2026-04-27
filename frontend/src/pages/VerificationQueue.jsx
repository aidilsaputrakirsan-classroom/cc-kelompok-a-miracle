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
import Swal from 'sweetalert2';

export const VerificationQueue = () => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          to="/admin" 
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
          title="Kembali ke Dashboard"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Antrean Verifikasi</h1>
          <p className="text-slate-500 text-sm">Validasi laporan donor darah dari pendonor untuk memberikan point.</p>
        </div>
      </div>

      <div className="grid gap-4">
        {queue.map((item) => (
          <div key={item.id_riwayat} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-slate-900">Laporan Donor #{item.id_riwayat}</span>
                  <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[10px] font-bold uppercase rounded-md border border-amber-100">
                    Pending
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
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

            <div className="flex items-center gap-3 border-t md:border-t-0 pt-4 md:pt-0">
              <button
                onClick={() => openDetail(item)}
                className="flex-1 md:flex-none px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                <span>Tinjau</span>
              </button>
              <button 
                onClick={() => handleVerify(item.id_riwayat, 'rejected')}
                className="flex-1 md:flex-none px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                <span>Tolak</span>
              </button>
              <button 
                onClick={() => handleVerify(item.id_riwayat, 'approved')}
                className="flex-1 md:flex-none px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-sm shadow-emerald-100"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Setujui</span>
              </button>
            </div>
          </div>
        ))}

        {queue.length === 0 && !loading && (
          <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-200 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-slate-200" />
            </div>
            <h3 className="text-slate-900 font-medium">Semua Bersih!</h3>
            <p className="text-slate-500 text-sm mt-1">Tidak ada laporan donor yang menunggu verifikasi saat ini.</p>
          </div>
        )}
      </div>

      {selectedItem && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={closeDetail}
          />

          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-slate-100">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-[#660000] to-[#7d0f0f] text-white">
              <div>
                <h2 className="text-xl font-black">Detail Laporan Donor #{selectedItem.id_riwayat}</h2>
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
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <p className="text-xs text-slate-500 uppercase font-bold mb-1">ID Riwayat</p>
                  <p className="font-semibold text-slate-900">{selectedItem.id_riwayat}</p>
                </div>
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 shadow-sm">
                  <p className="text-xs text-slate-500 uppercase font-bold mb-1">Status</p>
                  <p className="font-semibold text-amber-700">Pending Verifikasi</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <p className="text-xs text-slate-500 uppercase font-bold mb-1">ID Pendonor</p>
                  <p className="font-semibold text-slate-900">{selectedItem.id_pendonor}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <p className="text-xs text-slate-500 uppercase font-bold mb-1">Golongan Darah Laporan</p>
                  <p className="font-semibold text-slate-900">{selectedItem.golongan_darah}</p>
                </div>
              </div>

              {detailLoading ? (
                <div className="text-sm text-slate-500">Memuat detail pendonor...</div>
              ) : selectedDonor ? (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Data Pendonor</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="bg-white p-4 rounded-2xl border border-slate-100">
                      <p className="text-xs text-slate-500 uppercase font-bold mb-1">Nama Lengkap</p>
                      <p className="font-semibold text-slate-900">{selectedDonor.nama_lengkap || '-'}</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-100">
                      <p className="text-xs text-slate-500 uppercase font-bold mb-1">Jenis Kelamin</p>
                      <p className="font-semibold text-slate-900">{selectedDonor.jenis_kelamin || '-'}</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-100">
                      <p className="text-xs text-slate-500 uppercase font-bold mb-1">Usia</p>
                      <p className="font-semibold text-slate-900">{selectedDonor.umur || '-'} Tahun</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-100">
                      <p className="text-xs text-slate-500 uppercase font-bold mb-1">Tanggal Lahir</p>
                      <p className="font-semibold text-slate-900">{selectedDonor.tanggal_lahir || '-'}</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-100">
                      <p className="text-xs text-slate-500 uppercase font-bold mb-1">Berat Badan</p>
                      <p className="font-semibold text-slate-900">{selectedDonor.berat_badan || '-'} kg</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-100">
                      <p className="text-xs text-slate-500 uppercase font-bold mb-1">Tinggi Badan</p>
                      <p className="font-semibold text-slate-900">{selectedDonor.tinggi_badan || '-'} cm</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-100">
                      <p className="text-xs text-slate-500 uppercase font-bold mb-1">No. Telepon</p>
                      <p className="font-semibold text-slate-900">{selectedDonor.no_telepon || '-'}</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-100">
                      <p className="text-xs text-slate-500 uppercase font-bold mb-1">Email</p>
                      <p className="font-semibold text-slate-900">{selectedDonor.email || '-'}</p>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-100 text-sm">
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Alamat</p>
                    <p className="font-semibold text-slate-900">{selectedDonor.alamat || '-'}</p>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-100 text-sm">
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Riwayat Kesehatan</p>
                    <p className="font-semibold text-slate-900">{selectedDonor.riwayat_kesehatan || '-'}</p>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-slate-500">Detail pendonor tidak ditemukan.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};