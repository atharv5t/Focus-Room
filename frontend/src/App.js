import React, { useState } from 'react';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/clerk-react';
import './App.css';

function App() {
  // --- STATE FOR ROUTING ---
  const currentPath = window.location.pathname;

  // --- STATE FOR DASHBOARD ---
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(25);
  
  const [taskInput, setTaskInput] = useState('');
  const [logs, setLogs] = useState([
    { title: 'formula', time: '7:34 AM – 7:35 AM' },
    { title: 'testing', time: '7:27 PM – 7:36 PM' }
  ]);

  const [dailyGoal, setDailyGoal] = useState('');
  const [weeklyGoal, setWeeklyGoal] = useState('‘nlm & trig’');
  const [monthlyGoal, setMonthlyGoal] = useState('');

  // --- DASHBOARD FUNCTIONS ---
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartTimer = (mins) => {
    setSelectedDuration(mins);
    setTimeLeft(mins * 60);
    setIsRunning(true);
  };

  const handleAddLog = () => {
    if (!taskInput.trim()) return;
    const newLog = { title: taskInput, time: 'Just now' };
    setLogs([newLog, ...logs]);
    setTaskInput('');
  };

  // ==========================================
  // PAGE 2: DASHBOARD VIEW
  // ==========================================
  if (currentPath === '/dashboard') {
    return (
      <div className="dashboard-container" style={{ padding: '40px', fontFamily: 'sans-serif' }}>
        {/* Top Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px' }}>Focus.room</h1>
            <span style={{ fontSize: '12px', color: '#666' }}>BY ATHARV</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ fontSize: '14px', fontWeight: '500', color: '#555' }}>FRIDAY 31 JULY</span>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </header>

        {/* Main Grid Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '40px' }}>
          
          {/* Left Column: Focus Session & Time Studied */}
          <div>
            <div style={{ marginBottom: '40px' }}>
              <h3 style={{ fontSize: '12px', letterSpacing: '1px', color: '#888', marginBottom: '20px' }}>FOCUS SESSION</h3>
              <div style={{ fontSize: '120px', fontWeight: '300', lineHeight: 1, marginBottom: '20px' }}>
                {formatTime(timeLeft)}
              </div>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button 
                  onClick={() => setIsRunning(!isRunning)} 
                  style={{ padding: '10px 30px', background: '#1c1c1c', color: '#fff', border: 'none', borderRadius: '20px', cursor: 'pointer' }}
                >
                  {isRunning ? 'PAUSE' : 'START'}
                </button>
                <button 
                  onClick={() => { setIsRunning(false); setTimeLeft(selectedDuration * 60); }}
                  style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #ccc', borderRadius: '20px', cursor: 'pointer' }}
                >
                  RESET
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#666' }}>
                <span>DURATION</span>
                {[25, 45, 60, 90, 120].map((mins) => (
                  <button 
                    key={mins}
                    onClick={() => handleStartTimer(mins)}
                    style={{ 
                      padding: '6px 12px', 
                      borderRadius: '15px', 
                      border: '1px solid #ddd', 
                      background: selectedDuration === mins ? '#e2dcca' : 'transparent',
                      cursor: 'pointer' 
                    }}
                  >
                    {mins < 60 ? `${mins}m` : `${mins / 60}h`}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Studied Section */}
            <div>
              <h3 style={{ fontSize: '12px', letterSpacing: '1px', color: '#888', marginBottom: '15px' }}>● TIME STUDIED</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                <div style={{ background: '#f5f2eb', padding: '20px', borderRadius: '8px', border: '1px solid #e8e3d5' }}>
                  <span style={{ fontSize: '11px', color: '#777' }}>● TODAY</span>
                  <div style={{ fontSize: '28px', fontWeight: '600', marginTop: '10px' }}>10m</div>
                </div>
                <div style={{ background: '#f5f2eb', padding: '20px', borderRadius: '8px', border: '1px solid #e8e3d5' }}>
                  <span style={{ fontSize: '11px', color: '#777' }}>● THIS WEEK</span>
                  <div style={{ fontSize: '28px', fontWeight: '600', marginTop: '10px' }}>10m</div>
                </div>
                <div style={{ background: '#f5f2eb', padding: '20px', borderRadius: '8px', border: '1px solid #e8e3d5' }}>
                  <span style={{ fontSize: '11px', color: '#777' }}>● THIS MONTH</span>
                  <div style={{ fontSize: '28px', fontWeight: '600', marginTop: '10px' }}>10m</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Log Book & Goals */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {/* Log Book Box */}
            <div style={{ border: '1px solid #e0dbc9', padding: '25px', borderRadius: '12px', background: 'rgba(255,255,255,0.5)' }}>
              <h3 style={{ fontSize: '12px', letterSpacing: '1px', color: '#888', marginBottom: '15px' }}>● LOG BOOK · TODAY</h3>
              
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input 
                  type="text" 
                  placeholder="What are you starting on?" 
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
                  style={{ flex: 1, padding: '10px', border: 'none', borderBottom: '1px solid #ccc', background: 'transparent', outline: 'none' }}
                />
                <button 
                  onClick={handleAddLog}
                  style={{ padding: '8px 16px', background: '#1c1c1c', color: '#fff', border: 'none', borderRadius: '15px', cursor: 'pointer', fontSize: '12px' }}
                >
                  START
                </button>
              </div>

              {logs.map((log, index) => (
                <div key={index} style={{ marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                  <div style={{ fontWeight: '500', fontSize: '15px' }}>{log.title}</div>
                  <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>{log.time}</div>
                </div>
              ))}
            </div>

            {/* Goals Box */}
            <div style={{ border: '1px solid #e0dbc9', padding: '25px', borderRadius: '12px', background: 'rgba(255,255,255,0.5)' }}>
              <h3 style={{ fontSize: '12px', letterSpacing: '1px', color: '#888', marginBottom: '15px' }}>● GOALS</h3>
              
              <div style={{ marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#777' }}>
                  <span>● DAILY</span>
                  <span style={{ cursor: 'pointer' }}>SET</span>
                </div>
                <div style={{ fontSize: '14px', color: '#aaa', fontStyle: 'italic', marginTop: '5px' }}>
                  {dailyGoal || 'e.g. 1 chapter of calculus, 30 min run...'}
                </div>
              </div>

              <div style={{ marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#777' }}>
                  <span>● WEEKLY</span>
                  <span style={{ cursor: 'pointer' }}>EDIT</span>
                </div>
                <div style={{ fontSize: '14px', color: '#333', fontStyle: 'italic', marginTop: '5px' }}>
                  {weeklyGoal}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#777' }}>
                  <span>● MONTHLY</span>
                  <span style={{ cursor: 'pointer' }}>SET</span>
                </div>
                <div style={{ fontSize: '14px', color: '#aaa', fontStyle: 'italic', marginTop: '5px' }}>
                  {monthlyGoal || 'e.g. ship v1.0, read 3 books...'}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // PAGE 1: LANDING/WELCOME VIEW
  // ==========================================
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