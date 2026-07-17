import { useState, useEffect, useCallback } from 'react';
import {
  Trophy, Briefcase, Clock, CheckCircle2,
  Calendar, ExternalLink, Trash2, Edit3,
  Award, Send, FileText, User2
} from 'lucide-react';
import { getOpportunities, deleteOpportunity, moveOpportunity, updateOpportunity } from '../services/api';
import './Dashboard.css';

const SECTION_CONFIG = {
  yet_to_apply: {
    title: 'Yet to Apply',
    icon: Clock,
    color: '#fbbf24',
    statuses: ['yet to apply']
  },
  applied: {
    title: 'Applied',
    icon: Send,
    color: '#60a5fa',
    statuses: ['applied', 'applied thru referral', 'given oa']
  },
  completed: {
    title: 'Completed',
    icon: CheckCircle2,
    color: '#34d399',
    statuses: ['selected 🔥', 'rejected', 'done']
  }
};

function getStatusClass(status) {
  const s = (status || '').toLowerCase().trim();
  if (s === 'yet to apply') return 'status-yet-to-apply';
  if (s === 'applied') return 'status-applied';
  if (s === 'applied thru referral') return 'status-referral';
  if (s === 'given oa') return 'status-oa';
  if (s.includes('selected')) return 'status-selected';
  if (s === 'rejected') return 'status-rejected';
  if (s === 'done') return 'status-done';
  return 'status-custom';
}

function getDeadlineInfo(deadline) {
  if (!deadline) return null;
  const now = new Date();
  const dl = new Date(deadline);
  const diffMs = dl - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { text: 'Expired', urgency: 'expired' };
  if (diffDays === 0) return { text: 'Today!', urgency: 'critical' };
  if (diffDays === 1) return { text: 'Tomorrow', urgency: 'critical' };
  if (diffDays <= 3) return { text: `${diffDays}d left`, urgency: 'critical' };
  if (diffDays <= 7) return { text: `${diffDays}d left`, urgency: 'warning' };
  return { text: `${diffDays}d left`, urgency: 'normal' };
}

function OpportunityRow({ opp, onDelete, onUpdate, onDragStart }) {
  const [editing, setEditing] = useState(false);
  const [editValues, setEditValues] = useState({});
  const deadlineInfo = getDeadlineInfo(opp.deadline);

  const handleStartEdit = () => {
    setEditValues({
      title: opp.title,
      description: opp.description,
      status: opp.status,
      type: opp.type || 'competition',
      deadline: opp.deadline ? new Date(opp.deadline).toISOString().split('T')[0] : '',
      resumeUsed: opp.resumeUsed || 'Default',
      referralName: opp.referralName || '',
      sourceUrl: opp.sourceUrl || ''
    });
    setEditing(true);
  };

  const handleSaveEdit = async () => {
    await onUpdate(opp._id, editValues);
    setEditing(false);
  };

  const handleCancelEdit = () => {
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="opp-row opp-row-editing">
        <div className="edit-form">
          <div className="edit-row">
            <input
              type="text"
              className="edit-input flex-2"
              value={editValues.title}
              onChange={e => setEditValues({ ...editValues, title: e.target.value })}
              placeholder="Title"
            />
            <input
              type="url"
              className="edit-input flex-1"
              value={editValues.sourceUrl}
              onChange={e => setEditValues({ ...editValues, sourceUrl: e.target.value })}
              placeholder="Link URL"
            />
          </div>
          
          <textarea
            className="edit-input edit-textarea"
            value={editValues.description}
            onChange={e => setEditValues({ ...editValues, description: e.target.value })}
            placeholder="Description / Notes"
            rows={2}
          />
          
          <div className="edit-row">
            <select
              className="edit-input"
              value={editValues.type}
              onChange={e => setEditValues({ ...editValues, type: e.target.value })}
            >
              <option value="competition">Competition</option>
              <option value="internship">Internship</option>
            </select>
            
            <select
              className="edit-input"
              value={editValues.status}
              onChange={e => setEditValues({ ...editValues, status: e.target.value })}
            >
              <optgroup label="Yet to Apply">
                <option value="yet to apply">Yet to Apply</option>
              </optgroup>
              <optgroup label="Applied">
                <option value="applied">Applied</option>
                <option value="applied thru referral">Applied thru Referral</option>
                <option value="given oa">Given OA</option>
              </optgroup>
              <optgroup label="Completed">
                <option value="selected 🔥">Selected 🔥</option>
                <option value="rejected">Rejected</option>
                <option value="done">Done</option>
              </optgroup>
            </select>
            
            <input
              type="date"
              className="edit-input"
              value={editValues.deadline}
              onChange={e => setEditValues({ ...editValues, deadline: e.target.value })}
            />
          </div>

          <div className="edit-row">
            <input
              type="text"
              className="edit-input"
              value={editValues.resumeUsed}
              onChange={e => setEditValues({ ...editValues, resumeUsed: e.target.value })}
              placeholder="Resume version (e.g. Default)"
            />
            {editValues.status === 'applied thru referral' && (
              <input
                type="text"
                className="edit-input"
                value={editValues.referralName}
                onChange={e => setEditValues({ ...editValues, referralName: e.target.value })}
                placeholder="Referral name"
              />
            )}
          </div>
          
          <div className="edit-actions">
            <button className="btn btn-sm btn-secondary" onClick={handleCancelEdit}>Cancel</button>
            <button className="btn btn-sm btn-primary" onClick={handleSaveEdit}>Save</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="opp-row"
      draggable
      onDragStart={(e) => onDragStart(e, opp._id)}
    >
      <div className="opp-row-main">
        <div className="opp-row-top">
          <div className="opp-row-title-area">
            {opp.sourceUrl ? (
              <a
                href={opp.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="opp-row-title"
              >
                {opp.title}
              </a>
            ) : (
              <span className="opp-row-title no-link">{opp.title}</span>
            )}
            <span className={`status-pill ${getStatusClass(opp.status)}`}>
              {opp.status}
            </span>
          </div>

          <div className="opp-row-actions">
            <button className="icon-btn" onClick={handleStartEdit} title="Edit">
              <Edit3 size={14} />
            </button>
            <button className="icon-btn icon-btn-danger" onClick={() => onDelete(opp._id)} title="Delete">
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {opp.description && (
          <p className="opp-row-desc">{opp.description}</p>
        )}

        <div className="opp-row-meta">
          {deadlineInfo && (
            <span className={`meta-tag deadline-${deadlineInfo.urgency}`}>
              <Calendar size={12} />
              {opp.deadline && new Date(opp.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              <span className="deadline-countdown">{deadlineInfo.text}</span>
            </span>
          )}
          {opp.resumeUsed && opp.resumeUsed !== 'Default' && (
            <span className="meta-tag meta-resume">
              <FileText size={12} />
              {opp.resumeUsed}
            </span>
          )}
          {opp.status === 'applied thru referral' && opp.referralName && (
            <span className="meta-tag meta-referral">
              <User2 size={12} />
              Ref: {opp.referralName}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function KanbanSection({ sectionKey, items, onDelete, onUpdate, onDragStart, onDragOver, onDrop }) {
  const config = SECTION_CONFIG[sectionKey];
  const Icon = config.icon;

  return (
    <div
      className="kanban-section"
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, sectionKey)}
      data-section={sectionKey}
    >
      <div className="kanban-section-header" style={{ '--section-color': config.color }}>
        <div className="kanban-section-title">
          <Icon size={16} style={{ color: config.color }} />
          <h3>{config.title}</h3>
          <span className="kanban-count">{items.length}</span>
        </div>
      </div>

      <div className="kanban-section-body">
        {items.length === 0 ? (
          <div className="kanban-empty">
            <p>No entries yet</p>
            <span>Drag items here or add new</span>
          </div>
        ) : (
          items.map(opp => (
            <OpportunityRow
              key={opp._id}
              opp={opp}
              onDelete={onDelete}
              onUpdate={onUpdate}
              onDragStart={onDragStart}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('competition');
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dragOverSection, setDragOverSection] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getOpportunities({ type: activeTab });
      setOpportunities(res.data || []);
    } catch (err) {
      console.error('Failed to fetch:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Group opportunities by section
  const grouped = {
    yet_to_apply: [],
    applied: [],
    completed: []
  };

  opportunities.forEach(opp => {
    const section = opp.section || 'yet_to_apply';
    if (grouped[section]) {
      grouped[section].push(opp);
    } else {
      grouped.yet_to_apply.push(opp);
    }
  });

  // Sort "yet to apply" by deadline (earliest first, null deadlines last)
  grouped.yet_to_apply.sort((a, b) => {
    if (!a.deadline && !b.deadline) return 0;
    if (!a.deadline) return 1;
    if (!b.deadline) return -1;
    return new Date(a.deadline) - new Date(b.deadline);
  });

  const handleDelete = async (id) => {
    if (!confirm('Delete this entry?')) return;
    try {
      await deleteOpportunity(id);
      setOpportunities(prev => prev.filter(o => o._id !== id));
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleUpdate = async (id, updates) => {
    try {
      const res = await updateOpportunity(id, updates);
      if (res.success) {
        if (updates.type && updates.type !== activeTab) {
          setOpportunities(prev => prev.filter(o => o._id !== id));
        } else {
          setOpportunities(prev =>
            prev.map(o => o._id === id ? res.data : o)
          );
        }
      }
    } catch (err) {
      console.error('Update error:', err);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e, id) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
    requestAnimationFrame(() => {
      e.target.classList.add('dragging');
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const section = e.currentTarget.dataset.section;
    if (section !== dragOverSection) {
      setDragOverSection(section);
    }
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('drag-over');
    setDragOverSection(null);
  };

  const handleDrop = async (e, targetSection) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    setDragOverSection(null);

    const id = e.dataTransfer.getData('text/plain');
    if (!id) return;

    document.querySelectorAll('.dragging').forEach(el => el.classList.remove('dragging'));

    const opp = opportunities.find(o => o._id === id);
    if (!opp || opp.section === targetSection) return;

    // Optimistically update
    setOpportunities(prev =>
      prev.map(o => o._id === id ? { ...o, section: targetSection } : o)
    );

    try {
      await moveOpportunity(id, targetSection);
    } catch (err) {
      console.error('Move error:', err);
      fetchData();
    }
  };

  const totalCount = opportunities.length;

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="dashboard-header-left">
          <h1>Dashboard</h1>
          <p className="dashboard-subtitle">Track your applications and opportunities</p>
        </div>
        <div className="dashboard-stats-mini">
          <div className="mini-stat">
            <span className="mini-stat-num">{grouped.yet_to_apply.length}</span>
            <span className="mini-stat-label">To Apply</span>
          </div>
          <div className="mini-stat">
            <span className="mini-stat-num">{grouped.applied.length}</span>
            <span className="mini-stat-label">Applied</span>
          </div>
          <div className="mini-stat">
            <span className="mini-stat-num">{grouped.completed.length}</span>
            <span className="mini-stat-label">Completed</span>
          </div>
        </div>
      </header>

      {/* Tab Switcher */}
      <div className="tab-switcher">
        <button
          className={`tab-btn ${activeTab === 'competition' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('competition')}
        >
          <Trophy size={16} />
          <span>Competitions</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'internship' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('internship')}
        >
          <Briefcase size={16} />
          <span>Internships</span>
        </button>
        <div
          className="tab-indicator"
          style={{ transform: activeTab === 'internship' ? 'translateX(100%)' : 'translateX(0)' }}
        />
      </div>

      {/* Kanban Board */}
      {loading ? (
        <div className="dashboard-loading">
          <div className="spinner" />
          <p>Loading entries...</p>
        </div>
      ) : (
        <div className="kanban-board">
          {['yet_to_apply', 'applied', 'completed'].map(sectionKey => (
            <KanbanSection
              key={sectionKey}
              sectionKey={sectionKey}
              items={grouped[sectionKey]}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
              onDragStart={handleDragStart}
              onDragOver={(e) => { handleDragOver(e); }}
              onDrop={handleDrop}
            />
          ))}
        </div>
      )}

      {!loading && totalCount === 0 && (
        <div className="empty-dashboard">
          <Award size={48} />
          <h3>No {activeTab === 'internship' ? 'internships' : 'competitions'} tracked yet</h3>
          <p>Click <strong>"Track New"</strong> in the sidebar to add your first entry</p>
        </div>
      )}
    </div>
  );
}
