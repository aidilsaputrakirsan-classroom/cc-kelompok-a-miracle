import { useState } from 'react';
import { motion } from 'framer-motion';
import { Droplets, Mail, Lock, ArrowRight, AlertCircle, ChevronLeft, Eye, EyeOff, Shield } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthServiceBanner } from '../components/AuthServiceBanner';
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

  // ── Tema kondisional: indigo untuk admin, crimson untuk user ──
  const t = isAdminLogin
    ? {
        pageBg:      'bg-gradient-to-br from-slate-50 via-white to-indigo-800/5 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-900/10',
        blob1:       'bg-indigo-800/10',
        blob2:       'bg-indigo-300/10',
        backLink:    'hover:text-indigo-800 dark:hover:text-indigo-400',
        iconGrad:    'from-indigo-900 to-indigo-700 shadow-indigo-900/30',
        cardBorder:  'border-indigo-100 dark:border-indigo-900/40',
        errorBox:    'bg-indigo-800/5 text-indigo-900 dark:bg-indigo-400/10 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700/40',
        inputFocus:  'focus:border-indigo-800 dark:focus:border-indigo-400 focus:ring-indigo-800/10 dark:focus:ring-indigo-400/20',
        btnGrad:     'from-indigo-900 to-indigo-700 shadow-indigo-900/30 hover:from-indigo-800 hover:to-indigo-600',
      }
    : {
        pageBg:      'bg-gradient-to-br from-slate-50 via-white to-[#660000]/5 dark:from-slate-950 dark:via-slate-900 dark:to-[#660000]/10',
        blob1:       'bg-[#660000]/10',
        blob2:       'bg-blue-100/10',
        backLink:    'hover:text-[#660000] dark:hover:text-red-400',
        iconGrad:    'from-[#660000] to-[#440000] shadow-[#660000]/30',
        cardBorder:  'border-slate-100 dark:border-slate-800',
        errorBox:    'bg-[#660000]/5 text-[#660000] dark:bg-red-500/10 dark:text-red-400 border-[#660000]/10 dark:border-red-500/20',
        inputFocus:  'focus:border-[#660000] dark:focus:border-red-500 focus:ring-[#660000]/10 dark:focus:ring-red-500/20',
        btnGrad:     'from-[#660000] to-[#8b0000] shadow-[#660000]/30 hover:from-[#550000] hover:to-[#770000]',
      };

  const getLoginErrorMessage = (err) => {
    if (!err) return 'Terjadi kesalahan saat login. Silakan coba lagi.';
    if (err.response?.status === 502 || err.response?.status === 503 || err.response?.status === 504) {
      return 'Layanan sementara tidak tersedia. Silakan coba lagi beberapa saat.';
    }
    if (err.message?.includes('Layanan sementara tidak tersedia') || err.message?.includes('Service temporarily unavailable')) {
      return 'Layanan sementara tidak tersedia. Silakan coba lagi beberapa saat.';
    }
    return err.response?.data?.detail || 'Email atau password salah.';
  };

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
      setError(getLoginErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 relative overflow-hidden ${t.pageBg}`}>
      {/* Background decorative blobs */}
      <div className={`absolute top-20 left-10 w-72 h-72 ${t.blob1} rounded-full blur-3xl`}></div>
      <div className={`absolute bottom-20 right-10 w-96 h-96 ${t.blob2} rounded-full blur-3xl`}></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <AuthServiceBanner />

        <Link
          to="/"
          className={`inline-flex items-center gap-2 mb-8 font-semibold text-slate-600 ${t.backLink} dark:text-slate-400 transition-colors group`}
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Kembali ke Beranda
        </Link>

        {/* Icon + title */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-2xl bg-gradient-to-br ${t.iconGrad}`}
          >
            {isAdminLogin ? (
              <Shield className="w-10 h-10" />
            ) : (
              <Droplets className="w-10 h-10" />
            )}
          </motion.div>

          <div className="flex items-center justify-center gap-3 mb-2">
            <h1 className="text-4xl font-black text-slate-900 dark:text-white">
              {isAdminLogin ? 'PORTAL ADMIN' : 'TRACELT'}
            </h1>
          </div>

          {isAdminLogin && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-indigo-800/10 text-indigo-800 dark:bg-indigo-400/10 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-2">
              Admin Portal
            </span>
          )}

          <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">
            {isAdminLogin ? 'Masuk untuk mengelola sistem donor darah' : 'Pantau riwayat donor Anda'}
          </p>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={`p-8 rounded-3xl backdrop-blur-xl border bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-black/20 ${t.cardBorder}`}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className={`p-4 rounded-2xl text-sm flex items-center gap-3 border ${t.errorBox}`}>
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1 flex items-center gap-1 text-slate-700 dark:text-slate-300">
                <Mail className="w-4 h-4" />
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                placeholder={loginType === 'admin' ? 'admin@itk.ac.id' : 'budi@student.itk.ac.id'}
                className={`w-full px-4 py-3.5 border-2 border-transparent rounded-2xl focus:outline-none focus:ring-4 transition-all font-medium bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 placeholder:text-slate-400 dark:placeholder:text-slate-500 ${t.inputFocus}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1 flex items-center gap-1 text-slate-700 dark:text-slate-300">
                <Lock className="w-4 h-4" />
                Kata Sandi <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  className={`w-full px-4 py-3.5 border-2 border-transparent rounded-2xl focus:outline-none focus:ring-4 transition-all font-medium pr-12 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 placeholder:text-slate-400 dark:placeholder:text-slate-500 ${t.inputFocus}`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors p-1 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed bg-gradient-to-r shadow-lg ${t.btnGrad} text-white`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 rounded-full animate-spin border-2 border-white/30 border-t-white"></div>
                  Memproses...
                </>
              ) : (
                <>
                  {isAdminLogin ? 'Masuk Sebagai Admin' : 'Masuk'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>
        </motion.div>

        {!isAdminLogin && (
          <p className="text-center text-slate-600 dark:text-slate-400 text-sm mt-8 font-medium">
            Belum punya akun?{' '}
            <Link to="/user/register" className="text-[#660000] hover:text-[#440000] dark:text-red-400 dark:hover:text-red-300 font-bold transition-colors">
              Daftar di sini
            </Link>
          </p>
        )}
      </motion.div>
    </div>
  );
};
