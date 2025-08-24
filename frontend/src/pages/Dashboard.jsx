import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../services/authService';
import { getUserProjects } from '../services/projectService';
import CreateProjectModal from '../components/CreateProjectModal';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [activeTab, setActiveTab] = useState('projects');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchProjects();
  }, [user, navigate]);

  const fetchProjects = async () => {
    try {
      const response = await getUserProjects();
      setProjects(response.projects || []);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectCreated = (newProject) => {
    setProjects(prev => [newProject, ...prev]);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>CollabWorkspace</h2>
        </div>
        
        <div className="user-profile">
          <div className="user-avatar">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="user-info">
            <h4>{user.name}</h4>
            <p>{user.email}</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button className={activeTab === 'overview' ? 'nav-item active' : 'nav-item'}>
            📊 Overview
          </button>
          <button 
            className={activeTab === 'projects' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActiveTab('projects')}
          >
            📁 My Projects ({projects.length})
          </button>
          <button className={activeTab === 'shared' ? 'nav-item active' : 'nav-item'}>
            👥 Shared with Me
          </button>
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="dashboard-main">
        <div className="dashboard-header">
          <h1>My Projects</h1>
          <button 
            className="create-project-btn"
            onClick={() => setIsModalOpen(true)}
          >
            + New Project
          </button>
        </div>

        <div className="dashboard-content">
          {loading ? (
            <div className="loading">Loading projects...</div>
          ) : projects.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📁</div>
              <h3>No projects yet</h3>
              <p>Create your first project to start collaborating with others</p>
              <button 
                className="primary-btn"
                onClick={() => setIsModalOpen(true)}
              >
                Create First Project
              </button>
            </div>
          ) : (
            <div className="projects-grid">
              {projects.map(project => (
                <div key={project._id} className="project-card">
                  <div className="project-header">
                    <h3>{project.name}</h3>
                    <span className={`language-badge ${project.language}`}>
                      {project.language}
                    </span>
                  </div>
                  
                  {project.description && (
                    <p className="project-description">{project.description}</p>
                  )}
                  
                  <div className="project-meta">
                    <span className="owner">Owner: {project.owner.name}</span>
                    <span className="collaborators">
                      👥 {project.collaborators.length} collaborator{project.collaborators.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="project-actions">
                    <button 
                      className="btn-primary"
                      onClick={() => navigate(`/editor/${project._id}`)}
                    >
                      Open Project
                    </button>
                    <button className="btn-secondary">
                      Settings
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
};

export default Dashboard;