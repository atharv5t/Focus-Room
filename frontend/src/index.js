import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ClerkProvider } from '@clerk/clerk-react';

// Replace with your LIVE Publishable Key from Clerk
const PUBLISHABLE_KEY = "pk_test_cG9saXNoZWQtbGVtdXItODAuY2xlcmsuYWNjb3VudHMuZGV2JA"; 

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <App />
    </ClerkProvider>
  </React.StrictMode>
);