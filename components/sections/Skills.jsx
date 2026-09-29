'use client';

import { useEffect, useRef } from 'react';

export default function Skills({ skills }) {
  const gridRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.skill-bar-fill').forEach((bar) => {
            bar.style.width = bar.dataset.width;
            bar.classList.add('animated');
          });
          entry.target.classList.add('visible');
        }
      },
      { threshold: 0.2 }
    );
    if (gridRef.current) observer.observe(gridRef.current);
    return () => observer.disconnect();
  }, [skills]);

  const groupedSkills = {};
  (skills || []).forEach((skill) => {
    const cat = skill.category || 'General';
    if (!groupedSkills[cat]) groupedSkills[cat] = [];
    groupedSkills[cat].push(skill);
  });

  if (!skills || skills.length === 0) {
    return (
      <section className="skills" id="skills">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              <span className="gradient-text">Keahlian</span> Saya
            </h2>
            <p className="section-subtitle">Tambahkan keahlian melalui panel admin.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="skills" id="skills">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">
            <span className="gradient-text">Keahlian</span> Saya
          </h2>
          <p className="section-subtitle">Teknologi dan alat yang saya gunakan</p>
        </div>

        <div className="skills-grid reveal" ref={gridRef}>
          {skills.map((skill) => (
            <div key={skill.id} className="skill-card glass">
              <div className="skill-header">
                <div className="skill-name">
                  {skill.name}
                </div>
                <span className="skill-percentage">{skill.proficiency}%</span>
              </div>
              <div className="skill-bar">
                <div
                  className="skill-bar-fill"
                  data-width={`${skill.proficiency}%`}
                  style={{ width: '0%' }}
                />
              </div>
              <span className="skill-category-tag">{skill.category}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
