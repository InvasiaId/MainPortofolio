'use client';

import { useState, useEffect, useCallback } from 'react';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaCheckCircle } from 'react-icons/fa';
import Toast from '@/components/ui/Toast';

const COMMON_CATEGORIES = [
  'Web Development',
  '3D & Animation',
  'Game & AR Development',
  'UI UX Designer',
  'Video & Motion Graphics',
  'Hardware & IoT',
  'Tools & DevOps',
];

const emptySkill = {
  name: '',
  category: 'Web Development',
  proficiency: 85,
  displayOrder: 0,
};

function getLevelLabel(proficiency) {
  if (proficiency >= 90) return { label: 'Utama / Expert', color: 'var(--accent)' };
  if (proficiency >= 75) return { label: 'Mahir / Advanced', color: '#38bdf8' };
  return { label: 'Kompeten / Intermediate', color: '#94a3b8' };
}

export default function AdminSkills() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptySkill);
  const [toast, setToast] = useState(null);
  const [filterCat, setFilterCat] = useState('all');

  const loadSkills = useCallback(async () => {
    try {
      const res = await fetch('/api/skills');
      const data = await res.json();
      setSkills(Array.isArray(data) ? data : []);
    } catch {
      setToast({ message: 'Gagal memuat data keahlian.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSkills();
  }, [loadSkills]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm(emptySkill);
    setModalOpen(true);
  };

  const handleOpenEdit = (skill) => {
    setEditingId(skill.id);
    setForm({
      name: skill.name,
      category: skill.category || 'Web Development',
      proficiency: skill.proficiency || 80,
      displayOrder: skill.displayOrder || 0,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.category) {
      setToast({ message: 'Mohon isi nama keahlian dan kategori.', type: 'error' });
      return;
    }

    try {
      const url = '/api/skills';
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
        message: editingId ? 'Keahlian berhasil diperbarui!' : 'Keahlian baru berhasil ditambahkan!',
        type: 'success',
      });
      setModalOpen(false);
      loadSkills();
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Hapus keahlian "${name}"?`)) return;

    try {
      const res = await fetch(`/api/skills?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus.');
      setToast({ message: 'Keahlian berhasil dihapus.', type: 'success' });
      loadSkills();
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    }
  };

  const categories = Array.from(new Set(skills.map((s) => s.category || 'General')));

  const filteredSkills = skills.filter((s) => {
    if (filterCat === 'all') return true;
    return s.category === filterCat;
  });

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
            Tech Stack & <span className="gradient-text">Keahlian</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Kelola daftar teknologi, bahasa pemrograman, dan alat yang Anda kuasai.
          </p>
        </div>

        <button onClick={handleOpenCreate} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaPlus /> Tambah Keahlian
        </button>
      </div>

      {/* Category Filter Pills */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button
          className={`filter-tab ${filterCat === 'all' ? 'active' : ''}`}
          onClick={() => setFilterCat('all')}
          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
        >
          Semua ({skills.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            className={`filter-tab ${filterCat === cat ? 'active' : ''}`}
            onClick={() => setFilterCat(cat)}
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            {cat} ({skills.filter((s) => s.category === cat).length})
          </button>
        ))}
      </div>

      {/* Skills Grid */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Memuat data...</div>
      ) : filteredSkills.length === 0 ? (
        <div className="glass" style={{ padding: '40px', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Belum ada data keahlian pada kategori ini.</p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '16px',
          }}
        >
          {filteredSkills.map((skill) => {
            const level = getLevelLabel(skill.proficiency);

            return (
              <div
                key={skill.id}
                className="glass"
                style={{
                  padding: '18px 20px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-glass)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <FaCheckCircle style={{ color: level.color, fontSize: '0.8rem' }} />
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {skill.name}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {skill.category}
                    </span>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        color: level.color,
                        background: 'rgba(255,255,255,0.05)',
                        padding: '1px 6px',
                        borderRadius: '6px',
                      }}
                    >
                      {level.label}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => handleOpenEdit(skill)}
                    className="btn btn-outline"
                    style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(skill.id, skill.name)}
                    className="btn btn-outline"
                    style={{ padding: '6px 10px', fontSize: '0.8rem', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}
                    title="Hapus"
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
              maxWidth: '500px',
              width: '100%',
              borderRadius: 'var(--radius-xl)',
              padding: '28px',
              position: 'relative',
            }}
          >
            <button
              onClick={() => setModalOpen(false)}
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '1.2rem',
                cursor: 'pointer',
              }}
            >
              <FaTimes />
            </button>

            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '20px' }}>
              {editingId ? 'Edit Keahlian' : 'Tambah Keahlian Baru'}
            </h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Nama Teknologi / Alat *
                </label>
                <input
                  type="text"
                  placeholder="Misal: Next.js, Blender, Docker"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
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
                  Kategori *
                </label>
                <input
                  type="text"
                  list="category-suggestions"
                  placeholder="Pilih atau ketik kategori baru"
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
                />
                <datalist id="category-suggestions">
                  {COMMON_CATEGORIES.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Tingkat Kemahiran</label>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: getLevelLabel(form.proficiency).color }}>
                    {getLevelLabel(form.proficiency).label} ({form.proficiency}%)
                  </span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="100"
                  step="5"
                  value={form.proficiency}
                  onChange={(e) => setForm({ ...form, proficiency: parseInt(e.target.value) || 50 })}
                  style={{ width: '100%', accentColor: 'var(--accent)' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  <span>Kompeten</span>
                  <span>Mahir</span>
                  <span>Utama / Expert</span>
                </div>
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
