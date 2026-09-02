'use client';

import { useEffect, useRef } from 'react';
import { FaLinkedin, FaGithub, FaDribbble, FaInstagram, FaTiktok } from 'react-icons/fa';

const SOCIAL_ICONS = {
  linkedin: FaLinkedin,
  github: FaGithub,
  dribbble: FaDribbble,
  instagram: FaInstagram,
  tiktok: FaTiktok,
};

function ParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let particles = [];
    let mouse = { x: null, y: null };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticles = () => {
      particles = [];
      const count = Math.floor((canvas.width * canvas.height) / 15000);
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 2 + 1,
          opacity: Math.random() * 0.5 + 0.1,
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        // Mouse interaction
        if (mouse.x !== null) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            p.x += dx * 0.01;
            p.y += dy * 0.01;
          }
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(214, 255, 1, ${p.opacity})`;
        ctx.fill();

        // Connect nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const dx = p.x - particles[j].x;
          const dy = p.y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(214, 255, 1, ${0.1 * (1 - dist / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    const handleMouse = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener('resize', resize);
    canvas.addEventListener('mousemove', handleMouse);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    resize();
    createParticles();
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleMouse);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-canvas" />;
}

export default function Hero({ profile, socialLinks }) {
  return (
    <section className="hero" id="hero">
      <ParticleCanvas />
      <div className="container">
        <div className="hero-content">
          <div className="hero-text">
            <p className="hero-greeting">👋 Hello, I&apos;m</p>
            <h1 className="hero-name">
              <span className="gradient-text">{profile?.name || 'Your Name'}</span>
            </h1>
            <p className="hero-tagline">
              {profile?.tagline || 'Full-Stack Developer & Designer'}
            </p>
            <div className="hero-buttons">
              <a href="#projects" className="btn btn-primary">
                View My Work
              </a>
              <a href="#contact" className="btn btn-outline">
                Contact Me
              </a>
            </div>
            {socialLinks && socialLinks.length > 0 && (
              <div className="hero-socials">
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
          <div className="hero-image">
            <div className="hero-image-wrapper">
              {profile?.photoUrl ? (
                <img src={profile.photoUrl} alt={profile.name || 'Profile'} />
              ) : (
                <div className="hero-image-placeholder">👤</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
