import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  History,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Edit2,
  Trash2,
  X,
  ChevronRight,
  LogOut,
  User,
  Droplets,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Header } from '../components/Header';
import { apiService } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import Swal from 'sweetalert2';

const emptyForm = {
  id_pendonor: '',
  nama_lengkap: '',
  jenis_kelamin: '',
  berat_badan: '',
  tinggi_badan: '',
  tanggal_lahir: '',
  tanggal_terakhir_donor: '',
  no_telepon: '',
  email: '',
  alamat: '',
  riwayat_kesehatan: '',
  golongan_darah: '',
};

export const UserDashboard = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState(emptyForm);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
    fetchHistory();
  }, []);

  const fetchUserData = async () => {
    try {
      const res = await apiService.getPenggunaMe();
      setUser(res.data);
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
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

  const enrichRiwayatWithPendonor = async (riwayatList) => {
    const uniqueIds = [...new Set(riwayatList.map((item) => item.id_pendonor).filter(Boolean))];

    const details = await Promise.all(
      uniqueIds.map(async (idPendonor) => {
        try {
          const res = await apiService.getPendonorById(idPendonor);
          return [idPendonor, res.data];
        } catch {
          return [idPendonor, null];
        }
      }),
    );

    const detailMap = Object.fromEntries(details);
    return riwayatList.map((item) => ({
      ...item,
      pendonor: detailMap[item.id_pendonor] || null,
    }));
  };

  const fetchHistory = async () => {
    try {
      const res = await apiService.getRiwayatDonorPengguna();
      const rawHistory = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.riwayat_donor)
          ? res.data.riwayat_donor
          : [];

      const enrichedHistory = await enrichRiwayatWithPendonor(rawHistory);
      setHistory(enrichedHistory);
    } catch (err) {
      console.error('Error fetching history:', err);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user_token');
    navigate('/login?type=user');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const payload = {
      id_pendonor: Number(formData.id_pendonor),
      golongan_darah: formData.golongan_darah || undefined,
    };

    const donorPayload = {
      nama_lengkap: formData.nama_lengkap || undefined,
      jenis_kelamin: formData.jenis_kelamin || undefined,
      berat_badan: formData.berat_badan !== '' ? Number(formData.berat_badan) : undefined,
      tinggi_badan: formData.tinggi_badan !== '' ? Number(formData.tinggi_badan) : undefined,
      umur: formData.tanggal_lahir ? getAgeFromDate(formData.tanggal_lahir) : undefined,
      tanggal_lahir: formData.tanggal_lahir || undefined,
      tanggal_terakhir_donor: formData.tanggal_terakhir_donor || undefined,
      no_telepon: formData.no_telepon || undefined,
      email: formData.email || undefined,
      alamat: formData.alamat || undefined,
      riwayat_kesehatan: formData.riwayat_kesehatan || undefined,
      golongan_darah: formData.golongan_darah || undefined,
    };

    if (!payload.id_pendonor) {
      setError('ID pendonor wajib diisi.');
      return;
    }

    try {
      if (editingItem) {
        await apiService.updatePendonor(payload.id_pendonor, donorPayload);
        await apiService.updateRiwayatDonorPengguna(editingItem.id_riwayat, payload);
      } else {
        await apiService.createRiwayatDonorPengguna(payload);
      }

      setIsModalOpen(false);
      setEditingItem(null);
      setFormData(emptyForm);
      await fetchHistory();
      
      Swal.fire({
        title: 'Berhasil!',
        text: editingItem ? 'Data riwayat donor berhasil diperbarui.' : 'Data riwayat donor berhasil ditambahkan.',
        icon: 'success',
        confirmButtonColor: '#660000'
      });
    } catch (err) {
      setError(err.response?.data?.detail || 'Gagal menyimpan data.');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      id_pendonor: String(item.id_pendonor || ''),
      nama_lengkap: item.pendonor?.nama_lengkap || '',
      jenis_kelamin: item.pendonor?.jenis_kelamin || '',
      berat_badan: item.pendonor?.berat_badan ?? '',
      tinggi_badan: item.pendonor?.tinggi_badan ?? '',
      umur: item.pendonor?.umur ?? '',
      tanggal_lahir: item.pendonor?.tanggal_lahir ? String(item.pendonor.tanggal_lahir).split('T')[0] : '',
      tanggal_terakhir_donor: item.pendonor?.tanggal_terakhir_donor ? String(item.pendonor.tanggal_terakhir_donor).split('T')[0] : '',
      no_telepon: item.pendonor?.no_telepon || '',
      email: item.pendonor?.email || '',
      alamat: item.pendonor?.alamat || '',
      riwayat_kesehatan: item.pendonor?.riwayat_kesehatan || '',
      golongan_darah: item.golongan_darah || item.pendonor?.golongan_darah || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (itemId) => {
    const result = await Swal.fire({
      title: 'Hapus Riwayat?',
      text: "Apakah Anda yakin ingin menghapus riwayat donor ini?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#660000',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (!result.isConfirmed) return;

    try {
      await apiService.deleteRiwayatDonorPengguna(itemId);
      await fetchHistory();
      Swal.fire({
        title: 'Terhapus!',
        text: 'Riwayat donor berhasil dihapus.',
        icon: 'success',
        confirmButtonColor: '#660000'
      });
    } catch (err) {
      Swal.fire({
        title: 'Error!',
        text: err.response?.data?.detail || 'Gagal menghapus riwayat.',
        icon: 'error',
        confirmButtonColor: '#660000'
      });
    }
  };

  const formatDate = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return format(date, 'dd MMM yyyy', { locale: id });
  };

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 overflow-hidden relative">
      {/* Decorative BG */}
      <div className="absolute top-0 right-0 w-full h-[500px] bg-gradient-to-b from-[#660000]/10 to-transparent dark:from-red-950/20 pointer-events-none" />
      <div className="absolute top-48 -left-24 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      <Header />

      <main className="pb-24 relative z-10">
        <div className="bg-gradient-to-r from-[#660000] to-[#8b0000] text-white py-20 shadow-2xl shadow-black/10 dark:from-red-950 dark:to-red-900 border-b border-white/10">
          <div className="px-6 max-w-full mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div>
                <motion.h1 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-5xl lg:text-7xl font-black text-white mb-4 tracking-tighter"
                >
                  Halo, {user?.nama_pengguna || 'Pendonor'}!
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-white/80 font-bold text-xl dark:text-slate-300 max-w-2xl"
                >
                  Selamat datang kembali di Pusat Kendali Donor TRACELT ITK.
                </motion.p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20">
                  <User className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 max-w-full mx-auto pt-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 dark:bg-slate-900 dark:border-slate-800 transition-all flex flex-col items-center text-center group"
            >
              <div className="w-16 h-16 bg-[#660000]/10 rounded-[1.5rem] flex items-center justify-center text-[#660000] dark:bg-red-400/10 dark:text-red-400 mb-6 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                <History className="w-8 h-8" />
              </div>
              <div className="text-5xl font-black text-slate-900 dark:text-white mb-2 tabular-nums">{history.length}</div>
              <div className="text-slate-400 dark:text-slate-500 font-black uppercase text-[10px] tracking-[0.2em]">Total Donor</div>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white p-10 rounded-[3rem] shadow-xl border border-green-100 dark:bg-slate-900 dark:border-slate-800 transition-all flex flex-col items-center text-center group"
            >
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-[1.5rem] flex items-center justify-center text-green-600 dark:text-green-400 mb-6 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="text-5xl font-black text-green-600 dark:text-green-500 mb-2 tabular-nums">{history.filter((h) => h.status_verifikasi).length}</div>
              <div className="text-green-600/60 dark:text-green-500/60 font-black uppercase text-[10px] tracking-[0.2em]">Terverifikasi</div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white p-10 rounded-[3rem] shadow-xl border border-amber-100 dark:bg-slate-900 dark:border-slate-800 transition-all flex flex-col items-center text-center group"
            >
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-[1.5rem] flex items-center justify-center text-amber-600 dark:text-amber-400 mb-6 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                <Clock className="w-8 h-8" />
              </div>
              <div className="text-5xl font-black text-amber-600 dark:text-amber-500 mb-2 tabular-nums">{history.filter((h) => !h.status_verifikasi).length}</div>
              <div className="text-amber-600/60 dark:text-amber-500/60 font-black uppercase text-[10px] tracking-[0.2em]">Menunggu</div>
            </motion.div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-md border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
            <div className="px-8 py-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-900">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Riwayat Donor Anda</h2>
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[1200px]">
                <thead>
                  <tr className="bg-[#660000] dark:bg-red-950 text-white">
                    <th className="px-6 py-5 text-xs font-black uppercase tracking-widest border-r border-white/10">Tanggal Input</th>
                    <th className="px-6 py-5 text-xs font-black uppercase tracking-widest border-r border-white/10">ID Pendonor</th>
                    <th className="px-6 py-5 text-xs font-black uppercase tracking-widest border-r border-white/10">Nama</th>
                    <th className="px-6 py-5 text-xs font-black uppercase tracking-widest border-r border-white/10">Usia</th>
                    <th className="px-6 py-5 text-xs font-black uppercase tracking-widest border-r border-white/10">Gol</th>
                    <th className="px-6 py-5 text-xs font-black uppercase tracking-widest border-r border-white/10">Berat</th>
                    <th className="px-6 py-5 text-xs font-black uppercase tracking-widest border-r border-white/10">Tinggi</th>
                    <th className="px-6 py-5 text-xs font-black uppercase tracking-widest border-r border-white/10">Telepon</th>
                    <th className="px-6 py-5 text-xs font-black uppercase tracking-widest border-r border-white/10">Email</th>
                    <th className="px-6 py-5 text-xs font-black uppercase tracking-widest border-r border-white/10">Tgl Lahir</th>
                    <th className="px-6 py-5 text-xs font-black uppercase tracking-widest border-r border-white/10">Alamat</th>
                    <th className="px-6 py-5 text-xs font-black uppercase tracking-widest border-r border-white/10">Status</th>
                    <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {history.length === 0 ? (
                    <tr>
                      <td colSpan="12" className="px-8 py-16 text-center text-slate-400 dark:text-slate-500">Belum ada riwayat donor.</td>
                    </tr>
                  ) : (
                    history.map((item) => (
                      <tr key={item.id_riwayat} className="hover:bg-blue-50/40 dark:hover:bg-slate-800/40 transition-all duration-200 border-l-4 border-l-transparent hover:border-l-[#660000] dark:hover:border-l-red-500">
                        <td className="px-6 py-6 text-sm text-slate-700 dark:text-slate-300 font-medium">{formatDate(item.pendonor?.created_at)}</td>
                        <td className="px-6 py-6 text-sm text-slate-700 dark:text-slate-300 font-medium">{item.id_pendonor}</td>
                        <td className="px-6 py-6 text-sm text-slate-700 dark:text-slate-300 font-medium">{item.pendonor?.nama_lengkap || '-'}</td>
                        <td className="px-6 py-6 text-sm text-slate-700 dark:text-slate-300 font-medium">{item.pendonor?.umur ? `${item.pendonor.umur} Thn` : '-'}</td>
                        <td className="px-6 py-6">
                          <span className="px-2 py-1 bg-[#660000]/10 text-[#660000] dark:bg-red-400/10 dark:text-red-400 rounded-lg font-black text-xs">
                            {item.golongan_darah || item.pendonor?.golongan_darah || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-6 text-sm text-slate-700 dark:text-slate-300 font-medium">{item.pendonor?.berat_badan ? `${item.pendonor.berat_badan} kg` : '-'}</td>
                        <td className="px-6 py-6 text-sm text-slate-700 dark:text-slate-300 font-medium">{item.pendonor?.tinggi_badan ? `${item.pendonor.tinggi_badan} cm` : '-'}</td>
                        <td className="px-6 py-6 text-sm text-slate-700 dark:text-slate-300 font-medium">{item.pendonor?.no_telepon || '-'}</td>
                        <td className="px-6 py-6 text-sm text-slate-700 dark:text-slate-300 font-medium">{item.pendonor?.email || '-'}</td>
                        <td className="px-6 py-6 text-sm text-slate-700 dark:text-slate-300 font-medium">{formatDate(item.pendonor?.tanggal_lahir)}</td>
                        <td className="px-6 py-6 text-sm text-slate-700 dark:text-slate-300 font-medium truncate max-w-[200px]" title={item.pendonor?.alamat || ''}>
                          {item.pendonor?.alamat || '-'}
                        </td>
                        <td className="px-6 py-6">
                          {item.status_verifikasi ? (
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold rounded-full border border-green-200 dark:border-green-800 shadow-sm">
                              <CheckCircle2 className="w-3 h-3" />
                              Terverifikasi
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold rounded-full border border-amber-200 dark:border-amber-800 shadow-sm">
                              <Clock className="w-3 h-3" />
                              Menunggu
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-6 text-right">
                          {!item.status_verifikasi && (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openEditModal(item)}
                                className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-[#660000] dark:hover:text-red-400 hover:bg-[#660000]/10 dark:hover:bg-red-400/10 rounded-xl transition-all duration-200"
                                title="Edit"
                              >
                                <Edit2 className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id_riwayat)}
                                className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200"
                                title="Hapus"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col transition-colors"
            >
              <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Edit Riwayat Donor</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="absolute right-4 top-4 p-2 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
                {error && (
                  <div className="p-4 bg-[#660000]/5 dark:bg-red-900/20 text-[#660000] dark:text-red-400 rounded-2xl text-sm flex items-center gap-3 border border-[#660000]/10 dark:border-red-800">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Nama Lengkap</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-[#660000] dark:focus:ring-red-500 transition-all text-slate-900 dark:text-white"
                      value={formData.nama_lengkap}
                      onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">ID Pendonor</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-5 h-5" />
                      <input
                        type="number"
                        disabled
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-slate-900 dark:text-white disabled:opacity-70"
                        value={formData.id_pendonor}
                        onChange={(e) => setFormData({ ...formData, id_pendonor: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Golongan Darah</label>
                    <div className="relative">
                      <Droplets className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-5 h-5" />
                      <select
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-[#660000] dark:focus:ring-red-500 transition-all text-slate-900 dark:text-white appearance-none"
                        value={formData.golongan_darah}
                        onChange={(e) => setFormData({ ...formData, golongan_darah: e.target.value })}
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
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Jenis Kelamin</label>
                    <select
                      required
                      className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-[#660000] dark:focus:ring-red-500 transition-all text-slate-900 dark:text-white appearance-none"
                      value={formData.jenis_kelamin}
                      onChange={(e) => setFormData({ ...formData, jenis_kelamin: e.target.value })}
                    >
                      <option value="">Pilih Jenis Kelamin</option>
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Berat Badan (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-[#660000] dark:focus:ring-red-500 transition-all text-slate-900 dark:text-white"
                      value={formData.berat_badan}
                      onChange={(e) => setFormData({ ...formData, berat_badan: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Tinggi Badan (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-[#660000] dark:focus:ring-red-500 transition-all text-slate-900 dark:text-white"
                      value={formData.tinggi_badan}
                      onChange={(e) => setFormData({ ...formData, tinggi_badan: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Tanggal Lahir</label>
                    <input
                      type="date"
                      required
                      className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-[#660000] dark:focus:ring-red-500 transition-all text-slate-900 dark:text-white"
                      value={formData.tanggal_lahir}
                      onChange={(e) => {
                        const dateVal = e.target.value;
                        const age = getAgeFromDate(dateVal);
                        setFormData({ 
                          ...formData, 
                          tanggal_lahir: dateVal,
                          umur: age || 0
                        });
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Tanggal Donor Terakhir</label>
                    <input
                      type="date"
                      className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-[#660000] dark:focus:ring-red-500 transition-all text-slate-900 dark:text-white"
                      value={formData.tanggal_terakhir_donor}
                      onChange={(e) => setFormData({ ...formData, tanggal_terakhir_donor: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">No. Telepon</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-[#660000] dark:focus:ring-red-500 transition-all text-slate-900 dark:text-white"
                      value={formData.no_telepon}
                      onChange={(e) => setFormData({ ...formData, no_telepon: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Email</label>
                    <input
                      type="email"
                      required
                      className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-[#660000] dark:focus:ring-red-500 transition-all text-slate-900 dark:text-white"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Alamat</label>
                    <textarea
                      required
                      className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-[#660000] dark:focus:ring-red-500 transition-all text-slate-900 dark:text-white min-h-[80px]"
                      value={formData.alamat}
                      onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Riwayat Kesehatan</label>
                    <textarea
                      className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-[#660000] dark:focus:ring-red-500 transition-all text-slate-900 dark:text-white min-h-[80px]"
                      value={formData.riwayat_kesehatan}
                      onChange={(e) => setFormData({ ...formData, riwayat_kesehatan: e.target.value })}
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-4 text-sm text-slate-600 dark:text-slate-400">
                  <p className="font-semibold text-slate-900 dark:text-white mb-2">Data sebelumnya</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <p>Nama: {editingItem?.pendonor?.nama_lengkap || '-'}</p>
                    <p>Jenis Kelamin: {editingItem?.pendonor?.jenis_kelamin || '-'}</p>
                    <p>Usia: {editingItem?.pendonor?.umur ? `${editingItem.pendonor.umur} Tahun` : '-'}</p>
                    <p>Berat Badan: {editingItem?.pendonor?.berat_badan ? `${editingItem.pendonor.berat_badan} kg` : '-'}</p>
                    <p>Tinggi Badan: {editingItem?.pendonor?.tinggi_badan ? `${editingItem.pendonor.tinggi_badan} cm` : '-'}</p>
                    <p>Telepon: {editingItem?.pendonor?.no_telepon || '-'}</p>
                    <p>Email: {editingItem?.pendonor?.email || '-'}</p>
                    <p>Tanggal Lahir: {formatDate(editingItem?.pendonor?.tanggal_lahir)}</p>
                    <p>Golongan Darah Sebelumnya: {editingItem?.pendonor?.golongan_darah || '-'}</p>
                    <p>Total Donor: {editingItem?.pendonor?.total_donor ?? '-'}</p>
                    <p>Donor Terakhir: {formatDate(editingItem?.pendonor?.tanggal_terakhir_donor)}</p>
                  </div>
                  <p className="mt-3">Alamat: {editingItem?.pendonor?.alamat || '-'}</p>
                  <p className="mt-1">Riwayat Kesehatan: {editingItem?.pendonor?.riwayat_kesehatan || '-'}</p>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full bg-[#660000] dark:bg-red-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-black/10 ${submitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#550000] dark:hover:bg-red-800'}`}
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sedang Menyimpan...
                    </>
                  ) : (
                    <>
                      Simpan Perubahan
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <button
        onClick={handleLogout}
        className="fixed bottom-8 right-8 flex items-center gap-2 bg-[#660000] hover:bg-[#550000] text-white px-6 py-4 rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl z-50"
        title="Keluar dari akun"
      >
        <LogOut className="w-5 h-5" />
        <span className="hidden sm:inline">Keluar</span>
      </button>
    </div>
  );
};