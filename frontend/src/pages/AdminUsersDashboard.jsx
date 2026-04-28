import { useEffect, useState } from 'react';
import { 
  Users, 
  Mail,
  UserCheck,
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
import { LoadingSpinner } from '../components/LoadingSpinner';

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

export const AdminUsersDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulasi data pengguna statistik
    const userData = {
      total_pengguna: 24,
      pengguna_aktif: 18,
      pengguna_pending: 6,
      pengguna_by_akses: {
        'Full Access': 18,
        'Limited Access': 6
      },
      pengguna_by_status: {
        'Aktif': 18,
        'Nonaktif': 6
      }
    };
    
    setStats(userData);
    setLoading(false);
  }, []);

  if (loading || !stats) {
    return <LoadingSpinner fullPage />;
  }

  const accessData = Object.entries(stats.pengguna_by_akses).map(([name, value]) => ({ name, value }));
  const statusData = Object.entries(stats.pengguna_by_status).map(([name, value]) => ({ name, value }));

  const COLORS = ['#660000', '#3b82f6', '#f59e0b', '#10b981', '#6366f1', '#8b5cf6', '#d946ef', '#f97316'];

  return (
    <div className="space-y-8">
      <div className="bg-[#660000] -m-6 lg:-m-10 p-6 lg:p-10 mb-8 text-white rounded-b-[3rem] shadow-lg shadow-black/10">
        <div className="flex items-center gap-4 mb-6">
          <Link 
            to="/admin" 
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/80"
            title="Kembali ke Dashboard"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="text-2xl font-black tracking-tighter uppercase">TRACELT ADMIN</div>
        </div>
        <h1 className="text-3xl lg:text-4xl font-black mb-2">Manajemen Pengguna</h1>
        <p className="text-white/80 font-medium">Pantau data pengguna dan aktivitas mereka secara real-time.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Pengguna" 
          value={stats.total_pengguna} 
          icon={Users} 
          trend="+8%" 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Pengguna Aktif" 
          value={stats.pengguna_aktif} 
          icon={UserCheck} 
          color="bg-[#660000]" 
        />
        <StatCard 
          title="Pending Verifikasi" 
          value={stats.pengguna_pending} 
          icon={Clock} 
          color="bg-amber-500" 
        />
        <StatCard 
          title="Email Terverifikasi" 
          value={`${Math.round((stats.pengguna_aktif / stats.total_pengguna) * 100)}%`} 
          icon={Mail} 
          color="bg-emerald-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Access Level Chart */}
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-slate-900">Distribusi Jenis Akses</h2>
            <PieChartIcon className="w-5 h-5 text-slate-400" />
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={accessData}>
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

        {/* Status Chart */}
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-slate-900">Status Pengguna</h2>
            <TrendingUp className="w-5 h-5 text-slate-400" />
          </div>
          <div className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2 ml-4">
              {statusData.map((entry, index) => (
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