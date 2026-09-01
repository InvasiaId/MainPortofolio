'use client';

import { useState, useEffect } from 'react';
import { FaSave, FaPlus, FaTimes, FaUpload } from 'react-icons/fa';

const PLATFORMS = [
  { value: 'linkedin', label: 'LinkedIn', icon: '🔗' },
  { value: 'github', label: 'GitHub', icon: '🐱' },
  { value: 'dribbble', label: 'Dribbble', icon: '🏀' },
  { value: 'instagram', label: 'Instagram', icon: '📸' },
  { value: 'tiktok', label: 'TikTok', icon: '🎵' },
];

export default function AdminProfile() {
  const [profile, setProfile] = useState({ name: '', tagline: '', bio: '', photoUrl: '' });
  const [socialLinks, setSocialLinks] = useState([]);
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState({ name: '', icon: '', category: '', proficiency: 50 });
  const [saving, setSaving] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    fetch('/api/profile').then((r) => r.json()).then((data) => {
      if (data.profile) setProfile(data.profile);
      if (data.socialLinks) setSocialLinks(data.socialLinks);
    });
    fetch('/api/skills').then((r) => r.json()).then(setSkills).catch(() => {});
  }, []);

  const saveProfile = async () => {
    setSaving('profile');
    await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'profile', ...profile }),
    });
    setSaving('');
  };

  const saveSocialLinks = async () => {
    setSaving('social');
    await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'social_links', links: socialLinks }),
    });
    setSaving('');
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
    }
  };

  const deleteSkill = async (id) => {
    await fetch(`/api/skills?id=${id}`, { method: 'DELETE' });
    setSkills(skills.filter((s) => s.id !== id));
  };

  const handlePhotoUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'profile');
    formData.append('fileCategory', 'image');

    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await res.json();
    if (res.ok) setProfile({ ...profile, photoUrl: data.url });
  };

  const TABS = [
    { key: 'profile', label: '👤 Profile' },
    { key: 'social', label: '🔗 Social Links' },
    { key: 'skills', label: '⚡ Skills' },
  ];

  return (
    <div>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '24px' }}>
        <span className="gradient-text">Profile</span>
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
          <div style={s.field}>
            <label style={s.label}>Photo</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--border-glass)', background: 'var(--bg-primary)' }}>
                {profile.photoUrl ? (
                  <img src={profile.photoUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>👤</div>
                )}
              </div>
              <label className="btn btn-outline" style={{ cursor: 'pointer', fontSize: '0.85rem' }}>
                <FaUpload /> Upload Photo
                <input type="file" accept="image/*" hidden onChange={(e) => e.target.files[0] && handlePhotoUpload(e.target.files[0])} />
              </label>
            </div>
          </div>

          <div style={s.field}>
            <label style={s.label}>Name</label>
            <input style={s.input} value={profile.name || ''} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
          </div>

          <div style={s.field}>
            <label style={s.label}>Tagline</label>
            <input style={s.input} value={profile.tagline || ''} onChange={(e) => setProfile({ ...profile, tagline: e.target.value })} placeholder="Full-Stack Developer & Designer" />
          </div>

          <div style={s.field}>
            <label style={s.label}>Bio</label>
            <textarea style={{ ...s.input, minHeight: '150px' }} value={profile.bio || ''} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} />
          </div>

          <button onClick={saveProfile} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            <FaSave /> {saving === 'profile' ? 'Saving...' : 'Save Profile'}
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
            <FaPlus /> Add Social Link
          </button>

          <button onClick={saveSocialLinks} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            <FaSave /> {saving === 'social' ? 'Saving...' : 'Save Social Links'}
          </button>
        </div>
      )}

      {/* Skills Tab */}
      {activeTab === 'skills' && (
        <div className="glass" style={s.card}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'end', flexWrap: 'wrap' }}>
            <div style={{ ...s.field, flex: '1 1 150px' }}>
              <label style={s.label}>Name</label>
              <input style={s.input} value={newSkill.name} onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })} placeholder="React" />
            </div>
            <div style={{ ...s.field, flex: '0 0 80px' }}>
              <label style={s.label}>Icon</label>
              <input style={s.input} value={newSkill.icon} onChange={(e) => setNewSkill({ ...newSkill, icon: e.target.value })} placeholder="⚛️" />
            </div>
            <div style={{ ...s.field, flex: '1 1 120px' }}>
              <label style={s.label}>Category</label>
              <input style={s.input} value={newSkill.category} onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })} placeholder="Frontend" />
            </div>
            <div style={{ ...s.field, flex: '0 0 80px' }}>
              <label style={s.label}>Level %</label>
              <input type="number" style={s.input} value={newSkill.proficiency} onChange={(e) => setNewSkill({ ...newSkill, proficiency: parseInt(e.target.value) || 0 })} min="0" max="100" />
            </div>
            <button onClick={addSkill} className="btn btn-primary" style={{ padding: '12px 20px' }}>
              <FaPlus />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
            {skills.map((skill) => (
              <div key={skill.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'var(--bg-glass)', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                <span>{skill.icon || '⚡'}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{skill.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{skill.category} • {skill.proficiency}%</div>
                </div>
                <button onClick={() => deleteSkill(skill.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}>
                  <FaTimes />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  card: { padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' },
  field: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px', color: 'var(--text-secondary)' },
  input: { padding: '12px 16px', background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: 'var(--text-primary)', fontFamily: 'var(--font-main)', fontSize: '0.9rem', outline: 'none' },
};
