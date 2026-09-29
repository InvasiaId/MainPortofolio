'use client';

import { useState, useEffect } from 'react';
import { FaSave, FaPlus, FaTimes, FaUpload, FaFilePdf, FaDownload } from 'react-icons/fa';
import Toast from '@/components/ui/Toast';

const PLATFORMS = [
  { value: 'linkedin', label: 'LinkedIn', icon: '🔗' },
  { value: 'github', label: 'GitHub', icon: '🐱' },
  { value: 'dribbble', label: 'Dribbble', icon: '🏀' },
  { value: 'instagram', label: 'Instagram', icon: '📸' },
  { value: 'tiktok', label: 'TikTok', icon: '🎵' },
];

export default function AdminProfile() {
  const [profile, setProfile] = useState({ name: '', tagline: '', bio: '', photoUrl: '', heroPhotoUrl: '', resumeUrl: '', contactEmail: '' });
  const [socialLinks, setSocialLinks] = useState([]);
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState({ name: '', category: 'Frontend', proficiency: 50 });
  const [saving, setSaving] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => setToast({ message, type });

  useEffect(() => {
    fetch('/api/profile').then((r) => r.json()).then((data) => {
      if (data.profile) setProfile(data.profile);
      if (data.socialLinks) setSocialLinks(data.socialLinks);
    });
    fetch('/api/skills').then((r) => r.json()).then(setSkills).catch(() => {});
  }, []);

  const saveProfile = async () => {
    setSaving('profile');
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'profile', ...profile }),
    });
    setSaving('');
    if (res.ok) showToast('Profil berhasil disimpan!');
    else showToast('Gagal menyimpan profil.', 'error');
  };

  const saveSocialLinks = async () => {
    setSaving('social');
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'social_links', links: socialLinks }),
    });
    setSaving('');
    if (res.ok) showToast('Tautan media sosial berhasil disimpan!');
    else showToast('Gagal menyimpan tautan media sosial.', 'error');
  };

  const addSocialLink = () => {
    setSocialLinks([...socialLinks, { platform: 'linkedin', url: '', icon: 'linkedin' }]);
  };

  const removeSocialLink = (index) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  const updateSocialLink = (index, field, value) => {
    const updated = [...socialLinks];
    updated[index] = { ...updated[index], [field]: value };
    if (field === 'platform') updated[index].icon = value;
    setSocialLinks(updated);
  };

  const addSkill = async () => {
    if (!newSkill.name) return;
    const res = await fetch('/api/skills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSkill),
    });
    if (res.ok) {
      const skill = await res.json();
      setSkills([...skills, skill]);
      setNewSkill({ name: '', icon: '', category: '', proficiency: 50 });
      showToast('Keahlian berhasil ditambahkan!');
    } else {
      showToast('Gagal menambahkan keahlian.', 'error');
    }
  };

  const deleteSkill = async (id) => {
    const res = await fetch(`/api/skills?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      setSkills(skills.filter((s) => s.id !== id));
      showToast('Keahlian berhasil dihapus!');
    } else {
      showToast('Gagal menghapus keahlian.', 'error');
    }
  };

  const updateSkillLocal = (id, field, value) => {
    setSkills(skills.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const saveSkill = async (skill) => {
    const res = await fetch('/api/skills', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(skill),
    });
    if (res.ok) showToast('Keahlian berhasil diperbarui!');
    else showToast('Gagal memperbarui keahlian.', 'error');
  };

  const handlePhotoUpload = async (file, field = 'photoUrl') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'profile');
    formData.append('fileCategory', 'image');

    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await res.json();
    if (res.ok) {
      setProfile(prev => ({ ...prev, [field]: data.url }));
      showToast('Foto berhasil diunggah. Jangan lupa simpan profil.');
    } else {
      showToast(data.error || 'Gagal mengunggah foto.', 'error');
    }
  };

  const handleResumeUpload = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'profile');
    formData.append('fileCategory', 'pdf');

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Gagal mengunggah CV.', 'error');
        return;
      }
      setProfile((previous) => ({ ...previous, resumeUrl: data.url }));
      showToast('CV berhasil diunggah. Klik Simpan Profil untuk menerbitkannya.');
    } catch {
      showToast('Terjadi kesalahan jaringan saat mengunggah CV.', 'error');
    }
  };

  const TABS = [
    { key: 'profile', label: '👤 Profil' },
    { key: 'social', label: '🔗 Media Sosial' },
    { key: 'skills', label: '⚡ Keahlian' },
  ];

  return (
    <div>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '24px' }}>
        <span className="gradient-text">Profil</span>
      </h1>

      <div style={{ display: 'flex', gap: '6px', marginBottom: '24px' }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`filter-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="glass" style={s.card}>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            {/* Hero Photo */}
            <div style={{ ...s.field, flex: 1 }}>
              <label style={s.label}>Foto Utama (Beranda)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', border: '2px solid var(--border-glass)', background: 'var(--bg-primary)' }}>
                  {profile.heroPhotoUrl ? (
                    <img src={profile.heroPhotoUrl} alt="Foto utama" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>🖼️</div>
                  )}
                </div>
                <label className="btn btn-outline" style={{ cursor: 'pointer', fontSize: '0.85rem' }}>
                  <FaUpload /> Unggah Foto Utama
                  <input type="file" accept="image/*" hidden onChange={(e) => e.target.files[0] && handlePhotoUpload(e.target.files[0], 'heroPhotoUrl')} />
                </label>
              </div>
            </div>

            {/* About Photo */}
            <div style={{ ...s.field, flex: 1 }}>
              <label style={s.label}>Foto Tentang Saya</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', border: '2px solid var(--border-glass)', background: 'var(--bg-primary)' }}>
                  {profile.photoUrl ? (
                    <img src={profile.photoUrl} alt="About" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>👤</div>
                  )}
                </div>
                <label className="btn btn-outline" style={{ cursor: 'pointer', fontSize: '0.85rem' }}>
                  <FaUpload /> Unggah Foto Profil
                  <input type="file" accept="image/*" hidden onChange={(e) => e.target.files[0] && handlePhotoUpload(e.target.files[0], 'photoUrl')} />
                </label>
              </div>
            </div>
          </div>

          <div style={s.field}>
            <label style={s.label}>Nama</label>
            <input style={s.input} value={profile.name || ''} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
          </div>

          <div style={s.field}>
            <label style={s.label}>Slogan</label>
            <input style={s.input} value={profile.tagline || ''} onChange={(e) => setProfile({ ...profile, tagline: e.target.value })} placeholder="Pengembang dan Desainer Full-Stack" />
          </div>

          <div style={s.field}>
            <label style={s.label}>Biografi</label>
            <textarea style={{ ...s.input, minHeight: '150px' }} value={profile.bio || ''} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} />
          </div>

          <div style={s.field}>
            <label style={s.label}>Email Kontak (untuk formulir kontak situs)</label>
            <input type="email" style={s.input} value={profile.contactEmail || ''} onChange={(e) => setProfile({ ...profile, contactEmail: e.target.value })} placeholder="email@gmail.com" />
          </div>

          <div style={s.field}>
            <label style={s.label}>CV (PDF, maksimal 4 MB)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <label className="btn btn-outline" style={{ cursor: 'pointer', fontSize: '0.85rem' }}>
                <FaUpload /> Unggah CV
                <input type="file" accept="application/pdf,.pdf" hidden onChange={(e) => handleResumeUpload(e.target.files[0])} />
              </label>
              {profile.resumeUrl && (
                <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                  <FaFilePdf /> Lihat CV <FaDownload />
                </a>
              )}
            </div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '6px' }}>
              Setelah mengunggah, klik Simpan Profil agar CV tampil di situs.
            </span>
          </div>

          <button onClick={saveProfile} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            {saving === 'profile' ? 'Menyimpan...' : <><FaSave /> Simpan Profil</>}
          </button>
        </div>
      )}

      {/* Social Links Tab */}
      {activeTab === 'social' && (
        <div className="glass" style={s.card}>
          {socialLinks.map((link, i) => (
            <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'end' }}>
              <div style={{ ...s.field, flex: '0 0 140px' }}>
                <label style={s.label}>Platform</label>
                <select style={s.input} value={link.platform} onChange={(e) => updateSocialLink(i, 'platform', e.target.value)}>
                  {PLATFORMS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div style={{ ...s.field, flex: 1 }}>
                <label style={s.label}>URL</label>
                <input style={s.input} value={link.url} onChange={(e) => updateSocialLink(i, 'url', e.target.value)} placeholder="https://..." />
              </div>
              <button onClick={() => removeSocialLink(i)} style={{ background: 'none', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', width: '40px', height: '40px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FaTimes />
              </button>
            </div>
          ))}

          <button onClick={addSocialLink} className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem' }}>
            <FaPlus /> Tambah Tautan Media Sosial
          </button>

          <button onClick={saveSocialLinks} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            <FaSave /> {saving === 'social' ? 'Menyimpan...' : 'Simpan Tautan Media Sosial'}
          </button>
        </div>
      )}

      {/* Skills Tab */}
      {activeTab === 'skills' && (
        <div className="glass" style={s.card}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Tambah Keahlian</h3>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'end', flexWrap: 'wrap' }}>
            <div style={{ ...s.field, flex: '1 1 150px' }}>
              <label style={s.label}>Nama</label>
              <input style={s.input} value={newSkill.name} onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })} placeholder="misalnya React" />
            </div>
            <div style={{ ...s.field, flex: '1 1 120px' }}>
              <label style={s.label}>Kategori</label>
              <input style={s.input} value={newSkill.category} onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })} placeholder="Antarmuka Depan" />
            </div>
            <div style={{ ...s.field, flex: '0 0 80px' }}>
              <label style={s.label}>Tingkat %</label>
              <input type="number" style={s.input} value={newSkill.proficiency} onChange={(e) => setNewSkill({ ...newSkill, proficiency: parseInt(e.target.value) || 0 })} min="0" max="100" />
            </div>
            <button onClick={addSkill} className="btn btn-primary" style={{ padding: '12px 20px', height: '44px' }}>
              <FaPlus />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Kelola Keahlian</h3>
            {skills.map((skill) => (
              <div key={skill.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', padding: '12px', background: 'var(--bg-glass)', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                <input style={{ ...s.input, flex: '1 1 120px', padding: '8px 12px' }} value={skill.name} onChange={(e) => updateSkillLocal(skill.id, 'name', e.target.value)} onBlur={() => saveSkill(skill)} />
                <input style={{ ...s.input, flex: '1 1 120px', padding: '8px 12px' }} value={skill.category} onChange={(e) => updateSkillLocal(skill.id, 'category', e.target.value)} onBlur={() => saveSkill(skill)} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: '0 0 80px' }}>
                  <input type="number" style={{ ...s.input, width: '60px', padding: '8px' }} value={skill.proficiency} onChange={(e) => updateSkillLocal(skill.id, 'proficiency', parseInt(e.target.value) || 0)} onBlur={() => saveSkill(skill)} />
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>%</span>
                </div>
                
                <button onClick={() => deleteSkill(skill.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FaTimes />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

const s = {
  card: { padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' },
  field: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px', color: 'var(--text-secondary)' },
  input: { padding: '12px 16px', background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: 'var(--text-primary)', fontFamily: 'var(--font-main)', fontSize: '0.9rem', outline: 'none' },
};
