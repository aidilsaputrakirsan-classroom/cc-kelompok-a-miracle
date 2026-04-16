import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Droplets, Mail, Lock, ArrowRight, AlertCircle, ChevronLeft, Eye, EyeOff, Shield } from 'lucide-react';
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
    <div className={`min-h-screen flex items-center justify-center p-6 relative overflow-hidden ${
      isAdminLogin 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-[#1a1a1a]' 
        : 'bg-gradient-to-br from-slate-50 via-white to-[#660000]/5'
    }`}>
      {/* Background decorative elements */}
      {isAdminLogin ? (
        <>
          <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-slate-500/10 rounded-full blur-3xl"></div>
        </>
      ) : (
        <>
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#660000]/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-100/10 rounded-full blur-3xl"></div>
        </>
      )}
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Link to="/" className={`inline-flex items-center gap-2 mb-8 font-semibold transition-colors group ${
          isAdminLogin
            ? 'text-slate-400 hover:text-yellow-500'
            : 'text-slate-600 hover:text-[#660000]'
        }`}>
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Kembali ke Beranda
        </Link>

        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-2xl ${
              isAdminLogin
                ? 'bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-yellow-500/30'
                : 'bg-gradient-to-br from-[#660000] to-[#440000] shadow-[#660000]/30'
            }`}
          >
            {isAdminLogin ? (
              <Shield className="w-10 h-10" />
            ) : (
              <Droplets className="w-10 h-10" />
            )}
          </motion.div>
          <h1 className={`text-4xl font-black mb-2 ${
            isAdminLogin ? 'text-slate-100' : 'text-slate-900'
          }`}>
            {isAdminLogin ? 'PORTAL ADMIN' : 'TRACELT'}
          </h1>
          {isAdminLogin && (
            <p className="text-yellow-500/80 text-sm font-semibold">Sistem Manajemen Donor Darah</p>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={`p-8 rounded-3xl backdrop-blur-xl border ${
            isAdminLogin
              ? 'bg-slate-800/50 border-slate-700 shadow-xl shadow-black/50'
              : 'bg-white shadow-xl shadow-slate-200/50 border-slate-100'
          }`}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className={`p-4 rounded-2xl text-sm flex items-center gap-3 border ${
                isAdminLogin
                  ? 'bg-red-500/10 text-red-400 border-red-500/20'
                  : 'bg-[#660000]/5 text-[#660000] border-[#660000]/10'
              }`}>
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className={`text-sm font-semibold ml-1 flex items-center gap-1 ${
                isAdminLogin ? 'text-slate-300' : 'text-slate-700'
              }`}>
                <Mail className="w-4 h-4" />
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <input 
                  type="email" 
                  required
                  placeholder={loginType === 'admin' ? "admin@itk.ac.id" : "budi@student.itk.ac.id"}
                  className={`w-full px-4 py-3.5 border-2 border-transparent rounded-2xl focus:outline-none focus:ring-4 transition-all font-medium ${
                    isAdminLogin
                      ? 'bg-slate-700 text-white placeholder-slate-400 focus:bg-slate-700 focus:border-yellow-500 focus:ring-yellow-500/10'
                      : 'bg-slate-100 text-slate-900 focus:bg-white focus:border-[#660000] focus:ring-[#660000]/10'
                  }`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className={`text-sm font-semibold ml-1 flex items-center gap-1 ${
                isAdminLogin ? 'text-slate-300' : 'text-slate-700'
              }`}>
                <Lock className="w-4 h-4" />
                Kata Sandi <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  placeholder="••••••••"
                  className={`w-full px-4 py-3.5 border-2 border-transparent rounded-2xl focus:outline-none focus:ring-4 transition-all font-medium pr-12 ${
                    isAdminLogin
                      ? 'bg-slate-700 text-white placeholder-slate-400 focus:bg-slate-700 focus:border-yellow-500 focus:ring-yellow-500/10'
                      : 'bg-slate-100 text-slate-900 focus:bg-white focus:border-[#660000] focus:ring-[#660000]/10'
                  }`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors p-1 rounded-lg ${
                    isAdminLogin
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-600'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
                  }`}
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
              className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed ${
                isAdminLogin
                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-slate-900 hover:shadow-xl shadow-lg shadow-yellow-500/30'
                  : 'bg-gradient-to-r from-[#660000] to-[#8b0000] text-white hover:shadow-xl shadow-lg shadow-[#660000]/30'
              }`}
            >
              {loading ? (
                <>
                  <div className={`w-5 h-5 rounded-full animate-spin border-2 ${
                    isAdminLogin
                      ? 'border-slate-900/30 border-t-slate-900'
                      : 'border-white/30 border-t-white'
                  }`} />
                  Memproses...
                </>
              ) : (
                <>
                  Masuk
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>

            {isAdminLogin && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-6 pt-6 border-t border-slate-700 text-center"
              >
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  🔐 Akses Terbatas - Hanya untuk Administrator
                </p>
              </motion.div>
            )}
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