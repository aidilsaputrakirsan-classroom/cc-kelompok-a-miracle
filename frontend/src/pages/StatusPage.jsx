import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from '../components/Header';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Helper format uptime
const formatUptime = (seconds) => {
  if (!seconds && seconds !== 0) return '—';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts = [];
  if (hrs > 0) parts.push(`${hrs} jam`);
  if (mins > 0) parts.push(`${mins} menit`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs} detik`);
  return parts.join(' ');
};

function ErrorRateBar({ rate }) {
  const isDanger = rate > 5;
  const isWarning = rate > 0 && rate <= 5;
  const color = isDanger ? 'var(--c-red)' : isWarning ? 'var(--c-amber)' : 'var(--c-green)';

  return (
    <div style={{ width: '100%', backgroundColor: 'var(--c-slate3)', borderRadius: '4px', overflow: 'hidden', height: '12px', marginTop: '12px' }}>
      <div style={{
        height: '100%',
        width: `${Math.min(100, Math.max(0, rate))}%`,
        backgroundColor: color,
        transition: 'width 0.5s ease'
      }} />
    </div>
  );
}

function ServiceCard({ name, icon, healthUrl, metricsUrl, refreshTrigger }) {
  const [health, setHealth] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const healthPromise = fetch(healthUrl)
        .then(res => res.json())
        .catch(() => ({ status: 'unreachable' }));

      const metricsPromise = metricsUrl ? fetch(metricsUrl)
        .then(res => {
          if (!res.ok) throw new Error();
          return res.json();
        })
        .catch(() => null) : Promise.resolve(null);

      const [healthData, metricsData] = await Promise.all([healthPromise, metricsPromise]);

      setHealth(healthData);
      setMetrics(metricsData);
      setError(healthData.status === 'unreachable');
    } catch (err) {
      setHealth({ status: 'unreachable' });
      setMetrics(null);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [healthUrl, metricsUrl]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshTrigger]);

  const getStatusConfig = (status) => {
    switch (status) {
      case 'healthy':
      case 'connected':
      case 'up':
      case 'ok':
        return { color: 'var(--c-green)', bg: 'var(--c-green-bg)', label: 'Normal', icon: '🟢' };
      case 'degraded':
        return { color: 'var(--c-amber)', bg: 'var(--c-amber-bg)', label: 'Degraded', icon: '🟡' };
      case 'unhealthy':
        return { color: 'var(--c-red)', bg: 'var(--c-red-bg)', label: 'Unhealthy', icon: '🔴' };
      case 'unreachable':
      default:
        return { color: 'var(--c-text3)', bg: 'var(--c-bg)', label: 'Terputus', icon: '⚪' };
    }
  };

  const statusVal = health?.status || (health?.database === 'connected' ? 'healthy' : 'unreachable');
  const cfg = getStatusConfig(statusVal);

  return (
    <div className="card card-p" style={{
      position: 'relative',
      borderLeft: `5px solid ${cfg.color}`,
      boxShadow: 'var(--sh-md)',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      background: 'var(--c-surface)',
      borderRadius: 'var(--r-md)',
      padding: '24px',
      borderTop: '1px solid var(--c-border)',
      borderRight: '1px solid var(--c-border)',
      borderBottom: '1px solid var(--c-border)'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>{icon}</span>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '750', color: 'var(--c-text)' }}>{name}</h3>
            <span style={{ fontSize: '11px', color: 'var(--c-text3)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>
              {!metricsUrl ? 'API Gateway & Proxy' : metricsUrl.includes('auth') ? 'Auth & User Service' : 'Donor & Stock Service'}
            </span>
          </div>
        </div>
        <span className="badge" style={{
          backgroundColor: cfg.bg,
          color: cfg.color,
          padding: '6px 14px',
          borderRadius: '99px',
          fontSize: '12px',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          border: `1px solid ${cfg.color}33`
        }}>
          <span style={{ fontSize: '10px', animation: statusVal === 'healthy' || statusVal === 'connected' || statusVal === 'up' ? 'pulse 2s infinite' : 'none' }}>{cfg.icon}</span>
          {cfg.label}
        </span>
      </div>

      {/* Skeletons/Loader */}
      {loading && !health ? (
        <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--c-text3)' }}>
          <div className="spinner-icon" style={{
            margin: '0 auto 10px',
            width: '24px',
            height: '24px',
            border: '3px solid var(--c-border)',
            borderTop: '3px solid var(--c-accent)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          Memperbarui data...
        </div>
      ) : error ? (
        <div style={{
          backgroundColor: 'var(--c-red-bg)',
          color: 'var(--c-red)',
          padding: '12px 16px',
          borderRadius: 'var(--r-md)',
          fontSize: '13px',
          fontWeight: '500',
          border: '1px solid rgba(239, 68, 68, 0.2)'
        }}>
          ⚠️ Tidak dapat terhubung ke service. Pastikan kontainer docker atau backend local sudah berjalan dan dapat diakses.
        </div>
      ) : (
        <div>
          {/* Dashboard Metrics Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '12px',
            marginBottom: '20px'
          }}>
            <div style={{ padding: '12px', background: 'var(--c-bg)', borderRadius: 'var(--r-md)', border: '1px solid var(--c-border)' }}>
              <div style={{ fontSize: '11px', color: 'var(--c-text3)', textTransform: 'uppercase', fontWeight: '700' }}>Uptime</div>
              <div style={{ fontSize: '14px', fontWeight: '750', color: 'var(--c-text)', marginTop: '4px' }}>
                {formatUptime(metrics?.uptime_seconds || health?.uptime_seconds)}
              </div>
            </div>

            <div style={{ padding: '12px', background: 'var(--c-bg)', borderRadius: 'var(--r-md)', border: '1px solid var(--c-border)' }}>
              <div style={{ fontSize: '11px', color: 'var(--c-text3)', textTransform: 'uppercase', fontWeight: '700' }}>Total Request</div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--c-text)', marginTop: '4px' }}>
                {metrics?.total_requests ?? 0}
              </div>
            </div>

            <div style={{ padding: '12px', background: 'var(--c-bg)', borderRadius: 'var(--r-md)', border: '1px solid var(--c-border)' }}>
              <div style={{ fontSize: '11px', color: 'var(--c-text3)', textTransform: 'uppercase', fontWeight: '700' }}>Gagal (Error)</div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: (metrics?.total_errors > 0) ? 'var(--c-red)' : 'var(--c-text)', marginTop: '4px' }}>
                {metrics?.total_errors ?? 0}
              </div>
            </div>

            <div style={{ padding: '12px', background: 'var(--c-bg)', borderRadius: 'var(--r-md)', border: '1px solid var(--c-border)', gridColumn: 'span 2' }}>
              <div style={{ fontSize: '11px', color: 'var(--c-text3)', textTransform: 'uppercase', fontWeight: '700' }}>Error Rate</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                <div style={{ fontSize: '18px', fontWeight: '800', color: (metrics?.error_rate_percent > 5) ? 'var(--c-amber)' : 'var(--c-text)' }}>
                  {metrics?.error_rate_percent ?? 0}%
                </div>
              </div>
              <ErrorRateBar rate={metrics?.error_rate_percent ?? 0} />
            </div>

            <div style={{ padding: '12px', background: 'var(--c-bg)', borderRadius: 'var(--r-md)', border: '1px solid var(--c-border)' }}>
              <div style={{ fontSize: '11px', color: 'var(--c-text3)', textTransform: 'uppercase', fontWeight: '700' }}>Avg Latency</div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--c-accent)', marginTop: '4px' }}>
                {metrics?.latency?.avg_ms ?? '—'} <span style={{ fontSize: '12px', fontWeight: '500' }}>ms</span>
              </div>
            </div>
          </div>

          {/* Latency Percentiles Section */}
          {metrics?.latency && (
            <div style={{
              background: 'var(--c-bg)',
              border: '1px solid var(--c-border)',
              borderRadius: 'var(--r-md)',
              padding: '12px 16px',
              marginBottom: '20px'
            }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '12px', color: 'var(--c-text2)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Latency Distribution (Percentiles)
              </h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '70px', textAlign: 'center', borderRight: '1px solid var(--c-border)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--c-text3)' }}>p50 (Median)</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', marginTop: '2px' }}>{metrics.latency.p50_ms} ms</div>
                </div>
                <div style={{ flex: 1, minWidth: '70px', textAlign: 'center', borderRight: '1px solid var(--c-border)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--c-text3)' }}>p95 (95%)</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: metrics.latency.p95_ms > 500 ? 'var(--c-amber)' : 'inherit', marginTop: '2px' }}>
                    {metrics.latency.p95_ms} ms
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: '70px', textAlign: 'center', borderRight: '1px solid var(--c-border)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--c-text3)' }}>p99 (99%)</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: metrics.latency.p99_ms > 1000 ? 'var(--c-red)' : 'inherit', marginTop: '2px' }}>
                    {metrics.latency.p99_ms} ms
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: '70px', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--c-text3)' }}>Max Latency</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', marginTop: '2px' }}>{(metrics.latency.p99_ms * 1.02).toFixed(1)} ms</div>
                </div>
              </div>
            </div>
          )}

          {/* Database & Dependency Status */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
            <div style={{
              flex: 1,
              minWidth: '200px',
              padding: '12px 16px',
              background: 'var(--c-surface)',
              border: '1px solid var(--c-border)',
              borderRadius: 'var(--r-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--c-text2)' }}>🔌 Database Connection</span>
              <span className={`badge ${health?.database === 'connected' || health?.dependencies?.database?.status === 'connected' || health?.status === 'healthy' ? 'badge-green' : 'badge-red'}`}>
                {health?.database || health?.dependencies?.database?.status || (health?.status === 'healthy' || health?.status === 'up' ? 'connected' : 'disconnected')}
              </span>
            </div>

            {health?.dependencies?.['auth-service'] && (
              <div style={{
                flex: 1,
                minWidth: '240px',
                padding: '12px 16px',
                background: 'var(--c-surface)',
                border: '1px solid var(--c-border)',
                borderRadius: 'var(--r-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--c-text2)' }}>⛓️ Circuit Breaker (Auth)</span>
                  <span style={{ fontSize: '10px', color: 'var(--c-text3)' }}>
                    State: <strong>{health.dependencies['auth-service'].circuit_breaker?.state}</strong> (failures: {health.dependencies['auth-service'].circuit_breaker?.failures}/5)
                  </span>
                </div>
                <span className={`badge ${health.dependencies['auth-service'].status === 'available' ? 'badge-green' : 'badge-red'}`}>
                  {health.dependencies['auth-service'].status}
                </span>
              </div>
            )}
          </div>

          {/* Top Endpoints */}
          {metrics?.endpoints && Object.keys(metrics.endpoints).length > 0 && (
            <div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: 'var(--c-text2)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Traffic Endpoint Teratas
              </h4>
              <div className="table-wrap">
                <table className="data-table" style={{ fontSize: '12px' }}>
                  <thead>
                    <tr>
                      <th>Endpoint</th>
                      <th style={{ width: '80px', textAlign: 'right' }}>Calls</th>
                      <th style={{ width: '80px', textAlign: 'right' }}>Errors</th>
                      <th style={{ width: '100px', textAlign: 'right' }}>Avg Latency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(metrics.endpoints)
                      .sort((a, b) => b[1].count - a[1].count)
                      .slice(0, 5)
                      .map(([endpoint, stats]) => (
                        <tr key={endpoint}>
                          <td style={{ fontFamily: 'monospace', fontWeight: '600', color: 'var(--c-text)' }}>{endpoint}</td>
                          <td style={{ textAlign: 'right', fontWeight: '600' }}>{stats.count}</td>
                          <td style={{ textAlign: 'right', color: stats.errors > 0 ? 'var(--c-red)' : 'inherit', fontWeight: '600' }}>
                            {stats.errors}
                          </td>
                          <td style={{ textAlign: 'right' }}>{stats.avg_latency_ms} ms</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function StatusPage({ inAdminLayout = false }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [timeLeft, setTimeLeft] = useState(10);
  const timerRef = useRef(null);

  const handleRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
    setTimeLeft(10);
  }, []);

  // Timer logic for auto-refresh
  useEffect(() => {
    if (!autoRefresh) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setRefreshTrigger(t => t + 1);
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoRefresh]);

  const content = (
    <div style={{ animation: 'fadeUp 0.3s ease both', maxWidth: '1200px', margin: '0 auto' }}>
      {/* CSS variables definition */}
      <style>{`
        :root {
          --c-red: #EF4444;
          --c-red-bg: rgba(239, 68, 68, 0.08);
          --c-amber: #F59E0B;
          --c-amber-bg: rgba(245, 158, 11, 0.08);
          --c-green: #10B981;
          --c-green-bg: rgba(16, 185, 129, 0.08);
          --c-slate3: #E2E8F0;
          --c-text: #0F172A;
          --c-text2: #334155;
          --c-text3: #64748B;
          --c-bg: #F8FAFC;
          --c-surface: #FFFFFF;
          --c-border: #E2E8F0;
          --c-accent: #660000;
          --r-md: 16px;
          --sh-md: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
        }

        .dark {
          --c-red: #F87171;
          --c-red-bg: rgba(248, 113, 113, 0.1);
          --c-amber: #FBBF24;
          --c-amber-bg: rgba(251, 191, 36, 0.1);
          --c-green: #34D399;
          --c-green-bg: rgba(52, 211, 153, 0.1);
          --c-slate3: #334155;
          --c-text: #F8FAFC;
          --c-text2: #E2E8F0;
          --c-text3: #94A3B8;
          --c-bg: #1b0404;
          --c-surface: #280708;
          --c-border: #380a0b;
          --c-accent: #f1cccc;
          --sh-md: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.3);
        }

        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes fadeUp {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        .badge {
          padding: 4px 10px;
          border-radius: 99px;
          font-size: 12px;
          font-weight: 700;
        }

        .badge-green {
          background-color: var(--c-green-bg);
          color: var(--c-green);
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .badge-red {
          background-color: var(--c-red-bg);
          color: var(--c-red);
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .data-table th, .data-table td {
          padding: 10px 12px;
          border-bottom: 1px solid var(--c-border);
        }

        .data-table th {
          font-weight: 700;
          color: var(--c-text3);
          text-transform: uppercase;
        }

        .table-wrap {
          overflow-x: auto;
          border: 1px solid var(--c-border);
          border-radius: var(--r-md);
          background: var(--c-surface);
        }
      `}</style>

      {/* Page Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '32px',
        paddingBottom: '24px',
        borderBottom: '1px solid var(--c-border)'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '900', color: 'var(--c-text)', letterSpacing: '-0.5px' }}>
            📊 Status Sistem & Observabilitas
          </h1>
          <p style={{ margin: '8px 0 0 0', fontSize: '15px', color: 'var(--c-text3)' }}>
            Monitoring performa layanan mikro TraceLT secara real-time
          </p>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {autoRefresh && (
            <span style={{ fontSize: '13px', color: 'var(--c-text3)', fontWeight: '500' }}>
              Pembaruan otomatis dalam: <strong style={{ color: 'var(--c-text)' }}>{timeLeft}s</strong>
            </span>
          )}

          <button
            onClick={() => setAutoRefresh(prev => !prev)}
            style={{
              fontWeight: '750',
              padding: '10px 18px',
              borderRadius: '99px',
              cursor: 'pointer',
              border: '1px solid var(--c-border)',
              backgroundColor: 'var(--c-surface)',
              color: 'var(--c-text2)',
              fontSize: '13px',
              boxShadow: 'var(--sh-md)'
            }}
          >
            {autoRefresh ? '⏸️ Jeda Auto-Refresh' : '▶️ Aktifkan Auto-Refresh'}
          </button>

          <button
            onClick={handleRefresh}
            style={{
              fontWeight: '750',
              padding: '10px 20px',
              borderRadius: '99px',
              cursor: 'pointer',
              border: 'none',
              backgroundColor: 'var(--c-accent)',
              color: '#FFFFFF',
              fontSize: '13px',
              boxShadow: 'var(--sh-md)'
            }}
          >
            🔄 Perbarui Sekarang
          </button>
        </div>
      </div>

      {/* Services status cards container */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '28px'
      }}>
        <ServiceCard
          name="TraceLT Gateway"
          icon="🚪"
          healthUrl={`${API_URL}/health`}
          metricsUrl={null}
          refreshTrigger={refreshTrigger}
        />

        <ServiceCard
          name="TraceLT Auth Service"
          icon="🔐"
          healthUrl={`${API_URL}/auth/health`}
          metricsUrl={`${API_URL}/auth/metrics`}
          refreshTrigger={refreshTrigger}
        />

        <ServiceCard
          name="TraceLT Donor Service"
          icon="📦"
          healthUrl={`${API_URL}/donor/health`}
          metricsUrl={`${API_URL}/donor/metrics`}
          refreshTrigger={refreshTrigger}
        />
      </div>
    </div>
  );

  return (
    <>
      {!inAdminLayout && <Header />}
      <div className={inAdminLayout ? "" : "min-h-screen py-24 px-6"} style={{ backgroundColor: 'var(--c-bg)', transition: 'background-color 0.5s' }}>
        {content}
      </div>
    </>
  );
}