'use client';

import { useRef, useEffect } from 'react';
import { FaDownload } from 'react-icons/fa';

export default function About({ profile }) {
  const ref = useRef(null);
  const resumeDownloadUrl = profile?.resumeUrl
    ? `${profile.resumeUrl}${profile.resumeUrl.includes('?') ? '&' : '?'}download=1`
    : null;

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
          <p className="section-subtitle">Kenali siapa saya dan apa yang saya sukai</p>
        </div>

        <div className="about-content">
          <div className="about-image">
            <div className="about-image-frame">
              {profile?.photoUrl ? (
                <img src={profile.photoUrl} alt={profile?.name || 'Foto profil'} />
              ) : (
                '📸'
              )}
            </div>
          </div>

          <div>
            <p className="about-bio">
              {profile?.bio || 'Tuliskan biografi Anda di sini. Ceritakan latar belakang, pengalaman, dan minat Anda dalam menciptakan pengalaman digital.'}
            </p>

            <div className="about-stats">
              <div className="stat-card glass">
                <div className="stat-number gradient-text">5+</div>
                <div className="stat-label">Tahun Pengalaman</div>
              </div>
              <div className="stat-card glass">
                <div className="stat-number gradient-text">10+</div>
                <div className="stat-label">Proyek Selesai</div>
              </div>
              <div className="stat-card glass">
                <div className="stat-number gradient-text">6</div>
                <div className="stat-label">Kategori Keahlian</div>
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
