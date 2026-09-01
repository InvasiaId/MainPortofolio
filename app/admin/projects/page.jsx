'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaUpload } from 'react-icons/fa';

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
};

export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [editing, setEditing] = useState(null); // null = list, 'new' = create, object = edit
  const [form, setForm] = useState(emptyProject);
  const [techInput, setTechInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [filterCat, setFilterCat] = useState('all');

  const fetchProjects = () => {
    fetch('/api/projects').then((r) => r.json()).then(setProjects).catch(() => {});
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleSave = async () => {
    const method = editing === 'new' ? 'POST' : 'PUT';
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
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this project?')) return;
    await fetch(`/api/projects?id=${id}`, { method: 'DELETE' });
    fetchProjects();
  };

  const handleUploadMedia = async (file, type = 'image') => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'projects');
    formData.append('fileCategory', type);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok && data.url && editing && editing !== 'new') {
        await fetch('/api/media', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectId: editing.id, mediaUrl: data.url, mediaType: type }),
        });
        fetchProjects();
        setEditing((prev) => {
          const updated = projects.find((p) => p.id === prev.id);
          return updated || prev;
        });
      }
      return data.url;
    } catch {
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMedia = async (mediaId) => {
    await fetch(`/api/media?id=${mediaId}`, { method: 'DELETE' });
    fetchProjects();
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
    });
  };

  const filtered = filterCat === 'all' ? projects : projects.filter((p) => p.category === filterCat);

  // === FORM VIEW ===
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
              <label style={s.label}>3D Model URL (.glb/.gltf)</label>
              <input style={s.input} value={form.model3dUrl} onChange={(e) => setForm({ ...form, model3dUrl: e.target.value })} placeholder="URL or upload..." />
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

          <button onClick={handleSave} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '16px' }}>
            {editing === 'new' ? 'Create Project' : 'Save Changes'}
          </button>

          {/* Media Upload (only available after project is created) */}
          {editing !== 'new' && (
            <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border-glass)' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '16px' }}>Media</h3>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <label className="btn btn-outline" style={{ cursor: 'pointer', padding: '8px 16px', fontSize: '0.85rem' }}>
                  <FaUpload /> Upload Image
                  <input type="file" accept="image/*" hidden onChange={(e) => e.target.files[0] && handleUploadMedia(e.target.files[0], 'image')} />
                </label>
                <label className="btn btn-outline" style={{ cursor: 'pointer', padding: '8px 16px', fontSize: '0.85rem' }}>
                  <FaUpload /> Upload Video
                  <input type="file" accept="video/*" hidden onChange={(e) => e.target.files[0] && handleUploadMedia(e.target.files[0], 'video')} />
                </label>
              </div>
              {uploading && <p style={{ color: 'var(--accent-purple)', fontSize: '0.85rem' }}>Uploading...</p>}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px' }}>
                {(editing.media || []).map((m) => (
                  <div key={m.id} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-glass)' }}>
                    {m.mediaType === 'image' ? (
                      <img src={m.mediaUrl} alt="" style={{ width: '100%', height: '80px', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', color: 'var(--text-muted)' }}>🎬</div>
                    )}
                    <button onClick={() => handleDeleteMedia(m.id)} style={{ position: 'absolute', top: '4px', right: '4px', width: '24px', height: '24px', borderRadius: '50%', border: 'none', background: 'rgba(239,68,68,0.8)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem' }}>
                      <FaTimes />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
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
                    <img src={project.media[0].mediaUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
    </div>
  );
}

const s = {
  pageTitle: { fontSize: '1.8rem', fontWeight: 800 },
  formHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' },
  cancelBtn: { display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: '1px solid var(--border-glass)', color: 'var(--text-secondary)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'var(--font-main)', fontSize: '0.85rem' },
  formCard: { padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' },
  field: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px', color: 'var(--text-secondary)' },
  input: { padding: '12px 16px', background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: 'var(--text-primary)', fontFamily: 'var(--font-main)', fontSize: '0.9rem', outline: 'none' },
  projectRow: { padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  actionBtn: { background: 'none', border: '1px solid var(--border-glass)', color: 'var(--text-secondary)', width: '36px', height: '36px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
};
