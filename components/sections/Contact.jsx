'use client';

import { useState } from 'react';
import { FaLinkedin, FaGithub, FaDribbble, FaInstagram, FaTiktok } from 'react-icons/fa';
import { rateLimit } from '@/lib/sanitize';

const SOCIAL_ICONS = {
  linkedin: FaLinkedin,
  github: FaGithub,
  dribbble: FaDribbble,
  instagram: FaInstagram,
  tiktok: FaTiktok,
};

export default function Contact({ socialLinks }) {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      setStatus('Please fill in all fields.');
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
        setStatus(data.error || 'Failed to send message. Please try again.');
      }
    } catch {
      setStatus('Network error. Please try again.');
    }
  };

  return (
    <section className="contact" id="contact">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">
            Get In <span className="gradient-text">Touch</span>
          </h2>
          <p className="section-subtitle">Have a project in mind? Let&apos;s work together</p>
        </div>

        <div className="contact-grid">
          <div className="contact-info">
            <h3>Let&apos;s Connect</h3>
            <p>
              Feel free to reach out for collaborations, freelance work, or just a friendly chat.
              I&apos;m always open to discussing new projects and creative ideas.
            </p>

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
              <label htmlFor="contact-name">Name</label>
              <input
                id="contact-name"
                type="text"
                placeholder="Your Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="contact-email">Email</label>
              <input
                id="contact-email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="contact-message">Message</label>
              <textarea
                id="contact-message"
                placeholder="Tell me about your project..."
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
              {status === 'sending' ? 'Sending...' : status === 'sent' ? '✅ Sent!' : 'Send Message'}
            </button>

            {status && status !== 'sending' && status !== 'sent' && (
              <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '8px' }}>{status}</p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
