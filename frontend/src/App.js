import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/clerk-react";
import Dashboard from "./pages/Dashboard"; // Ensure this matches your actual path
import { Toaster } from "sonner";
import "./App.css"; 

function LandingPage() {
  return (
    <div className="landing-container">
      <nav className="top-nav">
        <div className="brand">
          <h1>Focus.room</h1>
          <span className="subtitle">BY ATHARV</span>
        </div>
      </nav>
      
      <main className="landing-content">
        <h2 className="title">Master your time.</h2>
        <p className="tagline">The ultimate focus dashboard.</p>
        
        <div className="action-buttons">
          <SignInButton mode="modal">
            <button className="btn-secondary">Sign In</button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="btn-primary">Sign Up</button>
          </SignUpButton>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route 
            path="/" 
            element={
              <>
                <SignedIn>
                  <Dashboard />
                </SignedIn>
                <SignedOut>
                  <LandingPage />
                </SignedOut>
              </>
            } 
          />
        </Routes>
      </BrowserRouter>
      <Toaster position="bottom-center" theme="light" />
    </div>
  );
}

export default App;