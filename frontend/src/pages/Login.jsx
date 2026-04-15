import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Droplets, Mail, Lock, ArrowRight, AlertCircle, ChevronLeft, Eye, EyeOff } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { apiService } from '../services/api';

export const Login = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const isAdminLogin = queryParams.get('type') === 'admin';
  const loginType = isAdminLogin ? 'admin' : 'user';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (loginType === 'admin') {
        const res = await apiService.loginAdmin(email, password);
        localStorage.setItem('admin_token', res.data.access_token);
        localStorage.removeItem('user_token');
        navigate('/admin');
      } else {
        const res = await apiService.loginPengguna(email, password);
        localStorage.setItem('user_token', res.data.access_token);
        localStorage.removeItem('admin_token');
        navigate('/user/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Email atau password salah.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-[#660000]/5 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-[#660000]/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-100/10 rounded-full blur-3xl"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Link to="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-[#660000] mb-8 font-semibold transition-colors group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Kembali ke Beranda
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
          <h1 className="text-4xl font-black text-slate-900 mb-2">TRACELT</h1>
          <p className="text-slate-600 font-medium">
            {loginType === 'admin' ? '🔐 Login Administrator' : '👤 Login Pengguna'}
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 backdrop-blur-xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-[#660000]/5 text-[#660000] rounded-2xl text-sm flex items-center gap-3 border border-[#660000]/10">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1 flex items-center gap-1">
                <Mail className="w-4 h-4" />
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <input 
                  type="email" 
                  required
                  placeholder={loginType === 'admin' ? "admin@itk.ac.id" : "budi@student.itk.ac.id"}
                  className="w-full px-4 py-3.5 bg-slate-100 border-2 border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-[#660000] focus:ring-4 focus:ring-[#660000]/10 transition-all text-slate-900 font-medium"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1 flex items-center gap-1">
                <Lock className="w-4 h-4" />
                Kata Sandi <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
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
            </div>

            <motion.button 
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-[#660000] to-[#8b0000] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-xl shadow-lg shadow-[#660000]/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  Masuk
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>

          {loginType === 'user' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-8 pt-6 border-t border-slate-100 text-center"
            >
              <p className="text-slate-600 text-sm font-medium">
                Belum punya akun?{' '}
                <Link to="/user/register" className="text-[#660000] font-bold hover:text-[#8b0000] transition-colors underline-offset-2 hover:underline">
                  Daftar Sekarang
                </Link>
              </p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};