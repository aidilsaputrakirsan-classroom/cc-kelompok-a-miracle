import { useEffect, useState } from 'react';
import { 
  Users, 
  Droplets, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  ArrowUpRight,
  PieChart as PieChartIcon,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { apiService } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Megaphone, Send, AlertTriangle } from 'lucide-react';
import Swal from 'sweetalert2';

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
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({
    golongan_darah: 'O+',
    pesan: 'Dibutuhkan segera pendonor darah golongan O+ untuk pasien darurat di RS terdekat. Mohon bantuannya bagi yang sudah bisa mendonor kembali.'
  });
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

  const handleBroadcast = async (e) => {
    e.preventDefault();
    const result = await Swal.fire({
      title: 'Kirim Broadcast Darurat?',
      text: `Pesan ini akan dikirimkan secara simulasi ke semua pendonor golongan darah ${broadcastForm.golongan_darah}.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#660000',
      confirmButtonText: 'Ya, Kirim Sekarang!',
      cancelButtonText: 'Batal'
    });

    if (!result.isConfirmed) return;

    setBroadcasting(true);
    try {
      const res = await apiService.adminBroadcast(broadcastForm);
      Swal.fire({
        title: 'Broadcast Berhasil!',
        text: res.data.message,
        icon: 'success',
        confirmButtonColor: '#660000'
      });
    } catch (err) {
      console.error('Broadcast failed:', err);
      Swal.fire({
        title: 'Gagal!',
        text: 'Terjadi kesalahan saat mengirim broadcast.',
        icon: 'error'
      });
    } finally {
      setBroadcasting(false);
    }
  };

  const COLORS = ['#660000', '#3b82f6', '#f59e0b', '#10b981', '#6366f1', '#8b5cf6', '#d946ef', '#f97316'];

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
        {/* Blood Type Chart */}
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm dark:bg-slate-900 dark:border-slate-800 transition-colors">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Distribusi Golongan Darah</h2>
            <PieChartIcon className="w-5 h-5 text-slate-400 dark:text-slate-500" />
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bloodData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#f1f5f9'} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    backgroundColor: isDark ? '#0f172a' : '#ffffff',
                    color: isDark ? '#f8fafc' : '#0f172a'
                  }}
                  itemStyle={{ color: isDark ? '#f8fafc' : '#0f172a' }}
                  cursor={{ fill: isDark ? '#1e293b' : '#f8fafc' }}
                />
                <Bar dataKey="value" fill={isDark ? '#991b1b' : '#660000'} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gender Chart */}
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm dark:bg-slate-900 dark:border-slate-800 transition-colors">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Proporsi Jenis Kelamin</h2>
            <TrendingUp className="w-5 h-5 text-slate-400 dark:text-slate-500" />
          </div>
          <div className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    backgroundColor: isDark ? '#0f172a' : '#ffffff',
                    color: isDark ? '#f8fafc' : '#0f172a'
                  }}
                  itemStyle={{ color: isDark ? '#f8fafc' : '#0f172a' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2 ml-4">
              {genderData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-sm text-slate-600 dark:text-slate-400">{entry.name}: {entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Broadcast Section */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden mb-12">
        <div className="bg-gradient-to-r from-red-600 to-[#660000] p-8 text-white flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
            <Megaphone className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black">Emergency Request</h2>
            <p className="text-white/70 text-sm font-bold">Kirim pesan darurat ke semua pendonor tertentu.</p>
          </div>
        </div>
        <form onSubmit={handleBroadcast} className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Golongan Darah Target</label>
            <select
              className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-red-500 text-slate-900 dark:text-white font-bold transition-all"
              value={broadcastForm.golongan_darah}
              onChange={(e) => setBroadcastForm({ ...broadcastForm, golongan_darah: e.target.value })}
            >
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Isi Pesan Broadcast</label>
            <div className="flex gap-4">
              <input
                type="text"
                className="flex-1 px-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-red-500 text-slate-900 dark:text-white transition-all"
                placeholder="Tulis pesan darurat di sini..."
                value={broadcastForm.pesan}
                onChange={(e) => setBroadcastForm({ ...broadcastForm, pesan: e.target.value })}
                required
              />
              <button
                type="submit"
                disabled={broadcasting}
                className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-red-600/20 disabled:opacity-50 transition-all active:scale-95"
              >
                {broadcasting ? (
                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                <span>KIRIM</span>
              </button>
            </div>
          </div>
        </form>
        <div className="px-8 pb-8 flex items-center gap-2 text-[10px] text-amber-600 font-bold uppercase tracking-widest bg-amber-50/30 dark:bg-amber-900/10">
          <AlertTriangle className="w-3 h-3" />
          <span>Hati-hati: Pesan akan dikirimkan ke banyak orang sekaligus. Gunakan hanya dalam keadaan kritis.</span>
        </div>
      </div>
    </div>
  );
};