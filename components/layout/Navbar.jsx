'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('#hero');
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (pathname !== '/') return;

    const sectionIds = ['hero', 'about', 'experience', 'skills', 'projects', 'contact'];
    const handleScrollSpy = () => {
      const scrollPosition = window.scrollY + 140;

      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(`#${sectionIds[i]}`);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScrollSpy, { passive: true });
    handleScrollSpy();
    return () => window.removeEventListener('scroll', handleScrollSpy);
  }, [pathname]);

  const links = [
    { href: '#hero', label: 'Beranda' },
    { href: '#about', label: 'Tentang' },
    { href: '#experience', label: 'Pengalaman' },
    { href: '#skills', label: 'Keahlian' },
    { href: '#projects', label: 'Proyek' },
    { href: '#contact', label: 'Kontak' },
  ];

  const handleNavClick = (e, link) => {
    setMenuOpen(false);
    if (link.isPage) {
      return;
    }
    e.preventDefault();
    if (pathname === '/') {
      const target = document.querySelector(link.href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      router.push(`/${link.href}`);
    }
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <Link
          href="/"
          className="nav-logo gradient-text"
          onClick={(e) => {
            if (pathname === '/') {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
        >
          M. Dandi Fadli
        </Link>

        <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
          {links.map((link) => {
            const isActive = link.isPage
              ? pathname === link.href
              : (pathname === '/' && activeSection === link.href);

            return (
              <li key={link.href}>
                <Link
                  href={link.isPage ? link.href : `/${link.href}`}
                  className={`${isActive ? 'active' : ''} ${link.isPage ? 'nav-highlight-link' : ''}`}
                  onClick={(e) => handleNavClick(e, link)}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <button
          className="nav-hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Buka atau tutup menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {menuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: 99,
          }}
          onClick={() => setMenuOpen(false)}
        />
      )}
    </nav>
  );
}
