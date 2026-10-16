'use client';

import { useState } from 'react';
import { FaLinkedin, FaGithub, FaDribbble, FaInstagram, FaTiktok, FaWhatsapp } from 'react-icons/fa';

const SOCIAL_ICONS = {
  linkedin: FaLinkedin,
  github: FaGithub,
  dribbble: FaDribbble,
  instagram: FaInstagram,
  tiktok: FaTiktok,
  whatsapp: FaWhatsapp,
};

export default function Contact({ socialLinks, profile }) {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const name = formData.name.trim();
    const email = formData.email.trim();
    const message = formData.message.trim();

    if (!name || !email || !message) {
      setStatus('Mohon lengkapi semua kolom.');
      return;
    }

    setStatus('sending');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus('sent');
        setFormData({ name: '', email: '', message: '' });
        setTimeout(() => setStatus(''), 5000);
      } else {
        const data = await res.json();
        setStatus(data.error || 'Pesan gagal dikirim. Silakan coba lagi.');
      }
    } catch {
      setStatus('Terjadi kesalahan jaringan. Silakan coba lagi.');
    }
  };

  return (
    <section className="contact" id="contact">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">
            Hubungi <span className="gradient-text">Saya</span>
          </h2>
          <p className="section-subtitle">Punya tawaran proyek, peluang kerja sama, atau sekadar ingin berdiskusi? Silakan hubungi saya.</p>
        </div>

        <div className="contact-grid">
          <div className="contact-info">
            <h3>Kontak Langsung</h3>
            <p>
              Saya selalu terbuka untuk peluang kerja sama baru—baik posisi full-time, magang, maupun proyek freelance.
              Kirimkan pesan melalui formulir di samping, atau hubungi saya langsung melalui WhatsApp dan media sosial di bawah ini.
            </p>

            {profile?.whatsappNumber && (
              <div style={{ marginTop: '20px', marginBottom: '24px' }}>
                <a
                  href={`https://wa.me/${profile.whatsappNumber.replace(/[^0-9]/g, '')}?text=Halo%20Dandi,%20saya%20melihat%20portofolio%20Anda%20dan%20tertarik%20untuk%20berdiskusi.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    borderColor: '#25D366',
                    color: '#25D366',
                    padding: '10px 18px',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 600,
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <FaWhatsapp style={{ fontSize: '1.25rem' }} /> Chat via WhatsApp
                </a>
              </div>
            )}

            {socialLinks && socialLinks.length > 0 && (
              <div className="contact-socials">
                {socialLinks.map((link) => {
                  const Icon = SOCIAL_ICONS[link.platform] || FaGithub;
                  return (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={link.platform}
                    >
                      <Icon />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          <form className="contact-form glass" style={{ padding: '32px' }} onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="contact-name">Nama</label>
              <input
                id="contact-name"
                type="text"
                placeholder="Nama Kamu"
                maxLength={100}
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="contact-email">Email</label>
              <input
                id="contact-email"
                type="email"
                placeholder="namakamu@email.com"
                maxLength={150}
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="contact-message">Pesan</label>
              <textarea
                id="contact-message"
                placeholder="Ceritakan tentang proyekmu..."
                maxLength={3000}
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              disabled={status === 'sending'}
            >
              {status === 'sending' ? 'Mengirim...' : status === 'sent' ? '✅ Terkirim!' : 'Kirim Pesan'}
            </button>

            {status === 'sent' && (
              <div style={{ marginTop: '14px', padding: '12px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981', fontSize: '0.9rem', textAlign: 'center' }}>
                🎉 Pesan berhasil terkirim! Terima kasih telah menghubungi saya.
              </div>
            )}

            {status && status !== 'sending' && status !== 'sent' && (
              <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '8px' }}>{status}</p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
