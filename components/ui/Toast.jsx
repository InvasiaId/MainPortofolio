import { useEffect, useState } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaTimes } from 'react-icons/fa';

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      const showTimer = setTimeout(() => setIsVisible(true), 0);
      const hideTimer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for transition before fully unmounting
      }, duration);
      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [message, duration, onClose]);

  if (!message) return null;

  const bg = type === 'success' ? '#10b981' : '#ef4444';
  const Icon = type === 'success' ? FaCheckCircle : FaExclamationCircle;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      background: 'var(--bg-secondary)',
      border: `1px solid ${bg}`,
      borderRadius: '8px',
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
      transform: isVisible ? 'translateY(0)' : 'translateY(100px)',
      opacity: isVisible ? 1 : 0,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      zIndex: 9999,
      fontFamily: 'var(--font-main)'
    }}>
      <Icon style={{ color: bg, fontSize: '1.2rem' }} />
      <span style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 500 }}>
        {message}
      </span>
      <button aria-label="Tutup notifikasi" onClick={() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }} style={{
        background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '8px'
      }}>
        <FaTimes />
      </button>
    </div>
  );
}
