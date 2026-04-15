import { useState } from 'react';
import { motion } from 'framer-motion';
import { Droplets, Mail, Lock, ArrowRight, AlertCircle, ChevronLeft, User, Eye, EyeOff } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { apiService } from '../services/api';

export const UserRegister = () => {
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await apiService.registerPengguna({
        nama_pengguna: nama,
        email,
        password
      });
      navigate('/login?type=user');
    } catch (err) {
      setError(err.response?.data?.detail || 'Gagal mendaftar. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Link to="/login" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8 font-medium transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Kembali ke Login
        </Link>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#660000] rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-black/10">
            <Droplets className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">DAFTAR TRACELT</h1>
          <p className="text-slate-500 mt-2">Buat akun pengguna untuk mulai berkontribusi.</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 bg-[#660000]/5 text-[#660000] rounded-2xl text-sm flex items-center gap-3 border border-[#660000]/10">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Nama Lengkap <span className="text-red-500">*</span></label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="text" 
                  required
                  placeholder="Contoh: Intania"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#660000] transition-all text-slate-900"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Email <span className="text-red-500">*</span></label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="email" 
                  required
                  placeholder="Contoh: debora@student.itk.ac.id"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#660000] transition-all text-slate-900"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Kata Sandi <span className="text-red-500">*</span></label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  placeholder="Contoh: Yosan123!"
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#660000] transition-all text-slate-900"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Konfirmasi Kata Sandi <span className="text-red-500">*</span></label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  required
                  placeholder="Ulangi kata sandi Anda"
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#660000] transition-all text-slate-900"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button 
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#660000] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#550000] transition-all shadow-lg shadow-black/10 disabled:opacity-70"
            >
              {loading ? 'Memproses...' : 'Daftar Sekarang'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-slate-500 text-sm">
              Sudah punya akun?{' '}
              <Link to="/login?type=user" className="text-[#660000] font-bold hover:underline">
                Masuk Disini
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};