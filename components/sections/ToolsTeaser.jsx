'use client';

import Link from 'next/link';
import { FaTools, FaArrowRight, FaGift } from 'react-icons/fa';

export default function ToolsTeaser() {
  return (
    <section className="tools-teaser" style={{ padding: '60px 0' }}>
      <div className="container">
        <div
          className="glass"
          style={{
            padding: '40px',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid rgba(214, 255, 1, 0.25)',
            background: 'linear-gradient(135deg, rgba(214, 255, 1, 0.04) 0%, rgba(10, 10, 10, 0.8) 100%)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '24px',
            boxShadow: 'var(--shadow-glow)',
          }}
        >
          <div style={{ flex: '1 1 500px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 600,
                background: 'rgba(214, 255, 1, 0.1)',
                color: 'var(--accent)',
                marginBottom: '14px',
              }}
            >
              <FaGift /> Public Utility & Open Experiments
            </div>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '10px' }}>
              Mencari <span className="gradient-text">Alat Digital Gratis</span>?
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
              Saya senang membangun utilitas web dan alat bantu terbuka untuk memecahkan masalah praktis. Semua alat dapat Anda coba dan gunakan langsung secara gratis.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Link
              href="/tools"
              className="btn btn-primary"
              style={{
                padding: '14px 28px',
                fontSize: '1rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <FaTools /> Jelajahi Lab & Tools Gratis <FaArrowRight />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
