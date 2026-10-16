'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { FaExternalLinkAlt, FaGithub, FaSearch, FaArrowLeft, FaTools, FaCube, FaLaptopCode, FaMicrochip } from 'react-icons/fa';

const CATEGORY_MAP = {
  website: { label: 'Web Utility', icon: FaLaptopCode },
  threeD: { label: '3D Tool', icon: FaCube },
  hardware: { label: 'Hardware/IoT', icon: FaMicrochip },
  android: { label: 'Mobile App', icon: FaTools },
};

export default function ToolsDirectory({ tools = [] }) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      const matchesSearch =
        tool.title.toLowerCase().includes(search.toLowerCase()) ||
        tool.description.toLowerCase().includes(search.toLowerCase()) ||
        tool.techStack?.some((t) => t.toLowerCase().includes(search.toLowerCase()));

      const matchesCategory =
        activeCategory === 'all' || tool.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [tools, search, activeCategory]);

  return (
    <div className="container" style={{ paddingBottom: '100px' }}>
      {/* Back button */}
      <div style={{ marginBottom: '28px' }}>
        <Link href="/" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '0.9rem' }}>
          <FaArrowLeft /> Kembali ke Beranda
        </Link>
      </div>

      {/* Header section */}
      <div className="section-header" style={{ textAlign: 'center', marginBottom: '40px' }}>
        <span
          className="badge-accent"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: 600,
            background: 'rgba(214, 255, 1, 0.12)',
            color: 'var(--accent)',
            border: '1px solid rgba(214, 255, 1, 0.3)',
            marginBottom: '16px',
          }}
        >
          🎁 Public Lab & Free Utilities
        </span>
        <h1 className="section-title" style={{ fontSize: '2.5rem', marginBottom: '16px' }}>
          Alat & Proyek <span className="gradient-text">Gratis</span>
        </h1>
        <p className="section-subtitle" style={{ maxWidth: '680px', margin: '0 auto', fontSize: '1.05rem', color: 'var(--text-secondary)' }}>
          Kumpulan alat bantu web dan eksperimen digital yang saya bangun untuk mempermudah pekerjaan sehari-hari. Terbuka dan dapat digunakan langsung secara gratis.
        </p>
      </div>

      {/* Search and Filters */}
      <div
        className="glass"
        style={{
          padding: '20px',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '40px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ position: 'relative', flex: '1 1 300px', minWidth: '240px' }}>
          <FaSearch style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Cari alat atau teknologi (misal: 3D, viewer, react)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px 12px 42px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-glass)',
              color: 'var(--text-primary)',
              fontSize: '0.95rem',
              outline: 'none',
              fontFamily: 'var(--font-main)',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            className={`filter-tab ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => setActiveCategory('all')}
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            Semua
          </button>
          {['website', 'threeD', 'hardware'].map((cat) => (
            <button
              key={cat}
              className={`filter-tab ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              {CATEGORY_MAP[cat]?.label || cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tools Grid */}
      {filteredTools.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '24px',
          }}
        >
          {filteredTools.map((tool) => {
            const CatIcon = CATEGORY_MAP[tool.category]?.icon || FaTools;
            const thumbnail = tool.media?.find((m) => m.mediaType === 'image');

            return (
              <div
                key={tool.id}
                className="tool-card glass"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '24px',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-glass)',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Status Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#10b981',
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      padding: '4px 10px',
                      borderRadius: '12px',
                    }}
                  >
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></span>
                    Gratis Digunakan
                  </span>

                  <span
                    style={{
                      fontSize: '0.8rem',
                      color: 'var(--text-muted)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <CatIcon /> {CATEGORY_MAP[tool.category]?.label || tool.category}
                  </span>
                </div>

                {thumbnail && (
                  <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '16px', maxHeight: '180px' }}>
                    <img src={thumbnail.mediaUrl} alt={tool.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}

                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '10px', color: 'var(--text-primary)' }}>
                  {tool.title}
                </h3>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '20px', flex: 1 }}>
                  {tool.description}
                </p>

                {tool.techStack?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '24px' }}>
                    {tool.techStack.map((tech) => (
                      <span key={tech} className="tech-tag" style={{ fontSize: '0.75rem', padding: '3px 8px' }}>
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                  {tool.projectUrl && (
                    <a
                      href={tool.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary"
                      style={{ flex: 1, justifyContent: 'center', fontSize: '0.88rem', padding: '10px 14px' }}
                    >
                      <FaExternalLinkAlt /> Coba Sekarang
                    </a>
                  )}
                  {tool.repoUrl && (
                    <a
                      href={tool.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline"
                      style={{ padding: '10px 14px', fontSize: '0.88rem' }}
                      title="Lihat Kode Sumber di GitHub"
                    >
                      <FaGithub />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : tools.length === 0 ? (
        <div className="glass" style={{ textAlign: 'center', padding: '60px 20px', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🛠️</div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', color: 'var(--text-primary)' }}>Belum Ada Alat yang Dipublikasikan</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '480px', margin: '0 auto 20px auto' }}>
            Alat-alat web dan utilitas digital baru saat ini sedang dalam tahap perancangan dan akan segera dirilis di sini.
          </p>
          <Link href="/" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <FaArrowLeft /> Kembali ke Portofolio
          </Link>
        </div>
      ) : (
        <div className="glass" style={{ textAlign: 'center', padding: '60px 20px', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🔍</div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Tidak Ada Alat Ditemukan</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Coba ubah kata kunci pencarian atau ganti filter kategori.
          </p>
        </div>
      )}
    </div>
  );
}
