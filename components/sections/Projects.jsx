'use client';

import { useState, useMemo } from 'react';
import ProjectModal from '@/components/ui/ProjectModal';

const CATEGORY_LABELS = {
  all: '🎯 All',
  website: '🌐 Website',
  android: '📱 Android',
  threeD: '🎨 3D Design',
  video: '🎬 Video',
  graphic: '🖼️ Graphic',
  hardware: '⚙️ Hardware',
};

const CATEGORY_ICONS = {
  website: '🌐',
  android: '📱',
  threeD: '🎨',
  video: '🎬',
  graphic: '🖼️',
  hardware: '⚙️',
};

export default function Projects({ projects }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedProject, setSelectedProject] = useState(null);

  const filtered = useMemo(() => {
    if (activeFilter === 'all') return projects || [];
    return (projects || []).filter((p) => p.category === activeFilter);
  }, [projects, activeFilter]);

  return (
    <section className="projects" id="projects">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">
            My <span className="gradient-text">Projects</span>
          </h2>
          <p className="section-subtitle">Explore my work across different categories</p>
        </div>

        <div className="filter-tabs">
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <button
              key={key}
              className={`filter-tab ${activeFilter === key ? 'active' : ''}`}
              onClick={() => setActiveFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="projects-grid">
          {filtered.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              {projects?.length ? 'No projects in this category yet.' : 'Add projects through the admin panel.'}
            </div>
          ) : (
            filtered.map((project) => {
              const thumbnail = project.media?.find((m) => m.mediaType === 'image');
              return (
                <div
                  key={project.id}
                  className="project-card"
                  onClick={() => setSelectedProject(project)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setSelectedProject(project)}
                >
                  <div className="project-card-image">
                    {thumbnail ? (
                      <img src={thumbnail.mediaUrl} alt={project.title} loading="lazy" />
                    ) : (
                      <div className="project-card-image-placeholder">
                        {CATEGORY_ICONS[project.category] || '📁'}
                      </div>
                    )}
                    <div className="project-card-overlay">
                      <span className={`category-badge ${project.category}`}>
                        {project.category === 'threeD' ? '3D Design' : project.category}
                      </span>
                    </div>
                  </div>
                  <div className="project-card-body">
                    <h3 className="project-card-title">{project.title}</h3>
                    <p className="project-card-desc">{project.description}</p>
                    {project.techStack?.length > 0 && (
                      <div className="project-card-tech">
                        {project.techStack.slice(0, 4).map((tech) => (
                          <span key={tech} className="tech-tag">{tech}</span>
                        ))}
                        {project.techStack.length > 4 && (
                          <span className="tech-tag">+{project.techStack.length - 4}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </section>
  );
}
