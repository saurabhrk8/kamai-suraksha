// src/main.jsx (Simplified for Direct Redirect)

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
// import { AuthProvider } from "react-oidc-context"; // 🛑 REMOVE THIS 🛑

// --- Polyfill Imports ---
import * as buffer from 'buffer';
import * as process from 'process'; 
window.Buffer = buffer.Buffer; 

import App from "./App.jsx";
import "./app.css"; 

// --- AWS Amplify Configuration (Minimal) ---
import { Amplify } from 'aws-amplify';
Amplify.configure({}); 


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* 🛑 AuthProvider is GONE 🛑 */}
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);