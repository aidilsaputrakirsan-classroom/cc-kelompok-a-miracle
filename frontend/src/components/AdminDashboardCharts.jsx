import { useEffect, useState } from 'react';
import { PieChart as PieChartIcon, TrendingUp } from 'lucide-react';

const COLORS = ['#660000', '#3b82f6', '#f59e0b', '#10b981', '#6366f1', '#8b5cf6', '#d946ef', '#f97316'];

export const AdminDashboardCharts = ({ bloodData, genderData, isDark }) => {
  const [components, setComponents] = useState(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      import('recharts/es6/chart/BarChart'),
      import('recharts/es6/cartesian/CartesianGrid'),
      import('recharts/es6/cartesian/XAxis'),
      import('recharts/es6/cartesian/YAxis'),
      import('recharts/es6/cartesian/Bar'),
      import('recharts/es6/component/Tooltip'),
      import('recharts/es6/component/ResponsiveContainer'),
      import('recharts/es6/chart/PieChart'),
      import('recharts/es6/polar/Pie'),
      import('recharts/es6/component/Cell'),
    ])
      .then(([
        BarChartModule,
        CartesianGridModule,
        XAxisModule,
        YAxisModule,
        BarModule,
        TooltipModule,
        ResponsiveContainerModule,
        PieChartModule,
        PieModule,
        CellModule,
      ]) => {
        if (!cancelled) {
          setComponents({
            BarChart: BarChartModule.default,
            CartesianGrid: CartesianGridModule.default,
            XAxis: XAxisModule.default,
            YAxis: YAxisModule.default,
            Bar: BarModule.default,
            Tooltip: TooltipModule.default,
            ResponsiveContainer: ResponsiveContainerModule.default,
            PieChart: PieChartModule.default,
            Pie: PieModule.default,
            Cell: CellModule.default,
          });
        }
      })
      .catch((error) => {
        console.error('Gagal memuat library recharts:', error);
        if (!cancelled) {
          setLoadError(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loadError) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
        <div className="col-span-1 bg-white p-8 rounded-2xl border border-slate-100 shadow-sm dark:bg-slate-900 dark:border-slate-800 transition-colors">
          <div className="h-[300px] flex items-center justify-center text-red-600">Tidak dapat memuat grafik.</div>
        </div>
        <div className="col-span-1 bg-white p-8 rounded-2xl border border-slate-100 shadow-sm dark:bg-slate-900 dark:border-slate-800 transition-colors">
          <div className="h-[300px] flex items-center justify-center text-red-600">Tidak dapat memuat grafik.</div>
        </div>
      </div>
    );
  }

  if (!components) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
        <div className="col-span-1 bg-white p-8 rounded-2xl border border-slate-100 shadow-sm dark:bg-slate-900 dark:border-slate-800 transition-colors">
          <div className="h-[300px] flex items-center justify-center text-slate-500">Memuat grafik...</div>
        </div>
        <div className="col-span-1 bg-white p-8 rounded-2xl border border-slate-100 shadow-sm dark:bg-slate-900 dark:border-slate-800 transition-colors">
          <div className="h-[300px] flex items-center justify-center text-slate-500">Memuat grafik...</div>
        </div>
      </div>
    );
  }

  const {
    BarChart,
    CartesianGrid,
    XAxis,
    YAxis,
    Bar,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
  } = components;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
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
                  color: isDark ? '#f8fafc' : '#0f172a',
                }}
                itemStyle={{ color: isDark ? '#f8fafc' : '#0f172a' }}
                cursor={{ fill: isDark ? '#1e293b' : '#f8fafc' }}
              />
              <Bar dataKey="value" fill={isDark ? '#991b1b' : '#660000'} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

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
                  color: isDark ? '#f8fafc' : '#0f172a',
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
  );
};
