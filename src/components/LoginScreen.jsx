// src/components/LoginScreen.jsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Dumbbell } from 'lucide-react';

// This component now uses the useAuth hook to get the handleLogin function directly.
const LoginScreen = () => {
  const { handleLogin } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white p-8" style={{background: 'radial-gradient(circle, rgba(31,41,55,1) 0%, rgba(17,24,39,1) 100%)'}}>
        <div className="text-center mb-12">
            <div className="flex justify-center items-center gap-4 mb-4">
                <Dumbbell className="text-cyan-400" size={48} />
                <h1 className="text-5xl font-bold tracking-tight">Workout Companion</h1>
            </div>
            <p className="text-lg text-gray-400">Track your progress. See the results.</p>
        </div>
        <button 
            onClick={handleLogin} 
            className="flex items-center justify-center bg-white text-gray-700 font-semibold py-3 px-6 rounded-lg shadow-lg hover:bg-gray-200 transition-all duration-300 transform hover:scale-105"
        >
            {/* Google Icon SVG */}
            <svg className="w-6 h-6 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.99,36.586,44,31.023,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
            </svg>
            Sign In with Google
        </button>
    </div>
  );
};

export default LoginScreen;
