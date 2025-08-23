import { Link } from 'react-router-dom'

const Navbar = () => {
  return (
    <nav style={{
      padding: '1rem 0',
      backgroundColor: '#fff',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div className="container">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Link to="/" style={{
            textDecoration: 'none',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#646cff'
          }}>
            CollabWorkspace
          </Link>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/login" className="btn" style={{
              textDecoration: 'none',
              padding: '0.5rem 1rem',
              border: '1px solid #646cff',
              borderRadius: '4px',
              color: '#646cff'
            }}>
              Login
            </Link>
            <Link to="/signup" className="btn btn-primary" style={{
              textDecoration: 'none'
            }}>
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar