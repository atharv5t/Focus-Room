import React, { useState } from 'react';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/clerk-react';
import './App.css';

function App() {
  const [showDashboard, setShowDashboard] = useState(false);

  return (
    <div className="app-container">
      <SignedOut>
        <div className="landing-container">
          <nav className="top-nav">
            <div className="brand">
              <h1>Focusroom</h1>
            </div>
            <div>
              <SignInButton mode="modal" />
              <SignUpButton mode="modal" style={{ marginLeft: '10px' }} />
            </div>
          </nav>

          <div className="landing-content">
            <h1 className="title">Your focus, amplified.</h1>
            <p className="tagline">The ultimate platform to keep you locked in.</p>

            <div className="action-buttons">
              <SignUpButton mode="modal">
                <button className="btn-primary">Get Started</button>
              </SignUpButton>
              <SignInButton mode="modal">
                <button className="btn-secondary">Sign In</button>
              </SignInButton>
            </div>
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        {!showDashboard ? (
          <div className="landing-container">
            <nav className="top-nav">
              <div className="brand">
                <h1>Focusroom</h1>
              </div>
              <UserButton />
            </nav>

            <div className="landing-content">
              <h1 className="title">Your focus, amplified.</h1>
              <p className="tagline">The ultimate platform to keep you locked in.</p>

              <div className="action-buttons">
                <button className="btn-primary" onClick={() => setShowDashboard(true)}>
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="dashboard-container">
            <nav className="top-nav">
              <div className="brand">
                <h1>Focusroom</h1>
              </div>
              <button className="btn-secondary" onClick={() => setShowDashboard(false)} style={{ marginRight: '15px' }}>
                Home
              </button>
              <UserButton />
            </nav>

            <div className="dashboard-content" style={{ padding: '40px', color: '#fff' }}>
              <h2>Dashboard</h2>
              <div className="stats-grid" style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                <div className="card" style={{ background: '#1a1a1a', padding: '20px', borderRadius: '10px' }}>
                  <h3>Timer</h3>
                </div>
                <div className="card" style={{ background: '#1a1a1a', padding: '20px', borderRadius: '10px' }}>
                  <h3>Time Studied</h3>
                </div>
                <div className="card" style={{ background: '#1a1a1a', padding: '20px', borderRadius: '10px' }}>
                  <h3>Daily Log</h3>
                </div>
              </div>
            </div>
          </div>
        )}
      </SignedIn>
    </div>
  );
}

export default App;