// src/contexts/WorkoutContext.jsx
import React, { useState, useEffect, createContext, useContext } from 'react';
import { onSnapshot, collection, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../services/firebase.js'; // <-- Direct import from our new service file
import { useAuth } from './AuthContext.jsx'; // <-- Use the new AuthContext hook

// 1. Create the context
const WorkoutContext = createContext();

// 2. Create a custom hook for easy access
export const useWorkout = () => {
    return useContext(WorkoutContext);
};

// 3. Create the Provider component
export const WorkoutProvider = ({ children }) => {
    const { currentUser } = useAuth(); // Get user state from AuthContext
    const [weeklyPlan, setWeeklyPlan] = useState({});
    const [exerciseDescriptions, setExerciseDescriptions] = useState({});
    const [exerciseLibrary, setExerciseLibrary] = useState([]);
    const [libraryLoading, setLibraryLoading] = useState(true);
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

    // Effect to fetch the public exercise library
    useEffect(() => {
        // Only run if there is a logged-in user
        if (!currentUser) {
            setLibraryLoading(false);
            return;
        }
        
        setLibraryLoading(true);
        const libRef = collection(db, 'artifacts', appId, 'public', 'data', 'exercise-library');
        
        const unsubscribe = onSnapshot(libRef, (snapshot) => {
            const lib = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setExerciseLibrary(lib);
            setLibraryLoading(false);
        }, (error) => {
            console.error("Failed to fetch exercise library:", error);
            setExerciseLibrary([]);
            setLibraryLoading(false);
        });

        return () => unsubscribe(); // Cleanup on unmount
    }, [appId, currentUser]);

    // Effect to fetch the current user's private workout data
    useEffect(() => {
        if (!currentUser) {
            setWeeklyPlan({});
            setExerciseDescriptions({});
            return;
        }
        const userDocRef = doc(db, 'artifacts', appId, 'users', currentUser.uid);
        const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setWeeklyPlan(data.workouts || {});
                setExerciseDescriptions(data.descriptions || {});
            }
        });
        return () => unsubscribe(); // Cleanup on unmount
    }, [currentUser, appId]);

    // Function to update user-specific data (workouts, descriptions)
    const updateFirestore = async (data) => {
        if (!currentUser) return;
        const userDocRef = doc(db, 'artifacts', appId, 'users', currentUser.uid);
        await setDoc(userDocRef, data, { merge: true });
    };

    // Helper to update a specific day's plan
    const updateDayData = (dateKey, newDayData) => {
        const newWeeklyPlan = { ...weeklyPlan, [dateKey]: newDayData };
        updateFirestore({ workouts: newWeeklyPlan });
    };

    // Functions to manage the public exercise library
    const saveExerciseToLibrary = async (exerciseData) => {
        if (!currentUser) return;
        const exerciseId = exerciseData.id || crypto.randomUUID();
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'exercise-library', exerciseId);
        await setDoc(docRef, { ...exerciseData, id: exerciseId }, { merge: true });
    };

    const deleteExerciseFromLibrary = async (exerciseId) => {
        if (!currentUser) return;
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'exercise-library', exerciseId);
        await deleteDoc(docRef);
    };
    
    const value = {
        weeklyPlan,
        exerciseDescriptions,
        exerciseLibrary,
        libraryLoading,
        updateDayData,
        updateFirestore,
        saveExerciseToLibrary,
        deleteExerciseFromLibrary,
    };

    return <WorkoutContext.Provider value={value}>{children}</WorkoutContext.Provider>;
};
