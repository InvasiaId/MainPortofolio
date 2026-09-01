'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { FaHome, FaProjectDiagram, FaUser, FaChartBar, FaSignOutAlt } from 'react-icons/fa';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: FaHome },
  { href: '/admin/projects', label: 'Projects', icon: FaProjectDiagram },
  { href: '/admin/profile', label: 'Profile', icon: FaUser },
  { href: '/admin/monitoring', label: 'Monitoring', icon: FaChartBar },
];

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pathname === '/admin/login') {
      setLoading(false);
      setAuthenticated(false);
      return;
    }

    fetch('/api/auth')
      .then((res) => {
        if (!res.ok) {
          router.push('/admin/login');
          return;
        }
        setAuthenticated(true);
      })
      .catch(() => router.push('/admin/login'))
      .finally(() => setLoading(false));
  }, [pathname, router]);

  if (pathname === '/admin/login') return children;

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <div className="skeleton" style={{ width: 200, height: 30, borderRadius: 8 }} />
      </div>
    );
  }

  if (!authenticated) return null;

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    router.push('/admin/login');
  };

  return (
    <div style={styles.layout}>
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <Link href="/" className="gradient-text" style={styles.logo}>Portfolio</Link>
          <span style={styles.adminBadge}>Admin</span>
        </div>

        <nav style={styles.nav}>
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  ...styles.navItem,
                  ...(active ? styles.navItemActive : {}),
                }}
              >
                <item.icon style={{ fontSize: '1.1rem' }} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button onClick={handleLogout} style={styles.logoutBtn}>
          <FaSignOutAlt />
          Logout
        </button>
      </aside>

      <main style={styles.main}>
        {children}
      </main>
    </div>
  );
}

const styles = {
  loadingPage: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-primary)',
  },
  layout: {
    display: 'flex',
    minHeight: '100vh',
    background: 'var(--bg-primary)',
  },
  sidebar: {
    width: '260px',
    background: 'var(--bg-secondary)',
    borderRight: '1px solid var(--border-glass)',
    padding: '24px 16px',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 50,
  },
  sidebarHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '40px',
    paddingLeft: '12px',
  },
  logo: {
    fontSize: '1.3rem',
    fontWeight: 800,
    textDecoration: 'none',
  },
  adminBadge: {
    padding: '2px 10px',
    borderRadius: '20px',
    fontSize: '0.7rem',
    fontWeight: 600,
    background: 'var(--gradient-main)',
    color: 'white',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: 500,
    transition: 'all 0.2s ease',
  },
  navItemActive: {
    background: 'var(--gradient-subtle)',
    color: 'var(--accent-purple)',
    fontWeight: 600,
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: 'var(--radius-md)',
    background: 'none',
    border: '1px solid var(--border-glass)',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontFamily: 'var(--font-main)',
    transition: 'all 0.2s ease',
  },
  main: {
    flex: 1,
    marginLeft: '260px',
    padding: '32px',
    minHeight: '100vh',
  },
};
