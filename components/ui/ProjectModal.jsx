'use client';

import { useState, useEffect } from 'react';
import { FaExternalLinkAlt, FaGithub, FaChevronLeft, FaChevronRight, FaTimes, FaCode, FaCube, FaMobileAlt, FaVideo, FaPalette, FaMicrochip, FaFolder } from 'react-icons/fa';

export default function ProjectModal({ project, onClose }) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const mediaItems = project.media || [];
  const videos = mediaItems.filter((item) => item.mediaType === 'video');

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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prevMedia();
      if (e.key === 'ArrowRight') nextMedia();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose, mediaItems.length]);

  const categoryLabels = {
    website: 'Situs Web',
    android: 'Android',
    threeD: 'Desain 3D',
    video: 'Video',
    graphic: 'Desain Grafis',
    hardware: 'Perangkat Keras',
  };
  const categoryLabel = categoryLabels[project.category] || project.category;

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
                <button className="gallery-nav gallery-prev" onClick={prevMedia} aria-label="Media sebelumnya">
                  <FaChevronLeft />
                </button>
                <button className="gallery-nav gallery-next" onClick={nextMedia} aria-label="Media berikutnya">
                  <FaChevronRight />
                </button>
                <span style={{
                  position: 'absolute',
                  bottom: '12px',
                  right: '12px',
                  background: 'rgba(10, 14, 39, 0.75)',
                  backdropFilter: 'blur(4px)',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  fontWeight: 500,
                  pointerEvents: 'none',
                  zIndex: 2,
                }}>
                  {currentMediaIndex + 1} / {mediaItems.length}
                </span>
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
                     <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0e27', fontSize: '1.2rem', color: 'var(--text-muted)' }}>
                       <FaVideo />
                     </div>
                  ) : (
                    <img src={m.mediaUrl} alt={`Pratinjau ${i + 1}`} loading="lazy" decoding="async" />
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      );
    }

    const categoryIcons = {
      website: <FaCode />,
      android: <FaMobileAlt />,
      threeD: <FaCube />,
      video: <FaVideo />,
      graphic: <FaPalette />,
      hardware: <FaMicrochip />,
    };

    return (
      <div className="modal-gallery" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem', color: 'var(--text-muted)' }}>
        {categoryIcons[project.category] || <FaFolder />}
      </div>
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Tutup jendela detail">
          <FaTimes />
        </button>

        {renderMediaSection()}

        <div className="modal-body">
          <span className={`category-badge ${project.category}`} style={{ marginBottom: '12px', display: 'inline-block' }}>
            {categoryLabel}
          </span>
          <h2 className="modal-title">{project.title}</h2>
          <div className="modal-description" style={{ whiteSpace: 'pre-line', lineHeight: '1.7', color: 'var(--text-secondary)' }}>
            {project.description}
          </div>

          {project.techStack?.length > 0 && (
            <div className="modal-tech">
              {project.techStack.map((tech) => (
                <span key={tech} className="tech-tag">{tech}</span>
              ))}
            </div>
          )}

          {/* Project links — accessible for all categories */}
          {(project.projectUrl || project.repoUrl) && (
            <div className="modal-links">
              {project.projectUrl && (
                <a href={project.projectUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                  <FaExternalLinkAlt />{' '}
                  {project.category === 'threeD'
                    ? 'Lihat Model / Demo'
                    : project.category === 'video'
                    ? 'Tonton Video Penuh'
                    : project.category === 'hardware'
                    ? 'Lihat Demo / Skema'
                    : 'Buka Proyek / Demo'}
                </a>
              )}
              {project.repoUrl && (
                <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                  <FaGithub /> Kode Sumber
                </a>
              )}
            </div>
          )}

          {/* Additional gallery links for 3D */}
          {(project.category === 'threeD' || project.category === 'video') && mediaItems.length > 0 && (
            <div style={{ marginTop: '24px' }}>
              <h4 style={{ marginBottom: '12px', fontWeight: 600 }}>Galeri</h4>
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
