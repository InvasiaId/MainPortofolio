'use client';

import { useState, useEffect, useCallback } from 'react';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaExternalLinkAlt, FaGithub, FaCloudUploadAlt, FaTools } from 'react-icons/fa';
import Toast from '@/components/ui/Toast';

const CATEGORIES = [
  { value: 'website', label: '🌐 Web Utility' },
  { value: 'threeD', label: '🎨 3D Tool' },
  { value: 'android', label: '📱 Mobile Utility' },
  { value: 'hardware', label: '⚙️ Hardware / IoT' },
];

const emptyTool = {
  title: '',
  category: 'website',
  tag: 'freeTool',
  description: '',
  techStack: [],
  projectUrl: '',
  repoUrl: '',
  featured: false,
  displayOrder: 0,
  media: [],
};

// Reusable Image Upload Dropzone
const Dropzone = ({ onUpload, label = 'Unggah Gambar Pratinjau' }) => {
  const [isDrag, setIsDrag] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (file) => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'tools');
    formData.append('fileCategory', 'image');

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        onUpload(data.url);
      } else {
        alert(data.error || 'Pengunggahan gagal.');
      }
    } catch {
      alert('Terjadi kesalahan jaringan saat mengunggah.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDrag(true); }}
      onDragLeave={(e) => { e.preventDefault(); setIsDrag(false); }}
      onDrop={(e) => {
        e.preventDefault();
        setIsDrag(false);
        handleUpload(e.dataTransfer.files[0]);
      }}
      style={{
        border: `2px dashed ${isDrag ? 'var(--accent)' : 'var(--border-glass)'}`,
        background: isDrag ? 'rgba(214,255,1,0.05)' : 'var(--bg-glass)',
        padding: '20px',
        borderRadius: '12px',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
      }}
    >
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={(e) => handleUpload(e.target.files[0])}
        style={{ display: 'none' }}
        id="tool-file-upload"
      />
      <label htmlFor="tool-file-upload" style={{ cursor: 'pointer', width: '100%' }}>
        <FaCloudUploadAlt style={{ fontSize: '1.8rem', color: isDrag ? 'var(--accent)' : 'var(--text-muted)' }} />
        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>
          {loading ? 'Mengunggah...' : label}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          JPG, PNG, atau WebP (Maks. 5 MB)
        </div>
      </label>
    </div>
  );
};

export default function AdminTools() {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyTool);
  const [techInput, setTechInput] = useState('');
  const [toast, setToast] = useState(null);

  const loadTools = useCallback(async () => {
    try {
      const res = await fetch('/api/projects?tag=freeTool');
      const data = await res.json();
      setTools(Array.isArray(data) ? data : []);
    } catch {
      setToast({ message: 'Gagal memuat data tools.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTools();
  }, [loadTools]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm(emptyTool);
    setTechInput('');
    setModalOpen(true);
  };

  const handleOpenEdit = (tool) => {
    setEditingId(tool.id);
    setForm({
      title: tool.title,
      category: tool.category,
      tag: 'freeTool',
      description: tool.description || '',
      techStack: tool.techStack || [],
      projectUrl: tool.projectUrl || '',
      repoUrl: tool.repoUrl || '',
      featured: tool.featured || false,
      displayOrder: tool.displayOrder || 0,
      media: tool.media || [],
    });
    setTechInput('');
    setModalOpen(true);
  };

  const addTech = (e) => {
    e.preventDefault();
    const trimmed = techInput.trim();
    if (trimmed && !form.techStack.includes(trimmed)) {
      setForm({ ...form, techStack: [...form.techStack, trimmed] });
      setTechInput('');
    }
  };

  const removeTech = (item) => {
    setForm({ ...form, techStack: form.techStack.filter((t) => t !== item) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.category) {
      setToast({ message: 'Mohon isi nama alat dan kategori.', type: 'error' });
      return;
    }

    try {
      const url = '/api/projects';
      const method = editingId ? 'PUT' : 'POST';
      const payload = {
        ...(editingId ? { id: editingId } : {}),
        ...form,
        tag: 'freeTool', // Always ensure tag is freeTool
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal menyimpan.');
      }

      setToast({
        message: editingId ? 'Alat gratis berhasil diperbarui!' : 'Alat gratis baru berhasil ditambahkan!',
        type: 'success',
      });
      setModalOpen(false);
      loadTools();
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Hapus alat "${title}"?`)) return;

    try {
      const res = await fetch(`/api/projects?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus.');
      setToast({ message: 'Alat berhasil dihapus.', type: 'success' });
      loadTools();
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    }
  };

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
            Tools & <span className="gradient-text">Utilitas Gratis</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Kelola aplikasi web gratis, alat bantu, dan utilitas publik yang tampil di halaman <code>/tools</code>.
          </p>
        </div>

        <button onClick={handleOpenCreate} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaPlus /> Tambah Alat Gratis
        </button>
      </div>

      {/* Tools List */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Memuat data tools...</div>
      ) : tools.length === 0 ? (
        <div className="glass" style={{ padding: '50px 20px', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🛠️</div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'var(--text-primary)' }}>Belum Ada Alat Gratis</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '480px', margin: '0 auto 20px auto' }}>
            Saat Anda menambahkan alat baru di sini, alat tersebut akan otomatis muncul di halaman publik <code>/tools</code>.
          </p>
          <button onClick={handleOpenCreate} className="btn btn-primary">
            <FaPlus /> Tambah Alat Pertama
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px',
          }}
        >
          {tools.map((tool) => {
            const thumbnail = tool.media?.find((m) => m.mediaType === 'image');

            return (
              <div
                key={tool.id}
                className="glass"
                style={{
                  padding: '24px',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-glass)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#10b981',
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      padding: '3px 8px',
                      borderRadius: '10px',
                    }}
                  >
                    🟢 Publik / Gratis
                  </span>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => handleOpenEdit(tool)}
                      className="btn btn-outline"
                      style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(tool.id, tool.title)}
                      className="btn btn-outline"
                      style={{ padding: '6px 10px', fontSize: '0.8rem', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}
                      title="Hapus"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                {thumbnail && (
                  <div style={{ width: '100%', height: '140px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-glass)' }}>
                    <img src={thumbnail.mediaUrl} alt={tool.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}

                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  {tool.title}
                </h3>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.5', margin: 0, flex: 1 }}>
                  {tool.description}
                </p>

                {tool.techStack?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {tool.techStack.map((tech) => (
                      <span key={tech} className="tech-tag" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  {tool.projectUrl && (
                    <a
                      href={tool.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary"
                      style={{ flex: 1, justifyContent: 'center', fontSize: '0.8rem', padding: '8px 12px' }}
                    >
                      <FaExternalLinkAlt /> Buka Alat
                    </a>
                  )}
                  {tool.repoUrl && (
                    <a
                      href={tool.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline"
                      style={{ padding: '8px 12px', fontSize: '0.8rem' }}
                      title="GitHub"
                    >
                      <FaGithub />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Form */}
      {modalOpen && (
        <div
          className="modal-overlay"
          onClick={() => setModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px',
          }}
        >
          <div
            className="modal-content glass"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '650px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              borderRadius: 'var(--radius-xl)',
              padding: '32px',
              position: 'relative',
            }}
          >
            <button
              onClick={() => setModalOpen(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '1.2rem',
                cursor: 'pointer',
              }}
            >
              <FaTimes />
            </button>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '20px' }}>
              {editingId ? 'Edit Alat Gratis' : 'Tambah Alat Gratis Baru'}
            </h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Nama Alat / Web App *
                </label>
                <input
                  type="text"
                  placeholder="Misal: 3D Model Web Viewer, Pembuat QR Code"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-glass)',
                    border: '1px solid var(--border-glass)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-main)',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Kategori Alat *
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-glass)',
                    border: '1px solid var(--border-glass)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-main)',
                  }}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Deskripsi & Manfaat Alat *
                </label>
                <textarea
                  rows={3}
                  placeholder="Jelaskan apa fungsi alat ini dan masalah apa yang dipecahkan untuk pengguna..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-glass)',
                    border: '1px solid var(--border-glass)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-main)',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                    Tautan Langsung Aplikasi (URL Live)
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={form.projectUrl}
                    onChange={(e) => setForm({ ...form, projectUrl: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-glass)',
                      border: '1px solid var(--border-glass)',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-main)',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                    Tautan GitHub (Opsional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    value={form.repoUrl}
                    onChange={(e) => setForm({ ...form, repoUrl: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-glass)',
                      border: '1px solid var(--border-glass)',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-main)',
                    }}
                  />
                </div>
              </div>

              {/* Tech Stack */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Teknologi yang Digunakan
                </label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="text"
                    placeholder="Ketik teknologi lalu tekan Tambah..."
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') addTech(e);
                    }}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-glass)',
                      border: '1px solid var(--border-glass)',
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem',
                    }}
                  />
                  <button type="button" onClick={addTech} className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                    + Tambah
                  </button>
                </div>

                {form.techStack.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {form.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="tech-tag"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                        }}
                        onClick={() => removeTech(tech)}
                        title="Klik untuk menghapus"
                      >
                        {tech} <FaTimes style={{ fontSize: '0.65rem' }} />
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Thumbnail Image */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Gambar Pratinjau / Cover Alat
                </label>
                {form.media && form.media.length > 0 ? (
                  <div style={{ position: 'relative', display: 'inline-block', marginBottom: '8px' }}>
                    <img
                      src={form.media[0].mediaUrl}
                      alt="Thumbnail"
                      style={{ maxHeight: '160px', borderRadius: '8px', border: '1px solid var(--border-glass)' }}
                    />
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, media: [] })}
                      style={{
                        position: 'absolute',
                        top: '6px',
                        right: '6px',
                        background: '#ef4444',
                        border: 'none',
                        color: 'white',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                      title="Hapus Gambar"
                    >
                      <FaTimes />
                    </button>
                  </div>
                ) : (
                  <Dropzone
                    onUpload={(url) =>
                      setForm({
                        ...form,
                        media: [{ mediaUrl: url, mediaType: 'image', displayOrder: 0 }],
                      })
                    }
                  />
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-outline">
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Simpan' : 'Tambahkan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
