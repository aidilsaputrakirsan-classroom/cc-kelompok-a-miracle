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
  CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

export const DonorList = () => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [isEditingDonor, setIsEditingDonor] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [unverifiedRiwayat, setUnverifiedRiwayat] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [verificationTab, setVerificationTab] = useState('unverified');
  const [donorVerificationStatus, setDonorVerificationStatus] = useState({});
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
      const donorList = res.data.pendonor || [];
      setDonors(donorList);
      
      // Load verification status untuk semua donors
      for (const donor of donorList) {
        await loadDonorVerificationStatus(donor.id_pendonor);
      }
    } catch (err) {
      console.error('Gagal mengambil data pendonor:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDonorVerificationStatus = async (donorId) => {
    try {
      const res = await apiService.getRiwayatDonorByPendonor(donorId);
      const riwayats = res.data.riwayat_donor || [];
      const unverified = riwayats.find(r => !r.status_verifikasi);
      const hasVerified = riwayats.some(r => r.status_verifikasi);
      
      setDonorVerificationStatus(prev => ({
        ...prev,
        [donorId]: { unverified, hasVerified, allRiwayats: riwayats }
      }));
    } catch (err) {
      console.error('Error checking riwayat:', err);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, [searchTerm, filters]);

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
    
    const status = donorVerificationStatus[donor.id_pendonor];
    setUnverifiedRiwayat(status?.unverified || null);
  };

  const handleVerifyDonor = async (riwayatId) => {
    if (!window.confirm('Verifikasi riwayat donor ini?')) return;
    
    try {
      await apiService.verifyRiwayatDonor(riwayatId, { status_verifikasi: true });
      if (selectedDonor) {
        await loadDonorVerificationStatus(selectedDonor.id_pendonor);
        const updated = donorVerificationStatus[selectedDonor.id_pendonor];
        setUnverifiedRiwayat(updated?.unverified || null);
      }
      alert('Riwayat donor berhasil diverifikasi!');
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || 'Gagal memverifikasi riwayat donor.');
    }
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

  // Filter donors berdasarkan verification status
  const filteredDonors = donors.filter(donor => {
    const status = donorVerificationStatus[donor.id_pendonor];
    if (verificationTab === 'unverified') {
      return status?.unverified; // Ada riwayat yang belum diverifikasi
    } else {
      return status?.hasVerified && !status?.unverified; // Sudah punya riwayat terverifikasi, dan tidak ada yang pending
    }
  });

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

      {/* Verification Tabs */}
      <div className="flex gap-2 border-b border-slate-200 bg-white rounded-t-2xl px-6">
        <button
          onClick={() => setVerificationTab('unverified')}
          className={`px-6 py-3 font-semibold text-sm border-b-2 transition-all ${
            verificationTab === 'unverified'
              ? 'text-[#660000] border-[#660000]'
              : 'text-slate-500 border-transparent hover:text-slate-900'
          }`}
        >
          🔄 Menunggu Verifikasi ({donors.filter(d => donorVerificationStatus[d.id_pendonor]?.unverified).length})
        </button>
        <button
          onClick={() => setVerificationTab('verified')}
          className={`px-6 py-3 font-semibold text-sm border-b-2 transition-all ${
            verificationTab === 'verified'
              ? 'text-[#660000] border-[#660000]'
              : 'text-slate-500 border-transparent hover:text-slate-900'
          }`}
        >
          ✅ Sudah Diverifikasi ({donors.filter(d => donorVerificationStatus[d.id_pendonor]?.hasVerified && !donorVerificationStatus[d.id_pendonor]?.unverified).length})
        </button>
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
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Pendonor</th>
                <th className="px-6 py-4 font-semibold text-center">Gol. Darah</th>
                <th className="px-6 py-4 font-semibold">Kontak</th>
                <th className="px-6 py-4 font-semibold">Donor Terakhir</th>
                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">Memuat data...</td>
                </tr>
              ) : filteredDonors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    {verificationTab === 'unverified' ? 'Tidak ada pendonor yang menunggu verifikasi.' : 'Tidak ada pendonor yang sudah diverifikasi.'}
                  </td>
                </tr>
              ) : filteredDonors.map((donor) => (
                <tr key={donor.id_pendonor} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                        {donor.nama_lengkap.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{donor.nama_lengkap}</div>
                        <div className="text-xs text-slate-500">{donor.umur} th • {donor.jenis_kelamin}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <span className="px-3 py-1 bg-[#660000]/10 text-[#660000] rounded-full text-sm font-bold border border-[#660000]/20">
                        {donor.golongan_darah}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone className="w-3 h-3" />
                        <span>{donor.no_telepon}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate max-w-[150px]">{donor.alamat}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="w-3 h-3" />
                      <span>{donor.tanggal_terakhir_donor || '-'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {verificationTab === 'unverified' && donorVerificationStatus[donor.id_pendonor]?.unverified && (
                        <button 
                          onClick={() => {
                            handleOpenDonorDetail(donor);
                          }}
                          className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-all flex items-center gap-2 whitespace-nowrap"
                          title="Verifikasi Riwayat"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Verifikasi
                        </button>
                      )}
                      <button 
                        onClick={() => handleOpenDonorDetail(donor)}
                        className="p-2 text-slate-400 hover:text-[#660000] hover:bg-[#660000]/10 rounded-lg transition-all"
                        title="Lihat Detail"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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
                {errorMessage && (
                  <div className="p-4 bg-red-50 text-red-700 rounded-2xl text-sm flex items-center gap-3 border border-red-100">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

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
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 bg-green-50 text-green-600 rounded-xl">
                        <Droplets className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Golongan Darah</p>
                        <p className="font-black text-2xl text-[#660000]">{selectedDonor.golongan_darah}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">No. Telepon</p>
                        <p className="font-semibold text-slate-900">{selectedDonor.no_telepon}</p>
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
                    <Heart className="w-5 h-5 text-[#660000] mx-auto mb-2" />
                    <p className="text-[10px] font-bold text-[#660000] uppercase tracking-wider mb-1">Total Donor</p>
                    <p className="font-bold text-xl text-[#660000]">{selectedDonor.total_donor}x</p>
                  </div>
                </div>

                {/* Unverified Riwayat Box */}
                {unverifiedRiwayat && (
                  <div className="bg-amber-50 p-6 rounded-3xl border-2 border-amber-200">
                    <h3 className="text-sm font-bold text-amber-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Riwayat Donor Menunggu Verifikasi
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-amber-800">Riwayat ID:</span>
                        <span className="font-bold text-amber-900">#{unverifiedRiwayat.id_riwayat}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-amber-800">Golongan Darah:</span>
                        <span className="font-bold text-amber-900">{unverifiedRiwayat.golongan_darah}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-amber-800">Status:</span>
                        <span className="font-bold text-amber-600">❌ Belum Diverifikasi</span>
                      </div>
                    </div>
                  </div>
                )}

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
                      className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-black/10 flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      Verifikasi Riwayat
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
                  className={`${unverifiedRiwayat ? 'flex-1' : 'w-full'} py-4 bg-slate-200 text-slate-900 rounded-2xl font-bold hover:bg-slate-300 transition-all`}
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
