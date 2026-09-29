'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Gagal masuk.');
        setLoading(false);
        return;
      }

      router.push('/admin');
    } catch {
      setError('Terjadi kesalahan jaringan. Silakan coba lagi.');
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>
          <span className="gradient-text">Admin</span> Masuk
        </h1>
        <p style={styles.subtitle}>Masuk untuk mengelola portofolio Anda.</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="form-group">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@contoh.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Kata Sandi</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={loading}
          >
            {loading ? 'Sedang masuk...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    background: 'var(--bg-primary)',
  },
  card: {
    maxWidth: '420px',
    width: '100%',
    padding: '40px',
    background: 'var(--bg-glass)',
    backdropFilter: 'blur(20px)',
    border: '1px solid var(--border-glass)',
    borderRadius: 'var(--radius-xl)',
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: 800,
    marginBottom: '8px',
  },
  subtitle: {
    color: 'var(--text-secondary)',
    marginBottom: '32px',
    fontSize: '0.9rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  error: {
    color: '#ef4444',
    fontSize: '0.85rem',
    padding: '10px 14px',
    background: 'rgba(239, 68, 68, 0.1)',
    borderRadius: '8px',
    border: '1px solid rgba(239, 68, 68, 0.2)',
  },
};
