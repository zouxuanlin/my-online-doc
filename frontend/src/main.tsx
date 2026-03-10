import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import PWAUpdatePrompt from './components/PWAUpdatePrompt';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <PWAUpdatePrompt />
  </React.StrictMode>
);
