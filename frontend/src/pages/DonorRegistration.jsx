import { useState } from 'react';
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
  const [neverDonated, setNeverDonated] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    nama_lengkap: '',
    jenis_kelamin: 'Laki-laki',
    berat_badan: '',
    tinggi_badan: '',
    golongan_darah: 'O+',
    umur: '',
    tanggal_lahir: '',
    alamat: '',
    no_telepon: '',
    tanggal_terakhir_donor: '',
    riwayat_donor_count: '0',
    riwayat_kesehatan: ''
  });

  const validateStep = (currentStep) => {
    const newErrors = {};
    if (currentStep === 1) {
      if (!formData.nama_lengkap) newErrors.nama_lengkap = 'Nama lengkap wajib diisi';
      if (!formData.no_telepon) newErrors.no_telepon = 'Nomor telepon wajib diisi';
      if (!formData.tanggal_lahir) newErrors.tanggal_lahir = 'Tanggal lahir wajib diisi';
      if (!formData.alamat) newErrors.alamat = 'Alamat domisili wajib diisi';
    } else if (currentStep === 2) {
      if (!formData.berat_badan) newErrors.berat_badan = 'Berat badan wajib diisi';
      if (!formData.tinggi_badan) newErrors.tinggi_badan = 'Tinggi badan wajib diisi';
      if (!formData.umur) newErrors.umur = 'Usia wajib diisi';
    } else if (currentStep === 3) {
      if (!neverDonated && !formData.tanggal_terakhir_donor) newErrors.tanggal_terakhir_donor = 'Tanggal terakhir donor wajib diisi';
      if (!formData.riwayat_donor_count && formData.riwayat_donor_count !== 0) newErrors.riwayat_donor_count = 'Total donor wajib diisi';
      if (!formData.riwayat_kesehatan) newErrors.riwayat_kesehatan = 'Riwayat kesehatan wajib diisi (isi "Tidak ada" jika tidak ada)';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    try {
      await apiService.registerPendonor({
        ...formData,
        berat_badan: parseFloat(formData.berat_badan),
        tinggi_badan: parseFloat(formData.tinggi_badan),
        umur: parseInt(formData.umur),
        riwayat_donor_count: parseInt(formData.riwayat_donor_count),
        tanggal_terakhir_donor: neverDonated ? null : formData.tanggal_terakhir_donor
      });
      setStep(4);
    } catch (err) {
      alert('Gagal mendaftar. Silakan coba lagi.');
    }
  };

  const handleNeverDonatedChange = (e) => {
    const checked = e.target.checked;
    setNeverDonated(checked);
    if (checked) {
      setFormData({
        ...formData,
        tanggal_terakhir_donor: '',
        riwayat_donor_count: '0'
      });
      // Clear error for these fields if they existed
      const newErrors = { ...errors };
      delete newErrors.tanggal_terakhir_donor;
      delete newErrors.riwayat_donor_count;
      setErrors(newErrors);
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
                    <label className="text-sm font-semibold text-slate-700 ml-1 flex justify-between">
                      Nama Lengkap <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input 
                        type="text" 
                        required
                        placeholder="Contoh: Budi Santoso"
                        className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#660000] transition-all ${errors.nama_lengkap ? 'ring-2 ring-red-500' : ''}`}
                        value={formData.nama_lengkap}
                        onChange={(e) => {
                          setFormData({...formData, nama_lengkap: e.target.value});
                          if (errors.nama_lengkap) setErrors({...errors, nama_lengkap: ''});
                        }}
                      />
                    </div>
                    {errors.nama_lengkap && <p className="text-xs text-red-500 ml-1">{errors.nama_lengkap}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 ml-1 flex justify-between">
                      No. Telepon <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input 
                        type="tel" 
                        required
                        placeholder="0812..."
                        className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#660000] transition-all ${errors.no_telepon ? 'ring-2 ring-red-500' : ''}`}
                        value={formData.no_telepon}
                        onChange={(e) => {
                          setFormData({...formData, no_telepon: e.target.value});
                          if (errors.no_telepon) setErrors({...errors, no_telepon: ''});
                        }}
                      />
                    </div>
                    {errors.no_telepon && <p className="text-xs text-red-500 ml-1">{errors.no_telepon}</p>}
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
                    <label className="text-sm font-semibold text-slate-700 ml-1 flex justify-between">
                      Tanggal Lahir <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input 
                        type="date" 
                        required
                        className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#660000] transition-all ${errors.tanggal_lahir ? 'ring-2 ring-red-500' : ''}`}
                        value={formData.tanggal_lahir}
                        onChange={(e) => {
                          setFormData({...formData, tanggal_lahir: e.target.value});
                          if (errors.tanggal_lahir) setErrors({...errors, tanggal_lahir: ''});
                        }}
                      />
                    </div>
                    {errors.tanggal_lahir && <p className="text-xs text-red-500 ml-1">{errors.tanggal_lahir}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1 flex justify-between">
                    Alamat Domisili <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 text-slate-400 w-5 h-5" />
                    <textarea 
                      required
                      rows={3}
                      placeholder="Alamat lengkap di Balikpapan..."
                      className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#660000] transition-all ${errors.alamat ? 'ring-2 ring-red-500' : ''}`}
                      value={formData.alamat}
                      onChange={(e) => {
                        setFormData({...formData, alamat: e.target.value});
                        if (errors.alamat) setErrors({...errors, alamat: ''});
                      }}
                    />
                  </div>
                  {errors.alamat && <p className="text-xs text-red-500 ml-1">{errors.alamat}</p>}
                </div>

                <button 
                  onClick={handleNext}
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
                    <label className="text-sm font-semibold text-slate-700 ml-1 flex justify-between">
                      Berat Badan (kg) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Scale className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input 
                        type="number" 
                        required
                        placeholder="Contoh: 65"
                        className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#660000] transition-all ${errors.berat_badan ? 'ring-2 ring-red-500' : ''}`}
                        value={formData.berat_badan}
                        onChange={(e) => {
                          setFormData({...formData, berat_badan: e.target.value});
                          if (errors.berat_badan) setErrors({...errors, berat_badan: ''});
                        }}
                      />
                    </div>
                    {errors.berat_badan && <p className="text-xs text-red-500 ml-1">{errors.berat_badan}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 ml-1 flex justify-between">
                      Tinggi Badan (cm) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input 
                        type="number" 
                        required
                        placeholder="Contoh: 170"
                        className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#660000] transition-all ${errors.tinggi_badan ? 'ring-2 ring-red-500' : ''}`}
                        value={formData.tinggi_badan}
                        onChange={(e) => {
                          setFormData({...formData, tinggi_badan: e.target.value});
                          if (errors.tinggi_badan) setErrors({...errors, tinggi_badan: ''});
                        }}
                      />
                    </div>
                    {errors.tinggi_badan && <p className="text-xs text-red-500 ml-1">{errors.tinggi_badan}</p>}
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
                    <label className="text-sm font-semibold text-slate-700 ml-1 flex justify-between">
                      Usia <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="number" 
                      required
                      min={17}
                      placeholder="Contoh: 20"
                      className={`w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#660000] transition-all ${errors.umur ? 'ring-2 ring-red-500' : ''}`}
                      value={formData.umur}
                      onChange={(e) => {
                        setFormData({...formData, umur: e.target.value});
                        if (errors.umur) setErrors({...errors, umur: ''});
                      }}
                    />
                    {errors.umur && <p className="text-xs text-red-500 ml-1">{errors.umur}</p>}
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
                    onClick={handleNext}
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

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className={`space-y-2 transition-opacity ${neverDonated ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                        <label className="text-sm font-semibold text-slate-700 ml-1 flex justify-between">
                          Tanggal Terakhir Donor {!neverDonated && <span className="text-red-500">*</span>}
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                          <input 
                            type="date" 
                            disabled={neverDonated}
                            className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#660000] transition-all ${errors.tanggal_terakhir_donor ? 'ring-2 ring-red-500' : ''}`}
                            value={formData.tanggal_terakhir_donor}
                            onChange={(e) => {
                              setFormData({...formData, tanggal_terakhir_donor: e.target.value});
                              if (errors.tanggal_terakhir_donor) setErrors({...errors, tanggal_terakhir_donor: ''});
                            }}
                          />
                        </div>
                        {errors.tanggal_terakhir_donor && <p className="text-xs text-red-500 ml-1">{errors.tanggal_terakhir_donor}</p>}
                      </div>
                      
                      <div className="flex items-center gap-2 ml-1">
                        <input 
                          type="checkbox" 
                          id="neverDonated"
                          className="w-4 h-4 rounded text-[#660000] focus:ring-[#660000] border-slate-300"
                          checked={neverDonated}
                          onChange={handleNeverDonatedChange}
                        />
                        <label htmlFor="neverDonated" className="text-xs font-medium text-slate-500 cursor-pointer">
                          Belum pernah mendonor sama sekali
                        </label>
                      </div>
                    </div>

                    <div className={`space-y-2 transition-opacity ${neverDonated ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                      <label className="text-sm font-semibold text-slate-700 ml-1 flex justify-between">
                        Total Donor (Kali) {!neverDonated && <span className="text-red-500">*</span>}
                      </label>
                      <input 
                        type="number" 
                        min={0}
                        disabled={neverDonated}
                        placeholder="0"
                        className={`w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#660000] transition-all ${errors.riwayat_donor_count ? 'ring-2 ring-red-500' : ''}`}
                        value={formData.riwayat_donor_count}
                        onChange={(e) => {
                          setFormData({...formData, riwayat_donor_count: e.target.value});
                          if (errors.riwayat_donor_count) setErrors({...errors, riwayat_donor_count: ''});
                        }}
                      />
                      {errors.riwayat_donor_count && <p className="text-xs text-red-500 ml-1">{errors.riwayat_donor_count}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 ml-1 flex justify-between">
                      Riwayat Kesehatan <span className="text-red-500">*</span>
                    </label>
                    <textarea 
                      rows={4}
                      placeholder="Contoh: Tidak ada penyakit bawaan, alergi obat tertentu, dsb."
                      className={`w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#660000] transition-all ${errors.riwayat_kesehatan ? 'ring-2 ring-red-500' : ''}`}
                      value={formData.riwayat_kesehatan}
                      onChange={(e) => {
                        setFormData({...formData, riwayat_kesehatan: e.target.value});
                        if (errors.riwayat_kesehatan) setErrors({...errors, riwayat_kesehatan: ''});
                      }}
                    />
                    {errors.riwayat_kesehatan && <p className="text-xs text-red-500 ml-1">{errors.riwayat_kesehatan}</p>}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setStep(2)}
                    className="flex-1 bg-slate-50 text-slate-600 py-4 rounded-2xl font-bold hover:bg-slate-100 transition-all"
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
                  Terima kasih telah bergabung. Data Anda telah tersimpan di sistem TRACELT ITK.
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