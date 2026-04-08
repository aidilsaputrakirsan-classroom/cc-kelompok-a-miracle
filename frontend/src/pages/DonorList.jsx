import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  UserPlus,
  Phone,
  Calendar,
  MapPin,
  Users,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';

export const DonorList = () => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    golongan_darah: '',
    jenis_kelamin: '',
    usia_min: '',
    usia_max: ''
  });

  const fetchDonors = async () => {
    setLoading(true);
    try {
      const params = {};

      if (searchTerm.trim()) {
        params.nama = searchTerm.trim();
      }
      if (filters.golongan_darah) {
        params.golongan_darah = filters.golongan_darah;
      }
      if (filters.jenis_kelamin) {
        params.jenis_kelamin = filters.jenis_kelamin;
      }
      if (filters.usia_min !== '') {
        params.usia_min = Number(filters.usia_min);
      }
      if (filters.usia_max !== '') {
        params.usia_max = Number(filters.usia_max);
      }

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
            title="Kembali ke Dashboard"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Daftar Pendonor</h1>
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
                  min={18}
                  className="w-20 px-3 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-[#660000] transition-all text-sm"
                  value={filters.usia_min}
                  onChange={(e) => setFilters({...filters, usia_min: e.target.value})}
                />
                <span className="text-slate-300">-</span>
                <input 
                  type="number" 
                  placeholder="Max Umur"
                  min={18}
                  className="w-20 px-3 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-[#660000] transition-all text-sm"
                  value={filters.usia_max}
                  onChange={(e) => setFilters({...filters, usia_max: e.target.value})}
                />
              </div>

              <button 
                onClick={() => {
                  setSearchTerm('');
                  setFilters({ golongan_darah: '', jenis_kelamin: '', usia_min: '', usia_max: '' });
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
                        <div className="text-xs text-slate-500">{donor.usia} th • {donor.jenis_kelamin}</div>
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
                    <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};