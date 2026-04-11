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
  Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

export const DonorList = () => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDonor, setSelectedDonor] = useState(null);
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
        nama: searchTerm,
        ...filters
      };
      const res = await apiService.getPendonorList(params);
      setDonors(res.data.pendonor);
    } catch (err) {
      console.error('Gagal mengambil data pendonor:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, [searchTerm, filters]);

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
            <p className="text-slate-500 text-sm">Kelola data civitas akademika yang terdaftar sebagai pendonor.</p>
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
              ) : donors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">Tidak ada data pendonor ditemukan.</td>
                </tr>
              ) : donors.map((donor) => (
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
                    <button 
                      onClick={() => setSelectedDonor(donor)}
                      className="p-2 text-slate-400 hover:text-[#660000] hover:bg-[#660000]/10 rounded-lg transition-all"
                      title="Lihat Detail"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
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

                {/* Donation History */}
                <div className="bg-[#660000]/5 p-6 rounded-3xl border border-[#660000]/10">
                  <h3 className="text-sm font-bold text-[#660000] uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    Riwayat Donor
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Terakhir Donor</p>
                      <p className="font-bold text-slate-900">{selectedDonor.tanggal_terakhir_donor || 'Belum pernah'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Total Donor</p>
                      <p className="font-bold text-slate-900">{selectedDonor.riwayat_donor_count} Kali</p>
                    </div>
                  </div>
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

              <div className="p-6 bg-slate-50 border-t border-slate-100">
                <button 
                  onClick={() => setSelectedDonor(null)}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-black/10"
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