import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, ClipboardList, Droplets, Clock, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { apiService } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ServiceUnavailable } from '../components/ServiceUnavailable';

export const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [riwayats, setRiwayats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchUserData(), fetchUserRiwayat()]);
    };
    loadData();
  }, []);

  const fetchUserData = async () => {
    try {
      const res = await apiService.getPenggunaMe();
      setUser(res.data);
    } catch (err) {
      console.error('Error fetching user data:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('user_token');
        navigate('/login?type=user');
      } else {
        setError(err);
      }
    }
  };

  const fetchUserRiwayat = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await apiService.getRiwayatDonorPengguna({ limit: 1000 });
      setRiwayats(res.data.riwayat_donor || []);
    } catch (err) {
      console.error('Error fetching riwayat donor:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user_token');
    localStorage.removeItem('admin_token');
    navigate('/login?type=user');
  };

  const totalRiwayat = riwayats.length;
  const verifiedCount = riwayats.filter((riwayat) => riwayat.status_verifikasi).length;
  const pendingCount = totalRiwayat - verifiedCount;

  if (loading && !error) {
    return <LoadingSpinner fullPage />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 overflow-hidden relative font-sans">
      <div className="absolute top-0 right-0 w-full h-[500px] bg-gradient-to-b from-[#660000]/10 to-transparent dark:from-red-950/20 pointer-events-none" />
      <div className="absolute top-48 -left-24 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      <Header />

      <main className="pb-24 relative z-10">
        <div className="bg-gradient-to-r from-[#660000] to-[#8b0000] text-white py-20 shadow-2xl shadow-black/10 dark:from-red-950 dark:to-red-900 border-b border-white/10">
          <div className="px-6 max-w-full mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div>
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-5xl lg:text-7xl font-black text-white mb-4 tracking-tighter"
                >
                  Halo, {user?.nama_pengguna || 'Pengguna'}!
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-white/80 font-bold text-xl dark:text-slate-300 max-w-2xl"
                >
                  Ini adalah halaman riwayat donor Anda.
                </motion.p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20">
                  <User className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 max-w-full mx-auto pt-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm dark:bg-slate-900 dark:border-slate-800">
              <div className="flex items-center justify-between mb-6">
                <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Total Riwayat</div>
                <ClipboardList className="w-6 h-6 text-[#660000]" />
              </div>
              <div className="text-5xl font-black text-slate-900 dark:text-white">{totalRiwayat}</div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm dark:bg-slate-900 dark:border-slate-800">
              <div className="flex items-center justify-between mb-6">
                <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Terverifikasi</div>
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              </div>
              <div className="text-5xl font-black text-slate-900 dark:text-white">{verifiedCount}</div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm dark:bg-slate-900 dark:border-slate-800">
              <div className="flex items-center justify-between mb-6">
                <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Menunggu Verifikasi</div>
                <Clock className="w-6 h-6 text-amber-500" />
              </div>
              <div className="text-5xl font-black text-slate-900 dark:text-white">{pendingCount}</div>
            </div>
          </div>

          {error ? (
            <ServiceUnavailable onRetry={fetchUserRiwayat} error={error} />
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Riwayat Donor Saya</h2>
                  <p className="text-slate-500 dark:text-slate-400">Daftar semua laporan donor yang Anda kirim.</p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-full bg-[#660000] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4d0000]"
                >
                  Keluar
                </button>
              </div>

              {riwayats.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center dark:bg-slate-900 dark:border-slate-700">
                  <Droplets className="mx-auto mb-4 h-12 w-12 text-[#660000]" />
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Belum ada riwayat donor</h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Riwayat donor Anda akan muncul di sini setelah Anda menambahkan laporan donor.
                  </p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {riwayats.map((riwayat) => (
                    <div key={riwayat.id_riwayat} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-sm text-slate-500">ID Riwayat #{riwayat.id_riwayat}</p>
                          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Pendonor #{riwayat.id_pendonor}</h3>
                        </div>
                        <span className={`rounded-full px-4 py-2 text-xs font-semibold ${riwayat.status_verifikasi ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {riwayat.status_verifikasi ? 'Terverifikasi' : 'Pending'}
                        </span>
                      </div>
                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                          <p className="text-sm text-slate-500">Golongan Darah</p>
                          <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{riwayat.golongan_darah}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                          <p className="text-sm text-slate-500">Jenis Laporan</p>
                          <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">Riwayat Donor</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
