import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../services/authService';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <h1>Welcome to Your Dashboard, {user?.name}!</h1>
      <p>Email: {user?.email}</p>
      <p>User ID: {user?.id}</p>
      
      <button onClick={handleLogout} className="btn" style={{ marginTop: '1rem' }}>
        Logout
      </button>
      
      <div style={{ marginTop: '2rem' }}>
        <h2>Your Projects</h2>
        <p>No projects yet. Create your first project!</p>
      </div>
    </div>
  );
};

export default Dashboard;