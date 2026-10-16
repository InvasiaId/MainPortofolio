'use client';

import { useMemo, useState } from 'react';
import {
  FaCode,
  FaCube,
  FaGamepad,
  FaPalette,
  FaVideo,
  FaLayerGroup,
  FaCheckCircle,
} from 'react-icons/fa';

const CATEGORY_META = {
  'Web Development': { icon: FaCode, color: 'var(--accent)' },
  '3D & Animation': { icon: FaCube, color: '#a855f7' },
  'Game & AR Development': { icon: FaGamepad, color: '#38bdf8' },
  'UI UX Designer': { icon: FaPalette, color: '#f43f5e' },
  'Video & Motion Graphics': { icon: FaVideo, color: '#eab308' },
};

function getLevelBadge(proficiency) {
  if (proficiency >= 90) {
    return { label: 'Utama / Expert', color: 'var(--accent)', bg: 'rgba(214, 255, 1, 0.12)' };
  }
  if (proficiency >= 75) {
    return { label: 'Mahir / Advanced', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.12)' };
  }
  return { label: 'Kompeten / Intermediate', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.1)' };
}

export default function Skills({ skills }) {
  const [activeCategory, setActiveCategory] = useState('all');

  const groupedSkills = useMemo(() => {
    const map = {};
    (skills || []).forEach((skill) => {
      const cat = skill.category || 'General';
      if (!map[cat]) map[cat] = [];
      map[cat].push(skill);
    });
    return map;
  }, [skills]);

  const categories = Object.keys(groupedSkills);

  if (!skills || skills.length === 0) {
    return (
      <section className="skills" id="skills">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              <span className="gradient-text">Keahlian</span> Saya
            </h2>
            <p className="section-subtitle">Tambahkan keahlian melalui panel admin.</p>
          </div>
        </div>
      </section>
    );
  }

  const displayedCategories = activeCategory === 'all'
    ? categories
    : categories.filter((c) => c === activeCategory);

  return (
    <section className="skills" id="skills" style={{ padding: '80px 0' }}>
      <div className="container">
        <div className="section-header" style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 className="section-title">
            Tech Stack & <span className="gradient-text">Keahlian</span>
          </h2>
          <p className="section-subtitle">Alat, bahasa pemrograman, dan teknologi yang saya kuasai</p>

          {/* Filter Pills */}
          {categories.length > 1 && (
            <div className="filter-tabs" style={{ marginTop: '24px', justifyContent: 'center' }}>
              <button
                className={`filter-tab ${activeCategory === 'all' ? 'active' : ''}`}
                onClick={() => setActiveCategory('all')}
              >
                Semua Bidang
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`filter-tab ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Categorized Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
          }}
        >
          {displayedCategories.map((cat) => {
            const catMeta = CATEGORY_META[cat] || { icon: FaLayerGroup, color: 'var(--accent)' };
            const CatIcon = catMeta.icon;
            const items = groupedSkills[cat] || [];

            return (
              <div
                key={cat}
                className="glass"
                style={{
                  padding: '28px',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-glass)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                  transition: 'transform 0.2s ease, border-color 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: `${catMeta.color}1a`,
                      border: `1px solid ${catMeta.color}33`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: catMeta.color,
                      fontSize: '1.2rem',
                    }}
                  >
                    <CatIcon />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                      {cat}
                    </h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {items.length} teknologi
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {items.map((skill) => {
                    const badge = getLevelBadge(skill.proficiency);
                    return (
                      <div
                        key={skill.id}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 14px',
                          borderRadius: 'var(--radius-md)',
                          background: 'var(--bg-glass)',
                          border: '1px solid var(--border-glass)',
                          fontSize: '0.88rem',
                          color: 'var(--text-primary)',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <FaCheckCircle style={{ color: badge.color, fontSize: '0.75rem' }} />
                        <span style={{ fontWeight: 600 }}>{skill.name}</span>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 500,
                            padding: '2px 8px',
                            borderRadius: '10px',
                            background: badge.bg,
                            color: badge.color,
                          }}
                        >
                          {badge.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
