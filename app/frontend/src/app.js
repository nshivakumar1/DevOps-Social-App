import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>🐦 SocialClone</h1>
        <p>DevOps Demo Application</p>
        <div className="feature-list">
          <h2>Features</h2>
          <ul>
            <li>✅ Docker containerization</li>
            <li>✅ CI/CD pipeline</li>
            <li>✅ Frontend & Backend services</li>
            <li>✅ Production-ready deployment</li>
          </ul>
        </div>
        <div className="status">
          <p>Status: <span className="status-ok">Running</span></p>
        </div>
      </header>
    </div>
  );
}

export default App;