import { useState, useEffect } from 'react';
import { Save, Plus, X, Check, User, GraduationCap, Sparkles, Heart, Target } from 'lucide-react';
import { getProfile, updateProfile } from '../services/api';
import './Profile.css';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [interestInput, setInterestInput] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await getProfile();
      setProfile(res.data);
    } catch (err) {
      console.error('Profile load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile(profile);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleEduChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      education: { ...prev.education, [field]: value }
    }));
  };

  const addSkill = () => {
    if (!skillInput.trim()) return;
    setProfile(prev => ({
      ...prev,
      skills: [...(prev.skills || []), skillInput.trim()]
    }));
    setSkillInput('');
  };

  const removeSkill = (index) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const addInterest = () => {
    if (!interestInput.trim()) return;
    setProfile(prev => ({
      ...prev,
      interests: [...(prev.interests || []), interestInput.trim()]
    }));
    setInterestInput('');
  };

  const removeInterest = (index) => {
    setProfile(prev => ({
      ...prev,
      interests: prev.interests.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          <div className="spinner" />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  // Calculate completeness
  const fields = [
    profile?.fullName, profile?.email,
    profile?.education?.degree, profile?.education?.branch,
    profile?.education?.college, profile?.education?.graduationYear,
    profile?.skills?.length > 0, profile?.careerGoals
  ];
  const completeness = Math.round((fields.filter(Boolean).length / fields.length) * 100);

  return (
    <div className="profile-page">
      {/* Header */}
      <div className="profile-header">
        <div>
          <h1>Profile</h1>
          <p>Your personal info and career data</p>
        </div>
        <button
          className={`profile-save-btn ${saved ? 'save-success' : ''}`}
          onClick={handleSave}
          disabled={saving}
        >
          {saved ? <><Check size={14} /> Saved!</> : <><Save size={14} /> {saving ? 'Saving...' : 'Save Profile'}</>}
        </button>
      </div>

      {/* Completeness Bar */}
      <div className="profile-progress-card">
        <div className="progress-header">
          <span className="progress-label">Profile Completeness</span>
          <span className="progress-value">{completeness}%</span>
        </div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${completeness}%` }}
          />
        </div>
        {completeness < 100 && (
          <p className="progress-hint">Complete your profile to get better recommendations</p>
        )}
      </div>

      {/* Sections */}
      <div className="profile-sections">
        {/* Basic Info */}
        <div className="profile-card">
          <div className="profile-card-header">
            <User size={16} />
            <h2>Basic Information</h2>
          </div>
          <div className="profile-card-body">
            <div className="profile-grid">
              <div className="profile-field">
                <label>Full Name</label>
                <input
                  className="profile-input"
                  value={profile?.fullName || ''}
                  onChange={e => handleChange('fullName', e.target.value)}
                  placeholder="Your full name"
                />
              </div>
              <div className="profile-field">
                <label>Email</label>
                <input
                  className="profile-input"
                  type="email"
                  value={profile?.email || ''}
                  onChange={e => handleChange('email', e.target.value)}
                  placeholder="your@email.com"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Education */}
        <div className="profile-card">
          <div className="profile-card-header">
            <GraduationCap size={16} />
            <h2>Education</h2>
          </div>
          <div className="profile-card-body">
            <div className="profile-grid profile-grid-3">
              <div className="profile-field">
                <label>Degree</label>
                <input
                  className="profile-input"
                  value={profile?.education?.degree || ''}
                  onChange={e => handleEduChange('degree', e.target.value)}
                  placeholder="B.Tech, M.S., etc."
                />
              </div>
              <div className="profile-field">
                <label>Branch / Major</label>
                <input
                  className="profile-input"
                  value={profile?.education?.branch || ''}
                  onChange={e => handleEduChange('branch', e.target.value)}
                  placeholder="Computer Science"
                />
              </div>
              <div className="profile-field">
                <label>College / University</label>
                <input
                  className="profile-input"
                  value={profile?.education?.college || ''}
                  onChange={e => handleEduChange('college', e.target.value)}
                  placeholder="MIT, IIT, etc."
                />
              </div>
              <div className="profile-field">
                <label>Graduation Year</label>
                <input
                  className="profile-input"
                  value={profile?.education?.graduationYear || ''}
                  onChange={e => handleEduChange('graduationYear', e.target.value)}
                  placeholder="2026"
                />
              </div>
              <div className="profile-field">
                <label>Country</label>
                <input
                  className="profile-input"
                  value={profile?.education?.country || ''}
                  onChange={e => handleEduChange('country', e.target.value)}
                  placeholder="India"
                />
              </div>
              <div className="profile-field">
                <label>CGPA</label>
                <input
                  className="profile-input"
                  value={profile?.education?.cgpa || ''}
                  onChange={e => handleEduChange('cgpa', e.target.value)}
                  placeholder="8.5"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="profile-card">
          <div className="profile-card-header">
            <Sparkles size={16} />
            <h2>Skills</h2>
          </div>
          <div className="profile-card-body">
            <div className="tags-container">
              {profile?.skills?.map((skill, i) => (
                <span key={i} className="tag tag-skill">
                  {skill}
                  <button onClick={() => removeSkill(i)} className="tag-remove">
                    <X size={12} />
                  </button>
                </span>
              ))}
              {(!profile?.skills || profile.skills.length === 0) && (
                <span className="tags-empty">No skills added yet</span>
              )}
            </div>
            <div className="tag-input-row">
              <input
                className="profile-input"
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                placeholder="Add a skill..."
              />
              <button className="tag-add-btn" onClick={addSkill} disabled={!skillInput.trim()}>
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Interests */}
        <div className="profile-card">
          <div className="profile-card-header">
            <Heart size={16} />
            <h2>Interests</h2>
          </div>
          <div className="profile-card-body">
            <div className="tags-container">
              {profile?.interests?.map((interest, i) => (
                <span key={i} className="tag tag-interest">
                  {interest}
                  <button onClick={() => removeInterest(i)} className="tag-remove">
                    <X size={12} />
                  </button>
                </span>
              ))}
              {(!profile?.interests || profile.interests.length === 0) && (
                <span className="tags-empty">No interests added yet</span>
              )}
            </div>
            <div className="tag-input-row">
              <input
                className="profile-input"
                value={interestInput}
                onChange={e => setInterestInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                placeholder="Add an interest..."
              />
              <button className="tag-add-btn" onClick={addInterest} disabled={!interestInput.trim()}>
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Career Goals */}
        <div className="profile-card">
          <div className="profile-card-header">
            <Target size={16} />
            <h2>Career Goals</h2>
          </div>
          <div className="profile-card-body">
            <textarea
              className="profile-textarea"
              value={profile?.careerGoals || ''}
              onChange={e => handleChange('careerGoals', e.target.value)}
              placeholder="What are your career goals? What kind of opportunities excite you?"
              rows={4}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
