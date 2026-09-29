'use client';

import { useState, useEffect } from 'react';
import { FaProjectDiagram, FaTh, FaEye, FaExclamationTriangle } from 'react-icons/fa';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/projects').then((r) => r.json()),
      fetch('/api/analytics?period=30d').then((r) => r.json()).catch(() => null),
    ]).then(([projects, analytics]) => {
      const categories = {};
      (projects || []).forEach((p) => {
        categories[p.category] = (categories[p.category] || 0) + 1;
      });
      setStats({
        totalProjects: projects?.length || 0,
        categories,
        totalViews: analytics?.totalViews || 0,
        todayViews: analytics?.todayViews || 0,
      });
    });
  }, []);

  const cards = [
    { label: 'Jumlah Proyek', value: stats?.totalProjects || 0, icon: FaProjectDiagram, color: '#D6FF01' },
    { label: 'Kategori', value: Object.keys(stats?.categories || {}).length, icon: FaTh, color: '#3b82f6' },
    { label: 'Total Kunjungan', value: stats?.totalViews || 0, icon: FaEye, color: '#10b981' },
    { label: 'Kunjungan Hari Ini', value: stats?.todayViews || 0, icon: FaExclamationTriangle, color: '#f59e0b' },
  ];

    const categoryLabels = {
      website: 'Situs Web',
      android: 'Android',
      threeD: 'Desain 3D',
      video: 'Video',
      graphic: 'Desain Grafis',
      hardware: 'Perangkat Keras',
    };

  return (
    <div>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
        <span className="gradient-text">Ringkasan</span>
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
        Selamat datang kembali! Berikut ringkasan portofolio Anda.
      </p>

      <div style={styles.cardGrid}>
        {cards.map((card) => (
          <div key={card.label} className="glass" style={styles.statCard}>
            <div style={{ ...styles.iconCircle, background: `${card.color}22` }}>
              <card.icon style={{ color: card.color, fontSize: '1.3rem' }} />
            </div>
            <div>
              <div style={styles.statValue}>{stats ? card.value : '—'}</div>
              <div style={styles.statLabel}>{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {stats && Object.keys(stats.categories).length > 0 && (
        <div className="glass" style={styles.chartCard}>
          <h3 style={{ fontWeight: 700, marginBottom: '20px' }}>Proyek berdasarkan Kategori</h3>
          <div style={styles.barChart}>
            {Object.entries(stats.categories).map(([cat, count]) => (
              <div key={cat} style={styles.barRow}>
                  <span style={styles.barLabel}>{categoryLabels[cat] || cat}</span>
                <div style={styles.barTrack}>
                  <div
                    style={{
                      ...styles.barFill,
                      width: `${(count / stats.totalProjects) * 100}%`,
                    }}
                  />
                </div>
                <span style={styles.barValue}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px',
    marginBottom: '32px',
  },
  statCard: {
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  iconCircle: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: '1.8rem',
    fontWeight: 800,
  },
  statLabel: {
    color: 'var(--text-secondary)',
    fontSize: '0.85rem',
  },
  chartCard: {
    padding: '28px',
  },
  barChart: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  barRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  barLabel: {
    width: '90px',
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    textTransform: 'capitalize',
  },
  barTrack: {
    flex: 1,
    height: '8px',
    background: 'rgba(255,255,255,0.06)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    background: 'var(--gradient-main)',
    borderRadius: '4px',
    transition: 'width 0.8s ease',
  },
  barValue: {
    width: '30px',
    textAlign: 'right',
    fontWeight: 700,
    fontSize: '0.9rem',
  },
};
