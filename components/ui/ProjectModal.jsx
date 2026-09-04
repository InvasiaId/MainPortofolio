'use client';

import { useState, useEffect } from 'react';
import { FaExternalLinkAlt, FaGithub, FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa';

export default function ProjectModal({ project, onClose }) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const mediaItems = project.media || [];

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const nextMedia = () => {
    if (mediaItems.length > 0) {
      setCurrentMediaIndex((prev) => (prev + 1) % mediaItems.length);
    }
  };

  const prevMedia = () => {
    if (mediaItems.length > 0) {
      setCurrentMediaIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length);
    }
  };

  const categoryLabel = project.category === 'threeD' ? '3D Design' : project.category;

  const renderMediaSection = () => {
    // 3D Design: Model Viewer
    if (project.category === 'threeD' && project.model3dUrl) {
      return (
        <div className="model-viewer-container">
          <model-viewer
            src={project.model3dUrl}
            alt={project.title}
            auto-rotate
            camera-controls
            shadow-intensity="1"
            style={{ width: '100%', height: '100%', background: '#0a0e27' }}
          />
        </div>
      );
    }

    // Video: Embedded player
    if (project.category === 'video' && videos.length > 0) {
      const videoUrl = videos[0].mediaUrl;
      const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');

      return (
        <div className="video-container">
          {isYouTube ? (
            <iframe
              src={videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')}
              title={project.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video controls>
              <source src={videoUrl} type="video/mp4" />
            </video>
          )}
        </div>
      );
    }

    // All others: Mixed Media Gallery
    if (mediaItems.length > 0) {
      const activeMedia = mediaItems[currentMediaIndex];
      return (
        <>
          <div className="modal-gallery">
            {activeMedia?.mediaType === 'video' ? (
              <video src={activeMedia.mediaUrl} controls autoPlay loop style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              <img
                src={activeMedia?.mediaUrl}
                alt={`${project.title} - ${currentMediaIndex + 1}`}
              />
            )}
            {mediaItems.length > 1 && (
              <>
                <button className="gallery-nav gallery-prev" onClick={prevMedia} aria-label="Previous media">
                  <FaChevronLeft />
                </button>
                <button className="gallery-nav gallery-next" onClick={nextMedia} aria-label="Next media">
                  <FaChevronRight />
                </button>
              </>
            )}
          </div>
          {mediaItems.length > 1 && (
            <div className="gallery-thumbnails">
              {mediaItems.map((m, i) => (
                <div
                  key={m.id || i}
                  className={`gallery-thumb ${i === currentMediaIndex ? 'active' : ''}`}
                  onClick={() => setCurrentMediaIndex(i)}
                >
                  {m.mediaType === 'video' ? (
                     <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0e27', fontSize: '1.2rem' }}>🎬</div>
                  ) : (
                    <img src={m.mediaUrl} alt={`Thumbnail ${i + 1}`} />
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      );
    }

    return (
      <div className="modal-gallery" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', color: 'var(--text-muted)' }}>
        {project.category === 'website' ? '🌐' : project.category === 'android' ? '📱' : project.category === 'threeD' ? '🎨' : project.category === 'video' ? '🎬' : project.category === 'graphic' ? '🖼️' : '⚙️'}
      </div>
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          <FaTimes />
        </button>

        {renderMediaSection()}

        <div className="modal-body">
          <span className={`category-badge ${project.category}`} style={{ marginBottom: '12px', display: 'inline-block' }}>
            {categoryLabel}
          </span>
          <h2 className="modal-title">{project.title}</h2>
          <p className="modal-description">{project.description}</p>

          {project.techStack?.length > 0 && (
            <div className="modal-tech">
              {project.techStack.map((tech) => (
                <span key={tech} className="tech-tag">{tech}</span>
              ))}
            </div>
          )}

          {/* Project links — only for website & android */}
          {(project.category === 'website' || project.category === 'android') && (
            <div className="modal-links">
              {project.projectUrl && (
                <a href={project.projectUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                  <FaExternalLinkAlt /> Live Project
                </a>
              )}
              {project.repoUrl && (
                <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                  <FaGithub /> Source Code
                </a>
              )}
            </div>
          )}

          {/* Additional gallery links for 3D */}
          {(project.category === 'threeD' || project.category === 'video') && mediaItems.length > 0 && (
            <div style={{ marginTop: '24px' }}>
              <h4 style={{ marginBottom: '12px', fontWeight: 600 }}>Gallery</h4>
              <div className="gallery-thumbnails" style={{ background: 'transparent', padding: 0, gap: '12px' }}>
                {mediaItems.map((m, i) => (
                  <div key={m.id || i} className="gallery-thumb" style={{ width: '120px', height: '80px', borderRadius: '8px' }}>
                    {m.mediaType === 'video' ? (
                       <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0e27' }}>🎬 Video</div>
                    ) : (
                      <img src={m.mediaUrl} alt={`Gallery ${i + 1}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
