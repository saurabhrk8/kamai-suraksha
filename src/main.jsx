// src/main.jsx 

import React from 'react'; 
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// --- Polyfill Imports (Required for token handling/decoding) ---
import * as buffer from 'buffer';
window.Buffer = buffer.Buffer; 

import App from "./App.jsx";
import "./app.css"; 


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* All application logic and configuration starts in App.jsx */}
      <App /> 
    </BrowserRouter>
  </React.StrictMode>,
);