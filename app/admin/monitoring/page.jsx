'use client';

import { useState, useEffect, useCallback } from 'react';
import { FaEye, FaDatabase, FaExclamationTriangle, FaSync } from 'react-icons/fa';

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="glass" style={ms.statCard}>
      <div style={{ ...ms.iconCircle, background: `${color}22` }}>
        <Icon style={{ color, fontSize: '1.2rem' }} />
      </div>
      <div>
        <div style={ms.statValue}>{value}</div>
        <div style={ms.statLabel}>{label}</div>
      </div>
    </div>
  );
}

export default function AdminMonitoring() {
  const [analytics, setAnalytics] = useState(null);
  const [errors, setErrors] = useState([]);
  const [period, setPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(() => {
    Promise.all([
      fetch(`/api/analytics?period=${period}`).then((r) => r.json()).catch(() => null),
      fetch('/api/errors?limit=20').then((r) => r.json()).catch(() => []),
    ]).then(([analyticsData, errorsData]) => {
      setAnalytics(analyticsData);
      setErrors(errorsData || []);
      setLoading(false);
    });
  }, [period]);

  const fetchData = () => {
    setLoading(true);
    loadData();
  };

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
          <span className="gradient-text">Pemantauan</span>
        </h1>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            style={{ padding: '8px 14px', background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: 'var(--text-primary)', fontFamily: 'var(--font-main)', fontSize: '0.85rem' }}
          >
            <option value="24h">24 Jam Terakhir</option>
            <option value="7d">7 Hari Terakhir</option>
            <option value="30d">30 Hari Terakhir</option>
          </select>
          <button onClick={fetchData} className="btn btn-outline" style={{ padding: '8px 14px' }}>
            <FaSync />
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton" style={{ height: '100px', borderRadius: '12px' }} />)}
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
            <StatCard label="Total Kunjungan" value={analytics?.totalViews || 0} icon={FaEye} color="#D6FF01" />
            <StatCard label="Hari Ini" value={analytics?.todayViews || 0} icon={FaEye} color="#3b82f6" />
            <StatCard label="Jumlah Proyek" value={analytics?.dbStats?.projectCount || 0} icon={FaDatabase} color="#10b981" />
            <StatCard label="Kesalahan" value={errors.length} icon={FaExclamationTriangle} color="#ef4444" />
          </div>

          {/* Daily Trend */}
          {analytics?.dailyTrend && Object.keys(analytics.dailyTrend).length > 0 && (
            <div className="glass" style={ms.chartCard}>
              <h3 style={ms.chartTitle}>Kunjungan Harian</h3>
              <div style={ms.barChart}>
                {Object.entries(analytics.dailyTrend).map(([date, count]) => {
                  const maxVal = Math.max(...Object.values(analytics.dailyTrend), 1);
                  return (
                    <div key={date} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '80px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{date.slice(5)}</span>
                      <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${(count / maxVal) * 100}%`, background: 'var(--gradient-main)', borderRadius: '3px' }} />
                      </div>
                      <span style={{ width: '30px', textAlign: 'right', fontSize: '0.8rem', fontWeight: 600 }}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginTop: '16px' }}>
            {/* Top Pages */}
            <div className="glass" style={ms.chartCard}>
              <h3 style={ms.chartTitle}>Halaman Terpopuler</h3>
              {(analytics?.topPages || []).map((p, i) => (
                <div key={i} style={ms.listItem}>
                  <span style={{ flex: 1, fontSize: '0.85rem' }}>{p.page}</span>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{p.count}</span>
                </div>
              ))}
            </div>

            {/* Devices */}
            <div className="glass" style={ms.chartCard}>
              <h3 style={ms.chartTitle}>Perangkat</h3>
              {(analytics?.devices || []).map((d, i) => (
                <div key={i} style={ms.listItem}>
                  <span style={{ flex: 1, fontSize: '0.85rem' }}>{{ Mobile: 'Ponsel', Desktop: 'Komputer', Tablet: 'Tablet' }[d.device] || d.device}</span>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{d.count}</span>
                </div>
              ))}
            </div>

            {/* Browsers */}
            <div className="glass" style={ms.chartCard}>
              <h3 style={ms.chartTitle}>Peramban</h3>
              {(analytics?.browsers || []).map((b, i) => (
                <div key={i} style={ms.listItem}>
                  <span style={{ flex: 1, fontSize: '0.85rem' }}>{b.browser === 'Other' ? 'Lainnya' : b.browser}</span>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{b.count}</span>
                </div>
              ))}
            </div>

            {/* Projects by Category */}
            <div className="glass" style={ms.chartCard}>
              <h3 style={ms.chartTitle}>Proyek berdasarkan Kategori</h3>
              {(analytics?.projectsByCategory || []).map((p, i) => (
                <div key={i} style={ms.listItem}>
                  <span style={{ flex: 1, fontSize: '0.85rem', textTransform: 'capitalize' }}>
                    {{ website: 'Situs Web', android: 'Android', threeD: 'Desain 3D', video: 'Video', graphic: 'Desain Grafis', hardware: 'Perangkat Keras' }[p.category] || p.category}
                  </span>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{p.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Error Logs */}
          <div className="glass" style={{ ...ms.chartCard, marginTop: '16px' }}>
            <h3 style={ms.chartTitle}>
              <FaExclamationTriangle style={{ color: '#ef4444' }} /> Kesalahan Terbaru
            </h3>
            {errors.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Belum ada kesalahan tercatat. 🎉</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {errors.map((err) => (
                  <div key={err.id} style={{ padding: '12px', background: 'rgba(239,68,68,0.06)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.15)' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ef4444', marginBottom: '4px' }}>{err.errorMessage}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {err.page && `Halaman: ${err.page} • `}
                      {new Date(err.createdAt).toLocaleString('id-ID')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

const ms = {
  statCard: { padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' },
  iconCircle: { width: '44px', height: '44px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: '1.6rem', fontWeight: 800 },
  statLabel: { color: 'var(--text-secondary)', fontSize: '0.8rem' },
  chartCard: { padding: '24px' },
  chartTitle: { fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' },
  barChart: { display: 'flex', flexDirection: 'column', gap: '10px' },
  listItem: { display: 'flex', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-glass)' },
};
