'use client';

import { useRef, useEffect } from 'react';
import { FaDownload, FaUser } from 'react-icons/fa';

export default function About({ profile, stats }) {
  const ref = useRef(null);
  const resumeDownloadUrl = profile?.resumeUrl
    ? `${profile.resumeUrl}${profile.resumeUrl.includes('?') ? '&' : '?'}download=1`
    : null;

  const yearsExp = stats?.yearsExp || '3+';
  const projectCount = stats?.projectCount ? `${stats.projectCount}+` : '15+';
  const skillCount = stats?.skillCount ? `${stats.skillCount}` : '10+';

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="about" id="about">
      <div className="container">
        <div className="section-header reveal" ref={ref}>
          <h2 className="section-title">
            Tentang <span className="gradient-text">Saya</span>
          </h2>
          <p className="section-subtitle">
            Latar belakang, fokus teknologi, dan pendekatan saya dalam membangun perangkat lunak.
          </p>
        </div>

        <div className="about-content">
          <div className="about-image">
            <div className="about-image-frame">
              {profile?.photoUrl ? (
                <img src={profile.photoUrl} alt={profile?.name || 'Foto profil'} loading="lazy" decoding="async" />
              ) : (
                <FaUser style={{ fontSize: '3rem', opacity: 0.35 }} />
              )}
            </div>
          </div>

          <div>
            <p className="about-bio">
              {profile?.bio || 'Tuliskan biografi Anda di sini. Ceritakan latar belakang, pengalaman, dan minat Anda dalam menciptakan pengalaman digital.'}
            </p>

            <div className="about-stats">
              <div className="stat-card glass">
                <div className="stat-number gradient-text">{yearsExp}</div>
                <div className="stat-label">Tahun Pengalaman</div>
              </div>
              <div className="stat-card glass">
                <div className="stat-number gradient-text">{projectCount}</div>
                <div className="stat-label">Proyek Selesai</div>
              </div>
              <div className="stat-card glass">
                <div className="stat-number gradient-text">{skillCount}</div>
                <div className="stat-label">Teknologi & Keahlian</div>
              </div>
            </div>

            <a
              href={resumeDownloadUrl || undefined}
              className="btn btn-primary"
              style={{ marginTop: '20px', opacity: resumeDownloadUrl ? 1 : 0.55 }}
              aria-disabled={!resumeDownloadUrl}
              title={resumeDownloadUrl ? 'Unduh Curriculum Vitae' : 'CV belum diunggah oleh admin'}
              onClick={(event) => {
                if (!resumeDownloadUrl) event.preventDefault();
              }}
              download="CV.pdf"
            >
              <FaDownload /> Unduh CV
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
