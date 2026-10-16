'use client';

import { useState, useEffect, useCallback } from 'react';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaBriefcase, FaGraduationCap, FaCertificate, FaImage, FaCloudUploadAlt } from 'react-icons/fa';
import Toast from '@/components/ui/Toast';

const TYPE_OPTIONS = [
  { value: 'work', label: '💼 Karier & Pekerjaan', color: 'var(--accent)' },
  { value: 'education', label: '🎓 Pendidikan Formal', color: '#38bdf8' },
  { value: 'certification', label: '📜 Sertifikasi', color: '#f59e0b' },
];

const emptyExperience = {
  title: '',
  organization: '',
  period: '',
  description: '',
  type: 'work',
  imageUrl: '',
  displayOrder: 0,
};

// Reusable Image Upload Dropzone
const ImageDropzone = ({ onUpload, label = 'Unggah Gambar Bukti / Sertifikat' }) => {
  const [isDrag, setIsDrag] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (file) => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'experiences');
    formData.append('fileCategory', 'image');

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        onUpload(data.url);
      } else {
        alert(data.error || 'Pengunggahan berkas gagal.');
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
        id="exp-file-upload"
      />
      <label htmlFor="exp-file-upload" style={{ cursor: 'pointer', width: '100%' }}>
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

export default function AdminExperiences() {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyExperience);
  const [toast, setToast] = useState(null);
  const [filterType, setFilterType] = useState('all');

  const loadExperiences = useCallback(async () => {
    try {
      const res = await fetch('/api/experiences');
      const data = await res.json();
      setExperiences(Array.isArray(data) ? data : []);
    } catch {
      setToast({ message: 'Gagal memuat data pengalaman.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExperiences();
  }, [loadExperiences]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm(emptyExperience);
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      organization: item.organization,
      period: item.period,
      description: item.description || '',
      type: item.type || 'work',
      imageUrl: item.imageUrl || '',
      displayOrder: item.displayOrder || 0,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.organization || !form.period) {
      setToast({ message: 'Mohon lengkapi judul, instansi, dan periode.', type: 'error' });
      return;
    }

    try {
      const url = '/api/experiences';
      const method = editingId ? 'PUT' : 'POST';
      const payload = editingId ? { id: editingId, ...form } : form;

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
        message: editingId ? 'Pengalaman berhasil diperbarui!' : 'Pengalaman baru berhasil ditambahkan!',
        type: 'success',
      });
      setModalOpen(false);
      loadExperiences();
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus "${title}"?`)) return;

    try {
      const res = await fetch(`/api/experiences?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus.');
      setToast({ message: 'Pengalaman berhasil dihapus.', type: 'success' });
      loadExperiences();
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    }
  };

  const filteredList = experiences.filter((item) => {
    if (filterType === 'all') return true;
    return item.type === filterType;
  });

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
            Jejak <span className="gradient-text">Pengalaman</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Kelola riwayat karier, pendidikan formal, dan sertifikasi keahlian Anda.
          </p>
        </div>

        <button onClick={handleOpenCreate} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaPlus /> Tambah Pengalaman
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button
          className={`filter-tab ${filterType === 'all' ? 'active' : ''}`}
          onClick={() => setFilterType('all')}
          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
        >
          Semua ({experiences.length})
        </button>
        {TYPE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            className={`filter-tab ${filterType === opt.value ? 'active' : ''}`}
            onClick={() => setFilterType(opt.value)}
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            {opt.label} ({experiences.filter((e) => e.type === opt.value).length})
          </button>
        ))}
      </div>

      {/* Experience List */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Memuat data...</div>
      ) : filteredList.length === 0 ? (
        <div className="glass" style={{ padding: '40px', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Belum ada data pengalaman pada kategori ini.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredList.map((item) => {
            const typeConfig = TYPE_OPTIONS.find((t) => t.value === item.type) || TYPE_OPTIONS[0];

            return (
              <div
                key={item.id}
                className="glass"
                style={{
                  padding: '20px 24px',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-glass)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '20px',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ flex: '1 1 500px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: typeConfig.color,
                        background: 'rgba(255,255,255,0.06)',
                        padding: '3px 10px',
                        borderRadius: '12px',
                        border: '1px solid var(--border-glass)',
                      }}
                    >
                      {typeConfig.label}
                    </span>

                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Urutan: {item.displayOrder}
                    </span>

                    {item.imageUrl && (
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--accent)',
                          background: 'rgba(214, 255, 1, 0.1)',
                          padding: '2px 8px',
                          borderRadius: '8px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <FaImage /> Ada Foto/Sertifikat
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '4px 0', color: 'var(--text-primary)' }}>
                    {item.title}
                  </h3>
                  <p style={{ color: 'var(--accent)', fontWeight: 500, fontSize: '0.9rem', margin: '0 0 8px 0' }}>
                    {item.organization} • <span style={{ color: 'var(--text-secondary)' }}>{item.period}</span>
                  </p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.6', margin: 0 }}>
                    {item.description}
                  </p>

                  {item.imageUrl && (
                    <div style={{ marginTop: '12px', width: '100px', height: '60px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-glass)' }}>
                      <img src={item.imageUrl} alt="Thumbnail Bukti" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="btn btn-outline"
                    style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                    title="Edit Pengalaman"
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.title)}
                    className="btn btn-outline"
                    style={{ padding: '8px 12px', fontSize: '0.85rem', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}
                    title="Hapus Pengalaman"
                  >
                    <FaTrash />
                  </button>
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
              {editingId ? 'Edit Pengalaman' : 'Tambah Pengalaman Baru'}
            </h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Kategori *
                </label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
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
                  {TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Posisi / Gelar / Nama Sertifikat *
                </label>
                <input
                  type="text"
                  placeholder="Misal: Full-Stack Web Developer atau D4 Teknik Komputer"
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                    Instansi / Perusahaan / Kampus *
                  </label>
                  <input
                    type="text"
                    placeholder="Misal: Dinas Kominfo Palembang"
                    value={form.organization}
                    onChange={(e) => setForm({ ...form, organization: e.target.value })}
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
                    Periode / Tahun *
                  </label>
                  <input
                    type="text"
                    placeholder="Misal: Februari 2026 – Juni 2026"
                    value={form.period}
                    onChange={(e) => setForm({ ...form, period: e.target.value })}
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

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Deskripsi Tanggung Jawab / Kompetensi
                </label>
                <textarea
                  rows={4}
                  placeholder="Ceritakan peran, kontribusi, atau pencapaian Anda..."
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
                    resize: 'vertical',
                  }}
                />
              </div>

              {/* Image Upload for Certificate / Proof photo */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Foto Bukti / Sertifikat (Muncul di Pop-up saat card diklik)
                </label>
                {form.imageUrl ? (
                  <div style={{ position: 'relative', display: 'inline-block', marginBottom: '8px' }}>
                    <img
                      src={form.imageUrl}
                      alt="Pratinjau"
                      style={{ maxHeight: '160px', borderRadius: '8px', border: '1px solid var(--border-glass)' }}
                    />
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, imageUrl: '' })}
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
                  <ImageDropzone onUpload={(url) => setForm({ ...form, imageUrl: url })} />
                )}
                <input
                  type="text"
                  placeholder="Atau masukkan tautan URL gambar..."
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  style={{
                    width: '100%',
                    marginTop: '8px',
                    padding: '8px 12px',
                    fontSize: '0.8rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-glass)',
                    border: '1px solid var(--border-glass)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Urutan Tampilan
                </label>
                <input
                  type="number"
                  value={form.displayOrder}
                  onChange={(e) => setForm({ ...form, displayOrder: parseInt(e.target.value) || 0 })}
                  style={{
                    width: '120px',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-glass)',
                    border: '1px solid var(--border-glass)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-outline">
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Simpan Perubahan' : 'Tambahkan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
