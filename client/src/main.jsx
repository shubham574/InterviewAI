import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App';
import './index.css';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY}
      appearance={{
        variables: {
          colorPrimary: '#4F46E5',
          colorBackground: '#1C1D21',
          colorInputBackground: '#141517',
          colorInputText: '#F3F4F6',
          colorText: '#F3F4F6',
          colorTextSecondary: '#9CA3AF',
          colorDanger: '#ef4444',
          colorSuccess: '#10b981',
          colorWarning: '#f59e0b',
        }
      }}
    >
      <App />
    </ClerkProvider>
  </React.StrictMode>
);
