'use client';

import { useState } from 'react';
import { FaBriefcase, FaGraduationCap, FaCertificate, FaCalendarAlt } from 'react-icons/fa';

const TYPE_CONFIG = {
  work: { label: 'Karier & Pekerjaan', icon: FaBriefcase, color: 'var(--accent)' },
  education: { label: 'Pendidikan Formal', icon: FaGraduationCap, color: '#38bdf8' },
  certification: { label: 'Sertifikasi', icon: FaCertificate, color: '#f59e0b' },
};

export default function Experience({ experiences = [] }) {
  const [activeTab, setActiveTab] = useState('all');

  const filtered = experiences.filter((item) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'work') return item.type === 'work';
    if (activeTab === 'education') return item.type === 'education' || item.type === 'certification';
    return true;
  });

  if (!experiences || experiences.length === 0) {
    return null;
  }

  return (
    <section className="experience" id="experience" style={{ padding: '80px 0' }}>
      <div className="container">
        <div className="section-header" style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 className="section-title">
            Jejak <span className="gradient-text">Pengalaman</span>
          </h2>
          <p className="section-subtitle">Riwayat profesional, pendidikan, dan sertifikasi saya</p>

          {/* Filter Tabs */}
          <div className="filter-tabs" style={{ marginTop: '24px', justifyContent: 'center' }}>
            <button
              className={`filter-tab ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              🎯 Semua
            </button>
            <button
              className={`filter-tab ${activeTab === 'work' ? 'active' : ''}`}
              onClick={() => setActiveTab('work')}
            >
              💼 Karier & Proyek
            </button>
            <button
              className={`filter-tab ${activeTab === 'education' ? 'active' : ''}`}
              onClick={() => setActiveTab('education')}
            >
              🎓 Pendidikan & Sertifikasi
            </button>
          </div>
        </div>

        {/* Timeline Layout */}
        <div
          className="timeline-container"
          style={{
            maxWidth: '800px',
            margin: '0 auto',
            position: 'relative',
            paddingLeft: '32px',
          }}
        >
          {/* Vertical central bar */}
          <div
            style={{
              position: 'absolute',
              top: '10px',
              bottom: '10px',
              left: '7px',
              width: '2px',
              background: 'linear-gradient(to bottom, var(--accent) 0%, rgba(214, 255, 1, 0.15) 100%)',
            }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {filtered.map((item) => {
              const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.work;
              const Icon = config.icon;

              return (
                <div key={item.id} style={{ position: 'relative' }}>
                  {/* Glowing Node Dot */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '-32px',
                      top: '6px',
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      background: 'var(--bg-primary)',
                      border: `2px solid ${config.color}`,
                      boxShadow: `0 0 10px ${config.color}88`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 2,
                    }}
                  />

                  {/* Card Content */}
                  <div
                    className="glass"
                    style={{
                      padding: '24px',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--border-glass)',
                      transition: 'transform 0.2s ease, border-color 0.2s ease',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '12px',
                        marginBottom: '10px',
                      }}
                    >
                      <div>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: config.color,
                            background: `${config.color}18`,
                            padding: '3px 10px',
                            borderRadius: '12px',
                            marginBottom: '8px',
                          }}
                        >
                          <Icon /> {config.label}
                        </span>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                          {item.title}
                        </h3>
                        <p style={{ fontSize: '0.95rem', color: 'var(--accent)', fontWeight: 500, margin: '4px 0 0 0' }}>
                          {item.organization}
                        </p>
                      </div>

                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '0.8rem',
                          color: 'var(--text-muted)',
                          background: 'var(--bg-glass)',
                          padding: '4px 10px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-glass)',
                        }}
                      >
                        <FaCalendarAlt /> {item.period}
                      </div>
                    </div>

                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
