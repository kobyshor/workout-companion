// src/components/MainLayout.jsx
import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useWorkout } from '../contexts/WorkoutContext.jsx';
import { firebaseConfig } from '../config/firebaseConfig.js';
import SideMenu from './SideMenu.jsx';
import ExerciseItem from './ExerciseItem.jsx';
import ProfileModal from './ProfileModal.jsx';
import TrendsModal from './TrendsModal.jsx';
import CSVImportModal from './CSVImportModal.jsx';
import AddExerciseModal from './AddExerciseModal.jsx';
import SummaryModal from './SummaryModal.jsx';
import VisualAidModal from './VisualAidModal.jsx';
import LibraryManager from './LibraryManager.jsx';
import EditWorkoutExerciseModal from './EditWorkoutExerciseModal.jsx';
import RestTimer from './RestTimer.jsx';
import WorkoutSummaryStats from './WorkoutSummaryStats.jsx';
import { Menu, User, ChevronLeft, ChevronRight, Plus, ClipboardList, ClipboardPlus, PartyPopper, TrendingUp } from 'lucide-react';

const toYYYYMMDD = (date) => {
    const d = new Date(date);
    const offset = d.getTimezoneOffset();
    const adjustedDate = new Date(d.getTime() - (offset * 60 * 1000));
    return adjustedDate.toISOString().split('T')[0];
};
const formatDate = (date) => date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

const MainLayout = () => {
    const { userProfile, updateProfile } = useAuth();
    const { weeklyPlan, exerciseLibrary, updateDayData, exerciseDescriptions, updateFirestore } = useWorkout();
    
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeModal, setActiveModal] = useState(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [editingExercise, setEditingExercise] = useState(null);
    const [visualAidExercise, setVisualAidExercise] = useState(null);
    const [restTimerId, setRestTimerId] = useState(0);
    const [restDuration, setRestDuration] = useState(0);
    const [toast, setToast] = useState({ show: false, message: '' });


    const dateKey = toYYYYMMDD(currentDate);
    const dayData = weeklyPlan[dateKey] || { exercises: [], sessionNotes: '' };

    const exercisesForDay = useMemo(() => {
        if (!dayData?.exercises || !exerciseLibrary) return [];
        const enrichedExercises = dayData.exercises.map(planExercise => {
            const libraryItem = exerciseLibrary.find(libEx => libEx.name === planExercise.name);
            return { ...libraryItem, ...planExercise };
        });
        return enrichedExercises.sort((a, b) => {
            const aDone = a.status !== 'pending';
            const bDone = b.status !== 'pending';
            if (aDone !== bDone) return aDone - bDone;
            return (a.completedTimestamp || 0) - (b.completedTimestamp || 0);
        });
    }, [dayData, exerciseLibrary]);

    const completionPercent = useMemo(() => {
        if (exercisesForDay.length === 0) return 0;
        const completedCount = exercisesForDay.filter(e => e.status !== 'pending').length;
        return (completedCount / exercisesForDay.length) * 100;
    }, [exercisesForDay]);

    const workoutSummaryStats = useMemo(() => {
        if (!exercisesForDay || exercisesForDay.length === 0) return null;
        const completedExercises = exercisesForDay.filter(ex => ex.status !== 'pending' && ex.status !== 'skipped');
        const totalCalories = completedExercises.reduce((sum, ex) => sum + (ex.calories || 0), 0);
        const totalVolume = completedExercises.reduce((volume, ex) => {
            if (ex.metricType !== 'weight_reps' || !ex.actualSets || ex.actualSets.length === 0) return volume;
            const exerciseVolume = ex.actualSets.reduce((setVolume, set) => {
                const reps = parseFloat(set.reps) || 0;
                const weight = parseFloat(set.weight) || 0;
                return setVolume + (reps * weight);
            }, 0);
            return volume + exerciseVolume;
        }, 0);
        return {
            exerciseCount: completedExercises.length,
            totalVolume: Math.round(totalVolume),
            totalCalories: Math.round(totalCalories)
        };
    }, [exercisesForDay]);

    const isWorkoutComplete = useMemo(() => completionPercent === 100, [completionPercent]);
    
    const showToast = (message) => {
        setToast({ show: true, message });
        setTimeout(() => setToast({ show: false, message: '' }), 2000);
    };

    const findLastPerformance = (exerciseName) => {
        let lastPerf = null;
        const sortedDates = Object.keys(weeklyPlan).sort().reverse();
        for (const date of sortedDates) {
            const day = weeklyPlan[date];
            if (day.exercises) {
                const foundEx = day.exercises.find(ex => ex.name === exerciseName && ex.status !== 'pending');
                if (foundEx) {
                    lastPerf = foundEx;
                    break;
                }
            }
        }
        return lastPerf;
    };
    
    const updateExercise = (id, updatedFields) => {
        const newExercises = dayData.exercises.map(ex => ex.id === id ? { ...ex, ...updatedFields } : ex);
        updateDayData(dateKey, { ...dayData, exercises: newExercises });
    };

    // --- UPDATED: Smarter calorie estimation ---
    const fetchCalorieEstimation = async (exercise) => {
        const userWeight = userProfile?.weight || 100; // Use your weight from profile
        let prompt;

        if (exercise.metricType === 'time' || exercise.metricType === 'time_distance') {
            const duration = exercise.actualTime || exercise.targetTime || 30;
            prompt = `Estimate calories burned for a ${userWeight}kg person performing ${exercise.name} for ${duration} minutes. Provide only the number.`;
        } else {
            const sets = exercise.actualSets?.length || exercise.targetSets;
            const reps = exercise.actualSets?.[0]?.reps || exercise.targetReps;
            const weight = exercise.actualSets?.[0]?.weight || exercise.targetWeightValue;
            prompt = `Estimate calories burned for a ${userWeight}kg person performing this exercise. Provide only the number. Exercise: ${exercise.name}, Sets: ${sets}, Reps: ${reps}, Weight: ${weight}kg`;
        }
        
        const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
        const apiKey = firebaseConfig.apiKey;
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        try {
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) throw new Error('API request failed');
            const result = await response.json();
            const text = result.candidates[0].content.parts[0].text;
            return parseInt(text.match(/\d+/)?.[0] || "0");
        } catch (e) {
            console.error("Calorie estimation failed:", e);
            return null;
        }
    };

    const handleCompleteExercise = async (id) => {
        const exercise = exercisesForDay.find(ex => ex.id === id);
        if (!exercise) return;
        
        const calories = await fetchCalorieEstimation(exercise);
        updateExercise(id, { status: 'completed', completedTimestamp: Date.now(), calories });
    };

    const handleSetUpdate = (exerciseId, setIndex, field, value) => {
        const exercise = dayData.exercises.find(ex => ex.id === exerciseId);
        if (!exercise) return;
        const newActualSets = [...(exercise.actualSets || [])];
        if (newActualSets[setIndex]) {
            newActualSets[setIndex] = { ...newActualSets[setIndex], [field]: value };
            updateExercise(exerciseId, { actualSets: newActualSets });
        }
    };

    const handleUndoExercise = (id) => {
        updateExercise(id, { status: 'pending', completedTimestamp: null, actualSets: [], calories: null });
    };
    
    const handleAddSet = (exerciseId) => {
        const exercise = dayData.exercises.find(ex => ex.id === exerciseId);
        if (!exercise || !exercise.actualSets || exercise.actualSets.length === 0) return;
        const lastSet = exercise.actualSets[exercise.actualSets.length - 1];
        const newSet = { ...lastSet, completed: false };
        updateExercise(exerciseId, { actualSets: [...exercise.actualSets, newSet] });
    };

    const handleDeleteSet = (exerciseId, setIndex) => {
        const exercise = dayData.exercises.find(ex => ex.id === exerciseId);
        if (!exercise) return;
        const newActualSets = exercise.actualSets.filter((_, index) => index !== setIndex);
        updateExercise(exerciseId, { actualSets: newActualSets });
    };

    const handleAddExercise = (newExerciseData) => {
        const newExercise = { 
            id: crypto.randomUUID(), 
            ...newExerciseData, 
            actualSets: [], 
            note: '', 
            status: 'pending', 
            completedTimestamp: null, 
            calories: null, 
            targetWeightValue: parseFloat(newExerciseData.targetWeight) || 0 
        };
        const newExercises = [...dayData.exercises, newExercise];
        updateDayData(dateKey, { ...dayData, exercises: newExercises });
        setActiveModal(null);
    };
    
    const handleSaveEditedExercise = (editedData) => {
        updateExercise(editedData.id, editedData);
    };
    
    const handleDeleteExercise = (exerciseId) => {
        const newExercises = dayData.exercises.filter(ex => ex.id !== exerciseId);
        updateDayData(dateKey, { ...dayData, exercises: newExercises });
        showToast("Exercise removed");
    };

    const handleDescriptionFetched = (name, description) => {
        const newDescriptions = { ...exerciseDescriptions, [name]: description };
        updateFirestore({ descriptions: newDescriptions });
    };

    const handleStartRest = (duration) => {
        setRestDuration(duration);
        setRestTimerId(prevId => prevId + 1);
    };

    const generateSummary = () => {
        if (!dayData) return "No workout for today.";
        let summary = `Workout Summary for ${formatDate(currentDate)}:\n`;
        if (dayData.sessionNotes) summary += `\nNotes: ${dayData.sessionNotes}\n`;
        summary += "\n";
        
        exercisesForDay.forEach(ex => {
            if (ex.status === 'pending' || ex.status === 'skipped') return;
            
            summary += `• ${ex.name}: `;
            if (ex.metricType === 'weight_reps' && ex.actualSets && ex.actualSets.length > 0) {
                const setsSummary = ex.actualSets.map(s => `${s.reps || '_'}x${s.weight || '_'}kg`).join(', ');
                summary += ` ${setsSummary}.`;
            } else if (ex.metricType === 'time_distance' || ex.metricType === 'time') {
                if (ex.actualTime) summary += ` Time: ${ex.actualTime} min.`;
                if (ex.actualDistance) summary += ` Distance: ${ex.actualDistance} ${ex.defaultUnit}.`;
            }
            if (ex.calories) summary += ` (~${ex.calories} kcal)`;
            summary += '\n';
        });
        return summary;
    };

    const handleCopySummary = () => {
        const summaryText = generateSummary();
        navigator.clipboard.writeText(summaryText);
        showToast("Summary copied to clipboard!");
        setActiveModal(null);
    };

    const renderActiveModal = () => {
        switch (activeModal) {
            case 'profile':
                return <ProfileModal user={userProfile} weeklyPlan={weeklyPlan} onSave={updateProfile} onClose={() => setActiveModal(null)} />;
            case 'trends':
                return <TrendsModal weeklyPlan={weeklyPlan} onClose={() => setActiveModal(null)} />;
            case 'import':
                return <CSVImportModal onImport={() => console.log('Importing...')} onClose={() => setActiveModal(null)} />;
            case 'add':
                return <AddExerciseModal onAdd={handleAddExercise} findLastPerformance={findLastPerformance} onClose={() => setActiveModal(null)} />;
            case 'summary':
                return <SummaryModal summary={generateSummary()} onCopy={handleCopySummary} onClose={() => setActiveModal(null)} />;
            case 'manageLibrary':
                return <LibraryManager onClose={() => setActiveModal(null)} />;
            case 'visual':
                if (!visualAidExercise) return null;
                return <VisualAidModal exercise={visualAidExercise} cachedDescription={exerciseDescriptions[visualAidExercise.name]} onDescriptionFetched={handleDescriptionFetched} onClose={() => setActiveModal(null)} />;
            case 'edit':
                if (!editingExercise) return null;
                return <EditWorkoutExerciseModal 
                            exercise={editingExercise} 
                            onSave={handleSaveEditedExercise} 
                            onClose={() => setActiveModal(null)} 
                        />;
            default:
                return null;
        }
    };

    return (
        <div className="bg-gray-900 text-gray-100 min-h-screen font-sans">
            <SideMenu 
                isOpen={isMenuOpen} 
                onClose={() => setIsMenuOpen(false)}
                onNavigate={(modal) => setActiveModal(modal)}
            />

            <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8 pb-32">
                <header className="flex items-center justify-between mb-6">
                    <button onClick={() => setIsMenuOpen(true)} className="p-2 rounded-md hover:bg-gray-700">
                        <Menu />
                    </button>
                    <h1 className="text-xl font-bold text-white tracking-tight">Workout Companion</h1>
                    <button onClick={() => setActiveModal('profile')} className="p-1 rounded-full hover:bg-gray-700">
                        {userProfile?.profilePic ? (
                            <img src={userProfile.profilePic} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                            <User className="w-8 h-8 rounded-full bg-gray-700 p-1" />
                        )}
                    </button>
                </header>

                <div className="flex items-center justify-between bg-gray-800 p-2 rounded-lg mb-4">
                    <button onClick={() => setCurrentDate(d => { const newDate = new Date(d); newDate.setDate(d.getDate() - 1); return newDate; })} className="p-2 rounded-md hover:bg-gray-700"><ChevronLeft/></button>
                    <div className="text-center">
                        <div className="text-lg font-bold text-white">{formatDate(currentDate)}</div>
                        {toYYYYMMDD(new Date()) !== toYYYYMMDD(currentDate) && <button onClick={() => setCurrentDate(new Date())} className="text-xs text-cyan-400 hover:text-cyan-300">Go to Today</button>}
                    </div>
                    <button onClick={() => setCurrentDate(d => { const newDate = new Date(d); newDate.setDate(d.getDate() + 1); return newDate; })} className="p-2 rounded-md hover:bg-gray-700"><ChevronRight/></button>
                </div>
                
                <WorkoutSummaryStats stats={workoutSummaryStats} />

                {exercisesForDay.length > 0 && (
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-cyan-400">Daily Progress</span>
                            <span className="text-sm font-medium text-gray-300">{Math.round(completionPercent)}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2.5">
                            <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${completionPercent}%` }}></div>
                        </div>
                    </div>
                )}
                
                <main className="space-y-4">
                    {isWorkoutComplete && exercisesForDay.length > 0 && (
                        <div className="bg-green-800/50 border border-green-600 text-white p-4 rounded-lg text-center flex items-center justify-center space-x-3">
                            <PartyPopper className="text-green-300" />
                            <div>
                                <h3 className="font-bold text-lg">Workout Complete!</h3>
                                <p className="text-sm text-green-200">Great job finishing all your exercises for today.</p>
                            </div>
                        </div>
                    )}
                    {exercisesForDay.length > 0 ? exercisesForDay.map(ex => {
                        let trendIndicator = null;
                        if (ex.metricType === 'weight_reps') {
                            const prevWeight = findLastPerformance(ex.name)?.targetWeightValue;
                            if (prevWeight && ex.targetWeightValue > prevWeight) {
                                const percentIncrease = ((ex.targetWeightValue - prevWeight) / prevWeight) * 100;
                                trendIndicator = (<span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-900 text-green-300"><TrendingUp className="w-3 h-3 mr-1" />+{percentIncrease.toFixed(1)}%</span>);
                            }
                        }
                        return (
                            <ExerciseItem 
                                key={ex.id}
                                exercise={ex}
                                onUpdate={updateExercise}
                                onSetUpdate={handleSetUpdate}
                                onComplete={handleCompleteExercise}
                                onUndo={handleUndoExercise}
                                onAddSet={handleAddSet}
                                onDeleteSet={handleDeleteSet}
                                onDeleteExercise={handleDeleteExercise}
                                onStartRest={handleStartRest}
                                onShowVisualAid={(exercise) => {
                                    setVisualAidExercise(exercise);
                                    setActiveModal('visual');
                                }}
                                onEdit={(exercise) => {
                                    setEditingExercise(exercise);
                                    setActiveModal('edit');
                                }}
                                trend={trendIndicator}
                            />
                        );
                    }) : (
                        <div className="text-center py-16 bg-gray-800 rounded-lg flex flex-col items-center justify-center space-y-4">
                            <ClipboardPlus size={48} className="text-gray-500" />
                            <h3 className="text-xl font-semibold text-white">No Workout Planned</h3>
                            <p className="text-gray-400 mt-2 max-w-xs">It's a rest day! Or, you can add exercises to get started.</p>
                        </div>
                    )}
                </main>
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-gray-900/80 backdrop-blur-sm border-t border-gray-700">
                <div className="max-w-2xl mx-auto p-4 flex gap-4">
                    <button onClick={() => setActiveModal('add')} className="w-1/2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg text-base transition-all duration-200 flex items-center justify-center">
                        <Plus size={20} className="mr-2" />Add Exercise
                    </button>
                    <button onClick={() => setActiveModal('summary')} className="w-1/2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-lg text-base transition-all duration-200 flex items-center justify-center">
                        <ClipboardList size={20} className="mr-2" />Review Summary
                    </button>
                </div>
            </div>
            
            <RestTimer timerId={restTimerId} duration={restDuration} />
            {renderActiveModal()}
            {toast.show && <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-green-500 text-white py-2 px-5 rounded-full text-sm font-semibold shadow-lg">{toast.message}</div>}
        </div>
    );
};

export default MainLayout;
