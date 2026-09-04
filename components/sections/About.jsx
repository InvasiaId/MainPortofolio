'use client';

import { useRef, useEffect } from 'react';

export default function About({ profile }) {
  const ref = useRef(null);

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
            About <span className="gradient-text">Me</span>
          </h2>
          <p className="section-subtitle">Get to know who I am and what drives me</p>
        </div>

        <div className="about-content">
          <div className="about-image">
            <div className="about-image-frame">
              {profile?.photoUrl ? (
                <img src={profile.photoUrl} alt={profile?.name || 'About photo'} />
              ) : (
                '📸'
              )}
            </div>
          </div>

          <div>
            <p className="about-bio">
              {profile?.bio || 'Write your bio here. Tell visitors about your background, experience, and passion for creating amazing digital experiences.'}
            </p>

            <div className="about-stats">
              <div className="stat-card glass">
                <div className="stat-number gradient-text">5+</div>
                <div className="stat-label">Years Experience</div>
              </div>
              <div className="stat-card glass">
                <div className="stat-number gradient-text">10+</div>
                <div className="stat-label">Projects Complete</div>
              </div>
              <div className="stat-card glass">
                <div className="stat-number gradient-text">6</div>
                <div className="stat-label">Skill Categories</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
