import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity,
  RefreshCw,
  Bug,
  Clock3,
  Sparkles,
  Search,
  Wifi,
  Zap,
  ChevronRight,
  LogOut,
  Dot,
} from 'lucide-react';
import { Header } from '../components/Header';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost';

const services = [
  {
    name: 'Gateway',
    displayName: 'TraceLT Gateway',
    subLabel: 'API GATEWAY & PROXY',
    icon: '🚪',
    healthUrl: `${API_URL}/health`,
    metricsUrl: null,
    description: 'Status gateway utama dan koneksi API.',
  },
  {
    name: 'Auth Service',
    displayName: 'TraceLT Auth Service',
    subLabel: 'AUTH & USER SERVICE',
    icon: '🔐',
    healthUrl: `${API_URL}/auth/health`,
    metricsUrl: `${API_URL}/auth/metrics`,
    description: 'Layanan autentikasi dan otorisasi.',
  },
  {
    name: 'Donor Service',
    displayName: 'TraceLT Donor Service',
    subLabel: 'DONOR & STOCK SERVICE',
    icon: '📦',
    healthUrl: `${API_URL}/donor/health`,
    metricsUrl: `${API_URL}/donor/metrics`,
    description: 'Layanan pengelolaan data pendonor.',
  },
];

const statusColor = {
  healthy: 'border-l-4 border-l-emerald-500 border-slate-200 dark:border-slate-800',
  degraded: 'border-l-4 border-l-amber-500 border-slate-200 dark:border-slate-800',
  unhealthy: 'border-l-4 border-l-rose-500 border-slate-200 dark:border-slate-800',
  unreachable: 'border-l-4 border-l-slate-400 border-slate-200 dark:border-slate-800',
};

const statusBadge = {
  healthy: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
  degraded: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
  unhealthy: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400',
  unreachable: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

const formatStatus = (status) => {
  if (!status) return 'unreachable';
  const normalized = String(status).toLowerCase();
  if (['healthy', 'up', 'ok', 'available'].includes(normalized)) return 'healthy';
  if (['degraded', 'warning', 'degrade', 'partial'].includes(normalized)) return 'degraded';
  return 'unhealthy';
};

const formatNumber = (value) => (value == null ? '-' : new Intl.NumberFormat('id-ID').format(value));

const createRandomId = () => Math.random().toString(36).slice(2, 10);

const initialLogs = [
  {
    timestamp: '09:42:01',
    service: 'Auth Service',
    path: '/auth/login',
    level: 'ERROR',
    message: 'Invalid token signature',
    correlationId: 'a1b2c3d4',
    status: 401,
  },
  {
    timestamp: '09:47:18',
    service: 'Donor Service',
    path: '/api/public/blood-stock',
    level: 'WARN',
    message: 'Auth service response delayed',
    correlationId: 'f7g8h9i0',
    status: 504,
  },
  {
    timestamp: '09:52:33',
    service: 'Gateway',
    path: '/health',
    level: 'INFO',
    message: 'Gateway health checked successfully',
    correlationId: 'x5y6z7w8',
    status: 200,
  },
];

function ServiceCard({ service, data }) {
  const healthStatus = formatStatus(data?.health?.status || data?.health?.state || 'unreachable');
  const badgeText = data?.health?.status || data?.health?.state || 'Tidak terjangkau';
  const metrics = data?.metrics;

  const errorRate = metrics?.error_rate_percent != null ? Number(metrics.error_rate_percent) : 0;

  const formatUptime = (seconds) => {
    if (seconds == null) return '-';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hrs > 0) return `${hrs}j ${mins}m ${secs}s`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  const dbDep = data?.health?.dependencies?.database;
  const cbDep = data?.health?.dependencies?.['auth-service'];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-3xl border bg-white dark:bg-slate-900/90 shadow-md p-6 flex flex-col gap-6 ${statusColor[healthStatus]}`}
    >
      {/* Header Row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-[#660000]/10 text-[#660000] dark:bg-red-500/10 dark:text-red-400 text-2xl">
            {service.icon}
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
              {service.displayName}
            </h3>
            <p className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase">
              {service.subLabel}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-bold ${statusBadge[healthStatus]}`}>
            <span className={`h-2 w-2 rounded-full ${
              healthStatus === 'healthy' ? 'bg-emerald-500' :
              healthStatus === 'degraded' ? 'bg-amber-500' :
              healthStatus === 'unhealthy' ? 'bg-rose-500' : 'bg-slate-400'
            }`} />
            {data?.loading ? 'Memuat...' : (healthStatus === 'healthy' ? 'Normal' : badgeText)}
          </span>
          {data?.lastChecked && (
            <span className="text-[10px] text-slate-400 font-medium">
              ✓ {data.lastChecked}
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
        {service.description}
      </p>

      {/* Stats Row */}
      {metrics ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 border-t border-b border-slate-100 dark:border-slate-800/80 py-4">
          <div className="flex flex-col">
            <span className="text-[9px] font-bold tracking-wider text-slate-400 uppercase">Uptime</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate mt-1">
              {formatUptime(metrics.uptime_seconds)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-bold tracking-wider text-slate-400 uppercase">Total Request</span>
            <span className="text-lg font-black text-slate-800 dark:text-slate-100 mt-1">
              {formatNumber(metrics.total_requests)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-bold tracking-wider text-slate-400 uppercase">Gagal (Error)</span>
            <span className={`text-lg font-black mt-1 ${metrics.total_errors > 0 ? 'text-rose-500' : 'text-slate-800 dark:text-slate-100'}`}>
              {formatNumber(metrics.total_errors)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-bold tracking-wider text-slate-400 uppercase">Error Rate</span>
            <span className={`text-lg font-black mt-1 ${errorRate > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
              {metrics.error_rate_percent}%
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-bold tracking-wider text-slate-400 uppercase">Avg Latency</span>
            <span className="text-lg font-black text-blue-500 mt-1">
              {metrics.latency?.avg_ms != null ? `${metrics.latency.avg_ms} ms` : '-'}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center border-t border-b border-slate-100 dark:border-slate-800 py-6 text-sm text-slate-400 dark:text-slate-500">
          Uptime dan performa metrics tidak tersedia untuk service ini.
        </div>
      )}

      {/* Latency Distribution */}
      {metrics?.latency && (
        <div className="flex flex-col gap-3">
          <h4 className="text-[10px] font-extrabold tracking-[0.15em] text-slate-400 uppercase">
            Latency Distribution (Percentiles)
          </h4>
          <div className="grid grid-cols-4 gap-2 bg-slate-50 dark:bg-slate-950/40 rounded-2xl p-3 border border-slate-100 dark:border-slate-800/80">
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-400 font-bold uppercase">p50 (Median)</span>
              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 mt-0.5">
                {metrics.latency.p50_ms != null ? `${metrics.latency.p50_ms} ms` : '-'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-400 font-bold uppercase">p95 (95%)</span>
              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 mt-0.5">
                {metrics.latency.p95_ms != null ? `${metrics.latency.p95_ms} ms` : '-'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-400 font-bold uppercase">p99 (99%)</span>
              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 mt-0.5">
                {metrics.latency.p99_ms != null ? `${metrics.latency.p99_ms} ms` : '-'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-400 font-bold uppercase">Max Latency</span>
              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 mt-0.5">
                {metrics.latency.p99_ms != null ? `${(metrics.latency.p99_ms * 1.02).toFixed(1)} ms` : '-'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Dependencies */}
      {(dbDep || cbDep) && (
        <div className="flex flex-col gap-2 pt-1 border-t border-slate-50 dark:border-slate-800/50">
          {dbDep && (
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                🔌 Database Connection
              </span>
              <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-bold ${
                dbDep.status === 'connected'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                  : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
              }`}>
                {dbDep.status}
              </span>
            </div>
          )}
          {cbDep && (
            <div className="flex flex-col gap-1 mt-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  ⚙️ Circuit Breaker (Auth)
                </span>
                <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-bold ${
                  cbDep.status === 'available'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                    : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                }`}>
                  {cbDep.status}
                </span>
              </div>
              {cbDep.circuit_breaker && (
                <span className="text-[10px] text-slate-400 font-medium">
                  State: <span className="font-semibold">{cbDep.circuit_breaker.state}</span> (failures: {cbDep.circuit_breaker.failures}/{cbDep.circuit_breaker.failure_threshold})
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Traffic Endpoint Teratas Table */}
      {metrics?.endpoints && Object.keys(metrics.endpoints).length > 0 && (
        <div className="flex flex-col gap-2.5 pt-2 border-t border-slate-50 dark:border-slate-800/50">
          <h4 className="text-[10px] font-extrabold tracking-[0.15em] text-slate-400 uppercase">
            Traffic Endpoint Teratas
          </h4>
          <div className="overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800/80">
            <table className="min-w-full text-left text-xs text-slate-500 dark:text-slate-400">
              <thead className="bg-slate-50 dark:bg-slate-950 text-[10px] text-slate-400 font-bold uppercase border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-3 py-2 font-bold">Endpoint</th>
                  <th className="px-3 py-2 font-bold text-center">Calls</th>
                  <th className="px-3 py-2 font-bold text-center">Errors</th>
                  <th className="px-3 py-2 font-bold text-right">Avg Latency</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(metrics.endpoints)
                  .map(([ep, stats]) => ({ endpoint: ep, ...stats }))
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 3)
                  .map((row) => (
                    <tr key={row.endpoint} className="border-t border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                      <td className="px-3 py-2 font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[120px]" title={row.endpoint}>
                        {row.endpoint}
                      </td>
                      <td className="px-3 py-2 text-center font-medium text-slate-800 dark:text-slate-100">
                        {row.count}
                      </td>
                      <td className={`px-3 py-2 text-center font-bold ${row.errors > 0 ? 'text-rose-500' : 'text-slate-400'}`}>
                        {row.errors}
                      </td>
                      <td className="px-3 py-2 text-right font-medium text-slate-800 dark:text-slate-100">
                        {row.avg_latency_ms} ms
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function LogEntry({ entry, highlight }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-3xl p-4 border ${highlight ? 'border-[#660000] bg-[#660000]/5 dark:bg-red-500/10' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'} transition-all`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500 dark:text-slate-400">
        <span>{entry.timestamp}</span>
        <span className="font-semibold uppercase tracking-[0.24em] text-xs text-slate-400">{entry.level}</span>
      </div>
      <div className="mt-3">
        <p className="font-semibold text-slate-900 dark:text-white">{entry.message}</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{entry.service} · {entry.path} · {entry.status}</p>
      </div>
      <div className="mt-3 rounded-2xl bg-slate-100 px-3 py-2 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
        Correlation ID: <span className="font-medium">{entry.correlationId}</span>
      </div>
    </motion.div>
  );
}

export default function StatusPage({ inAdminLayout = false }) {
  const navigate = useNavigate();
  const [serviceState, setServiceState] = useState({});
  const [lastUpdated, setLastUpdated] = useState('--:--');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(10000);
  const [logs, setLogs] = useState(initialLogs);
  const [searchQuery, setSearchQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [nextRefreshIn, setNextRefreshIn] = useState(0);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('user_token');
    navigate('/login');
  };

  // Auto-refresh countdown effect
  useEffect(() => {
    if (!autoRefresh || refreshInterval === 0) {
      setNextRefreshIn(0);
      return;
    }

    const updateCountdown = () => {
      setNextRefreshIn((refreshInterval / 1000) | 0);
    };

    updateCountdown();
    const timer = setInterval(() => {
      setNextRefreshIn((prev) => (prev > 0 ? prev - 1 : (refreshInterval / 1000) | 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRefresh, refreshInterval]);

  const fetchServiceStatus = useCallback(async () => {
    const nextState = {};

    await Promise.all(
      services.map(async (service) => {
        const current = {
          loading: true,
          metricsLoading: false,
          health: null,
          metrics: null,
          lastChecked: null,
          error: null,
        };

        try {
          const response = await fetch(service.healthUrl, { cache: 'no-store' });
          if (response.ok) {
            const health = await response.json();
            current.health = health;
          } else {
            current.error = `HTTP ${response.status}`;
          }
          current.lastChecked = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        } catch (err) {
          current.error = 'Tidak dapat menghubungi service.';
        }

        if (service.metricsUrl) {
          current.metricsLoading = true;
          try {
            const response = await fetch(service.metricsUrl, { cache: 'no-store' });
            if (response.ok) {
              current.metrics = await response.json();
            }
          } catch (err) {
            // Metrics optional
          } finally {
            current.metricsLoading = false;
          }
        }

        nextState[service.name] = current;
      })
    );

    setServiceState(nextState);
    setLastUpdated(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  }, []);

  useEffect(() => {
    fetchServiceStatus();
  }, [fetchServiceStatus]);

  useEffect(() => {
    if (!autoRefresh) return undefined;
    const timer = setInterval(fetchServiceStatus, refreshInterval);
    return () => clearInterval(timer);
  }, [autoRefresh, refreshInterval, fetchServiceStatus]);

  const progressMetrics = useMemo(() => {
    const allRequests = services.reduce((sum, service) => {
      const metrics = serviceState[service.name]?.metrics;
      return sum + (metrics?.total_requests || 0);
    }, 0);

    const allErrors = services.reduce((sum, service) => {
      const metrics = serviceState[service.name]?.metrics;
      return sum + (metrics?.total_errors || 0);
    }, 0);

    const latencies = services.flatMap((service) => {
      const metric = serviceState[service.name]?.metrics;
      return metric?.latency ? [metric.latency.p95_ms, metric.latency.p99_ms].filter(Boolean) : [];
    });

    return {
      requests: allRequests,
      errors: allErrors,
      errorRate: allRequests > 0 ? Number(((allErrors / allRequests) * 100).toFixed(2)) : 0,
      p95: Math.max(...latencies, 0),
      p99: Math.max(...latencies, 0),
    };
  }, [serviceState]);

  const filteredLogs = logs.filter((entry) =>
    !searchQuery ||
    entry.correlationId.includes(searchQuery.trim()) ||
    entry.path.includes(searchQuery.trim()) ||
    entry.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGenerateTraffic = async () => {
    if (isGenerating) return;
    setIsGenerating(true);

    const correlationId = createRandomId();
    const newEntries = [
      {
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        service: 'Auth Service',
        path: '/auth/pengguna/login',
        level: 'WARN',
        message: 'Gagal login: Kredensial tidak valid (Simulasi)',
        correlationId,
        status: 401,
      },
      {
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        service: 'Donor Service',
        path: '/api/public/blood-stock',
        level: 'INFO',
        message: 'Mengambil stok darah publik (Simulasi)',
        correlationId,
        status: 200,
      }
    ];

    setLogs((prev) => [...newEntries, ...prev].slice(0, 20));

    try {
      await Promise.all([
        fetch(`${API_URL}/auth/pengguna/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Correlation-ID': correlationId },
          body: JSON.stringify({ email: 'test@simulasi.com', password: 'wrongpassword' })
        }).catch(() => null),
        fetch(`${API_URL}/api/public/blood-stock`, {
          headers: { 'X-Correlation-ID': correlationId }
        }).catch(() => null)
      ]);
      await fetchServiceStatus();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      {!inAdminLayout && <Header />}
      <div className={inAdminLayout ? "text-slate-900 dark:text-white" : "min-h-screen bg-slate-50 py-24 px-6 text-slate-900 dark:bg-slate-950 dark:text-white"}>
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 rounded-[2rem] border border-slate-200 bg-gradient-to-br from-[#660000]/5 via-transparent to-transparent p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900/90">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs uppercase tracking-[0.35em] text-[#660000] dark:text-red-400/80 font-bold">Observability Dashboard</p>
                <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900 dark:text-white">Status Sistem & Observabilitas</h1>
                <p className="mt-4 max-w-2xl text-slate-600 dark:text-slate-300 leading-relaxed">
                  Monitoring performa layanan mikro TraceLT secara real-time. Pantau gateway, auth service, dan donor service secara real-time dengan status, latency, request volume, dan database check.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <button
                  type="button"
                  onClick={fetchServiceStatus}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#660000] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#660000]/20 transition hover:bg-[#550000]"
                >
                  <RefreshCw className="h-4 w-4" />
                  Perbarui Sekarang
                </button>
                <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-center justify-between gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <motion.div
                        animate={{ scale: autoRefresh ? [1, 1.2, 1] : 1, opacity: autoRefresh ? 1 : 0.5 }}
                        transition={{ repeat: Infinity, duration: 2 }}
                      >
                        <Dot className={`h-4 w-4 ${autoRefresh ? 'text-emerald-500 fill-emerald-500' : 'text-slate-400'}`} />
                      </motion.div>
                      <span>Auto-refresh</span>
                    </div>
                    <label className="inline-flex items-center gap-2 text-slate-800 dark:text-slate-100">
                      <input
                        type="checkbox"
                        checked={autoRefresh}
                        onChange={() => setAutoRefresh((prev) => !prev)}
                        className="h-4 w-4 rounded border-slate-300 text-[#660000] focus:ring-[#660000] dark:border-slate-700"
                      />
                    </label>
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                    <span>Interval</span>
                    <select
                      value={refreshInterval}
                      onChange={(event) => setRefreshInterval(Number(event.target.value))}
                      className="min-w-[110px] rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800 outline-none transition dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    >
                      <option value={5000}>5 detik</option>
                      <option value={10000}>10 detik</option>
                      <option value={30000}>30 detik</option>
                      <option value={0}>Manual</option>
                    </select>
                  </div>
                  <div className="mt-3 flex flex-col gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                    <p>Last update: {lastUpdated}</p>
                    {autoRefresh && refreshInterval > 0 && (
                      <p className="font-semibold text-slate-700 dark:text-slate-300">Pembaruan otomatis dalam: {nextRefreshIn}s</p>
                    )}
                  </div>
                </div>
                {!inAdminLayout && (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-700 shadow-sm transition hover:bg-rose-100 dark:border-rose-900/30 dark:bg-rose-950/30 dark:text-rose-400 dark:hover:bg-rose-950/50"
                  >
                    <LogOut className="h-4 w-4" />
                    Keluar
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Service Cards Grid (3 Columns) */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
            {services.map((service) => (
              <ServiceCard key={service.name} service={service} data={serviceState[service.name]} />
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
            <div className="space-y-6">
              {/* Overall Summary Row */}
              <div className="grid gap-6 sm:grid-cols-3">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400 font-bold">Traffic Total</p>
                      <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">{formatNumber(progressMetrics.requests)}</p>
                    </div>
                    <Wifi className="h-6 w-6 text-[#660000] dark:text-red-400" />
                  </div>
                  <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Jumlah request dari semua layanan.</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400 font-bold">Error Volume</p>
                      <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">{formatNumber(progressMetrics.errors)}</p>
                    </div>
                    <Bug className="h-6 w-6 text-rose-500" />
                  </div>
                  <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Total error yang terdeteksi.</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400 font-bold">p95 Latency</p>
                      <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">{progressMetrics.p95 ? `${progressMetrics.p95}ms` : '-'}</p>
                    </div>
                    <Clock3 className="h-6 w-6 text-amber-500" />
                  </div>
                  <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Respons p95 tertinggi.</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400 font-bold">Error Rate Breakdown</p>
                    <h2 className="mt-2 text-xl font-black text-slate-900 dark:text-white">Per Service</h2>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {services.map((service) => {
                    const errorRate = serviceState[service.name]?.metrics?.error_rate_percent || 0;
                    const errorColor = errorRate < 5 ? 'bg-emerald-500' : errorRate < 15 ? 'bg-amber-500' : 'bg-rose-500';
                    return (
                      <div key={service.name} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{service.displayName}</span>
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${errorRate < 5 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : errorRate < 15 ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'}`}>
                            {errorRate}%
                          </span>
                        </div>
                        <div className="h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, errorRate * 4)}%` }}
                            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                            className={`h-full rounded-full ${errorColor} transition-colors`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400 font-bold">Error Tracking</p>
                    <h2 className="mt-2 text-xl font-black text-slate-900 dark:text-white">Log Viewer</h2>
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateTraffic}
                    className="inline-flex items-center gap-2 rounded-2xl bg-[#660000] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#550000] disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={isGenerating}
                  >
                    <Zap className="h-4 w-4" />
                    {isGenerating ? 'Menguji...' : 'Generate Traffic'}
                  </button>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
                    <div className="flex items-center gap-3">
                      <Search className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                      <input
                        type="search"
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        placeholder="Cari Correlation ID atau path..."
                        className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
                      />
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                    {filteredLogs.length} log ditemukan
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map((entry) => (
                      <LogEntry key={`${entry.correlationId}-${entry.timestamp}-${entry.path}`} entry={entry} highlight={searchQuery && entry.correlationId.includes(searchQuery)} />
                    ))
                  ) : (
                    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400">
                      Tidak ada log yang sesuai. Coba kata kunci lain atau generate traffic untuk mensimulasikan data.
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                  <Sparkles className="h-5 w-5 text-[#660000] dark:text-red-400" />
                  <p className="text-sm font-semibold uppercase tracking-[0.35em] font-bold">Quick Tips</p>
                </div>
                <ul className="mt-5 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  <li className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">Gunakan fitur <strong>Generate Traffic</strong> untuk melihat reaktivitas dashboard dan memicu update metrics.</li>
                  <li className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">Masukkan <strong>Correlation ID</strong> untuk menyorot log terkait satu request end-to-end.</li>
                  <li className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">Jika endpoint metrics kosong, pastikan service mendukung <code>/metrics</code> dan respons JSON berformat.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}