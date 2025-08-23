const Home = () => {
  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
          Collaborative Code Editor
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '2rem' }}>
          Work on code projects in real-time with your team. 
          Edit, run, and collaborate seamlessly.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button className="btn btn-primary">Get Started</button>
          <button className="btn" style={{ border: '1px solid #646cff', color: '#646cff' }}>
            Learn More
          </button>
        </div>
      </div>
    </div>
  )
}

export default Home