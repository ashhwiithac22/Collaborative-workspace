import { useState } from 'react';
import { addCollaborator } from '../services/projectService';

const ShareProjectModal = ({ isOpen, onClose, project }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('editor');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter an email address');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await addCollaborator(project._id, { email, role });
      setSuccess(`Invitation sent to ${email}`);
      setEmail('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Share "{project.name}"</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">{error}</div>
          )}
          
          {success && (
            <div className="success-message">{success}</div>
          )}

          <div className="form-group">
            <label htmlFor="email">Collaborator Email *</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter collaborator's email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="editor">Editor (can edit code)</option>
              <option value="viewer">Viewer (read only)</option>
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Sharing...' : 'Share Project'}
            </button>
          </div>
        </form>

        <div className="collaborators-list">
          <h4>Current Collaborators</h4>
          {project.collaborators.map((collab, index) => (
            <div key={index} className="collaborator-item">
              <span>{collab.user.name}</span>
              <span className="role-badge">{collab.role}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShareProjectModal;