import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../services/authService';
import './Dashboard.css'; // We'll create this CSS file

const Dashboard = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return null;
  }

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
          <button 
            className={activeTab === 'overview' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
          <button 
            className={activeTab === 'projects' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActiveTab('projects')}
          >
            📁 My Projects
          </button>
          <button 
            className={activeTab === 'shared' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActiveTab('shared')}
          >
            👥 Shared with Me
          </button>
          <button 
            className={activeTab === 'settings' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActiveTab('settings')}
          >
            ⚙️ Settings
          </button>
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="dashboard-main">
        <div className="dashboard-header">
          <h1>
            {activeTab === 'overview' && 'Dashboard Overview'}
            {activeTab === 'projects' && 'My Projects'}
            {activeTab === 'shared' && 'Shared Projects'}
            {activeTab === 'settings' && 'Settings'}
          </h1>
          <button className="create-project-btn">
            + New Project
          </button>
        </div>

        <div className="dashboard-content">
          {activeTab === 'overview' && (
            <div className="overview-cards">
              <div className="stats-card">
                <div className="card-icon">📁</div>
                <div className="card-content">
                  <h3>5</h3>
                  <p>Total Projects</p>
                </div>
              </div>
              
              <div className="stats-card">
                <div className="card-icon">👥</div>
                <div className="card-content">
                  <h3>3</h3>
                  <p>Collaborators</p>
                </div>
              </div>
              
              <div className="stats-card">
                <div className="card-icon">⚡</div>
                <div className="card-content">
                  <h3>12</h3>
                  <p>Code Runs</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="projects-section">
              <div className="empty-state">
                <div className="empty-icon">📁</div>
                <h3>No projects yet</h3>
                <p>Create your first project to start collaborating with others</p>
                <button className="primary-btn">
                  Create First Project
                </button>
              </div>
            </div>
          )}

          {/* Add other tab contents here */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;