import { BrowserRouter as Router, Routes, Route } from 'react-router-dom' /* used for navigate between pages */
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Navbar from './components/Navbar'
import './App.css'
import Dashboard from './pages/Dashboard'
import ProjectEditor from './pages/ProjectEditor';


function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} /> {/* New route for Dashboard */}
          <Route path="/editor/:projectId" element={<ProjectEditor />} />
          </Routes>
      </div>
    </Router>
  )
}

export default App