import { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity,
  RefreshCw,
  Bug,
  Clock3,
  Search,
  Wifi,
  Zap,
  ChevronRight,
  Dot,
} from 'lucide-react';
import { Header } from '../components/Header';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const services = [
  {
    name: 'Gateway',
    icon: '🚪',
    healthUrl: `${API_URL}/health`,
    metricsUrl: null,
    description: 'Status gateway utama dan koneksi API.',
  },
  {
    name: 'Auth Service',
    icon: '🔐',
    healthUrl: `${API_URL}/auth/health`,
    metricsUrl: `${API_URL}/auth/metrics`,
    description: 'Layanan autentikasi dan otorisasi.',
  },
  {
    name: 'Donor Service',
    icon: '📦',
    healthUrl: `${API_URL}/donor/health`,
    metricsUrl: `${API_URL}/donor/metrics`,
    description: 'Layanan pengelolaan data pendonor.',
  },
];

const statusBorder = {
  healthy:     'border-emerald-200 dark:border-emerald-800/40',
  degraded:    'border-amber-200 dark:border-amber-800/40',
  unhealthy:   'border-rose-200 dark:border-rose-800/40',
  unreachable: 'border-slate-200 dark:border-slate-800',
};

const statusIconBg = {
  healthy:     'bg-emerald-100 dark:bg-emerald-950/50',
  degraded:    'bg-amber-100 dark:bg-amber-950/50',
  unhealthy:   'bg-rose-100 dark:bg-rose-950/50',
  unreachable: 'bg-slate-100 dark:bg-slate-800',
};

const statusTopBar = {
  healthy:     'bg-emerald-500',
  degraded:    'bg-amber-500',
  unhealthy:   'bg-rose-500',
  unreachable: 'bg-slate-300 dark:bg-slate-700',
};

const statusBadgeClass = {
  healthy:     'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400',
  degraded:    'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400',
  unhealthy:   'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400',
  unreachable: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

const statusDotClass = {
  healthy:     'bg-emerald-500',
  degraded:    'bg-amber-500',
  unhealthy:   'bg-rose-500',
  unreachable: 'bg-slate-400',
};

const formatStatus = (status) => {
  if (!status) return 'unreachable';
  const s = String(status).toLowerCase();
  if (['healthy', 'up', 'ok', 'available'].includes(s)) return 'healthy';
  if (['degraded', 'warning', 'degrade', 'partial'].includes(s)) return 'degraded';
  return 'unhealthy';
};

const fmt = (v) => (v == null ? '—' : new Intl.NumberFormat('id-ID').format(v));

const createRandomId = () => Math.random().toString(36).slice(2, 10);

const initialLogs = [
  { timestamp: '09:42:01', service: 'Auth Service', path: '/auth/login',   level: 'ERROR', message: 'Invalid token signature',              correlationId: 'a1b2c3d4', status: 401 },
  { timestamp: '09:47:18', service: 'Donor Service', path: '/pendonor',    level: 'WARN',  message: 'Auth service response delayed',          correlationId: 'f7g8h9i0', status: 504 },
  { timestamp: '09:52:33', service: 'Gateway',       path: '/health',      level: 'INFO',  message: 'Gateway health checked successfully',    correlationId: 'x5y6z7w8', status: 200 },
];

// ── Sub-components ────────────────────────────────────────────

function ProgressBar({ label, value, maxValue, color }) {
  const width = value != null ? Math.min(100, Math.round((value / maxValue) * 100)) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>{label}</span>
        <span className="font-medium">{value != null ? `${value}ms` : '—'}</span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function ServiceCard({ service, data }) {
  const health   = data?.health ?? null;
  const metrics  = data?.metrics;
  const status   = formatStatus(health?.status ?? health?.state ?? null);
  const label    = health?.status ?? health?.state ?? 'Tidak terjangkau';
  const errRate  = metrics?.error_rate_percent ?? 0;
  const errColor = errRate < 5 ? 'bg-emerald-500' : errRate < 15 ? 'bg-amber-500' : 'bg-rose-500';

  const uptime = health?.uptime_seconds;
  const uptimeStr = uptime != null
    ? uptime >= 3600
      ? `${Math.floor(uptime / 3600)}j ${Math.floor((uptime % 3600) / 60)}m`
      : uptime >= 60
        ? `${Math.floor(uptime / 60)}m ${uptime % 60}d`
        : `${uptime}d`
    : null;

  const hasTraffic = (metrics?.total_requests ?? 0) > 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-3xl border bg-white dark:bg-slate-900 shadow-sm hover:-translate-y-0.5 hover:shadow-lg transition-all overflow-hidden ${statusBorder[status]}`}
    >
      {/* Status accent strip */}
      <div className={`h-1.5 w-full ${statusTopBar[status]}`} />

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className={`w-11 h-11 rounded-2xl ${statusIconBg[status]} flex items-center justify-center text-xl shrink-0`}>
            {service.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h3 className="font-black text-slate-900 dark:text-white tracking-tight">{service.name}</h3>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide shrink-0 ${statusBadgeClass[status]}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusDotClass[status]} ${status === 'healthy' ? 'animate-pulse' : ''}`} />
                {data?.loading ? 'Memuat…' : label}
              </span>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 leading-snug">{service.description}</p>
          </div>
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-2 gap-2.5 mb-3">
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 p-3">
            <p className="text-[9px] uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Requests</p>
            <p className="text-xl font-black text-slate-900 dark:text-white leading-none">{fmt(metrics?.total_requests)}</p>
            {!hasTraffic && metrics != null && (
              <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-1">Belum ada traffic</p>
            )}
          </div>
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 p-3">
            <p className="text-[9px] uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Error Rate</p>
            <p className={`text-xl font-black leading-none ${errRate > 0 ? (errRate < 5 ? 'text-emerald-600 dark:text-emerald-400' : errRate < 15 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400') : 'text-slate-900 dark:text-white'}`}>
              {metrics?.error_rate_percent != null ? `${metrics.error_rate_percent}%` : '—'}
            </p>
            <div className="mt-2 h-1 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div className={`h-full rounded-full ${errColor} transition-all duration-500`} style={{ width: `${Math.min(100, errRate)}%` }} />
            </div>
          </div>
        </div>

        {/* Uptime row */}
        {uptimeStr && (
          <div className="mb-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 px-3 py-2 flex items-center justify-between">
            <span className="text-[9px] uppercase tracking-widest text-slate-400 dark:text-slate-500">Uptime</span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{uptimeStr}</span>
          </div>
        )}

        {/* Latency bars */}
        {metrics ? (
          hasTraffic ? (
            <div className="space-y-2">
              <ProgressBar label="p50" value={metrics.latency?.p50_ms} maxValue={1200} color="bg-indigo-500" />
              <ProgressBar label="p95" value={metrics.latency?.p95_ms} maxValue={1200} color="bg-amber-500" />
              <ProgressBar label="p99" value={metrics.latency?.p99_ms} maxValue={1200} color="bg-rose-500" />
            </div>
          ) : (
            <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-2">
              Klik <span className="font-bold">Generate</span> untuk memulai traffic.
            </p>
          )
        ) : (
          <p className="text-xs text-slate-400 dark:text-slate-500 italic">
            {service.metricsUrl ? 'Metrics tidak tersedia.' : 'Endpoint metrics tidak dikonfigurasi.'}
          </p>
        )}

        {/* Last checked */}
        <p className="mt-3 text-[10px] text-slate-400 dark:text-slate-500 text-right">
          {data?.lastChecked ? `Dicek ${data.lastChecked}` : 'Belum dicek'}
        </p>
      </div>
    </motion.div>
  );
}

function LogEntry({ entry, highlight }) {
  const levelColor = {
    ERROR: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40',
    WARN:  'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40',
    INFO:  'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40',
  }[entry.level] ?? 'text-slate-600 bg-slate-100 dark:bg-slate-800';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl p-4 border transition-all ${
        highlight
          ? 'border-[#660000]/30 bg-[#660000]/5 dark:border-red-700/30 dark:bg-red-500/5'
          : 'border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900'
      }`}
    >
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">{entry.timestamp}</span>
        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest ${levelColor}`}>
          {entry.level}
        </span>
        <span className="text-xs text-slate-400 dark:text-slate-500">{entry.service}</span>
      </div>
      <p className="text-sm font-semibold text-slate-900 dark:text-white">{entry.message}</p>
      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{entry.path} · HTTP {entry.status}</p>
      <div className="mt-2 rounded-xl bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
        corr: <span className="font-semibold text-slate-700 dark:text-slate-300">{entry.correlationId}</span>
      </div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────

export default function StatusPage({ inAdminLayout = false }) {
  const [serviceState, setServiceState]     = useState({});
  const [lastUpdated, setLastUpdated]       = useState('--:--');
  const [autoRefresh, setAutoRefresh]       = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(10000);
  const [logs, setLogs]                     = useState(initialLogs);
  const [searchQuery, setSearchQuery]       = useState('');
  const [isGenerating, setIsGenerating]     = useState(false);
  const [nextRefreshIn, setNextRefreshIn]   = useState(0);

  // Countdown timer
  useEffect(() => {
    if (!autoRefresh || refreshInterval === 0) { setNextRefreshIn(0); return; }
    setNextRefreshIn((refreshInterval / 1000) | 0);
    const t = setInterval(() => setNextRefreshIn((p) => (p > 1 ? p - 1 : (refreshInterval / 1000) | 0)), 1000);
    return () => clearInterval(t);
  }, [autoRefresh, refreshInterval]);

  const fetchServiceStatus = useCallback(async () => {
    const next = {};
    await Promise.all(
      services.map(async (svc) => {
        const entry = { loading: false, health: null, metrics: null, lastChecked: null, error: null };
        try {
          const r = await fetch(svc.healthUrl, { cache: 'no-store' });
          entry.health = await r.json();
          entry.lastChecked = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        } catch { entry.error = 'Tidak terjangkau'; }
        if (svc.metricsUrl) {
          try {
            const r = await fetch(svc.metricsUrl, { cache: 'no-store' });
            if (r.ok) entry.metrics = await r.json();
          } catch { /* metrics optional */ }
        }
        next[svc.name] = entry;
      })
    );
    setServiceState(next);
    setLastUpdated(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  }, []);

  useEffect(() => { fetchServiceStatus(); }, [fetchServiceStatus]);

  useEffect(() => {
    if (!autoRefresh) return;
    const t = setInterval(fetchServiceStatus, refreshInterval);
    return () => clearInterval(t);
  }, [autoRefresh, refreshInterval, fetchServiceStatus]);

  const progressMetrics = useMemo(() => {
    const reqs   = services.reduce((s, sv) => s + (serviceState[sv.name]?.metrics?.total_requests ?? 0), 0);
    const errs   = services.reduce((s, sv) => s + (serviceState[sv.name]?.metrics?.total_errors   ?? 0), 0);
    const lats   = services.flatMap((sv) => {
      const m = serviceState[sv.name]?.metrics;
      return m?.latency ? [m.latency.p95_ms, m.latency.p99_ms].filter(Boolean) : [];
    });
    return {
      requests:  reqs,
      errors:    errs,
      errorRate: reqs > 0 ? +((errs / reqs) * 100).toFixed(2) : 0,
      p95:       Math.max(...lats, 0),
    };
  }, [serviceState]);

  const endpointRows = useMemo(() => {
    const rows = [];
    services.forEach((svc) => {
      const m = serviceState[svc.name]?.metrics;
      if (!m?.endpoints) return;
      Object.entries(m.endpoints).forEach(([ep, st]) => {
        rows.push({
          service: svc.name, endpoint: ep,
          count: st.count, errors: st.errors, avgLatency: st.avg_latency_ms,
          errorRate: st.count > 0 ? +((st.errors / st.count) * 100).toFixed(1) : 0,
        });
      });
    });
    return rows.sort((a, b) => b.count - a.count);
  }, [serviceState]);

  const filteredLogs = logs.filter((e) =>
    !searchQuery ||
    e.correlationId.includes(searchQuery.trim()) ||
    e.path.includes(searchQuery.trim()) ||
    e.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGenerateTraffic = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      // Hit health endpoints to populate metrics counters in all services
      await Promise.all(services.map((svc) => fetch(svc.healthUrl, { cache: 'no-store' }).catch(() => null)));
      // Fetch fresh metrics immediately after so numbers update on screen
      await fetchServiceStatus();
      const entries = services.map((svc) => ({
        timestamp: new Date().toLocaleTimeString(),
        service: svc.name,
        path: svc.healthUrl.replace(API_URL, ''),
        level: 'INFO',
        message: `Health request recorded — ${svc.name}`,
        correlationId: createRandomId(),
        status: 200,
      }));
      setLogs((prev) => [...entries, ...prev].slice(0, 20));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={inAdminLayout ? '' : 'min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white'}>
      {!inAdminLayout && <Header />}

      <div className={`max-w-7xl mx-auto px-4 sm:px-6 pb-16 space-y-8 ${inAdminLayout ? 'pt-0' : 'pt-28'}`}>

        {/* ── Hero + Controls ─────────────────────────────── */}
        <div className="rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-br from-[#660000]/5 via-transparent to-transparent p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">

              {/* Title */}
              <div>
                <p className="text-xs font-black uppercase tracking-[0.35em] text-[#660000] dark:text-red-400/80 mb-2">
                  Observability Dashboard
                </p>
                <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-3">
                  Status Sistem
                </h1>
                <p className="text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed text-sm">
                  Pantau Gateway, Auth Service, dan Donor Service secara real-time — status, latency, request volume, dan log trace terintegrasi.
                </p>
              </div>

              {/* Controls */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:min-w-[220px]">
                {/* Refresh button */}
                <button
                  type="button"
                  onClick={fetchServiceStatus}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#660000] px-5 py-3 text-sm font-bold text-white shadow-md shadow-[#660000]/20 transition hover:bg-[#550000] active:scale-95"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh Sekarang
                </button>

                {/* Auto-refresh panel */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium">
                      <motion.div
                        animate={{ scale: autoRefresh ? [1, 1.3, 1] : 1, opacity: autoRefresh ? 1 : 0.4 }}
                        transition={{ repeat: Infinity, duration: 2 }}
                      >
                        <Dot className={`h-5 w-5 ${autoRefresh ? 'text-emerald-500 fill-emerald-500' : 'text-slate-400'}`} />
                      </motion.div>
                      Auto-refresh
                    </div>
                    <input
                      type="checkbox"
                      checked={autoRefresh}
                      onChange={() => setAutoRefresh((p) => !p)}
                      className="h-4 w-4 rounded border-slate-300 text-[#660000] focus:ring-[#660000] dark:border-slate-600 cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <span className="shrink-0">Interval</span>
                    <select
                      value={refreshInterval}
                      onChange={(e) => setRefreshInterval(Number(e.target.value))}
                      className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-sm text-slate-800 dark:text-slate-100 outline-none"
                    >
                      <option value={5000}>5 detik</option>
                      <option value={10000}>10 detik</option>
                      <option value={30000}>30 detik</option>
                      <option value={0}>Manual</option>
                    </select>
                  </div>
                  <div className="text-xs text-slate-400 dark:text-slate-500 space-y-0.5">
                    <p>Diperbarui: <span className="font-medium text-slate-600 dark:text-slate-300">{lastUpdated}</span></p>
                    {autoRefresh && refreshInterval > 0 && (
                      <p>Berikutnya: <span className="font-semibold text-[#660000] dark:text-red-400">{nextRefreshIn}d</span></p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Summary Metrics ─────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total Traffic', value: fmt(progressMetrics.requests), sub: 'Request dari semua layanan', icon: <Wifi className="h-5 w-5 text-[#660000] dark:text-red-400" /> },
            { label: 'Error Volume',  value: fmt(progressMetrics.errors),   sub: 'Error terdeteksi sesi ini',  icon: <Bug className="h-5 w-5 text-rose-500" /> },
            { label: 'p95 Latency',   value: progressMetrics.p95 ? `${progressMetrics.p95}ms` : '—', sub: 'Tertinggi antar layanan', icon: <Clock3 className="h-5 w-5 text-amber-500" /> },
          ].map((c) => (
            <div key={c.label} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">{c.label}</p>
                {c.icon}
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white">{c.value}</p>
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{c.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Service Cards ────────────────────────────────── */}
        <div>
          <h2 className="text-xs font-black uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500 mb-4">
            Status Layanan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {services.map((svc) => (
              <ServiceCard key={svc.name} service={svc} data={serviceState[svc.name]} />
            ))}
          </div>
        </div>

        {/* ── Endpoint Table + Right Column ───────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">

          {/* Endpoint Performance */}
          <div className="rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">Endpoint Performance</p>
                <h2 className="mt-1 text-lg font-black text-slate-900 dark:text-white">Request per Endpoint</h2>
              </div>
              <div className="inline-flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <Activity className="h-3.5 w-3.5" /> {endpointRows.length} endpoint
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-slate-950 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <tr>
                    {['Service', 'Endpoint', 'Calls', 'Error %', 'Latency'].map((h) => (
                      <th key={h} className="px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {endpointRows.length > 0 ? endpointRows.map((row) => (
                    <tr key={`${row.service}-${row.endpoint}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white whitespace-nowrap">{row.service}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300 font-mono text-xs truncate max-w-[160px]">{row.endpoint}</td>
                      <td className="px-4 py-3 font-medium">{fmt(row.count)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${
                          row.errorRate < 5
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                            : row.errorRate < 15
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                              : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                        }`}>{row.errorRate}%</span>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">
                        {row.avgLatency != null ? `${row.avgLatency}ms` : '—'}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-400 dark:text-slate-500">
                        Metrics belum tersedia — pastikan <code className="text-xs">/metrics</code> merespons.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right column: Error rate + Log viewer */}
          <div className="space-y-5">

            {/* Error rate breakdown */}
            <div className="rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500 mb-1">Error Rate</p>
              <h2 className="text-lg font-black text-slate-900 dark:text-white mb-5">Per Layanan</h2>
              <div className="space-y-4">
                {services.map((svc) => {
                  const er   = serviceState[svc.name]?.metrics?.error_rate_percent ?? 0;
                  const col  = er < 5 ? 'bg-emerald-500' : er < 15 ? 'bg-amber-500' : 'bg-rose-500';
                  const badge = er < 5
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                    : er < 15
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                      : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400';
                  return (
                    <div key={svc.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{svc.name}</span>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${badge}`}>{er}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, er)}%` }}
                          transition={{ type: 'spring', stiffness: 80, damping: 18 }}
                          className={`h-full rounded-full ${col}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Log viewer */}
            <div className="rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500 mb-1">Error Tracking</p>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">Log Viewer</h2>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateTraffic}
                  disabled={isGenerating}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#660000] hover:bg-[#550000] px-3 py-2 text-xs font-bold text-white transition disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
                >
                  <Zap className="h-3.5 w-3.5" />
                  {isGenerating ? 'Menguji…' : 'Generate'}
                </button>
              </div>

              {/* Search */}
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-3 py-2.5 mb-4">
                <Search className="h-4 w-4 text-slate-400 shrink-0" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari correlation ID, path…"
                  className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 outline-none placeholder:text-slate-400"
                />
                <span className="text-xs text-slate-400 font-medium shrink-0">{filteredLogs.length}</span>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {filteredLogs.length > 0 ? filteredLogs.map((e) => (
                  <LogEntry
                    key={`${e.correlationId}-${e.timestamp}`}
                    entry={e}
                    highlight={!!(searchQuery && e.correlationId.includes(searchQuery))}
                  />
                )) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 p-8 text-center text-sm text-slate-400 dark:text-slate-500">
                    Tidak ada log yang sesuai.
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* ── Performance Summary ──────────────────────────── */}
        <div className="rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">Observability</p>
              <h2 className="mt-1 text-lg font-black text-slate-900 dark:text-white">Ringkasan Kinerja</h2>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <ChevronRight className="h-3.5 w-3.5" />
              Auto-refresh {autoRefresh ? 'Aktif' : 'Nonaktif'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                label: 'Traffic',
                value: fmt(progressMetrics.requests),
                bar: 'bg-[#660000]',
                w: progressMetrics.requests > 0 ? 100 : 0,
              },
              {
                label: 'Errors',
                value: fmt(progressMetrics.errors),
                bar: 'bg-rose-500',
                w: progressMetrics.requests > 0
                  ? Math.min(100, Math.round((progressMetrics.errors / progressMetrics.requests) * 100))
                  : 0,
              },
              {
                label: 'Error Rate',
                value: `${progressMetrics.errorRate}%`,
                bar: progressMetrics.errorRate < 5 ? 'bg-emerald-500' : progressMetrics.errorRate < 15 ? 'bg-amber-500' : 'bg-rose-500',
                w: Math.min(100, progressMetrics.errorRate),
              },
            ].map((c) => (
              <div key={c.label} className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">{c.label}</p>
                <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">{c.value}</p>
                <div className="mt-3 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${c.w}%` }}
                    transition={{ type: 'spring', stiffness: 80, damping: 18 }}
                    className={`h-full rounded-full ${c.bar}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}