import { useEffect, useState, lazy, Suspense } from 'react';
import { Users, Droplets, CheckCircle, Clock, ArrowUpRight } from 'lucide-react';
import { apiService } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import useDarkMode from '../hooks/useDarkMode';
import { ServiceUnavailable } from '../components/ServiceUnavailable';

const AdminDashboardCharts = lazy(() => import('../components/AdminDashboardCharts').then((module) => ({ default: module.AdminDashboardCharts })));

const StatCard = ({ title, value, icon: Icon, trend, color }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm dark:bg-slate-900 dark:border-slate-800 transition-colors">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-emerald-600 text-sm font-medium dark:text-emerald-400">
          <span>{trend}</span>
          <ArrowUpRight className="w-4 h-4" />
        </div>
      )}
    </div>
    <h3 className="text-slate-500 text-sm font-medium mb-1 dark:text-slate-400">{title}</h3>
    <p className="text-2xl font-bold text-slate-900 dark:text-white transition-colors">{value}</p>
  </div>
);

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDark] = useDarkMode();

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.getStats();
      setStats(res.data);
    } catch (err) {
      console.error('Gagal mengambil statistik:', err);
      setError(err);
    } finally {
      setLoading(false);
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
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 -m-6 lg:-m-10 p-6 lg:p-10 mb-8 text-white rounded-b-[3rem] shadow-lg shadow-indigo-900/20 dark:from-indigo-950 dark:via-indigo-900 dark:to-slate-950 transition-colors">
        <h1 className="text-3xl lg:text-4xl font-black mb-2">Dashboard Admin</h1>
        <p className="text-white/70 font-medium">Pantau data pendonor dan statistik donor darah secara real-time.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Pendonor"
          value={stats.total_pendonor}
          icon={Users}
          trend="+12%"
          color="bg-indigo-600 dark:bg-indigo-700"
        />
        <StatCard
          title="Pendonor Siap"
          value={stats.pendonor_siap_donor || 0}
          icon={Droplets}
          color="bg-[#660000] dark:bg-red-800"
        />
        <StatCard
          title="Verifikasi Pending"
          value={stats.verifikasi_pending || 0}
          icon={Clock}
          color="bg-amber-500 dark:bg-amber-600"
        />
        <StatCard
          title="Donor Berhasil"
          value={stats.donor_berhasil || 0}
          icon={CheckCircle}
          color="bg-emerald-500 dark:bg-emerald-600"
        />
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
