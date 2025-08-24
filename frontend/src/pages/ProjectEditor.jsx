import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { getProject, updateProject } from '../services/projectService';
import { getCurrentUser } from '../services/authService';
import socketService from '../services/socketService';
import { executeCode } from '../services/executionService';
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
  const [onlineUsers, setOnlineUsers] = useState(1);
  const [output, setOutput] = useState('');
  const [executing, setExecuting] = useState(false);
  const [userRole, setUserRole] = useState('viewer');
  const editorRef = useRef(null);
  const hasSetupSocket = useRef(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchProject();

    if (!hasSetupSocket.current) {
      setupSocket();
      hasSetupSocket.current = true;
    }

    return () => {
      if (hasSetupSocket.current) {
        socketService.removeAllListeners();
      }
    };
  }, [projectId, user, navigate]);

  // Update editor read-only state when permissions change
  useEffect(() => {
    if (editorRef.current) {
      const canEdit = userRole === 'owner' || userRole === 'editor';
      editorRef.current.updateOptions({ readOnly: !canEdit });
    }
  }, [userRole]);

  const fetchProject = async () => {
    try {
      const response = await getProject(projectId);
      setProject(response.project);
      setCode(response.project.code || '');
      setLanguage(response.project.language || 'javascript');
      
      determineUserRole(response.project);
    } catch (err) {
      setError('Failed to load project');
      console.error('Error fetching project:', err);
    } finally {
      setLoading(false);
    }
  };

  // Debug function to check user role
  const determineUserRole = (projectData) => {
    if (!user || !projectData) {
      setUserRole('viewer');
      return;
    }
    
    console.log('Project owner:', projectData.owner?._id);
    console.log('Current user:', user.id);
    console.log('Collaborators:', projectData.collaborators);
    
    // Check if user is owner
    if (projectData.owner && projectData.owner._id === user.id) {
      setUserRole('owner');
      return;
    }
    
    // Check if user is collaborator
    if (projectData.collaborators && projectData.collaborators.length > 0) {
      const collaboration = projectData.collaborators.find(
        collab => collab.user && collab.user._id === user.id
      );
      
      if (collaboration) {
        setUserRole(collaboration.role || 'viewer');
        return;
      }
    }
    
    setUserRole('viewer');
  };

  const canEdit = userRole === 'owner' || userRole === 'editor';

  const setupSocket = () => {
    const socket = socketService.connect(projectId, user.id);
    
    socketService.onCodeChange(({ code: newCode, senderId }) => {
      if (senderId !== socket.id && canEdit) {
        setCode(newCode);
      }
    });

    socketService.onUserJoined(({ userId }) => {
      console.log('User joined:', userId);
      setOnlineUsers(prev => prev + 1);
    });

    socketService.onUserLeft(({ userId }) => {
      console.log('User left:', userId);
      setOnlineUsers(prev => Math.max(1, prev - 1));
    });
  };

  const handleCodeChange = (value) => {
    if (!canEdit) return;
    
    setCode(value);
    socketService.emitCodeChange(value);
    debouncedSave();
  };

  const handleSave = async () => {
    if (!project || !canEdit) return;
    
    setSaving(true);
    try {
      await updateProject(projectId, { code, language });
      showSaveIndicator();
    } catch (err) {
      setError('Failed to save project');
      console.error('Error saving project:', err);
    } finally {
      setSaving(false);
    }
  };

  const showSaveIndicator = () => {
    const saveIndicator = document.getElementById('save-indicator');
    if (saveIndicator) {
      saveIndicator.textContent = 'Saved ✓';
      setTimeout(() => {
        if (saveIndicator) saveIndicator.textContent = '';
      }, 2000);
    }
  };

  const handleRunCode = async () => {
    setExecuting(true);
    setOutput('Executing code...');
    
    try {
      const result = await executeCode(projectId, { code, language });
      setOutput(result.output || 'No output generated');
    } catch (err) {
      setOutput(`❌ ${err.message || 'Execution failed'}`);
      console.error('Code execution error:', err);
    } finally {
      setExecuting(false);
    }
  };

  const handleClearOutput = () => {
    setOutput('');
  };

  const handleLanguageChange = (newLanguage) => {
    if (!canEdit) return;
    
    setLanguage(newLanguage);
    debouncedSave();
  };

  const debouncedSave = debounce(handleSave, 2000);

  if (loading) {
    return <div className="editor-container"><div className="editor-loading">Loading project...</div></div>;
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
      <div className="editor-header">
        <div className="editor-header-left">
          <button onClick={() => navigate('/dashboard')} className="back-btn">
            ← Dashboard
          </button>
          <h2>{project.name}</h2>
          {project.description && <p className="project-description">{project.description}</p>}
          <span className={`user-role-badge ${userRole}`}>
            {userRole.toUpperCase()}
          </span>
        </div>
        
        <div className="editor-header-right">
          <select 
            value={language} 
            onChange={(e) => handleLanguageChange(e.target.value)} 
            className="language-select"
            disabled={executing || !canEdit}
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
          </select>
          
          <button 
            onClick={handleRunCode} 
            className="run-btn" 
            disabled={saving || executing}
          >
            {executing ? '⏳ Running...' : '▶ Run Code'}
          </button>
          
          <div className="save-status">
            {saving ? 'Saving...' : <span id="save-indicator"></span>}
          </div>

          <div className="collaborators">
            <span className="online-dot"></span>
            <span>{onlineUsers} online</span>
          </div>
        </div>
      </div>

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
            padding: { top: 10 }
          }}
          onMount={(editor) => {
            editorRef.current = editor;
            editor.updateOptions({ readOnly: !canEdit });
          }}
          loading={<div>Loading editor...</div>}
        />
        
        {!canEdit && (
          <div className="view-only-overlay">
            <div className="view-only-message">
              <h3>View Only Mode</h3>
              <p>You have {userRole} access. Contact the project owner for editing permissions.</p>
            </div>
          </div>
        )}
      </div>

      <div className="output-panel">
        <div className="output-header">
          <h4>Output {executing && '(Running...)'}</h4>
          <button 
            className="clear-output" 
            onClick={handleClearOutput}
            disabled={executing}
          >
            Clear
          </button>
        </div>
        <div className="output-content">
          {output ? (
            <pre>{output}</pre>
          ) : (
            <p>Run your code to see output here</p>
          )}
        </div>
      </div>
    </div>
  );
};

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