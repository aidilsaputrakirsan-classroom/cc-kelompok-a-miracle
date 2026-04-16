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

const emptyForm = {
  id_pendonor: '',
  nama_lengkap: '',
  jenis_kelamin: '',
  berat_badan: '',
  tinggi_badan: '',
  umur: '',
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

    const payload = {
      id_pendonor: Number(formData.id_pendonor),
      golongan_darah: formData.golongan_darah || undefined,
    };

    const donorPayload = {
      nama_lengkap: formData.nama_lengkap || undefined,
      jenis_kelamin: formData.jenis_kelamin || undefined,
      berat_badan: formData.berat_badan !== '' ? Number(formData.berat_badan) : undefined,
      tinggi_badan: formData.tinggi_badan !== '' ? Number(formData.tinggi_badan) : undefined,
      umur: formData.umur !== '' ? Number(formData.umur) : undefined,
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
    } catch (err) {
      setError(err.response?.data?.detail || 'Gagal menyimpan data.');
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
    if (!window.confirm('Apakah Anda yakin ingin menghapus riwayat ini?')) {
      return;
    }

    try {
      await apiService.deleteRiwayatDonorPengguna(itemId);
      await fetchHistory();
    } catch (err) {
      alert(err.response?.data?.detail || 'Gagal menghapus riwayat.');
    }
  };

  const formatDate = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return format(date, 'dd MMM yyyy', { locale: id });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#660000] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="pb-24">
        <div className="bg-gradient-to-r from-[#660000] to-[#8b0000] text-white py-16 shadow-lg shadow-black/10">
          <div className="px-6 max-w-6xl mx-auto">
            <h1 className="text-4xl lg:text-5xl font-black text-white mb-3">
              Halo, {user?.nama_pengguna || 'Pendonor'}!
            </h1>
            <p className="text-white/80 font-medium text-lg">Selamat datang di dashboard TRACELT Anda.</p>
          </div>
        </div>

        <div className="px-6 max-w-6xl mx-auto pt-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="bg-gradient-to-br from-white to-slate-50 p-8 rounded-[2.5rem] shadow-md border border-slate-100">
              <div className="w-12 h-12 bg-[#660000]/10 rounded-2xl flex items-center justify-center text-[#660000] mb-6">
                <History className="w-6 h-6" />
              </div>
              <div className="text-4xl font-black text-slate-900 mb-1">{history.length}</div>
              <div className="text-slate-500 font-semibold uppercase text-xs tracking-wider">Total Donor</div>
            </div>
            <div className="bg-gradient-to-br from-white to-green-50/30 p-8 rounded-[2.5rem] shadow-md border border-green-100">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 mb-6">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="text-4xl font-black text-green-700 mb-1">{history.filter((h) => h.status_verifikasi).length}</div>
              <div className="text-green-600 font-semibold uppercase text-xs tracking-wider">Terverifikasi</div>
            </div>
            <div className="bg-gradient-to-br from-white to-amber-50/30 p-8 rounded-[2.5rem] shadow-md border border-amber-100">
              <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 mb-6">
                <Clock className="w-6 h-6" />
              </div>
              <div className="text-4xl font-black text-amber-700 mb-1">{history.filter((h) => !h.status_verifikasi).length}</div>
              <div className="text-amber-600 font-semibold uppercase text-xs tracking-wider">Menunggu</div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-md border border-slate-100 overflow-hidden">
            <div className="px-8 py-8 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
              <h2 className="text-2xl font-bold text-slate-900">Riwayat Donor Anda</h2>
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[1200px]">
                <thead>
                  <tr className="bg-[#660000] text-white">
                    <th className="px-6 py-5 text-xs font-black uppercase tracking-widest border-r border-white/10">Tanggal Input</th>
                    <th className="px-6 py-5 text-xs font-black uppercase tracking-widest border-r border-white/10">ID Pendonor</th>
                    <th className="px-6 py-5 text-xs font-black uppercase tracking-widest border-r border-white/10">Nama</th>
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
                <tbody className="divide-y divide-slate-100">
                  {history.length === 0 ? (
                    <tr>
                      <td colSpan="12" className="px-8 py-16 text-center text-slate-400">Belum ada riwayat donor.</td>
                    </tr>
                  ) : (
                    history.map((item) => (
                      <tr key={item.id_riwayat} className="hover:bg-blue-50/40 transition-all duration-200 border-l-4 border-l-transparent hover:border-l-[#660000]">
                        <td className="px-6 py-6 text-sm text-slate-700 font-medium">{formatDate(item.pendonor?.created_at)}</td>
                        <td className="px-6 py-6 text-sm text-slate-700 font-medium">{item.id_pendonor}</td>
                        <td className="px-6 py-6 text-sm text-slate-700 font-medium">{item.pendonor?.nama_lengkap || '-'}</td>
                        <td className="px-6 py-6">
                          <span className="px-2 py-1 bg-[#660000]/10 text-[#660000] rounded-lg font-black text-xs">
                            {item.golongan_darah || item.pendonor?.golongan_darah || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-6 text-sm text-slate-700 font-medium">{item.pendonor?.berat_badan ? `${item.pendonor.berat_badan} kg` : '-'}</td>
                        <td className="px-6 py-6 text-sm text-slate-700 font-medium">{item.pendonor?.tinggi_badan ? `${item.pendonor.tinggi_badan} cm` : '-'}</td>
                        <td className="px-6 py-6 text-sm text-slate-700 font-medium">{item.pendonor?.no_telepon || '-'}</td>
                        <td className="px-6 py-6 text-sm text-slate-700 font-medium">{item.pendonor?.email || '-'}</td>
                        <td className="px-6 py-6 text-sm text-slate-700 font-medium">{formatDate(item.pendonor?.tanggal_lahir)}</td>
                        <td className="px-6 py-6 text-sm text-slate-700 font-medium truncate max-w-[200px]" title={item.pendonor?.alamat || ''}>
                          {item.pendonor?.alamat || '-'}
                        </td>
                        <td className="px-6 py-6">
                          {item.status_verifikasi ? (
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full border border-green-200 shadow-sm">
                              <CheckCircle2 className="w-3 h-3" />
                              Terverifikasi
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full border border-amber-200 shadow-sm">
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
                                className="p-2.5 text-slate-500 hover:text-[#660000] hover:bg-[#660000]/10 rounded-xl transition-all duration-200"
                                title="Edit"
                              >
                                <Edit2 className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id_riwayat)}
                                className="p-2.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
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
              className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-xl font-bold text-slate-900 mb-3">Edit Riwayat Donor</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-900 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
                {error && (
                  <div className="p-4 bg-[#660000]/5 text-[#660000] rounded-2xl text-sm flex items-center gap-3 border border-[#660000]/10">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Nama Lengkap</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#660000] transition-all text-slate-900"
                      value={formData.nama_lengkap}
                      onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">ID Pendonor</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type="number"
                        disabled
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-slate-900 disabled:opacity-70"
                        value={formData.id_pendonor}
                        onChange={(e) => setFormData({ ...formData, id_pendonor: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Golongan Darah</label>
                    <div className="relative">
                      <Droplets className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <select
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#660000] transition-all text-slate-900"
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
                    <label className="text-sm font-bold text-slate-700 ml-1">Jenis Kelamin</label>
                    <select
                      required
                      className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#660000] transition-all text-slate-900"
                      value={formData.jenis_kelamin}
                      onChange={(e) => setFormData({ ...formData, jenis_kelamin: e.target.value })}
                    >
                      <option value="">Pilih Jenis Kelamin</option>
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Usia</label>
                    <input
                      type="number"
                      min="17"
                      required
                      className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#660000] transition-all text-slate-900"
                      value={formData.umur}
                      onChange={(e) => setFormData({ ...formData, umur: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Berat Badan (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#660000] transition-all text-slate-900"
                      value={formData.berat_badan}
                      onChange={(e) => setFormData({ ...formData, berat_badan: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Tinggi Badan (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#660000] transition-all text-slate-900"
                      value={formData.tinggi_badan}
                      onChange={(e) => setFormData({ ...formData, tinggi_badan: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Tanggal Lahir</label>
                    <input
                      type="date"
                      required
                      className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#660000] transition-all text-slate-900"
                      value={formData.tanggal_lahir}
                      onChange={(e) => setFormData({ ...formData, tanggal_lahir: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Tanggal Donor Terakhir</label>
                    <input
                      type="date"
                      className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#660000] transition-all text-slate-900"
                      value={formData.tanggal_terakhir_donor}
                      onChange={(e) => setFormData({ ...formData, tanggal_terakhir_donor: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">No. Telepon</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#660000] transition-all text-slate-900"
                      value={formData.no_telepon}
                      onChange={(e) => setFormData({ ...formData, no_telepon: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Email</label>
                    <input
                      type="email"
                      required
                      className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#660000] transition-all text-slate-900"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Alamat</label>
                    <textarea
                      required
                      className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#660000] transition-all text-slate-900 min-h-[80px]"
                      value={formData.alamat}
                      onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Riwayat Kesehatan</label>
                    <textarea
                      className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#660000] transition-all text-slate-900 min-h-[80px]"
                      value={formData.riwayat_kesehatan}
                      onChange={(e) => setFormData({ ...formData, riwayat_kesehatan: e.target.value })}
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
                  <p className="font-semibold text-slate-900 mb-2">Data sebelumnya</p>
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
                  className="w-full bg-[#660000] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#550000] transition-all shadow-lg shadow-black/10"
                >
                  Simpan Perubahan
                  <ChevronRight className="w-5 h-5" />
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