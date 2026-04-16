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
  Heart,
  Activity,
  AlertCircle,
  Trash2,
  CheckCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export const DonorList = () => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [isEditingDonor, setIsEditingDonor] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [unverifiedRiwayat, setUnverifiedRiwayat] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [donorVerificationStatus, setDonorVerificationStatus] = useState({}); // Track which donors are verified
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
      const donorData = res.data.pendonor;
      setDonors(donorData);

      // Fetch verification status for all donors to populate tabs
      const statusMap = {};
      for (const donor of donorData) {
        try {
          const rRes = await apiService.getRiwayatDonorByPendonor(donor.id_pendonor);
          const unverified = rRes.data.riwayat_donor?.find(r => !r.status_verifikasi);
          const hasVerified = rRes.data.riwayat_donor?.some(r => r.status_verifikasi);
          statusMap[donor.id_pendonor] = { unverified, hasVerified };
        } catch (e) {
          console.error(`Error fetching status for donor ${donor.id_pendonor}:`, e);
        }
      }
      setDonorVerificationStatus(statusMap);
    } catch (err) {
      console.error('Gagal mengambil data pendonor:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, [searchTerm, filters]);

  const checkUnverifiedRiwayat = async (donorId) => {
    try {
      const res = await apiService.getRiwayatDonorByPendonor(donorId);
      // Check if ada riwayat yang unverified
      const unverified = res.data.riwayat_donor && res.data.riwayat_donor.length > 0 
        ? res.data.riwayat_donor.find(r => !r.status_verifikasi)
        : null;
      const hasVerified = res.data.riwayat_donor && res.data.riwayat_donor.some(r => r.status_verifikasi);
      
      setUnverifiedRiwayat(unverified);
      setDonorVerificationStatus(prev => ({
        ...prev,
        [donorId]: { unverified, hasVerified }
      }));
    } catch (err) {
      console.error('Error checking riwayat:', err);
      setUnverifiedRiwayat(null);
    }
  };

  const handleVerifyDonor = async (riwayatId) => {
    if (!window.confirm('Verifikasi riwayat donor ini?')) return;
    
    try {
      await apiService.verifyRiwayatDonor(riwayatId, { status_verifikasi: true });
      setUnverifiedRiwayat(null);
      if (selectedDonor) {
        await checkUnverifiedRiwayat(selectedDonor.id_pendonor);
      }
      alert('Riwayat donor berhasil diverifikasi!');
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || 'Gagal memverifikasi riwayat donor.');
    }
  };

  const handleOpenDonorDetail = async (donor) => {
    setSelectedDonor(donor);
    setEditFormData({
      nama_lengkap: donor.nama_lengkap,
      jenis_kelamin: donor.jenis_kelamin,
      umur: donor.umur,
      tanggal_lahir: donor.tanggal_lahir,
      berat_badan: donor.berat_badan,
      tinggi_badan: donor.tinggi_badan,
      no_telepon: donor.no_telepon,
      alamat: donor.alamat,
      golongan_darah: donor.golongan_darah,
      riwayat_kesehatan: donor.riwayat_kesehatan
    });
    setIsEditingDonor(false);
    setErrorMessage('');
    await checkUnverifiedRiwayat(donor.id_pendonor);
  };

  const handleUpdateDonor = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      await apiService.updatePendonor(selectedDonor.id_pendonor, editFormData);
      setIsEditingDonor(false);
      fetchDonors();
      alert('Data pendonor berhasil diperbarui!');
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || 'Gagal memperbarui data pendonor.');
    }
  };

  const handleDeleteDonor = async () => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data pendonor ini? Tindakan ini tidak dapat dibatalkan.')) {
      return;
    }
    setErrorMessage('');
    try {
      await apiService.deletePendonor(selectedDonor.id_pendonor);
      setSelectedDonor(null);
      fetchDonors();
      alert('Data pendonor berhasil dihapus!');
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || 'Gagal menghapus data pendonor.');
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
                  <td colSpan={12} className="px-6 py-12 text-center text-slate-400">Memuat data...</td>
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

                {/* Donation History / Verification */}
                <div className="bg-[#660000]/5 p-6 rounded-3xl border border-[#660000]/10">
                  <h3 className="text-sm font-bold text-[#660000] uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    Status Verifikasi Donor
                  </h3>
                  
                  {unverifiedRiwayat ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-white rounded-2xl border border-[#660000]/10 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-400 uppercase">Laporan Baru</span>
                          <span className="px-2 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-md">PENDING</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Tanggal Donor</p>
                            <p className="font-bold text-slate-900">{unverifiedRiwayat.tanggal_donor || '-'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Tempat</p>
                            <p className="font-bold text-slate-900">{unverifiedRiwayat.tempat_donor || '-'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Berat Badan</p>
                            <p className="font-bold text-slate-900">{unverifiedRiwayat.berat_badan} kg</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Tinggi Badan</p>
                            <p className="font-bold text-slate-900">{unverifiedRiwayat.tinggi_badan} cm</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Usia</p>
                            <p className="font-bold text-slate-900">{unverifiedRiwayat.umur} Tahun</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Gol. Darah</p>
                            <p className="font-bold text-[#660000]">{unverifiedRiwayat.golongan_darah}</p>
                          </div>
                        </div>
                        <div className="pt-2 border-t border-slate-50">
                          <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Catatan Pengguna</p>
                          <p className="text-xs text-slate-600 italic">"{unverifiedRiwayat.catatan || 'Tidak ada catatan'}"</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2 opacity-20" />
                      <p className="text-xs text-slate-400 font-medium">Tidak ada laporan donor yang perlu diverifikasi.</p>
                    </div>
                  )}
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
                {unverifiedRiwayat && (
                  <>
                    <button 
                      onClick={() => handleVerifyDonor(unverifiedRiwayat.id_riwayat)}
                      className="flex-1 py-4 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-black/10 flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Verifikasi
                    </button>
                    <button 
                      onClick={() => setIsEditingDonor(true)}
                      className="flex-1 py-4 bg-[#660000] text-white rounded-2xl font-bold hover:bg-[#550000] transition-all shadow-lg shadow-black/10"
                    >
                      Perbarui Data
                    </button>
                    <button 
                      onClick={handleDeleteDonor}
                      className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-black/10 flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-5 h-5" />
                      Hapus
                    </button>
                  </>
                )}
                <button 
                  onClick={() => setSelectedDonor(null)}
                  className={`flex-1 py-4 bg-slate-200 text-slate-900 rounded-2xl font-bold hover:bg-slate-300 transition-all ${unverifiedRiwayat ? '' : 'col-span-2'}`}
                >
                  Tutup Detail
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditingDonor && selectedDonor && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditingDonor(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h2 className="text-xl font-bold text-slate-900">Perbarui Data Pendonor</h2>
                <button 
                  onClick={() => setIsEditingDonor(false)}
                  className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-slate-500" />
                </button>
              </div>

              <form id="donorEditForm" onSubmit={handleUpdateDonor} className="p-8 overflow-y-auto custom-scrollbar space-y-6">
                {errorMessage && (
                  <div className="p-4 bg-red-50 text-red-700 rounded-2xl text-sm flex items-center gap-3 border border-red-100">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Lengkap</label>
                    <input 
                      type="text"
                      required
                      value={editFormData.nama_lengkap || ''}
                      onChange={(e) => setEditFormData({...editFormData, nama_lengkap: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#660000] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">No. Telepon</label>
                    <input 
                      type="text"
                      required
                      value={editFormData.no_telepon || ''}
                      onChange={(e) => setEditFormData({...editFormData, no_telepon: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#660000] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Jenis Kelamin</label>
                    <select 
                      required
                      value={editFormData.jenis_kelamin || ''}
                      onChange={(e) => setEditFormData({...editFormData, jenis_kelamin: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#660000] transition-all"
                    >
                      <option value="">Pilih Jenis Kelamin</option>
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Golongan Darah</label>
                    <select 
                      required
                      value={editFormData.golongan_darah || ''}
                      onChange={(e) => setEditFormData({...editFormData, golongan_darah: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#660000] transition-all"
                    >
                      <option value="">Pilih Golongan Darah</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Tanggal Lahir</label>
                    <input 
                      type="date"
                      required
                      value={editFormData.tanggal_lahir || ''}
                      onChange={(e) => setEditFormData({...editFormData, tanggal_lahir: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#660000] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Usia</label>
                    <input 
                      type="number"
                      required
                      min="17"
                      value={editFormData.umur || ''}
                      onChange={(e) => setEditFormData({...editFormData, umur: parseInt(e.target.value)})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#660000] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Berat Badan (kg)</label>
                    <input 
                      type="number"
                      required
                      min="40"
                      value={editFormData.berat_badan || ''}
                      onChange={(e) => setEditFormData({...editFormData, berat_badan: parseInt(e.target.value)})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#660000] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Tinggi Badan (cm)</label>
                    <input 
                      type="number"
                      required
                      min="140"
                      value={editFormData.tinggi_badan || ''}
                      onChange={(e) => setEditFormData({...editFormData, tinggi_badan: parseInt(e.target.value)})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#660000] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Alamat Domisili</label>
                  <textarea 
                    required
                    value={editFormData.alamat || ''}
                    onChange={(e) => setEditFormData({...editFormData, alamat: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#660000] transition-all min-h-[100px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Riwayat Kesehatan</label>
                  <textarea 
                    value={editFormData.riwayat_kesehatan || ''}
                    onChange={(e) => setEditFormData({...editFormData, riwayat_kesehatan: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#660000] transition-all min-h-[80px]"
                    placeholder="Contoh: Alergi tertentu, penyakit bawaan, dll"
                  />
                </div>
              </form>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                <button 
                  type="submit"
                  form="donorEditForm"
                  className="flex-1 py-4 bg-[#660000] text-white rounded-2xl font-bold hover:bg-[#550000] transition-all shadow-lg shadow-black/10"
                >
                  Simpan Perubahan
                </button>
                <button 
                  onClick={() => setIsEditingDonor(false)}
                  className="flex-1 py-4 bg-slate-200 text-slate-900 rounded-2xl font-bold hover:bg-slate-300 transition-all"
                >
                  Batal
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};