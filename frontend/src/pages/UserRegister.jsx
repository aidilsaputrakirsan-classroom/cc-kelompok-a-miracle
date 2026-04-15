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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-[#660000]/5 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-10 right-5 w-96 h-96 bg-[#660000]/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-blue-100/10 rounded-full blur-3xl"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Link to="/login" className="inline-flex items-center gap-2 text-slate-600 hover:text-[#660000] mb-8 font-semibold transition-colors group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Kembali ke Login
        </Link>

        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="w-16 h-16 bg-gradient-to-br from-[#660000] to-[#440000] rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-2xl shadow-[#660000]/30"
          >
            <Droplets className="w-10 h-10" />
          </motion.div>
          <h1 className="text-4xl font-black text-slate-900 mb-2">DAFTAR TRACELT</h1>
          <p className="text-slate-600 font-medium">Buat akun pengguna untuk mulai berkontribusi</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 backdrop-blur-xl"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 bg-[#660000]/5 text-[#660000] rounded-2xl text-sm flex items-center gap-3 border border-[#660000]/10">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1 flex items-center gap-1">
                <User className="w-4 h-4" />
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                required
                placeholder="Intania"
                className="w-full px-4 py-3.5 bg-slate-100 border-2 border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-[#660000] focus:ring-4 focus:ring-[#660000]/10 transition-all text-slate-900 font-medium"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1 flex items-center gap-1">
                <Mail className="w-4 h-4" />
                Email <span className="text-red-500">*</span>
              </label>
              <input 
                type="email" 
                required
                placeholder="debora@student.itk.ac.id"
                className="w-full px-4 py-3.5 bg-slate-100 border-2 border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-[#660000] focus:ring-4 focus:ring-[#660000]/10 transition-all text-slate-900 font-medium"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1 flex items-center gap-1">
                <Lock className="w-4 h-4" />
                Kata Sandi <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3.5 bg-slate-100 border-2 border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-[#660000] focus:ring-4 focus:ring-[#660000]/10 transition-all text-slate-900 font-medium pr-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors p-1 hover:bg-slate-200 rounded-lg"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <div className="mt-3 p-4 bg-gradient-to-r from-blue-50 to-blue-50/50 rounded-2xl border border-blue-100">
                <p className="text-xs font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <span className="text-base">🔐</span>
                  Standar Kata Sandi yang Kuat
                </p>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>✓ Minimal 8 karakter</li>
                  <li>✓ Mengandung huruf besar (A-Z)</li>
                  <li>✓ Mengandung huruf kecil (a-z)</li>
                  <li>✓ Mengandung angka (0-9)</li>
                  <li>✓ Mengandung karakter khusus (!@#$%^&*)</li>
                </ul>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1 flex items-center gap-1">
                <Lock className="w-4 h-4" />
                Konfirmasi Kata Sandi <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3.5 bg-slate-100 border-2 border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-[#660000] focus:ring-4 focus:ring-[#660000]/10 transition-all text-slate-900 font-medium pr-12"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button 
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors p-1 hover:bg-slate-200 rounded-lg"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <motion.button 
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-[#660000] to-[#8b0000] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-xl shadow-lg shadow-[#660000]/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-6"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  Daftar Sekarang
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 pt-6 border-t border-slate-100 text-center"
          >
            <p className="text-slate-600 text-sm font-medium">
              Sudah punya akun?{' '}
              <Link to="/login?type=user" className="text-[#660000] font-bold hover:text-[#8b0000] transition-colors underline-offset-2 hover:underline">
                Masuk Disini
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};