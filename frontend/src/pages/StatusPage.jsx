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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const services = [
  {
    name: 'Gateway',
    icon: '🚪',
    healthUrl: `${API_URL}/health`,
    metricsUrl: null,
    description: 'Memeriksa status gateway utama dan koneksi API.',
  },
  {
    name: 'Auth Service',
    icon: '🔐',
    healthUrl: `${API_URL}/auth/health`,
    metricsUrl: `${API_URL}/auth/metrics`,
    description: 'Memantau status layanan autentikasi dan otorisasi.',
  },
  {
    name: 'Item Service',
    icon: '📦',
    healthUrl: `${API_URL}/items/health`,
    metricsUrl: `${API_URL}/items/metrics`,
    description: 'Memeriksa status layanan pengelolaan data pendonor.',
  },
];

const statusColor = {
  healthy: 'from-emerald-500/20 via-transparent to-transparent border-emerald-200',
  degraded: 'from-amber-500/20 via-transparent to-transparent border-amber-200',
  unhealthy: 'from-rose-500/20 via-transparent to-transparent border-rose-200',
  unreachable: 'from-slate-200/80 via-transparent to-transparent border-slate-300',
};

const statusBadge = {
  healthy: 'bg-emerald-500/15 text-emerald-800',
  degraded: 'bg-amber-500/15 text-amber-800',
  unhealthy: 'bg-rose-500/15 text-rose-800',
  unreachable: 'bg-slate-300 text-slate-700',
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
    service: 'Item Service',
    path: '/items',
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

function ProgressBar({ label, value, maxValue, color }) {
  const width = value != null ? Math.min(100, Math.round((value / maxValue) * 100)) : 0;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>{label}</span>
        <span>{value != null ? `${value}ms` : '-'}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function ServiceCard({ service, data }) {
  const current = data?.health || null;
  const metrics = data?.metrics;
  const healthStatus = formatStatus(current?.status || current?.state || 'unreachable');
  const badgeText = current?.status || current?.state || 'Tidak terjangkau';
  const errorRate = metrics?.error_rate_percent || 0;
  const errorColor = errorRate < 5 ? 'bg-emerald-500' : errorRate < 15 ? 'bg-amber-500' : 'bg-rose-500';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-3xl border p-6 shadow-lg transition-all hover:-translate-y-1 hover:shadow-2xl border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 ${statusColor[healthStatus]}`}
    >
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="text-4xl">{service.icon}</div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">{service.name}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{service.description}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusBadge[healthStatus]}`}>
            <span className={`h-2.5 w-2.5 rounded-full ${healthStatus === 'healthy' ? 'bg-emerald-600' : healthStatus === 'degraded' ? 'bg-amber-500' : healthStatus === 'unhealthy' ? 'bg-rose-500' : 'bg-slate-400'}`} />
            {data?.loading ? 'Memuat...' : badgeText}
          </span>
          <span className="text-[11px] uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
            {data?.lastChecked ? `✓ ${data.lastChecked}` : 'Belum dicek'}
          </span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-3xl bg-slate-50 p-4 border border-slate-200 dark:bg-slate-950 dark:border-slate-800">
          <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Requests</p>
          <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">{formatNumber(metrics?.total_requests)}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Total success + failed</p>
        </div>
        <div className="rounded-3xl bg-slate-50 p-4 border border-slate-200 dark:bg-slate-950 dark:border-slate-800">
          <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Error Rate</p>
          <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">{metrics?.error_rate_percent != null ? `${metrics.error_rate_percent}%` : '-'}</p>
          <div className="mt-3 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div className={`h-full rounded-full ${errorColor} transition-all`} style={{ width: `${Math.min(100, errorRate * 4)}%` }} />
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <ProgressBar label="p50 Latency" value={metrics?.latency?.p50_ms} maxValue={1200} color="bg-fuchsia-500" />
        <ProgressBar label="p95 Latency" value={metrics?.latency?.p95_ms} maxValue={1200} color="bg-amber-500" />
        <ProgressBar label="p99 Latency" value={metrics?.latency?.p99_ms} maxValue={1200} color="bg-emerald-500" />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-3xl bg-white/95 p-4 border border-slate-200 dark:bg-slate-950 dark:border-slate-800">
          <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Avg Latency</p>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{metrics?.latency?.avg_ms != null ? `${metrics.latency.avg_ms}ms` : '-'}</p>
        </div>
        <div className="rounded-3xl bg-white/95 p-4 border border-slate-200 dark:bg-slate-950 dark:border-slate-800">
          <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Uptime</p>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{metrics?.uptime_seconds != null ? `${Math.round(metrics.uptime_seconds / 60)}m` : '-'}</p>
        </div>
      </div>
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

export default function StatusPage() {
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
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
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
          const health = await response.json();
          current.health = health;
          current.lastChecked = new Date().toLocaleTimeString();
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
            // Metrics tidak wajib tersedia
          } finally {
            current.metricsLoading = false;
          }
        }

        nextState[service.name] = current;
      })
    );

    setServiceState(nextState);
    setLastUpdated(new Date().toLocaleTimeString());
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

  const endpointRows = useMemo(() => {
    const rows = [];
    services.forEach((service) => {
      const metrics = serviceState[service.name]?.metrics;
      if (!metrics?.endpoints) return;
      Object.entries(metrics.endpoints).forEach(([endpoint, stats]) => {
        rows.push({
          service: service.name,
          endpoint,
          count: stats.count,
          errors: stats.errors,
          avgLatency: stats.avg_latency_ms,
          errorRate: stats.count > 0 ? Number(((stats.errors / stats.count) * 100).toFixed(1)) : 0,
        });
      });
    });
    return rows.sort((a, b) => b.count - a.count);
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

    const newEntries = services.map((service) => ({
      timestamp: new Date().toLocaleTimeString(),
      service: service.name,
      path: service.healthUrl.replace(API_URL, ''),
      level: 'INFO',
      message: `Simulated request berhasil pada ${service.name}`,
      correlationId: createRandomId(),
      status: 200,
    }));

    setLogs((prev) => [...newEntries, ...prev].slice(0, 20));

    try {
      await Promise.all(
        services.map(async (service) => {
          await fetch(service.healthUrl, { cache: 'no-store' }).catch(() => null);
          if (service.metricsUrl) {
            await fetch(service.metricsUrl, { cache: 'no-store' }).catch(() => null);
          }
        })
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-16 px-6 text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 rounded-[2rem] border border-slate-200 bg-gradient-to-br from-[#660000]/5 via-transparent to-transparent p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900/90">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.35em] text-[#660000] dark:text-red-400/80">Observability Dashboard</p>
              <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900 dark:text-white">Status Sistem & Monitoring</h1>
              <p className="mt-4 max-w-2xl text-slate-600 dark:text-slate-300">
                Pantau gateway, auth service, dan item service secara real-time dengan status, latency, request volume, dan log trace yang terintegrasi.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <button
                type="button"
                onClick={fetchServiceStatus}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#660000] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#660000]/20 transition hover:bg-[#550000]"
              >
                <RefreshCw className="h-4 w-4" />
                Coba Lagi
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
                <div className="mt-4 flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <span>Interval</span>
                  <select
                    value={refreshInterval}
                    onChange={(event) => setRefreshInterval(Number(event.target.value))}
                    className="min-w-[110px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  >
                    <option value={5000}>5 detik</option>
                    <option value={10000}>10 detik</option>
                    <option value={30000}>30 detik</option>
                    <option value={0}>Manual</option>
                  </select>
                </div>
                <div className="mt-3 flex flex-col gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <p>Last update: {lastUpdated}</p>
                  {autoRefresh && refreshInterval > 0 && (
                    <p className="font-semibold text-slate-700 dark:text-slate-300">Next refresh: {nextRefreshIn}s</p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-700 shadow-sm transition hover:bg-rose-100 dark:border-rose-900/30 dark:bg-rose-950/30 dark:text-rose-400 dark:hover:bg-rose-950/50"
              >
                <LogOut className="h-4 w-4" />
                Keluar
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">Traffic</p>
                    <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">{formatNumber(progressMetrics.requests)}</p>
                  </div>
                  <Wifi className="h-6 w-6 text-[#660000] dark:text-red-400" />
                </div>
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Jumlah request terkumpul dari semua layanan.</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">Error Volume</p>
                    <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">{formatNumber(progressMetrics.errors)}</p>
                  </div>
                  <Bug className="h-6 w-6 text-rose-500" />
                </div>
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Total error yang terdeteksi selama sesi monitoring.</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:col-span-2 xl:col-span-1 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">p95 Latency</p>
                    <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">{progressMetrics.p95 ? `${progressMetrics.p95}ms` : '-'}</p>
                  </div>
                  <Clock3 className="h-6 w-6 text-amber-500" />
                </div>
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Waktu respons p95 tertinggi dari layanan yang terhubung.</p>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-x-auto">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">Endpoint Performance</p>
                  <h2 className="mt-2 text-xl font-black text-slate-900 dark:text-white">Breakdown request per endpoint</h2>
                </div>
                <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-300 whitespace-nowrap">
                  <Activity className="h-4 w-4" /> {endpointRows.length} endpoint
                </div>
              </div>

              <div className="mt-6 overflow-x-auto rounded-3xl border border-slate-200 dark:border-slate-800">
                <table className="min-w-full text-left text-sm text-slate-600 dark:text-slate-300">
                  <thead className="bg-slate-100 text-slate-500 dark:bg-slate-950 dark:text-slate-400 whitespace-nowrap">
                    <tr>
                      <th className="px-4 py-4 font-semibold text-xs sm:text-sm">Service</th>
                      <th className="px-4 py-4 font-semibold text-xs sm:text-sm">Endpoint</th>
                      <th className="px-4 py-4 font-semibold text-xs sm:text-sm">Calls</th>
                      <th className="px-4 py-4 font-semibold text-xs sm:text-sm">Error %</th>
                      <th className="px-4 py-4 font-semibold text-xs sm:text-sm">Latency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {endpointRows.length > 0 ? (
                      endpointRows.map((row) => (
                        <tr key={`${row.service}-${row.endpoint}`} className="border-t border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-4 py-4 font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">{row.service}</td>
                          <td className="px-4 py-4 text-xs sm:text-sm truncate">{row.endpoint}</td>
                          <td className="px-4 py-4 text-xs sm:text-sm font-medium">{formatNumber(row.count)}</td>
                          <td className="px-4 py-4 text-xs sm:text-sm">
                            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${row.errorRate < 5 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : row.errorRate < 15 ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'}`}>
                              {row.errorRate}%
                            </span>
                          </td>
                          <td className="px-4 py-4 text-xs sm:text-sm font-medium">{row.avgLatency != null ? `${row.avgLatency}ms` : '-'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                          Endpoint metrics belum tersedia. Pastikan service /metrics merespons.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">Error Rate Breakdown</p>
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
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{service.name}</span>
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
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">Error Tracking</p>
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
                <p className="text-sm font-semibold uppercase tracking-[0.35em]">Quick Tips</p>
              </div>
              <ul className="mt-5 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <li className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">Gunakan fitur <strong>Generate Traffic</strong> untuk melihat reaktivitas dashboard dan memicu update metrics.</li>
                <li className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">Masukkan <strong>Correlation ID</strong> untuk menyorot log terkait satu request end-to-end.</li>
                <li className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">Jika endpoint metrics kosong, pastikan service mendukung <code>/metrics</code> dan respons JSON berformat.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">Observability</p>
              <h2 className="mt-2 text-xl font-black text-slate-900 dark:text-white">Ringkasan Kinerja</h2>
            </div>
            <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <ChevronRight className="h-4 w-4" /> Auto-refresh {autoRefresh ? 'Aktif' : 'Nonaktif'}
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="rounded-3xl bg-slate-50 p-5 dark:bg-slate-950">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">Traffic</p>
              <p className="mt-4 text-3xl font-black text-slate-900 dark:text-white">{formatNumber(progressMetrics.requests)}</p>
              <div className="mt-4 h-2 rounded-full bg-slate-200 dark:bg-slate-800">
                <div className="h-full w-1/2 rounded-full bg-[#660000]" />
              </div>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5 dark:bg-slate-950">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">Errors</p>
              <p className="mt-4 text-3xl font-black text-slate-900 dark:text-white">{formatNumber(progressMetrics.errors)}</p>
              <div className="mt-4 h-2 rounded-full bg-slate-200 dark:bg-slate-800">
                <div className="h-full w-[40%] rounded-full bg-rose-500" />
              </div>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5 dark:bg-slate-950">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">Error Rate</p>
              <p className="mt-4 text-3xl font-black text-slate-900 dark:text-white">{progressMetrics.errorRate}%</p>
              <div className="mt-4 h-2 rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-amber-500"
                  style={{ width: `${Math.min(100, Math.max(0, progressMetrics.errorRate))}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}