'use client';

import { useState, useMemo, useRef, useLayoutEffect } from 'react';
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

function ProjectCards({ projects, onSelect, emptyMessage, carousel = false }) {
  const carouselRef = useRef(null);
  const trackRef = useRef(null);
  const dragRef = useRef({ active: false, startX: 0, startScrollLeft: 0 });
  const suppressClickRef = useRef(false);
  const [loopCopies, setLoopCopies] = useState(5);

  useLayoutEffect(() => {
    const viewport = carouselRef.current;
    const track = trackRef.current;
    if (!carousel || !viewport || !track || projects.length === 0) return;

    const firstGroup = track.children[0];
    const groupWidth = firstGroup?.getBoundingClientRect().width;
    if (!groupWidth) return;

    const requiredCopies = Math.max(5, Math.ceil(viewport.clientWidth / groupWidth) + 4);
    if (requiredCopies !== loopCopies) {
      setLoopCopies(requiredCopies);
      return;
    }

    viewport.scrollLeft = (groupWidth * loopCopies - viewport.clientWidth) / 2;
  }, [carousel, projects, loopCopies]);

  const normalizeScroll = () => {
    const viewport = carouselRef.current;
    const track = trackRef.current;
    const groupWidth = track?.children[0]?.getBoundingClientRect().width;
    if (!viewport || !groupWidth) return;

    const lowerBoundary = groupWidth;
    const upperBoundary = groupWidth * (loopCopies - 1) - viewport.clientWidth;
    if (viewport.scrollLeft < lowerBoundary) viewport.scrollLeft += groupWidth;
    else if (viewport.scrollLeft > upperBoundary) viewport.scrollLeft -= groupWidth;
  };

  const handlePointerDown = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    dragRef.current = {
      active: true,
      startX: event.clientX,
      lastX: event.clientX,
    };
    if (event.target.setPointerCapture) event.target.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!dragRef.current.active) return;
    const delta = event.clientX - dragRef.current.lastX;
    if (Math.abs(event.clientX - dragRef.current.startX) > 5) suppressClickRef.current = true;
    carouselRef.current.scrollLeft -= delta;
    dragRef.current.lastX = event.clientX;
    normalizeScroll();
  };

  const handlePointerUp = () => {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    if (suppressClickRef.current) {
      window.setTimeout(() => { suppressClickRef.current = false; }, 0);
    }
  };

  if (projects.length === 0) {
    return <div className="projects-empty">{emptyMessage}</div>;
  }

  const renderProjectCard = (project, groupIndex, isLoopCopy) => {
    const thumbnail = project.media?.find((m) => m.mediaType === 'image');
    return (
      <div
        key={`${groupIndex}-${project.id}`}
        className="project-card"
        onClick={(event) => {
          if (isLoopCopy && suppressClickRef.current) {
            event.preventDefault();
            event.stopPropagation();
            return;
          }
          onSelect(project);
        }}
        role="button"
        tabIndex={!isLoopCopy || groupIndex === Math.floor(loopCopies / 2) ? 0 : -1}
        onKeyDown={(event) => event.key === 'Enter' && onSelect(project)}
      >
        <div className="project-card-image">
          {thumbnail ? (
            <img src={thumbnail.mediaUrl} alt={project.title} loading="lazy" draggable="false" />
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
  };

  if (!carousel) {
    return (
      <div className="projects-grid projects-grid-static">
        {projects.map((project, index) => renderProjectCard(project, index, false))}
      </div>
    );
  }

  return (
    <div>
      <div
        ref={carouselRef}
        className="projects-carousel"
        role="region"
        aria-roledescription="carousel"
        aria-label="Project carousel. Drag to explore projects."
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onLostPointerCapture={handlePointerUp}
      >
        <div className="projects-track" ref={trackRef}>
          {Array.from({ length: loopCopies }, (_, groupIndex) => (
            <div
              className="projects-grid"
              key={`project-loop-${groupIndex}`}
              aria-hidden={groupIndex !== Math.floor(loopCopies / 2)}
            >
              {projects.map((project) => renderProjectCard(project, groupIndex, true))}
            </div>
          ))}
        </div>
      </div>
      <p className="carousel-hint" aria-hidden="true">← Hold and drag to explore →</p>
    </div>
  );
}

export default function Projects({ projects }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedProject, setSelectedProject] = useState(null);
  const allProjects = projects || [];
  const mainProjects = allProjects.filter((project) => !project.tag || project.tag === 'mainProject');
  const funProjects = allProjects.filter((project) => project.tag === 'funProject');

  const filteredMainProjects = useMemo(() => {
    if (activeFilter === 'all') return mainProjects;
    return mainProjects.filter((project) => project.category === activeFilter);
  }, [mainProjects, activeFilter]);

  const availableCategories = Object.entries(CATEGORY_LABELS).filter(([key]) =>
    key === 'all' || mainProjects.some((project) => project.category === key)
  );

  return (
    <>
      <section className="projects" id="projects">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              My <span className="gradient-text">Projects</span>
            </h2>
            <p className="section-subtitle">Explore my work across different categories</p>
          </div>

          <div className="filter-tabs">
            {availableCategories.map(([key, label]) => (
              <button
                key={key}
                className={`filter-tab ${activeFilter === key ? 'active' : ''}`}
                onClick={() => setActiveFilter(key)}
              >
                {label}
              </button>
            ))}
          </div>

          <ProjectCards
            projects={filteredMainProjects}
            onSelect={setSelectedProject}
            emptyMessage={mainProjects.length ? 'No projects in this category yet.' : 'Add main projects through the admin panel.'}
          />
        </div>
      </section>

      {funProjects.length > 0 && (
        <section className="projects fun-projects" id="fun-projects">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">
                Fun <span className="gradient-text">Projects</span>
              </h2>
              <p className="section-subtitle">Small experiments and projects made for fun</p>
            </div>
            <ProjectCards
              projects={funProjects}
              onSelect={setSelectedProject}
              emptyMessage="No fun projects yet."
              carousel
            />
          </div>
        </section>
      )}

      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </>
  );
}
