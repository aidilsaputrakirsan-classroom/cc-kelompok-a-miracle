import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Phone,
  Calendar,
  MapPin,
  ArrowLeft,
  X,
  User,
  Scale,
  Ruler,
  Droplets,
  Activity,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import Swal from 'sweetalert2';

export const DonorList = () => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [filters, setFilters] = useState({
    golongan_darah: '',
    jenis_kelamin: '',
    umur_min: '',
    umur_max: ''
  });

  const fetchDonors = async () => {
    setLoading(true);
    try {
      const params = {
        nama: searchTerm || undefined,
        golongan_darah: filters.golongan_darah || undefined,
        jenis_kelamin: filters.jenis_kelamin || undefined,
        umur_min: filters.umur_min || undefined,
        umur_max: filters.umur_max || undefined
      };
      
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== undefined)
      );
      
      const res = await apiService.getPendonorList(cleanParams);
      const donorData = res.data.pendonor || [];
      const verifiedRes = await apiService.getRiwayatDonorAll({ status_verifikasi: true, limit: 1000 });
      const verifiedRiwayat = verifiedRes.data.riwayat_donor || [];
      const verifiedIds = new Set(verifiedRiwayat.map((r) => r.id_pendonor));

      setDonors(donorData.filter((donor) => verifiedIds.has(donor.id_pendonor)));
    } catch (err) {
      console.error('Gagal mengambil data pendonor:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, [searchTerm, filters]);

  const handleOpenDonorDetail = async (donor) => {
    setSelectedDonor(donor);
    setErrorMessage('');
  };

  const handleDeleteDonor = async () => {
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Tindakan ini akan menghapus data pendonor dan tidak dapat dibatalkan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#660000',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (!result.isConfirmed) return;

    setDeleting(true);
    setErrorMessage('');
    try {
      await apiService.deletePendonor(selectedDonor.id_pendonor);
      setSelectedDonor(null);
      fetchDonors();
      Swal.fire({
        title: 'Terhapus!',
        text: 'Data pendonor berhasil dihapus.',
        icon: 'success',
        confirmButtonColor: '#660000'
      });
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || 'Gagal menghapus data pendonor.');
      Swal.fire({
        title: 'Error!',
        text: err.response?.data?.detail || 'Gagal menghapus data pendonor.',
        icon: 'error',
        confirmButtonColor: '#660000'
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link 
            to="/admin" 
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
            title="Kembali ke Dashboard Utama"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard Pendonor</h1>
            <p className="text-slate-500 text-sm">Pengelolaan dan verifikasi data pendonor.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Cari nama..." 
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-[#660000] transition-all text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-3">
              <select 
                className="px-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-[#660000] transition-all text-sm min-w-[140px]"
                value={filters.golongan_darah}
                onChange={(e) => setFilters({...filters, golongan_darah: e.target.value})}
              >
                <option value="">Semua Gol. Darah</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>

              <select 
                className="px-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-[#660000] transition-all text-sm min-w-[140px]"
                value={filters.jenis_kelamin}
                onChange={(e) => setFilters({...filters, jenis_kelamin: e.target.value})}
              >
                <option value="">Semua Gender</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>

              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  placeholder="Min Umur"
                  className="w-20 px-3 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-[#660000] transition-all text-sm"
                  value={filters.umur_min}
                  onChange={(e) => setFilters({...filters, umur_min: e.target.value})}
                />
                <span className="text-slate-300">-</span>
                <input 
                  type="number" 
                  placeholder="Max Umur"
                  className="w-20 px-3 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-[#660000] transition-all text-sm"
                  value={filters.umur_max}
                  onChange={(e) => setFilters({...filters, umur_max: e.target.value})}
                />
              </div>

              <button 
                onClick={() => {
                  setSearchTerm('');
                  setFilters({ golongan_darah: '', jenis_kelamin: '', umur_min: '', umur_max: '' });
                }}
                className="p-2.5 text-slate-400 hover:text-[#660000] hover:bg-[#660000]/10 rounded-xl transition-all"
                title="Reset Filter"
              >
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#660000] text-white text-[10px] uppercase tracking-wider">
                <th className="px-4 py-3 font-bold border-r border-white/10">Tanggal</th>
                <th className="px-4 py-3 font-bold border-r border-white/10">Nama Pendonor</th>
                <th className="px-4 py-3 font-bold border-r border-white/10 text-center">Berat</th>
                <th className="px-4 py-3 font-bold border-r border-white/10 text-center">Tinggi</th>
                <th className="px-4 py-3 font-bold border-r border-white/10 text-center">GolDar</th>
                <th className="px-4 py-3 font-bold border-r border-white/10 text-center">Usia</th>
                <th className="px-4 py-3 font-bold border-r border-white/10">Telepon</th>
                <th className="px-4 py-3 font-bold border-r border-white/10">Email</th>
                <th className="px-4 py-3 font-bold border-r border-white/10">Tgl Lahir</th>
                <th className="px-4 py-3 font-bold border-r border-white/10">Alamat</th>
                <th className="px-4 py-3 font-bold border-r border-white/10">Donor Terakhir</th>
                <th className="px-4 py-3 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={12} className="px-6 py-12">
                    <LoadingSpinner />
                  </td>
                </tr>
              ) : donors.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-6 py-12 text-center text-slate-400">Tidak ada data pendonor ditemukan.</td>
                </tr>
              ) : (
                donors.map((donor) => (
                  <tr key={donor.id_pendonor} className="hover:bg-slate-50/50 transition-colors group text-xs">
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {donor.created_at ? format(new Date(donor.created_at), 'dd MMM yyyy', { locale: id }) : '-'}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {donor.nama_lengkap}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-600">
                      {donor.berat_badan} kg
                    </td>
                    <td className="px-4 py-3 text-center text-slate-600">
                      {donor.tinggi_badan} cm
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-bold text-[#660000]">{donor.golongan_darah}</span>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-600">
                      {donor.umur} th
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {donor.no_telepon}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {donor.email}
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {donor.tanggal_lahir}
                    </td>
                    <td className="px-4 py-3 text-slate-500 max-w-[150px] truncate">
                      {donor.alamat}
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {donor.tanggal_terakhir_donor || '-'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => handleOpenDonorDetail(donor)}
                        className="p-1.5 text-slate-400 hover:text-[#660000] hover:bg-[#660000]/10 rounded-lg transition-all"
                        title="Lihat Detail"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedDonor && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDonor(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#660000] text-white flex items-center justify-center shadow-lg shadow-[#660000]/20">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Detail Pendonor</h2>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">ID: {selectedDonor.id_pendonor}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedDonor(null)}
                  className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-slate-500" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto custom-scrollbar space-y-8">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Nama Lengkap</p>
                        <p className="font-semibold text-slate-900">{selectedDonor.nama_lengkap}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                        <Activity className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Gender & Usia</p>
                        <p className="font-semibold text-slate-900">{selectedDonor.jenis_kelamin}, {selectedDonor.umur} Tahun</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tanggal Lahir</p>
                        <p className="font-semibold text-slate-900">{selectedDonor.tanggal_lahir}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 bg-green-50 text-green-600 rounded-xl">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">No. Telepon</p>
                        <p className="font-semibold text-slate-900">{selectedDonor.no_telepon}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Alamat</p>
                        <p className="font-semibold text-slate-900 leading-relaxed">{selectedDonor.alamat}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* Physical Info */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl text-center">
                    <Scale className="w-5 h-5 text-slate-400 mx-auto mb-2" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Berat</p>
                    <p className="font-bold text-slate-900">{selectedDonor.berat_badan} kg</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl text-center">
                    <Ruler className="w-5 h-5 text-slate-400 mx-auto mb-2" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tinggi</p>
                    <p className="font-bold text-slate-900">{selectedDonor.tinggi_badan} cm</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl text-center border-2 border-[#660000]/10">
                    <Droplets className="w-5 h-5 text-[#660000] mx-auto mb-2" />
                    <p className="text-[10px] font-bold text-[#660000] uppercase tracking-wider mb-1">Gol. Darah</p>
                    <p className="font-black text-xl text-[#660000]">{selectedDonor.golongan_darah}</p>
                  </div>
                </div>

                <div className="bg-[#660000]/5 p-6 rounded-3xl border border-[#660000]/10">
                  <h3 className="text-sm font-bold text-[#660000] uppercase tracking-widest mb-2">Status Donor</h3>
                  <p className="text-sm text-slate-700">
                    Data pada halaman ini hanya pendonor yang sudah memiliki riwayat donor terverifikasi admin.
                  </p>
                </div>

                {/* Health History */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <Activity className="w-4 h-4 text-slate-400" />
                    Riwayat Kesehatan
                  </h3>
                  <div className="bg-slate-50 p-5 rounded-2xl text-slate-600 text-sm leading-relaxed italic">
                    "{selectedDonor.riwayat_kesehatan || 'Tidak ada catatan riwayat kesehatan.'}"
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                <button
                  onClick={handleDeleteDonor}
                  disabled={deleting}
                  className={`flex-1 py-4 bg-red-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-black/10 flex items-center justify-center gap-2 ${deleting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-red-600'}`}
                >
                  {deleting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Menghapus...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-5 h-5" />
                      Hapus
                    </>
                  )}
                </button>
                <button
                  onClick={() => setSelectedDonor(null)}
                  disabled={deleting}
                  className="flex-1 py-4 bg-slate-200 text-slate-900 rounded-2xl font-bold hover:bg-slate-300 transition-all disabled:opacity-50"
                >
                  Tutup Detail
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};