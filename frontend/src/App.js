import React from 'react';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/clerk-react';
import './App.css';

function App() {
  return (
    <div className="landing-container">
      {/* Top Navigation with Auth Buttons */}
      <nav className="top-nav">
        <div className="brand">
          <h1>Focusroom</h1>
        </div>
        <div>
          <SignedOut>
            <SignInButton mode="modal" />
            <SignUpButton mode="modal" style={{ marginLeft: '10px' }} />
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </nav>

      {/* Public Landing Page Content */}
      <div className="landing-content">
        <h1 className="title">Your focus, amplified.</h1>
        <p className="tagline">The ultimate platform to keep you locked in.</p>

        <div className="action-buttons">
          <SignedOut>
            <SignUpButton mode="modal">
              <button className="btn-primary">Get Started</button>
            </SignUpButton>
            <SignInButton mode="modal">
              <button className="btn-secondary">Sign In</button>
            </SignInButton>
          </SignedOut>
          
          <SignedIn>
            <a href="/dashboard">
              <button className="btn-primary">Go to Dashboard</button>
            </a>
          </SignedIn>
        </div>
      </div>
    </div>
  );
}

export default App;