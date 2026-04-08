import React from 'react'; 
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from "./App.jsx";
import "./app.css"; 

ReactDOM.createRoot(document.getElementById('root')).render(
  // 🎯 STRICT MODE REMOVED HERE
  <BrowserRouter>
    <App /> 
  </BrowserRouter>
);