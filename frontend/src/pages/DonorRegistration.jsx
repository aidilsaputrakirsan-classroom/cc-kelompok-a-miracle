import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  Scale, 
  Ruler, 
  Droplets,
  ArrowRight,
  CheckCircle2,
  ChevronLeft
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';

export const DonorRegistration = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    nama_lengkap: '',
    jenis_kelamin: 'Laki-laki',
    berat_badan: '',
    tinggi_badan: '',
    golongan_darah: 'O+',
    usia: '',
    tanggal_lahir: '',
    alamat: '',
    no_telepon: '',
    tanggal_terakhir_donor: '',
    riwayat_donor_count: '0',
    riwayat_kesehatan: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiService.registerPendonor({
        ...formData,
        berat_badan: parseFloat(formData.berat_badan),
        tinggi_badan: parseFloat(formData.tinggi_badan),
        usia: parseInt(formData.usia),
        riwayat_donor_count: parseInt(formData.riwayat_donor_count)
      });
      setStep(4);
    } catch (err) {
      alert('Gagal mendaftar. Silakan coba lagi.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8 font-medium transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Kembali ke Beranda
        </Link>

        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="h-2 bg-slate-100 flex">
            <div 
              className="bg-[#660000] transition-all duration-500" 
              style={{ width: `${(step / 4) * 100}%` }} 
            />
          </div>

          <div className="p-8 lg:p-12">
            {step === 1 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">Data Pribadi</h1>
                  <p className="text-slate-500 mt-2">Lengkapi informasi dasar Anda untuk bergabung sebagai pendonor.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 ml-1">Nama Lengkap</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input 
                        type="text" 
                        required
                        placeholder="Contoh: Budi Santoso"
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#660000] transition-all"
                        value={formData.nama_lengkap}
                        onChange={(e) => setFormData({...formData, nama_lengkap: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 ml-1">No. Telepon</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input 
                        type="tel" 
                        required
                        placeholder="0812..."
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#660000] transition-all"
                        value={formData.no_telepon}
                        onChange={(e) => setFormData({...formData, no_telepon: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 ml-1">Jenis Kelamin</label>
                    <select 
                      className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#660000] transition-all"
                      value={formData.jenis_kelamin}
                      onChange={(e) => setFormData({...formData, jenis_kelamin: e.target.value})}
                    >
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 ml-1">Tanggal Lahir</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input 
                        type="date" 
                        required
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#660000] transition-all"
                        value={formData.tanggal_lahir}
                        onChange={(e) => setFormData({...formData, tanggal_lahir: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Alamat Domisili</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 text-slate-400 w-5 h-5" />
                    <textarea 
                      required
                      rows={3}
                      placeholder="Alamat lengkap di Balikpapan..."
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#660000] transition-all"
                      value={formData.alamat}
                      onChange={(e) => setFormData({...formData, alamat: e.target.value})}
                    />
                  </div>
                </div>

                <button 
                  onClick={() => setStep(2)}
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all"
                >
                  Lanjutkan
                  <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">Kesehatan & Fisik</h1>
                  <p className="text-slate-500 mt-2">Informasi ini penting untuk menentukan kelayakan donor Anda.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 ml-1">Berat Badan (kg)</label>
                    <div className="relative">
                      <Scale className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input 
                        type="number" 
                        required
                        placeholder="Contoh: 65"
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#660000] transition-all"
                        value={formData.berat_badan}
                        onChange={(e) => setFormData({...formData, berat_badan: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 ml-1">Tinggi Badan (cm)</label>
                    <div className="relative">
                      <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input 
                        type="number" 
                        required
                        placeholder="Contoh: 170"
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#660000] transition-all"
                        value={formData.tinggi_badan}
                        onChange={(e) => setFormData({...formData, tinggi_badan: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 ml-1">Golongan Darah</label>
                    <div className="relative">
                      <Droplets className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <select 
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#660000] transition-all"
                        value={formData.golongan_darah}
                        onChange={(e) => setFormData({...formData, golongan_darah: e.target.value})}
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
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 ml-1">Usia</label>
                    <input 
                      type="number" 
                      required
                      min={18}
                      placeholder="Contoh: 20"
                      className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#660000] transition-all"
                      value={formData.usia}
                      onChange={(e) => setFormData({...formData, usia: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setStep(1)}
                    className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                  >
                    Kembali
                  </button>
                  <button 
                    onClick={() => setStep(3)}
                    className="flex-[2] bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all"
                  >
                    Lanjutkan
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">Riwayat Donor</h1>
                  <p className="text-slate-500 mt-2">Informasi riwayat donor dan kesehatan Anda.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 ml-1">Tanggal Terakhir Donor</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input 
                        type="date" 
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#660000] transition-all"
                        value={formData.tanggal_terakhir_donor}
                        onChange={(e) => setFormData({...formData, tanggal_terakhir_donor: e.target.value})}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 ml-1">Kosongkan jika belum pernah donor</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 ml-1">Total Donor (Kali)</label>
                    <input 
                      type="number" 
                      min={0}
                      className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#660000] transition-all"
                      value={formData.riwayat_donor_count}
                      onChange={(e) => setFormData({...formData, riwayat_donor_count: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Riwayat Kesehatan</label>
                  <textarea 
                    rows={3}
                    placeholder="Contoh: Tidak ada penyakit bawaan, alergi obat tertentu, dsb."
                    className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#660000] transition-all"
                    value={formData.riwayat_kesehatan}
                    onChange={(e) => setFormData({...formData, riwayat_kesehatan: e.target.value})}
                  />
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setStep(2)}
                    className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                  >
                    Kembali
                  </button>
                  <button 
                    onClick={handleSubmit}
                    className="flex-[2] bg-[#660000] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#550000] transition-all shadow-lg shadow-black/10"
                  >
                    Selesaikan Pendaftaran
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10"
              >
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 mb-4">Pendaftaran Berhasil!</h1>
                <p className="text-slate-500 mb-10 max-w-sm mx-auto">
                  Terima kasih telah bergabung. Data Anda telah tersimpan di sistem TraceIt ITK.
                </p>
                <Link to="/" className="inline-block bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all">
                  Kembali ke Beranda
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};