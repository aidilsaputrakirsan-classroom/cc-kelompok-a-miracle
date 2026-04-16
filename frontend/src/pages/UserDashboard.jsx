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
  const [donorProfile, setDonorProfile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    id_pendonor: '',
    tanggal_donor: format(new Date(), 'yyyy-MM-dd'),
    tempat_donor: '',
    catatan: '',
    berat_badan: '',
    tinggi_badan: '',
    golongan_darah: '',
    umur: '',
    no_telepon: '',
    email: '',
    tanggal_lahir: '',
    alamat: ''
  });
  const [profileFormData, setProfileFormData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
    fetchHistory();
  }, []);

  const fetchUserData = async () => {
    try {
      const res = await apiService.getPenggunaMe();
      setUser(res.data);

      try {
        const donorRes = await apiService.getPenggunaPendonor();
        setDonorProfile(donorRes.data);
        setProfileFormData(donorRes.data);
      } catch (e) {
        console.log('User is not registered as a donor yet');
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await apiService.getRiwayatDonorPengguna();
      const normalizedHistory = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.riwayat_donor)
          ? res.data.riwayat_donor
          : [];
      setHistory(normalizedHistory);
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

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await apiService.updatePenggunaPendonor(profileFormData);
      await fetchUserData();
      setIsProfileModalOpen(false);
      alert('Profil berhasil diperbarui!');
    } catch (err) {
      setError(err.response?.data?.detail || 'Gagal memperbarui profil.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingItem) {
        await apiService.updateRiwayatDonorPengguna(editingItem.id_riwayat, formData);
      } else {
        await apiService.createRiwayatDonorPengguna(formData);
      }
      setIsModalOpen(false);
      setEditingItem(null);
      setFormData({
        id_pendonor: '',
        tanggal_donor: format(new Date(), 'yyyy-MM-dd'),
        tempat_donor: '',
        catatan: '',
        berat_badan: '',
        tinggi_badan: '',
        golongan_darah: '',
        umur: '',
        no_telepon: '',
        email: '',
        tanggal_lahir: '',
        alamat: ''
      });
      fetchHistory();
    } catch (err) {
      setError(err.response?.data?.detail || 'Gagal menyimpan data.');
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      id_pendonor: donorProfile?.id_pendonor || '',
      tanggal_donor: format(new Date(), 'yyyy-MM-dd'),
      tempat_donor: '',
      catatan: '',
      berat_badan: donorProfile?.berat_badan || '',
      tinggi_badan: donorProfile?.tinggi_badan || '',
      golongan_darah: donorProfile?.golongan_darah || '',
      umur: donorProfile?.umur || '',
      no_telepon: donorProfile?.no_telepon || '',
      email: donorProfile?.email || '',
      tanggal_lahir: donorProfile?.tanggal_lahir || '',
      alamat: donorProfile?.alamat || ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      id_pendonor: item.id_pendonor,
      tanggal_donor: item.tanggal_donor ? item.tanggal_donor.split('T')[0] : format(new Date(), 'yyyy-MM-dd'),
      tempat_donor: item.tempat_donor,
      catatan: item.catatan || '',
      berat_badan: item.berat_badan || '',
      tinggi_badan: item.tinggi_badan || '',
      golongan_darah: item.golongan_darah || '',
      umur: item.umur || '',
      no_telepon: item.no_telepon || '',
      email: item.email || '',
      tanggal_lahir: item.tanggal_lahir || '',
      alamat: item.alamat || ''
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

  const formatTanggalDonor = (tanggalDonor) => {
    if (!tanggalDonor) return '-';
    const parsedDate = new Date(tanggalDonor);
    if (Number.isNaN(parsedDate.getTime())) return '-';
    return format(parsedDate, 'dd MMMM yyyy', { locale: id });
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
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-[#660000] to-[#8b0000] text-white py-16 shadow-lg shadow-black/10">
          <div className="px-6 max-w-6xl mx-auto">
            <div>
              <h1 className="text-4xl lg:text-5xl font-black text-white mb-3">
                Halo, {user?.nama_pengguna || 'Pendonor'}!
              </h1>
              <p className="text-white/80 font-medium text-lg">Selamat datang di dashboard TRACELT Anda.</p>
            </div>
          </div>
        </div>

        <div className="px-6 max-w-6xl mx-auto pt-16">

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-gradient-to-br from-white to-slate-50 p-8 rounded-[2.5rem] shadow-md border border-slate-100 hover:shadow-lg transition-all duration-300 hover:border-slate-200">
            <div className="w-12 h-12 bg-[#660000]/10 rounded-2xl flex items-center justify-center text-[#660000] mb-6">
              <History className="w-6 h-6" />
            </div>
            <div className="text-4xl font-black text-slate-900 mb-1">{history.length}</div>
            <div className="text-slate-500 font-semibold uppercase text-xs tracking-wider">Total Donor</div>
          </div>
          <div className="bg-gradient-to-br from-white to-green-50/30 p-8 rounded-[2.5rem] shadow-md border border-green-100 hover:shadow-lg transition-all duration-300 hover:border-green-200">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 mb-6">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="text-4xl font-black text-green-700 mb-1">
              {history.filter(h => h.status_verifikasi).length}
            </div>
            <div className="text-green-600 font-semibold uppercase text-xs tracking-wider">Terverifikasi</div>
          </div>
          <div className="bg-gradient-to-br from-white to-amber-50/30 p-8 rounded-[2.5rem] shadow-md border border-amber-100 hover:shadow-lg transition-all duration-300 hover:border-amber-200">
            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 mb-6">
              <Clock className="w-6 h-6" />
            </div>
            <div className="text-4xl font-black text-amber-700 mb-1">
              {history.filter(h => !h.status_verifikasi).length}
            </div>
            <div className="text-amber-600 font-semibold uppercase text-xs tracking-wider">Menunggu</div>
          </div>
        </div>

        {/* History Table */}
        <div className="bg-white rounded-[2.5rem] shadow-md border border-slate-100 overflow-hidden">
          <div className="px-8 py-8 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
            <h2 className="text-2xl font-bold text-slate-900">Riwayat Donor Anda</h2>
          </div>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[1500px]">
              <thead>
                <tr className="bg-[#660000] text-white">
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-widest border-r border-white/10">Tanggal</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-widest border-r border-white/10">Tempat</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-widest border-r border-white/10">Berat</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-widest border-r border-white/10">Tinggi</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-widest border-r border-white/10">Gol</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-widest border-r border-white/10">Usia</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-widest border-r border-white/10">Telepon</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-widest border-r border-white/10">Email</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-widest border-r border-white/10">Tgl Lahir</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-widest border-r border-white/10">Alamat</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-widest border-r border-white/10">Status</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="12" className="px-8 py-16 text-center text-slate-400">Memuat data...</td>
                  </tr>
                ) : history.length === 0 ? (
                  <tr>
                    <td colSpan="12" className="px-8 py-16 text-center text-slate-400">Belum ada riwayat donor.</td>
                  </tr>
                ) : (
                  history.map((item) => (
                    <tr key={item.id_riwayat} className="hover:bg-blue-50/40 transition-all duration-200 border-l-4 border-l-transparent hover:border-l-[#660000]">
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-[#660000] flex-shrink-0" />
                          <span className="font-bold text-slate-900 text-sm">
                            {formatTanggalDonor(item.tanggal_donor)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-3">
                          <MapPin className="w-4 h-4 text-[#660000] flex-shrink-0" />
                          <span className="text-slate-700 font-medium text-sm">{item.tempat_donor}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <span className="text-slate-700 font-medium text-sm">{item.berat_badan} kg</span>
                      </td>
                      <td className="px-6 py-6">
                        <span className="text-slate-700 font-medium text-sm">{item.tinggi_badan} cm</span>
                      </td>
                      <td className="px-6 py-6">
                        <span className="px-2 py-1 bg-[#660000]/10 text-[#660000] rounded-lg font-black text-xs">{item.golongan_darah}</span>
                      </td>
                      <td className="px-6 py-6">
                        <span className="text-slate-700 font-medium text-sm">{item.umur} Thn</span>
                      </td>
                      <td className="px-6 py-6">
                        <span className="text-slate-700 font-medium text-sm">{item.no_telepon}</span>
                      </td>
                      <td className="px-6 py-6">
                        <span className="text-slate-700 font-medium text-sm">{item.email}</span>
                      </td>
                      <td className="px-6 py-6">
                        <span className="text-slate-700 font-medium text-sm">{item.tanggal_lahir}</span>
                      </td>
                      <td className="px-6 py-6">
                        <span className="text-slate-700 font-medium text-sm truncate max-w-[150px]" title={item.alamat}>{item.alamat}</span>
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
                              className="p-2.5 text-slate-500 hover:text-[#660000] hover:bg-[#660000]/10 rounded-xl transition-all duration-200 hover:shadow-md font-bold"
                              title="Edit"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => handleDelete(item.id_riwayat)}
                              className="p-2.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:shadow-md font-bold"
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
              <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {editingItem ? 'Edit Riwayat Donor' : 'Input Riwayat Donor'}
                </h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-900 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 overflow-y-auto max-h-[70vh] custom-scrollbar space-y-6">
                {error && (
                  <div className="p-4 bg-[#660000]/5 text-[#660000] rounded-2xl text-sm flex items-center gap-3 border border-[#660000]/10">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">ID Pendonor <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input 
                        type="number" 
                        required
                        disabled={editingItem ? true : false}
                        placeholder="Masukkan ID Pendonor"
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#660000] transition-all text-slate-900 disabled:opacity-60 disabled:cursor-not-allowed"
                        value={formData.id_pendonor}
                        onChange={(e) => setFormData({...formData, id_pendonor: e.target.value})}
                      />
                    </div>
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
                    <label className="text-sm font-bold text-slate-700 ml-1">Golongan Darah</label>
                    <select 
                      className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#660000] transition-all text-slate-900"
                      value={formData.golongan_darah}
                      onChange={(e) => setFormData({...formData, golongan_darah: e.target.value})}
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

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Berat Badan (kg)</label>
                    <input 
                      type="number"
                      placeholder="70.5"
                      className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#660000] transition-all text-slate-900"
                      value={formData.berat_badan}
                      onChange={(e) => setFormData({...formData, berat_badan: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Tinggi Badan (cm)</label>
                    <input 
                      type="number"
                      placeholder="175"
                      className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#660000] transition-all text-slate-900"
                      value={formData.tinggi_badan}
                      onChange={(e) => setFormData({...formData, tinggi_badan: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Usia (Tahun)</label>
                    <input 
                      type="number"
                      placeholder="25"
                      className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#660000] transition-all text-slate-900"
                      value={formData.umur}
                      onChange={(e) => setFormData({...formData, umur: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">No. Telepon</label>
                    <input 
                      type="text"
                      placeholder="0812..."
                      className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#660000] transition-all text-slate-900"
                      value={formData.no_telepon}
                      onChange={(e) => setFormData({...formData, no_telepon: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Email</label>
                    <input 
                      type="email"
                      placeholder="budi@..."
                      className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#660000] transition-all text-slate-900"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Tgl Lahir</label>
                    <input 
                      type="date"
                      className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#660000] transition-all text-slate-900"
                      value={formData.tanggal_lahir}
                      onChange={(e) => setFormData({...formData, tanggal_lahir: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Alamat</label>
                  <textarea 
                    placeholder="Alamat lengkap..."
                    className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#660000] transition-all text-slate-900 min-h-[80px]"
                    value={formData.alamat}
                    onChange={(e) => setFormData({...formData, alamat: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Catatan (Opsional)</label>
                  <textarea 
                    placeholder="Catatan tambahan..."
                    className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#660000] transition-all text-slate-900 min-h-[80px]"
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

      {/* Fixed Logout Button */}
      <button
        onClick={handleLogout}
        className="fixed bottom-8 right-8 flex items-center gap-2 bg-[#660000] hover:bg-[#550000] text-white px-6 py-4 rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl z-50"
        title="Keluar dari akun"
      >
        <LogOut className="w-5 h-5" />
        <span className="hidden sm:inline">Keluar</span>
      </button>

      {/* Profile Edit Modal */}
      <AnimatePresence>
        {isProfileModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProfileModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-xl font-bold text-slate-900">Perbarui Profil Pendonor</h3>
                <button 
                  onClick={() => setIsProfileModalOpen(false)}
                  className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-900 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleUpdateProfile} className="p-8 overflow-y-auto custom-scrollbar space-y-6">
                {error && (
                  <div className="p-4 bg-[#660000]/5 text-[#660000] rounded-2xl text-sm flex items-center gap-3 border border-[#660000]/10">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Nama Lengkap</label>
                    <input 
                      type="text"
                      required
                      value={profileFormData.nama_lengkap || ''}
                      onChange={(e) => setProfileFormData({...profileFormData, nama_lengkap: e.target.value})}
                      className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#660000] transition-all text-slate-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">No. Telepon</label>
                    <input 
                      type="text"
                      required
                      value={profileFormData.no_telepon || ''}
                      onChange={(e) => setProfileFormData({...profileFormData, no_telepon: e.target.value})}
                      className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#660000] transition-all text-slate-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Berat Badan (kg)</label>
                    <input 
                      type="number"
                      required
                      value={profileFormData.berat_badan || ''}
                      onChange={(e) => setProfileFormData({...profileFormData, berat_badan: parseInt(e.target.value)})}
                      className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#660000] transition-all text-slate-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Tinggi Badan (cm)</label>
                    <input 
                      type="number"
                      required
                      value={profileFormData.tinggi_badan || ''}
                      onChange={(e) => setProfileFormData({...profileFormData, tinggi_badan: parseInt(e.target.value)})}
                      className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#660000] transition-all text-slate-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Golongan Darah</label>
                    <select 
                      required
                      value={profileFormData.golongan_darah || ''}
                      onChange={(e) => setProfileFormData({...profileFormData, golongan_darah: e.target.value})}
                      className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#660000] transition-all text-slate-900"
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
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Usia</label>
                    <input 
                      type="number"
                      required
                      value={profileFormData.umur || ''}
                      onChange={(e) => setProfileFormData({...profileFormData, umur: parseInt(e.target.value)})}
                      className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#660000] transition-all text-slate-900"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Alamat Domisili</label>
                  <textarea 
                    required
                    value={profileFormData.alamat || ''}
                    onChange={(e) => setProfileFormData({...profileFormData, alamat: e.target.value})}
                    className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#660000] transition-all text-slate-900 min-h-[100px]"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-[#660000] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#550000] transition-all shadow-lg shadow-black/10"
                >
                  Simpan Perubahan Profil
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