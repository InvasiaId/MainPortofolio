'use client';

import { useState, useEffect } from 'react';
import { FaBriefcase, FaGraduationCap, FaCertificate, FaCalendarAlt, FaTimes, FaImage, FaExternalLinkAlt } from 'react-icons/fa';

const TYPE_CONFIG = {
  work: { label: 'Karier & Pekerjaan', icon: FaBriefcase, color: 'var(--accent)' },
  education: { label: 'Pendidikan Formal', icon: FaGraduationCap, color: '#38bdf8' },
  certification: { label: 'Sertifikasi', icon: FaCertificate, color: '#f59e0b' },
};

export default function Experience({ experiences = [] }) {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedDoc, setSelectedDoc] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedDoc(null);
    };
    if (selectedDoc) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [selectedDoc]);

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
    <>
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
                const hasImage = Boolean(item.imageUrl);

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
                      onClick={() => {
                        if (hasImage) setSelectedDoc(item);
                      }}
                      role={hasImage ? 'button' : undefined}
                      tabIndex={hasImage ? 0 : undefined}
                      onKeyDown={(e) => {
                        if (hasImage && e.key === 'Enter') setSelectedDoc(item);
                      }}
                      style={{
                        padding: '24px',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--border-glass)',
                        cursor: hasImage ? 'pointer' : 'default',
                        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: hasImage ? '0 4px 20px rgba(0, 0, 0, 0.3)' : undefined,
                      }}
                      onMouseEnter={(e) => {
                        if (hasImage) {
                          e.currentTarget.style.transform = 'translateY(-3px)';
                          e.currentTarget.style.borderColor = 'rgba(214, 255, 1, 0.4)';
                          e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(214, 255, 1, 0.15)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (hasImage) {
                          e.currentTarget.style.transform = 'none';
                          e.currentTarget.style.borderColor = 'var(--border-glass)';
                          e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
                        }
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
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
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
                              }}
                            >
                              <Icon /> {config.label}
                            </span>

                            {hasImage && (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  color: 'var(--accent)',
                                  background: 'rgba(214, 255, 1, 0.1)',
                                  border: '1px solid rgba(214, 255, 1, 0.3)',
                                  padding: '2px 8px',
                                  borderRadius: '10px',
                                }}
                              >
                                <FaImage /> Bukti Foto / Sertifikat ↗
                              </span>
                            )}
                          </div>

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

      {/* Pop-up Modal for Certificate / Photo Documentation */}
      {selectedDoc && selectedDoc.imageUrl && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedDoc(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            className="modal-content glass"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-glass)',
              position: 'relative',
              padding: 0,
              boxShadow: 'var(--shadow-card), var(--shadow-glow)',
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedDoc(null)}
              aria-label="Tutup pratinjau"
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(0, 0, 0, 0.6)',
                border: '1px solid var(--border-glass)',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 10,
                transition: 'all 0.2s ease',
              }}
            >
              <FaTimes />
            </button>

            {/* Header */}
            <div style={{ padding: '24px 28px 16px 28px', borderBottom: '1px solid var(--border-glass)' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: TYPE_CONFIG[selectedDoc.type]?.color || 'var(--accent)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '3px 10px',
                  borderRadius: '12px',
                  marginBottom: '8px',
                }}
              >
                {TYPE_CONFIG[selectedDoc.type]?.label || 'Dokumentasi'}
              </span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '4px 0', color: 'var(--text-primary)' }}>
                {selectedDoc.title}
              </h2>
              <p style={{ color: 'var(--accent)', fontWeight: 500, margin: 0, fontSize: '0.95rem' }}>
                {selectedDoc.organization} • {selectedDoc.period}
              </p>
            </div>

            {/* Image Preview */}
            <div style={{ padding: '24px', display: 'flex', justifyContent: 'center', background: 'rgba(0, 0, 0, 0.4)' }}>
              <div
                style={{
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  border: '1px solid var(--border-glass)',
                  maxHeight: '65vh',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={selectedDoc.imageUrl}
                  alt={selectedDoc.title}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '65vh',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
              </div>
            </div>

            {/* Footer with Description */}
            {selectedDoc.description && (
              <div style={{ padding: '16px 28px 24px 28px', borderTop: '1px solid var(--border-glass)' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
                  {selectedDoc.description}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
