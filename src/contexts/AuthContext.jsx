// src/contexts/AuthContext.jsx
import React, { useState, useEffect, createContext, useContext } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { auth, db, provider } from '../services/firebase.js';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

const createDefaultWorkoutPlan = () => {
    const plan = {};
    const today = new Date();
    const getNextDayOfWeek = (dayOfWeek) => {
        const resultDate = new Date(today.getTime());
        resultDate.setDate(today.getDate() + (dayOfWeek + 7 - today.getDay()) % 7);
        if (resultDate < today) {
             resultDate.setDate(resultDate.getDate() + 7);
        }
        return resultDate.toISOString().split('T')[0];
    };
    const monday = getNextDayOfWeek(1);
    const wednesday = getNextDayOfWeek(3);
    const friday = getNextDayOfWeek(5);
    plan[monday] = {
        sessionNotes: "Welcome! This is your first workout. Focus on good form.",
        exercises: [
            { id: crypto.randomUUID(), name: 'Barbell Bench Press', type: 'strength', targetSets: '3', targetReps: '12', targetWeight: '20', status: 'pending', targetWeightValue: 20 },
            { id: crypto.randomUUID(), name: 'Bent-Over Barbell Row', type: 'strength', targetSets: '3', targetReps: '12', targetWeight: '20', status: 'pending', targetWeightValue: 20 },
            { id: crypto.randomUUID(), name: 'Overhead Press (Barbell)', type: 'strength', targetSets: '3', targetReps: '12', targetWeight: '15', status: 'pending', targetWeightValue: 15 },
        ]
    };
    plan[wednesday] = {
        sessionNotes: "Leg day! Don't skip it.",
        exercises: [
            { id: crypto.randomUUID(), name: 'Barbell Squat', type: 'strength', targetSets: '3', targetReps: '12', targetWeight: '30', status: 'pending', targetWeightValue: 30 },
            { id: crypto.randomUUID(), name: 'Hamstring Curl Machine', type: 'strength', targetSets: '3', targetReps: '15', targetWeight: '25', status: 'pending', targetWeightValue: 25 },
            { id: crypto.randomUUID(), name: 'Standing Calf Raise', type: 'strength', targetSets: '3', targetReps: '20', targetWeight: '40', status: 'pending', targetWeightValue: 40 },
        ]
    };
    plan[friday] = {
        sessionNotes: "Full body workout to end the week.",
        exercises: [
            { id: crypto.randomUUID(), name: 'Deadlift (Barbell)', type: 'strength', targetSets: '3', targetReps: '5', targetWeight: '40', status: 'pending', targetWeightValue: 40 },
            { id: crypto.randomUUID(), name: 'Pull-up', type: 'bodyweight', targetSets: '3', targetReps: 'As many as possible', status: 'pending' },
            { id: crypto.randomUUID(), name: 'Plank', type: 'time', targetTime: '60', defaultUnit: 'seconds', status: 'pending' },
        ]
    };
    return plan;
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                const userDocRef = doc(db, 'artifacts', appId, 'users', user.uid);
                
                const unsubscribeSnapshot = onSnapshot(userDocRef, async (docSnap) => {
                    if (docSnap.exists()) {
                        setUserProfile(docSnap.data().profile);
                    } else {
                        const profile = { 
                            name: user.displayName || 'New User', 
                            email: user.email, 
                            profilePic: user.photoURL 
                        };
                        const defaultWorkouts = createDefaultWorkoutPlan();
                        await setDoc(userDocRef, { profile, workouts: defaultWorkouts });
                    }
                    setCurrentUser(user);
                    setLoading(false);
                });

                return () => unsubscribeSnapshot();
            } else {
                setCurrentUser(null);
                setUserProfile(null);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [appId]);

    const handleLogin = async () => {
        try {
            await signInWithPopup(auth, provider);
        } catch (e) {
            console.error("Google Sign-In failed:", e);
        }
    };

    // --- UPDATED: More robust logout function ---
    const handleLogout = async () => {
        try {
            await signOut(auth);
            // Explicitly clear state to force UI update immediately
            setCurrentUser(null);
            setUserProfile(null);
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const updateProfile = async (newProfile) => {
        if (!currentUser) return;
        const userDocRef = doc(db, 'artifacts', appId, 'users', currentUser.uid);
        await setDoc(userDocRef, { profile: newProfile }, { merge: true });
    };

    const value = {
        currentUser,
        userProfile,
        loading,
        handleLogin,
        handleLogout,
        updateProfile,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
