// src/App.jsx
import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import { WorkoutProvider } from './contexts/WorkoutContext.jsx';
import LoginScreen from './components/LoginScreen.jsx';
import MainLayout from './components/MainLayout.jsx';
import { Loader2 } from 'lucide-react';

// Root component that sets up all providers
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

// Consumes AuthContext to decide what to render
function AppContent() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="bg-gray-900 h-screen flex items-center justify-center text-white">
        <Loader2 className="animate-spin mr-4" />
        <span>Initializing...</span>
      </div>
    );
  }

  // If user is logged in, provide WorkoutContext and show the main app.
  // Otherwise, show the LoginScreen.
  return currentUser ? (
    <WorkoutProvider>
      <MainLayout />
    </WorkoutProvider>
  ) : (
    <LoginScreen />
  );
}

export default App;
