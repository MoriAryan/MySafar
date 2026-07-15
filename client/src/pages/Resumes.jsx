import { useState, useEffect } from 'react';
import { FileText, Upload, Trash2, ExternalLink, Loader2, AlertCircle, CheckCircle, FolderOpen } from 'lucide-react';
import { getResumes, uploadResume, deleteResume } from '../services/api';
import './Resumes.css';

export default function Resumes() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [resumeName, setResumeName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    loadResumes();
  }, []);

  // Auto-clear success message
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const loadResumes = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getResumes();
      setResumes(res.data);
    } catch (err) {
      console.error('Failed to load resumes:', err);
      setError('Could not load resumes. Make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const processFile = (file) => {
    if (file.type !== 'application/pdf') {
      setError('Only PDF resumes are supported.');
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
    setError('');
    if (!resumeName) {
      const baseName = file.name.replace(/\.[^/.]+$/, "");
      setResumeName(baseName);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragOut = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile || !resumeName.trim()) {
      setError('Please select a file and provide a name.');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('resume', selectedFile);
      formData.append('name', resumeName.trim());

      await uploadResume(formData);
      setSuccess('Resume uploaded successfully!');
      setResumeName('');
      setSelectedFile(null);

      const fileInput = document.getElementById('resume-file-input');
      if (fileInput) fileInput.value = '';

      loadResumes();
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.error || 'Failed to upload resume. Ensure file is PDF and under 10MB.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;
    try {
      await deleteResume(id);
      loadResumes();
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete resume.');
    }
  };

  return (
    <div className="resumes-page">
      <div className="resumes-header">
        <div>
          <h1>Resume Manager</h1>
          <p>Upload, manage, and link resume versions to your applications</p>
        </div>
        <div className="resumes-header-stat">
          <span className="resume-stat-num">{resumes.length}</span>
          <span className="resume-stat-label">Resumes</span>
        </div>
      </div>

      <div className="resumes-layout">
        {/* Upload Card */}
        <div className="resumes-upload-card">
          <div className="upload-card-header">
            <Upload size={18} />
            <h3>Upload Resume</h3>
          </div>

          <form onSubmit={handleUpload} className="upload-form">
            <div className="upload-field">
              <label className="upload-label">Resume Name / Version</label>
              <input
                type="text"
                className="upload-input"
                placeholder="e.g. AI/ML Resume, SDE Intern v2"
                value={resumeName}
                onChange={e => setResumeName(e.target.value)}
                disabled={uploading}
              />
            </div>

            <div className="upload-field">
              <label className="upload-label">PDF File</label>
              <div
                className={`upload-dropzone ${dragActive ? 'dropzone-active' : ''} ${selectedFile ? 'dropzone-selected' : ''}`}
                onDragEnter={handleDragIn}
                onDragLeave={handleDragOut}
                onDragOver={handleDrag}
                onDrop={handleFileDrop}
              >
                <input
                  id="resume-file-input"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="dropzone-input"
                />
                <label htmlFor="resume-file-input" className="dropzone-content">
                  {selectedFile ? (
                    <>
                      <div className="dropzone-file-icon">
                        <FileText size={20} />
                      </div>
                      <span className="dropzone-filename">{selectedFile.name}</span>
                      <span className="dropzone-size">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="dropzone-upload-icon">
                        <Upload size={22} />
                      </div>
                      <span className="dropzone-text">
                        Drop your PDF here or <strong>browse</strong>
                      </span>
                      <span className="dropzone-hint">PDF only • Max 10MB</span>
                    </>
                  )}
                </label>
              </div>
            </div>

            {error && (
              <div className="upload-alert upload-alert-error">
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="upload-alert upload-alert-success">
                <CheckCircle size={14} />
                <span>{success}</span>
              </div>
            )}

            <button
              type="submit"
              className="upload-btn"
              disabled={uploading || !selectedFile || !resumeName.trim()}
            >
              {uploading ? (
                <>
                  <Loader2 size={16} className="spinner" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={16} />
                  Upload Resume
                </>
              )}
            </button>
          </form>
        </div>

        {/* Resumes List */}
        <div className="resumes-list-card">
          <div className="list-card-header">
            <FolderOpen size={18} />
            <h3>Your Resumes</h3>
            <span className="list-count">{resumes.length}</span>
          </div>

          {loading ? (
            <div className="resumes-loading">
              <Loader2 size={22} className="spinner" />
              <p>Loading resumes...</p>
            </div>
          ) : resumes.length === 0 ? (
            <div className="resumes-empty-state">
              <div className="empty-icon-wrapper">
                <FileText size={32} />
              </div>
              <h4>No resumes yet</h4>
              <p>Upload your first resume to start linking it to applications</p>
            </div>
          ) : (
            <div className="resumes-list">
              {resumes.map((resume, index) => (
                <div key={resume._id} className="resume-item" style={{ animationDelay: `${index * 0.05}s` }}>
                  <div className="resume-item-left">
                    <div className="resume-item-icon">
                      <FileText size={16} />
                    </div>
                    <div className="resume-item-info">
                      <span className="resume-item-name">{resume.name}</span>
                      <span className="resume-item-date">
                        {new Date(resume.uploadedAt).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="resume-item-actions">
                    <a
                      href={`/api/resumes/${resume._id}/view`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="resume-action-btn"
                      title="Open PDF"
                    >
                      <ExternalLink size={14} />
                    </a>
                    <button
                      className="resume-action-btn resume-action-delete"
                      onClick={() => handleDelete(resume._id)}
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
