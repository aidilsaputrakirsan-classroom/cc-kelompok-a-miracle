import { useEffect, useState, lazy, Suspense } from 'react';
import { Users, Droplets, CheckCircle, Clock, ChevronRight, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import useDarkMode from '../hooks/useDarkMode';
import { ServiceUnavailable } from '../components/ServiceUnavailable';

const AdminDashboardCharts = lazy(() => import('../components/AdminDashboardCharts').then((module) => ({ default: module.AdminDashboardCharts })));

const StatCard = ({ title, value, subtitle, icon: Icon, color, onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm dark:bg-slate-900 dark:border-slate-800 transition-all ${
      onClick ? 'cursor-pointer hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800/50 hover:-translate-y-0.5 active:translate-y-0' : ''
    }`}
  >
    <div className="flex items-start justify-between mb-3 sm:mb-4">
      <div className={`p-2.5 sm:p-3 rounded-xl ${color}`}>
        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
      </div>
      {onClick && <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 self-start mt-1" />}
    </div>
    <h3 className="text-slate-500 text-xs sm:text-sm font-medium mb-1 dark:text-slate-400">{title}</h3>
    <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white transition-colors">{value}</p>
    {subtitle && <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">{subtitle}</p>}
  </div>
);

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [isDark] = useDarkMode();
  const navigate = useNavigate();

  const BLOOD_TYPES = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

  const fetchStats = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const res = await apiService.getStats();
      setStats(res.data);
    } catch (err) {
      console.error('Gagal mengambil statistik:', err);
      setError(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (error) {
    return <ServiceUnavailable onRetry={fetchStats} error={error} fullPage />;
  }

  if (loading || !stats) {
    return <LoadingSpinner fullPage />;
  }

  const bloodDistribution = stats.stok_darah_by_golongan_darah || stats.pendonor_by_golongan_darah || {};
  const bloodData = Object.entries(bloodDistribution).map(([name, value]) => ({ name, value }));
  const genderData = Object.entries(stats.pendonor_by_jenis_kelamin || {}).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-8">
      {/* Admin page header — indigo gradient, clearly distinct from landing's solid crimson */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 -m-4 sm:-m-6 lg:-m-10 p-4 sm:p-6 lg:p-10 mb-8 text-white rounded-b-[2rem] lg:rounded-b-[3rem] shadow-lg shadow-indigo-900/20 dark:from-indigo-950 dark:via-indigo-900 dark:to-slate-950 transition-colors">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-1.5 leading-tight">Dashboard Admin</h1>
            <p className="text-white/70 font-medium text-sm sm:text-base">Pantau data pendonor dan statistik donor darah secara real-time.</p>
          </div>
          <button
            onClick={() => fetchStats(true)}
            disabled={refreshing}
            className="shrink-0 mt-1 flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-xs font-semibold transition-all disabled:opacity-50 whitespace-nowrap"
            title="Perbarui data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{refreshing ? 'Memperbarui...' : 'Perbarui'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Pendonor"
          value={stats.total_pendonor}
          subtitle="terdaftar"
          icon={Users}
          color="bg-indigo-600 dark:bg-indigo-700"
          onClick={() => navigate('/admin/donors')}
        />
        <StatCard
          title="Pendonor Siap"
          value={stats.pendonor_siap_donor || 0}
          subtitle="pendonor unik terverifikasi"
          icon={Droplets}
          color="bg-[#660000] dark:bg-red-800"
          onClick={() => navigate('/admin/donors?tab=verified')}
        />
        <StatCard
          title="Verifikasi Pending"
          value={stats.verifikasi_pending || 0}
          subtitle="menunggu tindakan"
          icon={Clock}
          color="bg-amber-500 dark:bg-amber-600"
          onClick={() => navigate('/admin/verify')}
        />
        <StatCard
          title="Donor Berhasil"
          value={stats.donor_berhasil || 0}
          subtitle="total donasi terverifikasi"
          icon={CheckCircle}
          color="bg-emerald-500 dark:bg-emerald-600"
          onClick={() => navigate('/admin/donors?tab=verified')}
        />
      </div>

      {/* Blood Stock per Golongan Darah */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Stok Donor per Golongan Darah</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Pendonor terverifikasi aktif · Klik untuk lihat nama pendonor</p>
          </div>
          <Droplets className="w-5 h-5 text-[#660000] dark:text-red-400 shrink-0" />
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3">
          {BLOOD_TYPES.map((type) => {
            const count = bloodDistribution[type] || 0;
            return (
              <button
                key={type}
                onClick={() => navigate(`/admin/donors?golongan_darah=${encodeURIComponent(type)}&tab=verified`)}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 text-center hover:border-[#660000]/40 dark:hover:border-red-400/30 hover:shadow-lg hover:shadow-[#660000]/5 dark:hover:shadow-red-900/10 transition-all group cursor-pointer"
              >
                <span className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[#660000]/8 dark:bg-red-400/10 text-[#660000] dark:text-red-400 font-black text-xs sm:text-sm mb-1.5 sm:mb-2 group-hover:bg-[#660000]/15 dark:group-hover:bg-red-400/20 transition-colors border border-[#660000]/10 dark:border-red-400/15">
                  {type}
                </span>
                <p className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white leading-none mb-0.5 sm:mb-1">{count}</p>
                <p className="text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold tracking-wider">donor</p>
              </button>
            );
          })}
        </div>
      </div>

      <Suspense fallback={
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
          <div className="col-span-1 bg-white p-8 rounded-2xl border border-slate-100 shadow-sm dark:bg-slate-900 dark:border-slate-800 transition-colors">
            <div className="h-[300px] flex items-center justify-center text-slate-500">Memuat grafik...</div>
          </div>
          <div className="col-span-1 bg-white p-8 rounded-2xl border border-slate-100 shadow-sm dark:bg-slate-900 dark:border-slate-800 transition-colors">
            <div className="h-[300px] flex items-center justify-center text-slate-500">Memuat grafik...</div>
          </div>
        </div>
      }>
        <AdminDashboardCharts bloodData={bloodData} genderData={genderData} isDark={isDark} />
      </Suspense>
    </div>
  );
};