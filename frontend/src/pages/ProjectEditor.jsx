import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { getProject, updateProject } from '../services/projectService';
import { getCurrentUser } from '../services/authService';
import './ProjectEditor.css';

const ProjectEditor = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [project, setProject] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchProject();
  }, [projectId, user, navigate]);

  const fetchProject = async () => {
    try {
      const response = await getProject(projectId);
      setProject(response.project);
      setCode(response.project.code || '');
      setLanguage(response.project.language || 'javascript');
    } catch (err) {
      setError('Failed to load project');
      console.error('Error fetching project:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (value) => {
    setCode(value);
    // Auto-save after 2 seconds of inactivity
    debouncedSave();
  };

  const handleSave = async () => {
    if (!project) return;
    
    setSaving(true);
    try {
      await updateProject(projectId, { code, language });
      // Show saved indicator
      const saveIndicator = document.getElementById('save-indicator');
      if (saveIndicator) {
        saveIndicator.textContent = 'Saved ✓';
        setTimeout(() => {
          if (saveIndicator) saveIndicator.textContent = '';
        }, 2000);
      }
    } catch (err) {
      setError('Failed to save project');
      console.error('Error saving project:', err);
    } finally {
      setSaving(false);
    }
  };

  // Debounce save function
  const debouncedSave = debounce(handleSave, 2000);

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    debouncedSave();
  };

  const handleRunCode = () => {
    // We'll implement code execution in Phase 6
    alert('Code execution will be implemented in Phase 6 with Judge0/Piston API');
  };

  if (loading) {
    return (
      <div className="editor-container">
        <div className="editor-loading">Loading project...</div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="editor-container">
        <div className="editor-error">
          <h3>Error loading project</h3>
          <p>{error || 'Project not found'}</p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="editor-container">
      {/* Editor Header */}
      <div className="editor-header">
        <div className="editor-header-left">
          <button 
            onClick={() => navigate('/dashboard')}
            className="back-btn"
          >
            ← Dashboard
          </button>
          <h2>{project.name}</h2>
          {project.description && <p className="project-description">{project.description}</p>}
        </div>
        
        <div className="editor-header-right">
          <select 
            value={language} 
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="language-select"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
          </select>
          
          <button 
            onClick={handleRunCode}
            className="run-btn"
            disabled={saving}
          >
            ▶ Run Code
          </button>
          
          <div className="save-status">
            {saving ? 'Saving...' : <span id="save-indicator"></span>}
          </div>

          <div className="collaborators">
            <span className="online-dot"></span>
            <span>1 online</span>
          </div>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="editor-wrapper">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={handleCodeChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: true },
            fontSize: 14,
            wordWrap: 'on',
            automaticLayout: true,
            padding: { top: 10 },
          }}
          loading={<div>Loading editor...</div>}
        />
      </div>

      {/* Output Panel (will be used in Phase 6) */}
      <div className="output-panel">
        <div className="output-header">
          <h4>Output</h4>
          <button className="clear-output">Clear</button>
        </div>
        <div className="output-content">
          <p>Run your code to see output here</p>
        </div>
      </div>
    </div>
  );
};

// Debounce utility function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default ProjectEditor;