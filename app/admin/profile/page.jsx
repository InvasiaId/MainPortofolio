'use client';

import { useState, useEffect } from 'react';
import { FaSave, FaPlus, FaTimes, FaUpload } from 'react-icons/fa';
import Toast from '@/components/ui/Toast';

const PLATFORMS = [
  { value: 'linkedin', label: 'LinkedIn', icon: '🔗' },
  { value: 'github', label: 'GitHub', icon: '🐱' },
  { value: 'dribbble', label: 'Dribbble', icon: '🏀' },
  { value: 'instagram', label: 'Instagram', icon: '📸' },
  { value: 'tiktok', label: 'TikTok', icon: '🎵' },
];

export default function AdminProfile() {
  const [profile, setProfile] = useState({ name: '', tagline: '', bio: '', photoUrl: '', heroPhotoUrl: '' });
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
    if (res.ok) showToast('Profile saved successfully!');
    else showToast('Failed to save profile', 'error');
  };

  const saveSocialLinks = async () => {
    setSaving('social');
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'social_links', links: socialLinks }),
    });
    setSaving('');
    if (res.ok) showToast('Social links saved successfully!');
    else showToast('Failed to save social links', 'error');
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
      showToast('Skill added successfully!');
    } else {
      showToast('Failed to add skill', 'error');
    }
  };

  const deleteSkill = async (id) => {
    const res = await fetch(`/api/skills?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      setSkills(skills.filter((s) => s.id !== id));
      showToast('Skill deleted!');
    } else {
      showToast('Failed to delete skill', 'error');
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
    if (res.ok) showToast('Skill updated!');
    else showToast('Failed to update skill', 'error');
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
      showToast('Photo uploaded! Remember to click Save Profile.');
    } else {
      showToast(data.error || 'Photo upload failed', 'error');
    }
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
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            {/* Hero Photo */}
            <div style={{ ...s.field, flex: 1 }}>
              <label style={s.label}>Hero Photo (Beranda)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', border: '2px solid var(--border-glass)', background: 'var(--bg-primary)' }}>
                  {profile.heroPhotoUrl ? (
                    <img src={profile.heroPhotoUrl} alt="Hero" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>🖼️</div>
                  )}
                </div>
                <label className="btn btn-outline" style={{ cursor: 'pointer', fontSize: '0.85rem' }}>
                  <FaUpload /> Upload Hero
                  <input type="file" accept="image/*" hidden onChange={(e) => e.target.files[0] && handlePhotoUpload(e.target.files[0], 'heroPhotoUrl')} />
                </label>
              </div>
            </div>

            {/* About Photo */}
            <div style={{ ...s.field, flex: 1 }}>
              <label style={s.label}>About Photo (Profil)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', border: '2px solid var(--border-glass)', background: 'var(--bg-primary)' }}>
                  {profile.photoUrl ? (
                    <img src={profile.photoUrl} alt="About" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>👤</div>
                  )}
                </div>
                <label className="btn btn-outline" style={{ cursor: 'pointer', fontSize: '0.85rem' }}>
                  <FaUpload /> Upload About
                  <input type="file" accept="image/*" hidden onChange={(e) => e.target.files[0] && handlePhotoUpload(e.target.files[0], 'photoUrl')} />
                </label>
              </div>
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
          <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Add New Skill</h3>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'end', flexWrap: 'wrap' }}>
            <div style={{ ...s.field, flex: '1 1 150px' }}>
              <label style={s.label}>Name</label>
              <input style={s.input} value={newSkill.name} onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })} placeholder="e.g. React" />
            </div>
            <div style={{ ...s.field, flex: '1 1 120px' }}>
              <label style={s.label}>Category</label>
              <input style={s.input} value={newSkill.category} onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })} placeholder="Frontend" />
            </div>
            <div style={{ ...s.field, flex: '0 0 80px' }}>
              <label style={s.label}>Level %</label>
              <input type="number" style={s.input} value={newSkill.proficiency} onChange={(e) => setNewSkill({ ...newSkill, proficiency: parseInt(e.target.value) || 0 })} min="0" max="100" />
            </div>
            <button onClick={addSkill} className="btn btn-primary" style={{ padding: '12px 20px', height: '44px' }}>
              <FaPlus />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Manage Skills</h3>
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
