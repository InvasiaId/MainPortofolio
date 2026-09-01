'use client';

import { useState, useEffect } from 'react';
import { FaExternalLinkAlt, FaGithub, FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa';

export default function ProjectModal({ project, onClose }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = (project.media || []).filter((m) => m.mediaType === 'image');
  const videos = (project.media || []).filter((m) => m.mediaType === 'video');

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

  const nextImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
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

    // All others: Image Gallery
    if (images.length > 0) {
      return (
        <>
          <div className="modal-gallery">
            <img
              src={images[currentImageIndex]?.mediaUrl}
              alt={`${project.title} - ${currentImageIndex + 1}`}
            />
            {images.length > 1 && (
              <>
                <button className="gallery-nav gallery-prev" onClick={prevImage} aria-label="Previous image">
                  <FaChevronLeft />
                </button>
                <button className="gallery-nav gallery-next" onClick={nextImage} aria-label="Next image">
                  <FaChevronRight />
                </button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="gallery-thumbnails">
              {images.map((img, i) => (
                <div
                  key={img.id}
                  className={`gallery-thumb ${i === currentImageIndex ? 'active' : ''}`}
                  onClick={() => setCurrentImageIndex(i)}
                >
                  <img src={img.mediaUrl} alt={`Thumbnail ${i + 1}`} />
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

          {/* Additional images for 3D/video categories */}
          {(project.category === 'threeD' || project.category === 'video') && images.length > 0 && (
            <div style={{ marginTop: '24px' }}>
              <h4 style={{ marginBottom: '12px', fontWeight: 600 }}>Gallery</h4>
              <div className="gallery-thumbnails" style={{ background: 'transparent', padding: 0, gap: '12px' }}>
                {images.map((img, i) => (
                  <div key={img.id} className="gallery-thumb" style={{ width: '120px', height: '80px', borderRadius: '8px' }}>
                    <img src={img.mediaUrl} alt={`Gallery ${i + 1}`} />
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
