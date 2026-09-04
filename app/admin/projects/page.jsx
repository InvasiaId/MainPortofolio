'use client';

import { useState, useEffect, useCallback } from 'react';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaCloudUploadAlt } from 'react-icons/fa';
import Toast from '@/components/ui/Toast';

const CATEGORIES = [
  { value: 'website', label: '🌐 Website' },
  { value: 'android', label: '📱 Android' },
  { value: 'threeD', label: '🎨 3D Design' },
  { value: 'video', label: '🎬 Video' },
  { value: 'graphic', label: '🖼️ Graphic' },
  { value: 'hardware', label: '⚙️ Hardware' },
];

const emptyProject = {
  title: '', category: 'website', description: '', techStack: [],
  projectUrl: '', repoUrl: '', model3dUrl: '', featured: false, displayOrder: 0,
  media: []
};

// Reusable Drag & Drop zone
const Dropzone = ({ type, onUpload, label, accept }) => {
  const [isDrag, setIsDrag] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (file) => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'projects');
    formData.append('fileCategory', type);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        onUpload(data.url);
        // Note: the parent handles the success toast since it manages overall state
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch {
      alert('Network error during upload');
    } finally {
      setLoading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDrag(false);
    handleUpload(e.dataTransfer.files[0]);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDrag(true); }}
      onDragLeave={(e) => { e.preventDefault(); setIsDrag(false); }}
      onDrop={onDrop}
      style={{
        border: `2px dashed ${isDrag ? 'var(--accent)' : 'var(--border-glass)'}`,
        background: isDrag ? 'rgba(214,255,1,0.05)' : 'var(--bg-glass)',
        padding: '24px',
        borderRadius: '12px',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
      }}
    >
      <input 
        type="file" 
        accept={accept} 
        onChange={(e) => handleUpload(e.target.files[0])} 
        style={{ display: 'none' }} 
        id={`upload-${type}`}
      />
      <label htmlFor={`upload-${type}`} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <FaCloudUploadAlt style={{ fontSize: '2rem', color: isDrag ? 'var(--accent)' : 'var(--text-muted)' }} />
        <span style={{ fontSize: '0.9rem', marginTop: '8px', fontWeight: 600, color: 'var(--text-primary)' }}>
          {loading ? 'Uploading...' : label}
        </span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Drag & Drop or Click</span>
      </label>
    </div>
  );
};

export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [editing, setEditing] = useState(null); 
  const [form, setForm] = useState(emptyProject);
  const [techInput, setTechInput] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => setToast({ message, type });

  const fetchProjects = () => {
    fetch('/api/projects').then((r) => r.json()).then(setProjects).catch(() => {});
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleSave = async () => {
    const method = editing === 'new' ? 'POST' : 'PUT';
    
    // Extract new unsaved media (ones without id) to be sent on POST
    const body = editing === 'new' ? form : { id: editing.id, ...form };

    const res = await fetch('/api/projects', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      fetchProjects();
      setEditing(null);
      setForm(emptyProject);
      showToast(method === 'POST' ? 'Project created successfully!' : 'Project updated successfully!');
    } else {
      const err = await res.json();
      showToast(err.error || 'Failed to save project', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this project?')) return;
    const res = await fetch(`/api/projects?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      fetchProjects();
      showToast('Project deleted successfully!');
    } else {
      showToast('Failed to delete project', 'error');
    }
  };

  const handleUploadNewMedia = async (url, type) => {
    if (editing === 'new') {
      setForm({ ...form, media: [...form.media, { mediaUrl: url, mediaType: type }] });
      showToast('Media uploaded! It will be saved when you create the project.');
    } else {
      // For existing project, directly save it to DB
      const res = await fetch('/api/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: editing.id, mediaUrl: url, mediaType: type }),
      });
      if (res.ok) {
        const newMedia = await res.json();
        setForm({ ...form, media: [...form.media, newMedia] });
        fetchProjects();
        showToast('Media added to project successfully!');
      } else {
        showToast('Media uploaded but failed to save to project.', 'error');
      }
    }
  };

  const handleDeleteMedia = async (index, mediaId) => {
    if (editing === 'new' || !mediaId) {
      setForm({ ...form, media: form.media.filter((_, i) => i !== index) });
      showToast('Draft media removed');
    } else {
      const res = await fetch(`/api/media?id=${mediaId}`, { method: 'DELETE' });
      if (res.ok) {
        setForm({ ...form, media: form.media.filter(m => m.id !== mediaId) });
        fetchProjects();
        showToast('Media deleted successfully!');
      } else {
        showToast('Failed to delete media', 'error');
      }
    }
  };

  const addTech = () => {
    if (techInput.trim()) {
      setForm({ ...form, techStack: [...form.techStack, techInput.trim()] });
      setTechInput('');
    }
  };

  const removeTech = (index) => {
    setForm({ ...form, techStack: form.techStack.filter((_, i) => i !== index) });
  };

  const startEdit = (project) => {
    setEditing(project);
    setForm({
      title: project.title,
      category: project.category,
      description: project.description,
      techStack: project.techStack || [],
      projectUrl: project.projectUrl || '',
      repoUrl: project.repoUrl || '',
      model3dUrl: project.model3dUrl || '',
      featured: project.featured,
      displayOrder: project.displayOrder,
      media: project.media || []
    });
  };

  const filtered = filterCat === 'all' ? projects : projects.filter((p) => p.category === filterCat);

  if (editing) {
    return (
      <div>
        <div style={s.formHeader}>
          <h1 style={s.pageTitle}>
            {editing === 'new' ? 'New Project' : 'Edit Project'}
          </h1>
          <button onClick={() => { setEditing(null); setForm(emptyProject); }} style={s.cancelBtn}>
            <FaTimes /> Cancel
          </button>
        </div>

        <div className="glass" style={s.formCard}>
          <div style={s.field}>
            <label style={s.label}>Title *</label>
            <input style={s.input} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>

          <div style={s.field}>
            <label style={s.label}>Category *</label>
            <select style={s.input} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          <div style={s.field}>
            <label style={s.label}>Description</label>
            <textarea style={{ ...s.input, minHeight: '120px' }} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          <div style={s.field}>
            <label style={s.label}>Tech Stack</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input style={{ ...s.input, flex: 1 }} value={techInput} onChange={(e) => setTechInput(e.target.value)} placeholder="Add technology..." onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTech())} />
              <button onClick={addTech} className="btn btn-outline" style={{ padding: '8px 16px' }}>Add</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
              {form.techStack.map((tech, i) => (
                <span key={i} className="tech-tag" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => removeTech(i)}>
                  {tech} <FaTimes style={{ fontSize: '0.6rem' }} />
                </span>
              ))}
            </div>
          </div>

          {(form.category === 'website' || form.category === 'android') && (
            <>
              <div style={s.field}>
                <label style={s.label}>Project URL</label>
                <input style={s.input} value={form.projectUrl} onChange={(e) => setForm({ ...form, projectUrl: e.target.value })} placeholder="https://..." />
              </div>
              <div style={s.field}>
                <label style={s.label}>Repository URL</label>
                <input style={s.input} value={form.repoUrl} onChange={(e) => setForm({ ...form, repoUrl: e.target.value })} placeholder="https://github.com/..." />
              </div>
            </>
          )}

          {form.category === 'threeD' && (
            <div style={s.field}>
              <label style={s.label}>3D Model Upload (.glb/.gltf)</label>
              {form.model3dUrl ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', background: 'rgba(214,255,1,0.05)', border: '1px solid var(--accent)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.85rem' }}>3D Model Uploaded</span>
                    <button onClick={() => setForm({ ...form, model3dUrl: '' })} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><FaTimes /></button>
                  </div>
                  <div style={{ width: '100%', height: '200px', borderRadius: '8px', overflow: 'hidden', background: '#0a0e27' }}>
                    <model-viewer src={form.model3dUrl} auto-rotate camera-controls style={{ width: '100%', height: '100%' }}></model-viewer>
                  </div>
                </div>
              ) : (
                <Dropzone type="model" label="Upload 3D Model (.glb, .gltf)" accept=".glb,.gltf" onUpload={(url) => setForm({ ...form, model3dUrl: url })} />
              )}
            </div>
          )}

          <div style={{ ...s.field, flexDirection: 'row', alignItems: 'center', gap: '12px' }}>
            <input type="checkbox" id="featured" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
            <label htmlFor="featured" style={{ ...s.label, marginBottom: 0 }}>Featured Project</label>
          </div>

          <div style={s.field}>
            <label style={s.label}>Display Order</label>
            <input type="number" style={s.input} value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: parseInt(e.target.value) || 0 })} />
          </div>

          {/* Media Upload available for ALL states (new & existing) */}
          <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border-glass)' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '16px' }}>Photos & Videos Gallery</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <Dropzone type="image" label="Upload Photo" accept="image/*" onUpload={(url) => handleUploadNewMedia(url, 'image')} />
              <Dropzone type="video" label="Upload Video" accept="video/mp4,video/webm" onUpload={(url) => handleUploadNewMedia(url, 'video')} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
              {(form.media || []).map((m, i) => (
                <div key={m.id || i} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-glass)' }}>
                  {m.mediaType === 'image' ? (
                     <img src={m.mediaUrl} alt="" style={{ width: '100%', height: '100px', objectFit: 'cover' }} />
                  ) : (
                     <video src={m.mediaUrl} style={{ width: '100%', height: '100px', objectFit: 'cover', background: 'black' }} />
                  )}
                  <button onClick={() => handleDeleteMedia(i, m.id)} style={{ position: 'absolute', top: '4px', right: '4px', width: '24px', height: '24px', borderRadius: '50%', border: 'none', background: 'rgba(239,68,68,0.8)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem' }}>
                    <FaTimes />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button onClick={handleSave} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '16px' }}>
            {editing === 'new' ? 'Create Project' : 'Save Changes'}
          </button>
        </div>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    );
  }

  // === LIST VIEW ===
  return (
    <div>
      <div style={s.formHeader}>
        <h1 style={s.pageTitle}><span className="gradient-text">Projects</span></h1>
        <button onClick={() => { setEditing('new'); setForm(emptyProject); }} className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
          <FaPlus /> New Project
        </button>
      </div>

      <div style={{ display: 'flex', gap: '6px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button className={`filter-tab ${filterCat === 'all' ? 'active' : ''}`} onClick={() => setFilterCat('all')} style={{ fontSize: '0.8rem', padding: '6px 16px' }}>All ({projects.length})</button>
        {CATEGORIES.map((c) => {
          const count = projects.filter((p) => p.category === c.value).length;
          return <button key={c.value} className={`filter-tab ${filterCat === c.value ? 'active' : ''}`} onClick={() => setFilterCat(c.value)} style={{ fontSize: '0.8rem', padding: '6px 16px' }}>{c.label} ({count})</button>;
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="glass" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No projects yet. Click "New Project" to add one.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map((project) => (
            <div key={project.id} className="glass" style={s.projectRow}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                <div style={{ width: '60px', height: '45px', borderRadius: '8px', overflow: 'hidden', background: 'var(--bg-primary)', flexShrink: 0 }}>
                  {project.media?.[0] ? (
                    project.media[0].mediaType === 'image' ? (
                      <img src={project.media[0].mediaUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: 'var(--text-muted)' }}>🎬</div>
                    )
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>📁</div>
                  )}
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>{project.title}</div>
                  <span className={`category-badge ${project.category}`} style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
                    {project.category === 'threeD' ? '3D' : project.category}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => startEdit(project)} style={s.actionBtn}><FaEdit /></button>
                <button onClick={() => handleDelete(project.id)} style={{ ...s.actionBtn, color: '#ef4444' }}><FaTrash /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

const s = {
  pageTitle: { fontSize: '1.8rem', fontWeight: 800 },
  formHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' },
  cancelBtn: { display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: '1px solid var(--border-glass)', color: 'var(--text-secondary)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'var(--font-main)', fontSize: '0.85rem' },
  formCard: { padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' },
  field: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: '0.85rem', fontWeight: 500, marginBottom: '8px', color: 'var(--text-secondary)' },
  input: { padding: '12px 16px', background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: 'var(--text-primary)', fontFamily: 'var(--font-main)', fontSize: '0.9rem', outline: 'none' },
  projectRow: { padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  actionBtn: { background: 'none', border: '1px solid var(--border-glass)', color: 'var(--text-secondary)', width: '36px', height: '36px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
};
