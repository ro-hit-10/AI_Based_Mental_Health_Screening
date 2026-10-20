// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
// Global styles load before any page CSS so page-level rules can override them
import './styles/theme.css';
import './styles/pages.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
