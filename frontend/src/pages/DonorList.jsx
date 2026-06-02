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
  CheckCircle2,
  Mail,
  UserCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import useDarkMode from '../hooks/useDarkMode';
import Swal from 'sweetalert2';
import { ServiceUnavailable } from '../components/ServiceUnavailable';

export const DonorList = () => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [isEditingDonor, setIsEditingDonor] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [unverifiedRiwayat, setUnverifiedRiwayat] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [verificationTab, setVerificationTab] = useState('unverified');
  const [donorVerificationStatus, setDonorVerificationStatus] = useState({});
  const [isDark] = useDarkMode();
  const [filters, setFilters] = useState({
    golongan_darah: '',
    jenis_kelamin: '',
    umur_min: '',
    umur_max: ''
  });

  const fetchDonors = async () => {
    setLoading(true);
    setError(null);
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
      
      // Load verification status untuk semua donors secara paralel
      await Promise.all(donorList.map(donor => loadDonorVerificationStatus(donor.id_pendonor)));
    } catch (err) {
      console.error('Gagal mengambil data pendonor:', err);
      setError(err);
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
      email: donor.email || '',
      jenis_kelamin: donor.jenis_kelamin,
      tanggal_lahir: donor.tanggal_lahir,
      berat_badan: donor.berat_badan,
      tinggi_badan: donor.tinggi_badan,
      no_telepon: donor.no_telepon,
      alamat: donor.alamat,
      golongan_darah: donor.golongan_darah,
      riwayat_kesehatan: donor.riwayat_kesehatan || '',
      total_donor: donor.total_donor || 0
    });
    setIsEditingDonor(false);
    setErrorMessage('');
    
    const status = donorVerificationStatus[donor.id_pendonor];
    setUnverifiedRiwayat(status?.unverified || null);
  };

  const getAgeFromDate = (value) => {
    const birthDate = new Date(value);
    if (Number.isNaN(birthDate.getTime())) return 0;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age -= 1;
    }
    return age;
  };

  const handleVerifyDonor = async (riwayatId) => {
    const result = await Swal.fire({
      title: 'Verifikasi Riwayat?',
      text: "Apakah Anda yakin ingin memverifikasi riwayat donor ini?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Verifikasi',
      cancelButtonText: 'Batal'
    });

    if (!result.isConfirmed) return;
    
    try {
      await apiService.verifyRiwayatDonor(riwayatId, { status_verifikasi: true });
      if (selectedDonor) {
        await loadDonorVerificationStatus(selectedDonor.id_pendonor);
        const updatedStatus = donorVerificationStatus[selectedDonor.id_pendonor];
        setUnverifiedRiwayat(updatedStatus?.unverified || null);
      }
      Swal.fire({
        title: 'Berhasil!',
        text: 'Riwayat donor berhasil diverifikasi.',
        icon: 'success',
        confirmButtonColor: '#10b981'
      });
      fetchDonors();
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || 'Gagal memverifikasi riwayat donor.');
    }
  };

  const handleUpdateDonor = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    const calculatedAge = getAgeFromDate(editFormData.tanggal_lahir);
    try {
      await apiService.updatePendonor(selectedDonor.id_pendonor, {
        ...editFormData,
        umur: calculatedAge
      });
      setIsEditingDonor(false);
      setSelectedDonor(null);
      fetchDonors();
      Swal.fire({
        title: 'Berhasil!',
        text: 'Data pendonor berhasil diperbarui.',
        icon: 'success',
        confirmButtonColor: '#660000'
      });
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || 'Gagal memperbarui data pendonor.');
    }
  };

  const handleDeleteDonor = async () => {
    const result = await Swal.fire({
      title: 'Hapus Pendonor?',
      text: "Tindakan ini akan menghapus data pendonor dan seluruh riwayat kesehatannya secara permanen!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (!result.isConfirmed) return;

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
            className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all text-slate-500 dark:text-slate-450"
            title="Kembali ke Dashboard Utama"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Dashboard Pendonor</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Pengelolaan, perbaruan, dan verifikasi data pendonor sukarela.</p>
          </div>
        </div>
      </div>

      {/* Verification Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl px-4 py-2 shadow-sm">
        <button
          onClick={() => setVerificationTab('unverified')}
          className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm border-b-2 rounded-lg transition-all ${
            verificationTab === 'unverified'
              ? 'text-[#660000] border-[#660000] bg-red-50/50 dark:text-red-400 dark:border-red-400 dark:bg-red-950/20'
              : 'text-slate-500 border-transparent hover:text-slate-900 dark:text-slate-450 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
          }`}
        >
          <span>🔄 Menunggu Verifikasi</span>
          <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 font-bold">
            {donors.filter(d => donorVerificationStatus[d.id_pendonor]?.unverified).length}
          </span>
        </button>
        <button
          onClick={() => setVerificationTab('verified')}
          className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm border-b-2 rounded-lg transition-all ${
            verificationTab === 'verified'
              ? 'text-emerald-700 border-emerald-600 bg-emerald-50/30 dark:text-emerald-400 dark:border-emerald-400 dark:bg-emerald-950/20'
              : 'text-slate-500 border-transparent hover:text-slate-900 dark:text-slate-450 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
          }`}
        >
          <span>✅ Sudah Diverifikasi</span>
          <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 font-bold">
            {donors.filter(d => donorVerificationStatus[d.id_pendonor]?.hasVerified && !donorVerificationStatus[d.id_pendonor]?.unverified).length}
          </span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-850 shadow-sm overflow-hidden transition-colors">
        {/* Search & Filter Component */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-550 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Cari nama pendonor..." 
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-transparent dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#660000] dark:focus:ring-red-500/50 transition-all text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap lg:flex-nowrap gap-3">
              <select 
                className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-transparent dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#660000] text-sm text-slate-700 dark:text-slate-200"
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
                className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-transparent dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#660000] text-sm text-slate-700 dark:text-slate-200"
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
                  className="w-24 px-3 py-3 bg-slate-50 dark:bg-slate-800 border border-transparent dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#660000] text-sm text-slate-705 dark:text-slate-200 placeholder-slate-400"
                  value={filters.umur_min}
                  onChange={(e) => setFilters({...filters, umur_min: e.target.value})}
                />
                <span className="text-slate-350 dark:text-slate-600 font-medium">-</span>
                <input 
                  type="number" 
                  placeholder="Max Umur"
                  className="w-24 px-3 py-3 bg-slate-50 dark:bg-slate-800 border border-transparent dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#660000] text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400"
                  value={filters.umur_max}
                  onChange={(e) => setFilters({...filters, umur_max: e.target.value})}
                />
              </div>

              <button 
                onClick={() => {
                  setSearchTerm('');
                  setFilters({ golongan_darah: '', jenis_kelamin: '', umur_min: '', umur_max: '' });
                }}
                className="p-3 text-slate-400 hover:text-[#660000] dark:hover:text-red-400 hover:bg-slate-150 dark:hover:bg-slate-800 rounded-xl transition-all"
                title="Reset Filter"
              >
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-4 font-semibold">Pendonor</th>
                <th className="px-6 py-4 font-semibold text-center">Golongan Darah</th>
                <th className="px-6 py-4 font-semibold">Kontak</th>
                <th className="px-6 py-4 font-semibold">Donor Terakhir</th>
                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-slate-400 dark:text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 border-3 border-[#660000]/30 border-t-[#660000] dark:border-red-500/30 dark:border-t-red-500 rounded-full animate-spin" />
                      <span>Memuat data pendonor...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12">
                    <ServiceUnavailable onRetry={fetchDonors} error={error} />
                  </td>
                </tr>
              ) : filteredDonors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-slate-400 dark:text-slate-500 font-medium">
                    {verificationTab === 'unverified' 
                      ? 'Tidak ada pendonor yang sedang menunggu verifikasi.' 
                      : 'Belum ada pendonor yang diverifikasi.'}
                  </td>
                </tr>
              ) : filteredDonors.map((donor) => (
                <tr key={donor.id_pendonor} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-full bg-[#660000]/10 text-[#660000] dark:bg-red-400/15 dark:text-red-400 flex items-center justify-center text-base font-black border border-[#660000]/20 dark:border-red-400/20">
                        {donor.nama_lengkap.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-slate-100">{donor.nama_lengkap}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-450">{donor.umur} th • {donor.jenis_kelamin}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <span className="px-3.5 py-1 bg-[#660000]/10 dark:bg-red-400/10 text-[#660000] dark:text-red-400 rounded-full text-xs font-black border border-[#660000]/20 dark:border-red-400/25 tracking-wide">
                        {donor.golongan_darah}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-350">
                        <Phone className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        <span>{donor.no_telepon}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[200px]">{donor.alamat}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-350 bg-slate-50 dark:bg-slate-800/30 py-1.5 px-3 rounded-lg w-fit">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      <span className="font-medium text-xs">{donor.tanggal_terakhir_donor || 'Belum pernah'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                      {verificationTab === 'unverified' && donorVerificationStatus[donor.id_pendonor]?.unverified && (
                        <button 
                          onClick={() => handleOpenDonorDetail(donor)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5 hover:shadow-emerald-900/10"
                          title="Verifikasi Riwayat"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Verifikasi
                        </button>
                      )}
                      <button 
                        onClick={() => handleOpenDonorDetail(donor)}
                        className="p-2 text-slate-400 hover:text-[#660000] dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                        title="Lihat Detail Pendonor"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail & Edit Modal */}
      <AnimatePresence>
        {selectedDonor && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 overflow-y-auto bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDonor(null)}
              className="absolute inset-0"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col transition-colors border border-slate-100 dark:border-slate-800"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-[#660000] dark:bg-red-950 text-white dark:text-red-450 flex items-center justify-center shadow-md">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      {isEditingDonor ? 'Ubah Data Pendonor' : 'Profil Detail Pendonor'}
                    </h2>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">ID: {selectedDonor.id_pendonor}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedDonor(null)}
                  className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500 dark:text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content Form / Info */}
              {isEditingDonor ? (
                <form id="editDonorForm" onSubmit={handleUpdateDonor} className="p-8 overflow-y-auto custom-scrollbar space-y-6 flex-1">
                  {errorMessage && (
                    <div className="p-4 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-450 rounded-2xl text-sm flex items-center gap-3 border border-red-100 dark:border-red-900/30">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Nama Lengkap */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Nama Lengkap</label>
                      <input 
                        type="text" 
                        required
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#660055] text-sm text-slate-800 dark:text-slate-100"
                        value={editFormData.nama_lengkap || ''}
                        onChange={(e) => setEditFormData({...editFormData, nama_lengkap: e.target.value})}
                      />
                    </div>
                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Email</label>
                      <input 
                        type="email" 
                        required
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#660055] text-sm text-slate-800 dark:text-slate-100"
                        value={editFormData.email || ''}
                        onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                      />
                    </div>
                    {/* Gender */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Gender</label>
                      <select 
                        required
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#660055] text-sm text-slate-700 dark:text-slate-200"
                        value={editFormData.jenis_kelamin || ''}
                        onChange={(e) => setEditFormData({...editFormData, jenis_kelamin: e.target.value})}
                      >
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    </div>
                    {/* Golongan Darah */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Golongan Darah</label>
                      <select 
                        required
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#660055] text-sm text-slate-700 dark:text-slate-200"
                        value={editFormData.golongan_darah || ''}
                        onChange={(e) => setEditFormData({...editFormData, golongan_darah: e.target.value})}
                      >
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
                    {/* Tanggal Lahir */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Tanggal Lahir</label>
                      <input 
                        type="date" 
                        required
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#660055] text-sm text-slate-800 dark:text-slate-100"
                        value={editFormData.tanggal_lahir || ''}
                        onChange={(e) => setEditFormData({...editFormData, tanggal_lahir: e.target.value})}
                      />
                    </div>
                    {/* No Telepon */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">No. Telepon</label>
                      <input 
                        type="text" 
                        required
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#660005] text-sm text-slate-800 dark:text-slate-100"
                        value={editFormData.no_telepon || ''}
                        onChange={(e) => setEditFormData({...editFormData, no_telepon: e.target.value})}
                      />
                    </div>
                    {/* Berat Badan */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Berat Badan (kg)</label>
                      <input 
                        type="number" 
                        required
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#660005] text-sm text-slate-800 dark:text-slate-100"
                        value={editFormData.berat_badan || ''}
                        onChange={(e) => setEditFormData({...editFormData, berat_badan: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                    {/* Tinggi Badan */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Tinggi Badan (cm)</label>
                      <input 
                        type="number" 
                        required
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#660005] text-sm text-slate-800 dark:text-slate-100"
                        value={editFormData.tinggi_badan || ''}
                        onChange={(e) => setEditFormData({...editFormData, tinggi_badan: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                  </div>

                  {/* Alamat */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Alamat Lengkap</label>
                    <textarea 
                      rows={2}
                      required
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#660005] text-sm text-slate-800 dark:text-slate-100 resize-none"
                      value={editFormData.alamat || ''}
                      onChange={(e) => setEditFormData({...editFormData, alamat: e.target.value})}
                    />
                  </div>

                  {/* Riwayat Kesehatan */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Riwayat Medis / Kesehatan</label>
                    <textarea 
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#660005] text-sm text-slate-800 dark:text-slate-100 resize-none placeholder-slate-400"
                      placeholder="Mempunyai riwayat penyakit, mengonsumsi obat ritun, dsb..."
                      value={editFormData.riwayat_kesehatan || ''}
                      onChange={(e) => setEditFormData({...editFormData, riwayat_kesehatan: e.target.value})}
                    />
                  </div>
                </form>
              ) : (
                <div className="p-8 overflow-y-auto custom-scrollbar space-y-8 flex-1">
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
                        <div className="p-2.5 bg-blue-50 dark:bg-blue-950/45 text-blue-600 dark:text-blue-400 rounded-xl">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Nama Lengkap</p>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">{selectedDonor.nama_lengkap}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4">
                        <div className="p-2.5 bg-purple-50 dark:bg-purple-950/45 text-purple-600 dark:text-purple-400 rounded-xl">
                          <Activity className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Gender & Usia</p>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">{selectedDonor.jenis_kelamin}, {selectedDonor.umur} Tahun</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="p-2.5 bg-sky-50 dark:bg-sky-950/45 text-sky-600 dark:text-sky-450 rounded-xl">
                          <Mail className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Alamat Email</p>
                          <p className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[220px]">{selectedDonor.email || '-'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="p-2.5 bg-[#660000]/5 dark:bg-red-950/40 text-[#660000] dark:text-red-400 rounded-xl">
                          <Droplets className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Golongan Darah</p>
                          <p className="font-black text-2xl text-[#660000] dark:text-red-400">{selectedDonor.golongan_darah}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="p-2.5 bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-450 rounded-xl">
                          <Phone className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">No. Telepon</p>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">{selectedDonor.no_telepon}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Alamat Rumah</p>
                          <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm leading-relaxed">{selectedDonor.alamat}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <hr className="border-slate-100 dark:border-slate-800" />

                  {/* Physical Info */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl text-center border border-transparent dark:border-slate-800">
                      <Scale className="w-5 h-5 text-slate-400 dark:text-slate-500 mx-auto mb-2" />
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Berat</p>
                      <p className="font-bold text-slate-900 dark:text-slate-100">{selectedDonor.berat_badan} kg</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl text-center border border-transparent dark:border-slate-800">
                      <Ruler className="w-5 h-5 text-slate-400 dark:text-slate-500 mx-auto mb-2" />
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Tinggi</p>
                      <p className="font-bold text-slate-900 dark:text-slate-100">{selectedDonor.tinggi_badan} cm</p>
                    </div>
                    <div className="bg-[#660000]/5 dark:bg-red-950/20 p-4 rounded-2xl text-center border-2 border-[#660000]/10 dark:border-red-400/10">
                      <Heart className="w-5 h-5 text-[#660000] dark:text-red-450 mx-auto mb-2 animate-pulse" />
                      <p className="text-[10px] font-bold text-[#660000] dark:text-red-450 uppercase tracking-wider mb-1">Total Donor</p>
                      <p className="font-bold text-xl text-[#660000] dark:text-red-400">{selectedDonor.total_donor || 0}x</p>
                    </div>
                  </div>

                  {/* Unverified Riwayat Box */}
                  {unverifiedRiwayat && (
                    <div className="bg-amber-50 dark:bg-amber-955/20 p-6 rounded-3xl border-2 border-amber-200 dark:border-amber-900/40">
                      <h3 className="text-sm font-black text-amber-900 dark:text-amber-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Riwayat Donor Menunggu Verifikasi
                      </h3>
                      <div className="space-y-2 text-sm text-slate-705 dark:text-slate-350">
                        <div className="flex justify-between">
                          <span>ID Riwayat Laporan:</span>
                          <span className="font-bold text-amber-900 dark:text-amber-400">#{unverifiedRiwayat.id_riwayat}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tanggal Pengajuan:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{unverifiedRiwayat.tanggal_donor}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Golongan Darah Pendonor:</span>
                          <span className="font-bold text-amber-900 dark:text-amber-400">{unverifiedRiwayat.golongan_darah}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-amber-100 dark:border-amber-900/20">
                          <span>Status Laporan:</span>
                          <span className="px-2.5 py-1 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 rounded-lg font-bold text-xs flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            Belum Diverifikasi
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Health History */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-widest flex items-center gap-2">
                      <Activity className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                      Riwayat Kesehatan & Catatan Medis
                    </h3>
                    <div className="bg-slate-50 dark:bg-slate-800/30 p-5 rounded-2xl text-slate-600 dark:text-slate-350 text-sm leading-relaxed italic border border-slate-100 dark:border-slate-800/80">
                      "{selectedDonor.riwayat_kesehatan || 'Tidak ada catatan riwayat kesehatan khusus.'}"
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Actions Footer */}
              <div className="p-6 bg-slate-50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800 flex gap-3.5">
                {isEditingDonor ? (
                  <>
                    <button 
                      type="submit"
                      form="editDonorForm"
                      className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-black/10 flex items-center justify-center gap-2"
                    >
                      <UserCheck className="w-5 h-5" />
                      Simpan Perubahan
                    </button>
                    <button 
                      type="button"
                      onClick={() => setIsEditingDonor(false)}
                      className="flex-1 py-4 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-2xl font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-all"
                    >
                      Batal
                    </button>
                  </>
                ) : (
                  <>
                    {unverifiedRiwayat && (
                      <button 
                        onClick={() => handleVerifyDonor(unverifiedRiwayat.id_riwayat)}
                        className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-black/10 flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        Verifikasi Riwayat
                      </button>
                    )}
                    <button 
                      onClick={() => setIsEditingDonor(true)}
                      className="flex-1 py-4 bg-[#660000] text-white rounded-2xl font-bold hover:bg-[#550000] dark:bg-red-900 dark:hover:bg-red-800 transition-all shadow-lg shadow-black/10"
                    >
                      Ubah Data
                    </button>
                    <button 
                      onClick={handleDeleteDonor}
                      className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-black/10 flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-5 h-5" />
                      Hapus
                    </button>
                    <button 
                      onClick={() => setSelectedDonor(null)}
                      className="flex-1 py-4 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-150 rounded-2xl font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-all"
                    >
                      Tutup
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};