// src/polyfills.js

// Define global objects needed by Node polyfills
window.global = window;
window.module = {};
// We'll define Buffer and process inside main.jsx after they are imported