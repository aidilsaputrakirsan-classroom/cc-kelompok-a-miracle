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

const StatCard = ({ title, value, icon: Icon, trend, color }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
          <span>{trend}</span>
          <ArrowUpRight className="w-4 h-4" />
        </div>
      )}
    </div>
    <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
    <p className="text-2xl font-bold text-slate-900">{value}</p>
  </div>
);

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading || !stats) return <div className="flex items-center justify-center h-full">Memuat data...</div>;

  const bloodData = Object.entries(stats.pendonor_by_golongan_darah).map(([name, value]) => ({ name, value }));
  const genderData = Object.entries(stats.pendonor_by_jenis_kelamin).map(([name, value]) => ({ name, value }));

  const COLORS = ['#660000', '#3b82f6', '#f59e0b', '#10b981', '#6366f1', '#8b5cf6', '#d946ef', '#f97316'];

  return (
    <div className="space-y-8">
      <div className="bg-[#660000] -m-6 lg:-m-10 p-6 lg:p-10 mb-8 text-white rounded-b-[3rem] shadow-lg shadow-black/10">
        <div className="flex items-center gap-4 mb-6">
          <Link 
            to="/" 
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/80"
            title="Kembali ke Beranda"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="text-2xl font-black tracking-tighter uppercase">TRACELT ADMIN</div>
        </div>
        <h1 className="text-3xl lg:text-4xl font-black mb-2">Ringkasan Sistem</h1>
        <p className="text-white/80 font-medium">Pantau data pendonor dan statistik donor darah secara real-time.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Pendonor" 
          value={stats.total_pendonor} 
          icon={Users} 
          trend="+12%" 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Pendonor Siap" 
          value={stats.pendonor_siap_donor || 0} 
          icon={Droplets} 
          color="bg-[#660000]" 
        />
        <StatCard 
          title="Verifikasi Pending" 
          value="-" 
          icon={Clock} 
          color="bg-amber-500" 
        />
        <StatCard 
          title="Donor Berhasil" 
          value="-" 
          icon={CheckCircle} 
          color="bg-emerald-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Blood Type Chart */}
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-slate-900">Distribusi Golongan Darah</h2>
            <PieChartIcon className="w-5 h-5 text-slate-400" />
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bloodData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="value" fill="#660000" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gender Chart */}
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-slate-900">Proporsi Jenis Kelamin</h2>
            <TrendingUp className="w-5 h-5 text-slate-400" />
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
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2 ml-4">
              {genderData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-sm text-slate-600">{entry.name}: {entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};