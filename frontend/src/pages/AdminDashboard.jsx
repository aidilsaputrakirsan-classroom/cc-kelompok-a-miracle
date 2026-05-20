import { useEffect, useState, lazy, Suspense } from 'react';
import { Users, Droplets, CheckCircle, Clock, ArrowUpRight, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';

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
  const isDark = document.documentElement.classList.contains('dark');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiService.getStats();
        setStats(res.data);
      } catch (err) {
        console.error('Gagal mengambil statistik:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading || !stats) {
    return <LoadingSpinner fullPage />;
  }

  const bloodDistribution = stats.stok_darah_by_golongan_darah || stats.pendonor_by_golongan_darah || {};
  const bloodData = Object.entries(bloodDistribution).map(([name, value]) => ({ name, value }));
  const genderData = Object.entries(stats.pendonor_by_jenis_kelamin || {}).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-8">
      <div className="bg-[#660000] -m-6 lg:-m-10 p-6 lg:p-10 mb-8 text-white rounded-b-[3rem] shadow-lg shadow-black/10 dark:bg-red-950/80 transition-colors">
        <div className="flex items-center gap-4 mb-6">
          <Link 
            to="/" 
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/80 dark:text-white"
            title="Kembali ke Beranda"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
        </div>
        <h1 className="text-3xl lg:text-4xl font-black mb-2">Dashboard Pendonor</h1>
        <p className="text-white/80 font-medium dark:text-slate-300">Pantau data pendonor dan statistik donor darah secara real-time.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Pendonor" 
          value={stats.total_pendonor} 
          icon={Users} 
          trend="+12%" 
          color="bg-blue-500 dark:bg-blue-600" 
        />
        <StatCard 
          title="Pendonor Siap" 
          value={stats.pendonor_siap_donor || 0} 
          icon={Droplets} 
          color="bg-red-600 dark:bg-red-700" 
        />
        <StatCard 
          title="Verifikasi Pending" 
          value={stats.verifikasi_pending || 0} 
          icon={Clock} 
          color="bg-amber-400 dark:bg-amber-500" 
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