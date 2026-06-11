import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Droplets, Clock, CheckCircle2, User } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { UserDashboardHeader } from '../components/UserDashboardHeader';
import { apiService } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ServiceUnavailable } from '../components/ServiceUnavailable';

const STATUS_BADGE = {
  true: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  false: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

export const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [riwayats, setRiwayats] = useState([]);
  const [pendonorMap, setPendonorMap] = useState({});
  const [bloodStock, setBloodStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchUserData(), fetchUserRiwayat(), fetchBloodStock()]);
    };
    loadData();
  }, []);

  const fetchBloodStock = async () => {
    try {
      const res = await apiService.getPublicBloodStock();
      setBloodStock(res.data.blood_stock || []);
    } catch {
      // stok darah opsional, gagal tidak apa-apa
    }
  };

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
      const list = res.data.riwayat_donor || [];
      setRiwayats(list);

      // Fetch nama pendonor untuk setiap id_pendonor unik
      const uniqueIds = [...new Set(list.map((r) => r.id_pendonor))];
      const entries = await Promise.all(
        uniqueIds.map((id) =>
          apiService.getPendonorById(id)
            .then((r) => [id, r.data])
            .catch(() => [id, null])
        )
      );
      setPendonorMap(Object.fromEntries(entries));
    } catch (err) {
      console.error('Error fetching riwayat donor:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const totalRiwayat = riwayats.length;
  const verifiedCount = riwayats.filter((r) => r.status_verifikasi).length;
  const pendingCount = totalRiwayat - verifiedCount;

  if (loading && !error) return <LoadingSpinner fullPage />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 font-sans">
      <UserDashboardHeader />

      <main className="pb-24">
        {/* Hero */}
        <div className="bg-gradient-to-r from-[#660000] to-[#8b0000] text-white py-16 dark:from-red-950 dark:to-red-900 border-b border-white/10">
          <div className="px-6 max-w-full mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-4xl lg:text-6xl font-black text-white mb-2 tracking-tighter"
              >
                Halo, {user?.nama_pengguna || 'Pengguna'}!
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-white/70 text-base"
              >
                {user?.email}
              </motion.p>
            </div>
            <div className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20 shrink-0">
              <User className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        <div className="px-6 max-w-full mx-auto pt-10">
          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <StatCard label="Total Riwayat" value={totalRiwayat} icon={<ClipboardList className="w-5 h-5 text-[#660000]" />} />
            <StatCard label="Terverifikasi" value={verifiedCount} icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />} />
            <StatCard label="Menunggu Verifikasi" value={pendingCount} icon={<Clock className="w-5 h-5 text-amber-500" />} />
          </div>

          {/* Riwayat section */}
          {error ? (
            <ServiceUnavailable onRetry={fetchUserRiwayat} error={error} />
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Riwayat Donor Saya</h2>

              {riwayats.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center dark:bg-slate-900 dark:border-slate-700">
                  <Droplets className="mx-auto mb-4 h-10 w-10 text-[#660000]" />
                  <p className="font-semibold text-slate-800 dark:text-white">Belum ada riwayat donor</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 mb-6">
                    Klik "Input Donor" di atas untuk mencatat donor pertama Anda.
                  </p>
                  <Link
                    to="/user/input-donor"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#660000] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#4d0000] transition"
                  >
                    Input Donor Sekarang
                  </Link>
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  {/* Table header */}
                  <div className="grid grid-cols-12 gap-2 px-5 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold uppercase tracking-widest text-slate-400">
                    <div className="col-span-1 text-center">#</div>
                    <div className="col-span-4">Nama Pendonor</div>
                    <div className="col-span-3 text-center">Gol. Darah</div>
                    <div className="col-span-4 text-center">Status</div>
                  </div>

                  {/* Table rows */}
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {riwayats.map((riwayat, idx) => {
                      const donor = pendonorMap[riwayat.id_pendonor];
                      return (
                        <motion.div
                          key={riwayat.id_riwayat}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.04 }}
                          className="grid grid-cols-12 gap-2 px-5 py-4 items-center hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <div className="col-span-1 text-center">
                            <span className="text-xs font-mono text-slate-400">{idx + 1}</span>
                          </div>

                          <div className="col-span-4">
                            {donor ? (
                              <div>
                                <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                                  {donor.nama_lengkap}
                                </p>
                                <p className="text-xs text-slate-400 truncate">{donor.email}</p>
                              </div>
                            ) : (
                              <p className="text-sm text-slate-400">Pendonor #{riwayat.id_pendonor}</p>
                            )}
                          </div>

                          <div className="col-span-3 text-center">
                            <span className="inline-block rounded-full bg-red-50 dark:bg-red-900/20 text-[#660000] dark:text-red-400 text-xs font-bold px-3 py-1">
                              {riwayat.golongan_darah}
                            </span>
                          </div>

                          <div className="col-span-4 text-center">
                            <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${STATUS_BADGE[riwayat.status_verifikasi]}`}>
                              {riwayat.status_verifikasi ? 'Terverifikasi' : 'Menunggu Verifikasi'}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Stok Darah */}
          {bloodStock.length > 0 && (
            <div className="mt-10 space-y-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Stok Darah Tersedia</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Berdasarkan data donor yang sudah terverifikasi</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {bloodStock.map((item) => (
                  <BloodStockCard key={item.golongan_darah} golongan={item.golongan_darah} jumlah={item.jumlah_stok} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const STOCK_COLOR = {
  'O+': { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-300', dot: 'bg-red-500' },
  'O-': { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-300', dot: 'bg-red-500' },
  'A+': { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-300', dot: 'bg-blue-500' },
  'A-': { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-300', dot: 'bg-blue-500' },
  'B+': { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-300', dot: 'bg-green-500' },
  'B-': { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-300', dot: 'bg-green-500' },
  'AB+': { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-700 dark:text-purple-300', dot: 'bg-purple-500' },
  'AB-': { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-700 dark:text-purple-300', dot: 'bg-purple-500' },
};

const BloodStockCard = ({ golongan, jumlah }) => {
  const color = STOCK_COLOR[golongan] || { bg: 'bg-slate-50 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300', dot: 'bg-slate-400' };
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border border-slate-100 dark:border-slate-800 p-4 ${color.bg} flex flex-col items-center gap-2`}
    >
      <div className={`w-2 h-2 rounded-full ${color.dot}`} />
      <span className={`text-2xl font-black ${color.text}`}>{golongan}</span>
      <div className="text-center">
        <p className="text-3xl font-black text-slate-900 dark:text-white">{jumlah}</p>
        <p className="text-xs text-slate-400 mt-0.5">donor</p>
      </div>
    </motion.div>
  );
};

const StatCard = ({ label, value, icon }) => (
  <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 flex items-center justify-between">
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">{label}</p>
      <p className="text-4xl font-black text-slate-900 dark:text-white">{value}</p>
    </div>
    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">{icon}</div>
  </div>
);
