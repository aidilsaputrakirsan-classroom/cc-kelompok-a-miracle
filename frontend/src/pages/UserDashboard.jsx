import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Droplets, 
  History, 
  Calendar, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Edit2, 
  Trash2,
  X,
  ChevronRight,
  LogOut,
  User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { Header } from '../components/Header';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export const UserDashboard = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    id_pendonor: '',
    tanggal_donor: format(new Date(), 'yyyy-MM-dd'),
    tempat_donor: '',
    catatan: ''
  });
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

  const fetchHistory = async () => {
    try {
      const res = await apiService.getRiwayatDonorPengguna();
      setHistory(res.data);
    } catch (err) {
      console.error('Error fetching history:', err);
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
    try {
      if (editingItem) {
        await apiService.updateRiwayatDonorPengguna(editingItem.id, formData);
      } else {
        await apiService.createRiwayatDonorPengguna(formData);
      }
      setIsModalOpen(false);
      setEditingItem(null);
      setFormData({
        id_pendonor: '',
        tanggal_donor: format(new Date(), 'yyyy-MM-dd'),
        tempat_donor: '',
        catatan: ''
      });
      fetchHistory();
    } catch (err) {
      setError(err.response?.data?.detail || 'Gagal menyimpan data.');
    }
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      id_pendonor: item.id_pendonor,
      tanggal_donor: item.tanggal_donor.split('T')[0],
      tempat_donor: item.tempat_donor,
      catatan: item.catatan || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (itemId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus riwayat ini?')) {
      try {
        await apiService.deleteRiwayatDonorPengguna(itemId);
        fetchHistory();
      } catch (err) {
        alert(err.response?.data?.detail || 'Gagal menghapus riwayat.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="pt-32 pb-24 px-6 max-w-6xl mx-auto">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 mb-2">
              Halo!
            </h1>
            <p className="text-slate-500">Selamat datang di dashboard TRACELT Anda.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 bg-white text-slate-600 px-6 py-3 rounded-2xl font-bold border border-slate-200 hover:bg-slate-50 transition-all"
            >
              <LogOut className="w-5 h-5" />
              Keluar
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-[#660000]/10 rounded-2xl flex items-center justify-center text-[#660000] mb-6">
              <History className="w-6 h-6" />
            </div>
            <div className="text-3xl font-black text-slate-900 mb-1">{history.length}</div>
            <div className="text-slate-500 font-medium uppercase text-xs tracking-wider">Total Donor</div>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 mb-6">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="text-3xl font-black text-slate-900 mb-1">
              {history.filter(h => h.status_verifikasi).length}
            </div>
            <div className="text-slate-500 font-medium uppercase text-xs tracking-wider">Terverifikasi</div>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-6">
              <Clock className="w-6 h-6" />
            </div>
            <div className="text-3xl font-black text-slate-900 mb-1">
              {history.filter(h => !h.status_verifikasi).length}
            </div>
            <div className="text-slate-500 font-medium uppercase text-xs tracking-wider">Menunggu</div>
          </div>
        </div>

        {/* History Table */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Riwayat Donor Anda</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Tanggal</th>
                  <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Tempat</th>
                  <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-8 py-12 text-center text-slate-400">Memuat data...</td>
                  </tr>
                ) : history.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-8 py-12 text-center text-slate-400">Belum ada riwayat donor.</td>
                  </tr>
                ) : (
                  history.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-[#660000]" />
                          <span className="font-bold text-slate-900">
                            {format(new Date(item.tanggal_donor), 'dd MMMM yyyy', { locale: id })}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-600">{item.tempat_donor}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        {item.status_verifikasi ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-100">
                            <CheckCircle2 className="w-3 h-3" />
                            Terverifikasi
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-100">
                            <Clock className="w-3 h-3" />
                            Menunggu
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-5 text-right">
                        {!item.status_verifikasi && (
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => openEditModal(item)}
                              className="p-2 text-slate-400 hover:text-[#660000] hover:bg-[#660000]/5 rounded-xl transition-all"
                              title="Edit"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => handleDelete(item.id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
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
      </main>

      {/* Input/Edit Modal */}
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
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-xl font-bold text-slate-900">
                  {editingItem ? 'Edit Riwayat Donor' : 'Input Riwayat Donor'}
                </h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-900 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                {error && (
                  <div className="p-4 bg-[#660000]/5 text-[#660000] rounded-2xl text-sm flex items-center gap-3 border border-[#660000]/10">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">ID Pendonor <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input 
                      type="number" 
                      required
                      placeholder="Masukkan ID Pendonor Anda"
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#660000] transition-all text-slate-900"
                      value={formData.id_pendonor}
                      onChange={(e) => setFormData({...formData, id_pendonor: e.target.value})}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 ml-1 italic">* ID yang didapat setelah mendaftar sebagai pendonor</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Tanggal Donor <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input 
                      type="date" 
                      required
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#660000] transition-all text-slate-900"
                      value={formData.tanggal_donor}
                      onChange={(e) => setFormData({...formData, tanggal_donor: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Tempat Donor <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input 
                      type="text" 
                      required
                      placeholder="Contoh: PMI Balikpapan"
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#660000] transition-all text-slate-900"
                      value={formData.tempat_donor}
                      onChange={(e) => setFormData({...formData, tempat_donor: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Catatan (Opsional)</label>
                  <textarea 
                    placeholder="Contoh: Donor ke-5, lancar."
                    className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#660000] transition-all text-slate-900 min-h-[100px]"
                    value={formData.catatan}
                    onChange={(e) => setFormData({...formData, catatan: e.target.value})}
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-[#660000] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#550000] transition-all shadow-lg shadow-black/10"
                >
                  {editingItem ? 'Simpan Perubahan' : 'Simpan Riwayat'}
                  <ChevronRight className="w-5 h-5" />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};