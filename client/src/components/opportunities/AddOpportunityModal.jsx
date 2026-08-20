import { useState, useEffect } from 'react';
import { X, AlertTriangle, Plus } from 'lucide-react';
import { createOpportunity, getResumes } from '../../services/api';
import './AddOpportunityModal.css';

const TYPE_OPTIONS = [
  { value: 'competition', label: 'Competition' },
  { value: 'internship', label: 'Internship' },
  { value: 'oncampus', label: 'On-Campus' }
];

const STATUS_GROUPS = [
  {
    label: 'Yet to Apply',
    options: [
      { value: 'yet to apply', label: 'Yet to Apply' }
    ]
  },
  {
    label: 'Applied',
    options: [
      { value: 'applied', label: 'Applied' },
      { value: 'applied thru referral', label: 'Applied thru Referral' },
      { value: 'given oa', label: 'Given OA' }
    ]
  },
  {
    label: 'Completed',
    options: [
      { value: 'selected 🔥', label: 'Selected 🔥' },
      { value: 'rejected', label: 'Rejected' },
      { value: 'done', label: 'Done' }
    ]
  }
];

function sectionFromStatus(status) {
  const s = (status || '').toLowerCase().trim();
  const appliedStatuses = ['applied', 'applied thru referral', 'given oa'];
  const completedStatuses = ['selected 🔥', 'rejected', 'done'];
  if (appliedStatuses.includes(s)) return 'applied';
  if (completedStatuses.includes(s)) return 'completed';
  return 'yet_to_apply';
}

const initialValues = {
  title: '',
  sourceUrl: '',
  description: '',
  type: 'competition',
  status: 'yet to apply',
  deadline: '',
  resumeUsed: 'Default',
  referralName: '',
  customStatus: ''
};

export default function AddOpportunityModal({ isOpen, onClose, onSaved }) {
  const [values, setValues] = useState(initialValues);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [resumes, setResumes] = useState([]);
  const [useCustomStatus, setUseCustomStatus] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setValues(initialValues);
      setSaving(false);
      setError('');
      setUseCustomStatus(false);
      // Load resumes for dropdown
      getResumes().then(res => {
        setResumes(res.data || []);
      }).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setValues(curr => ({ ...curr, [field]: value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!values.title.trim()) {
      setError('Name is required');
      return;
    }

    setSaving(true);
    setError('');

    const finalStatus = useCustomStatus ? values.customStatus.trim() : values.status;
    if (!finalStatus) {
      setError('Status is required');
      setSaving(false);
      return;
    }

    const payload = {
      sourceUrl: values.sourceUrl.trim(),
      title: values.title.trim(),
      description: values.description.trim(),
      type: values.type,
      status: finalStatus,
      section: sectionFromStatus(finalStatus),
      deadline: values.deadline || null,
      resumeUsed: values.resumeUsed || 'Default',
      referralName: finalStatus === 'applied thru referral' ? values.referralName.trim() : ''
    };

    try {
      await createOpportunity(payload);
      onSaved?.();
      onClose?.();
    } catch (err) {
      console.error(err);
      setError('Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const currentStatus = useCustomStatus ? values.customStatus : values.status;

  return (
    <div className="add-modal-backdrop" onClick={onClose}>
      <div className="add-modal" onClick={(e) => e.stopPropagation()}>
        <div className="add-modal-header">
          <div>
            <h2>Track New Entry</h2>
            <p>Add a competition or internship to track</p>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form className="add-form" onSubmit={handleSave}>
          {/* Name */}
          <label className="add-label">
            <span className="label-text">Name <span className="required">*</span></span>
            <input
              type="text"
              className="add-input"
              value={values.title}
              onChange={handleChange('title')}
              placeholder="e.g. Google Summer of Code, Amazon SDE Intern"
              required
              autoFocus
            />
          </label>

          {/* Link */}
          <label className="add-label">
            <span className="label-text">Link</span>
            <input
              type="url"
              className="add-input"
              value={values.sourceUrl}
              onChange={handleChange('sourceUrl')}
              placeholder="https://opportunity-page.com"
            />
          </label>

          {/* Type + Deadline */}
          <div className="add-field-grid">
            <label className="add-label">
              <span className="label-text">Type</span>
              <select className="add-input" value={values.type} onChange={handleChange('type')}>
                {TYPE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </label>
            <label className="add-label">
              <span className="label-text">Deadline</span>
              <input
                type="date"
                className="add-input"
                value={values.deadline}
                onChange={handleChange('deadline')}
              />
            </label>
          </div>

          {/* Description */}
          <label className="add-label">
            <span className="label-text">Notes / Description</span>
            <textarea
              className="add-textarea"
              value={values.description}
              onChange={handleChange('description')}
              placeholder="Team needed, conditions, notes..."
              rows={3}
            />
          </label>

          {/* Resume + Status */}
          <div className="add-field-grid">
            <label className="add-label">
              <span className="label-text">Resume Version</span>
              <select className="add-input" value={values.resumeUsed} onChange={handleChange('resumeUsed')}>
                <option value="Default">Default</option>
                {resumes.map(r => (
                  <option key={r._id} value={r.name}>{r.name}</option>
                ))}
              </select>
            </label>
            <label className="add-label">
              <span className="label-text">Status</span>
              {!useCustomStatus ? (
                <select className="add-input" value={values.status} onChange={handleChange('status')}>
                  {STATUS_GROUPS.map(group => (
                    <optgroup key={group.label} label={group.label}>
                      {group.options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  className="add-input"
                  value={values.customStatus}
                  onChange={handleChange('customStatus')}
                  placeholder="Enter custom status"
                />
              )}
            </label>
          </div>

          {/* Custom status toggle */}
          <button
            type="button"
            className="custom-status-toggle"
            onClick={() => setUseCustomStatus(!useCustomStatus)}
          >
            <Plus size={14} />
            {useCustomStatus ? 'Use preset status' : 'Use custom status'}
          </button>

          {/* Referral Name - conditional */}
          {currentStatus === 'applied thru referral' && (
            <label className="add-label referral-field">
              <span className="label-text">Referral Name</span>
              <input
                type="text"
                className="add-input"
                value={values.referralName}
                onChange={handleChange('referralName')}
                placeholder="Who referred you?"
              />
            </label>
          )}

          {error && (
            <div className="add-error">
              <AlertTriangle size={14} />
              <span>{error}</span>
            </div>
          )}

          <div className="add-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-save" disabled={saving}>
              {saving ? 'Saving...' : 'Track Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
