import React from 'react';
import ReactDOM from 'react-dom/client';          // For Vite (React 18+)
import { BrowserRouter } from 'react-router-dom';

import App from './App';
import './index.css';    // Tailwind CSS styles

const root = ReactDOM.createRoot(document.getElementById('root'));   // React 18+
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);