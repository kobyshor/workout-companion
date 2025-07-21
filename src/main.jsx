// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
// import { seedExerciseLibrary } from './services/seedDatabase.js'; // Import the seeder

// --- TEMPORARY SEEDING TRIGGER ---
// This will run the seedExerciseLibrary function once when the app loads.
// After the library is seeded, you should remove this line.
// seedExerciseLibrary();
// ---------------------------------

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
