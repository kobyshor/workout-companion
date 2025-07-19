import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChevronLeft, ChevronRight, User, TrendingUp, X, Camera, Info, Undo2, GripVertical, Pencil, Trash2, Plus, ClipboardList, PartyPopper, ClipboardPlus, LogIn, LogOut, FileText, Loader2, AlertTriangle, Flame, BookOpen, ChevronsUpDown, Dumbbell, Repeat, Weight, UploadCloud, Download, Search, Footprints, Clock } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, signInAnonymously, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, enableIndexedDbPersistence } from 'firebase/firestore';

// --- FIREBASE SETUP ---
const fallbackConfig = {
  apiKey: "AIzaSyCNhTDZt54YkuVtz1YH47gcwg8cwSSDozQ",
  authDomain: "workout-companion-app.firebaseapp.com",
  projectId: "workout-companion-app",
  storageBucket: "workout-companion-app.appspot.com",
  messagingSenderId: "187661338158",
  appId: "1:187661338158:web:6cb196160755aa249c41bf",
  measurementId: "G-J84C5N9SXH"
};

const firebaseConfig = (typeof __firebase_config !== 'undefined' && Object.keys(JSON.parse(__firebase_config)).length > 0)
  ? JSON.parse(__firebase_config)
  : fallbackConfig;

let app;
let auth;
let db;
let provider;

if (firebaseConfig && firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_NEW_REGENERATED_API_KEY_HERE") {
    try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        provider = new GoogleAuthProvider();
        enableIndexedDbPersistence(db).catch((err) => { 
            if (err.code === 'failed-precondition') { console.warn("Firestore persistence failed: Multiple tabs open."); } 
            else if (err.code === 'unimplemented') { console.warn("Firestore persistence failed: Browser does not support it."); } 
        });
    } catch (error) {
        console.error("Firebase initialization failed:", error);
    }
}

// --- HELPER FUNCTIONS ---
const toYYYYMMDD = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const formatDate = (date) => date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

// --- MODAL & UI COMPONENTS ---
const ConfigErrorScreen = () => (
    <div className="flex flex-col items-center justify-center h-screen bg-red-900 text-white p-8">
        <AlertTriangle size={48} className="text-yellow-300 mb-4" />
        <h1 className="text-3xl font-bold mb-2">Configuration Error</h1>
        <p className="text-center max-w-md">
            Firebase configuration is missing or invalid. If you are running this locally, please ensure you have replaced the placeholder API key in <code>src/App.jsx</code> with your new, regenerated key.
        </p>
    </div>
);

const LoginScreen = ({ onLogin }) => (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white p-8" style={{background: 'radial-gradient(circle, rgba(31,41,55,1) 0%, rgba(17,24,39,1) 100%)'}}>
        <div className="text-center mb-12"><h1 className="text-5xl font-bold mb-3 tracking-tight">Workout Companion</h1><p className="text-lg text-gray-400">Track your progress. See the results.</p></div>
        <button onClick={onLogin} className="flex items-center justify-center bg-white text-gray-700 font-semibold py-3 px-6 rounded-lg shadow-lg hover:bg-gray-200 transition-all duration-300 transform hover:scale-105">
            <svg className="w-6 h-6 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48px" height="48px"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.99,36.586,44,31.023,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>
            Sign In with Google
        </button>
    </div>
);
const ProfileModal = ({ user, onSave, onClose }) => {
    const [profileData, setProfileData] = useState(user);
    const handleSave = () => { onSave(profileData); onClose(); };
    const handlePicChange = (e) => { if (e.target.files && e.target.files[0]) setProfileData({...profileData, profilePic: URL.createObjectURL(e.target.files[0])}); };
    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4"><div className="bg-gray-800 text-white rounded-lg p-6 w-full max-w-md relative"><button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24} /></button><h2 className="text-2xl font-bold mb-4">Profile</h2><div className="flex items-center space-x-4 mb-6"><div className="relative"><img src={profileData.profilePic || `https://placehold.co/100x100/1f2937/7dd3fc?text=${(profileData.name || ' ').charAt(0)}`} alt="Profile" className="w-24 h-24 rounded-full object-cover" /><label htmlFor="profile-pic-upload" className="absolute bottom-0 right-0 bg-cyan-500 p-1.5 rounded-full cursor-pointer hover:bg-cyan-600"><Camera size={16} /></label><input id="profile-pic-upload" type="file" className="hidden" accept="image/*" onChange={handlePicChange} /></div><input type="text" value={profileData.name || ''} onChange={e => setProfileData({...profileData, name: e.target.value})} placeholder="Your Name" className="bg-gray-700 border-gray-600 rounded p-2 text-xl font-bold w-full" /></div><div className="grid grid-cols-3 gap-4 mb-6"><div><label className="text-xs text-gray-400">Height (cm)</label><input type="number" value={profileData.height || ''} onChange={e => setProfileData({...profileData, height: e.target.value})} placeholder="cm" className="bg-gray-700 border-gray-600 rounded p-2 w-full mt-1" /></div><div><label className="text-xs text-gray-400">Weight (kg)</label><input type="number" value={profileData.weight || ''} onChange={e => setProfileData({...profileData, weight: e.target.value})} placeholder="kg" className="bg-gray-700 border-gray-600 rounded p-2 w-full mt-1" /></div><div><label className="text-xs text-gray-400">Age</label><input type="number" value={profileData.age || ''} onChange={e => setProfileData({...profileData, age: e.target.value})} placeholder="Age" className="bg-gray-700 border-gray-600 rounded p-2 w-full mt-1" /></div></div><div className="flex justify-end space-x-2"><button onClick={onClose} className="bg-gray-600 px-4 py-2 rounded">Cancel</button><button onClick={handleSave} className="bg-cyan-600 px-4 py-2 rounded">Save</button></div></div></div>
    );
};
const TrendsModal = ({ weeklyPlan, onClose }) => {
    const trendData = useMemo(() => {
        const exerciseHistory = {};
        Object.keys(weeklyPlan).sort().forEach(dateKey => {
            weeklyPlan[dateKey]?.exercises?.forEach(ex => {
                if (ex.type === 'strength' && ex.targetWeightValue > 0) {
                    if (!exerciseHistory[ex.name]) exerciseHistory[ex.name] = [];
                    exerciseHistory[ex.name].push({ date: formatDate(new Date(dateKey)), weight: ex.targetWeightValue });
                }
            });
        });
        return Object.entries(exerciseHistory).filter(([, data]) => data.length > 1);
    }, [weeklyPlan]);
    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4"><div className="bg-gray-800 text-white rounded-lg p-6 w-full max-w-4xl h-[90vh] overflow-y-auto relative"><button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24} /></button><div className="flex justify-between items-center mb-4"><h2 className="text-2xl font-bold">Performance Trends</h2></div><div className="grid grid-cols-1 lg:grid-cols-2 gap-6">{trendData.length > 0 ? trendData.map(([name, data]) => (<div key={name} className="bg-gray-900 p-4 rounded-lg"><h3 className="font-semibold mb-4 text-center">{name}</h3><ResponsiveContainer width="100%" height={250}><LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="#4b5563" /><XAxis dataKey="date" stroke="#9ca3af" fontSize={12} /><YAxis stroke="#9ca3af" fontSize={12} domain={['dataMin - 5', 'dataMax + 5']} /><Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }} /><Legend /><Line type="monotone" dataKey="weight" stroke="#22d3ee" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} /></LineChart></ResponsiveContainer></div>)) : <p className="col-span-full text-center text-gray-400">Not enough data to show trends. Complete more workouts!</p>}</div></div></div>
    );
};
const EditExerciseModal = ({ exercise, onSave, onDelete, onClose }) => {
    const [editedExercise, setEditedExercise] = useState(exercise);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const handleFieldChange = (field, value) => setEditedExercise(prev => ({ ...prev, [field]: value }));
    const handleSave = () => {
        const weightValue = parseFloat(editedExercise.targetWeight) || 0;
        onSave({ ...editedExercise, targetWeightValue: weightValue });
        onClose();
    };
    const handleDeleteClick = () => {
        if (confirmDelete) {
            onDelete(exercise.id);
            onClose();
        } else {
            setConfirmDelete(true);
        }
    };
    const exerciseType = editedExercise.type?.toLowerCase() || 'strength';

    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4"><div className="bg-gray-800 text-white rounded-lg p-6 w-full max-w-md relative"><button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24} /></button><h2 className="text-2xl font-bold mb-4">Edit Exercise</h2><div className="space-y-4"><div><label className="text-xs text-gray-400">Exercise Name</label><input type="text" value={editedExercise.name || ''} onChange={e => handleFieldChange('name', e.target.value)} className="bg-gray-700 p-2 rounded w-full mt-1" /></div>
            {exerciseType === 'strength' && (
                <>
                    <div><label className="text-xs text-gray-400">Target Sets</label><input type="text" value={editedExercise.targetSets || ''} onChange={e => handleFieldChange('targetSets', e.target.value)} className="bg-gray-700 p-2 rounded w-full mt-1" /></div>
                    <div><label className="text-xs text-gray-400">Target Reps</label><input type="text" value={editedExercise.targetReps || ''} onChange={e => handleFieldChange('targetReps', e.target.value)} className="bg-gray-700 p-2 rounded w-full mt-1" /></div>
                    <div><label className="text-xs text-gray-400">Target Weight (kg)</label><input type="text" value={editedExercise.targetWeight || ''} onChange={e => handleFieldChange('targetWeight', e.target.value)} className="bg-gray-700 p-2 rounded w-full mt-1" placeholder="e.g., 40kg" /></div>
                </>
            )}
            {exerciseType === 'cardio' && (
                 <>
                    <div><label className="text-xs text-gray-400">Target Time (min)</label><input type="number" value={editedExercise.targetTime} onChange={e => handleFieldChange('targetTime', e.target.value)} className="bg-gray-700 p-2 rounded w-full mt-1" /></div>
                    <div><label className="text-xs text-gray-400">Target Distance ({editedExercise.defaultUnit})</label><input type="number" value={editedExercise.targetDistance} onChange={e => handleFieldChange('targetDistance', e.target.value)} className="bg-gray-700 p-2 rounded w-full mt-1" step="0.1" /></div>
                </>
            )}
        </div><div className="flex justify-between items-center mt-6"><button onClick={handleDeleteClick} className={`px-4 py-2 rounded flex items-center transition-colors ${confirmDelete ? 'bg-red-600' : 'bg-red-900/50 hover:bg-red-900'}`}><Trash2 size={16} className="mr-2" /> {confirmDelete ? 'Confirm Delete?' : 'Delete'}</button><div className="space-x-2"><button onClick={onClose} className="bg-gray-600 px-4 py-2 rounded">Cancel</button><button onClick={handleSave} className="bg-cyan-600 px-4 py-2 rounded">Save Changes</button></div></div></div></div>
    );
};
const AddExerciseModal = ({ onAdd, onClose, exerciseLibrary, findLastPerformance }) => {
    const [step, setStep] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [newExerciseDetails, setNewExerciseDetails] = useState({});

    const filteredLibrary = useMemo(() => {
        if (!searchTerm) return exerciseLibrary;
        return exerciseLibrary.filter(ex => ex.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [searchTerm, exerciseLibrary]);

    const handleSelectExercise = (exercise) => {
        const lastPerformance = findLastPerformance(exercise.name);
        setSelectedExercise(exercise);
        setNewExerciseDetails({
            name: exercise.name,
            type: exercise.category.toLowerCase(),
            metricType: exercise.metricType,
            defaultUnit: exercise.defaultUnit,
            targetSets: lastPerformance?.targetSets || '3',
            targetReps: lastPerformance?.targetReps || '12',
            targetWeight: lastPerformance?.targetWeight || '10',
            targetTime: lastPerformance?.targetTime || '30',
            targetDistance: lastPerformance?.targetDistance || '5'
        });
        setStep(2);
    };

    const handleDetailChange = (field, value) => {
        setNewExerciseDetails(prev => ({ ...prev, [field]: value }));
    };

    const handleAdd = () => {
        onAdd(newExerciseDetails);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
            <div className="bg-gray-800 text-white rounded-lg p-6 w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24} /></button>
                {step === 1 && (
                    <>
                        <h2 className="text-2xl font-bold mb-4">Select Exercise</h2>
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                            <input 
                                type="text" 
                                placeholder="Search exercises..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="bg-gray-700 p-2 pl-10 rounded w-full"
                            />
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                            {filteredLibrary.map(ex => (
                                <div key={ex.id} onClick={() => handleSelectExercise(ex)} className="p-3 hover:bg-gray-700 rounded-md cursor-pointer">
                                    <p className="font-semibold">{ex.name}</p>
                                    <p className="text-xs text-gray-400">{ex.bodyPart}</p>
                                </div>
                            ))}
                        </div>
                    </>
                )}
                {step === 2 && selectedExercise && (
                    <>
                        <h2 className="text-2xl font-bold mb-4">{selectedExercise.name}</h2>
                        <div className="space-y-4">
                            {selectedExercise.metricType === 'weight_reps' && (
                                <>
                                    <div><label className="text-xs text-gray-400">Target Sets</label><input type="number" value={newExerciseDetails.targetSets} onChange={e => handleDetailChange('targetSets', e.target.value)} className="bg-gray-700 p-2 rounded w-full mt-1" /></div>
                                    <div><label className="text-xs text-gray-400">Target Reps</label><input type="number" value={newExerciseDetails.targetReps} onChange={e => handleDetailChange('targetReps', e.target.value)} className="bg-gray-700 p-2 rounded w-full mt-1" /></div>
                                    <div><label className="text-xs text-gray-400">Target Weight (kg)</label><input type="number" value={newExerciseDetails.targetWeight} onChange={e => handleDetailChange('targetWeight', e.target.value)} className="bg-gray-700 p-2 rounded w-full mt-1" step="0.5" /></div>
                                </>
                            )}
                             {selectedExercise.metricType === 'time_distance' && (
                                <>
                                    <div><label className="text-xs text-gray-400">Target Time (min)</label><input type="number" value={newExerciseDetails.targetTime} onChange={e => handleDetailChange('targetTime', e.target.value)} className="bg-gray-700 p-2 rounded w-full mt-1" /></div>
                                    <div><label className="text-xs text-gray-400">Target Distance ({selectedExercise.defaultUnit})</label><input type="number" value={newExerciseDetails.targetDistance} onChange={e => handleDetailChange('targetDistance', e.target.value)} className="bg-gray-700 p-2 rounded w-full mt-1" step="0.1" /></div>
                                </>
                            )}
                            {selectedExercise.metricType === 'bodyweight' && (
                                 <>
                                    <div><label className="text-xs text-gray-400">Target Sets</label><input type="number" value={newExerciseDetails.targetSets} onChange={e => handleDetailChange('targetSets', e.target.value)} className="bg-gray-700 p-2 rounded w-full mt-1" /></div>
                                    <div><label className="text-xs text-gray-400">Target Reps</label><input type="number" value={newExerciseDetails.targetReps} onChange={e => handleDetailChange('targetReps', e.target.value)} className="bg-gray-700 p-2 rounded w-full mt-1" /></div>
                                </>
                            )}
                        </div>
                        <div className="flex justify-between mt-6">
                             <button onClick={() => setStep(1)} className="bg-gray-600 px-4 py-2 rounded">Back</button>
                             <button onClick={handleAdd} className="bg-cyan-600 px-4 py-2 rounded">Add Exercise</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
const SummaryModal = ({ summary, onClose, onCopy }) => (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4"><div className="bg-gray-800 text-white rounded-lg p-6 w-full max-w-lg relative"><button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24} /></button><h2 className="text-2xl font-bold mb-4">Workout Summary</h2><textarea readOnly value={summary} className="w-full h-64 bg-gray-900 text-gray-200 rounded-lg p-3 border border-gray-600"></textarea><div className="flex justify-end space-x-2 mt-4"><button onClick={onClose} className="bg-gray-600 px-4 py-2 rounded">Cancel</button><button onClick={onCopy} className="bg-green-600 px-4 py-2 rounded">Copy to Clipboard</button></div></div></div>
);
const CSVImportModal = ({ onImport, onClose }) => {
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        setError('');
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === "text/csv") {
            setFile(selectedFile);
        } else {
            setError("Please select a valid .csv file.");
            setFile(null);
        }
    };

    const handleImport = () => {
        if (!file) {
            setError("Please select a file to import.");
            return;
        }
        if (typeof Papa === 'undefined') {
            setError("Parsing library not available. Please ensure you've added the Papaparse script to your HTML.");
            return;
        }

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                if(results.errors.length > 0) {
                    setError("Error parsing CSV. Please check the file format.");
                    console.error("CSV Parsing Errors:", results.errors);
                    return;
                }
                onImport(results.data);
                onClose();
            },
            error: (err) => {
                setError("An unexpected error occurred during parsing.");
                console.error(err);
            }
        });
    };
    
    const csvTemplate = "date,exerciseName,type,targetSets,targetReps,targetWeight,sessionNotes\n2025-07-20,Squat,strength,5,5,100kg,\n2025-07-20,Bench Press,strength,5,5,80kg,\n2025-07-21,Run,cardio,1,30min,5km,Focus on cardio endurance today.";
    const downloadTemplate = () => {
        const blob = new Blob([csvTemplate], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "workout_template.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
            <div className="bg-gray-800 text-white rounded-lg p-6 w-full max-w-lg relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24} /></button>
                <h2 className="text-2xl font-bold mb-4">Import from CSV</h2>
                <div className="bg-gray-900 p-4 rounded-md mb-4">
                    <p className="text-sm text-gray-300 mb-2">Upload a CSV file with the following columns:</p>
                    <code className="text-xs text-cyan-300 bg-black/30 p-2 rounded-md block whitespace-pre-wrap">date, exerciseName, type, targetSets, targetReps, targetWeight, sessionNotes</code>
                     <button onClick={downloadTemplate} className="mt-3 text-sm text-cyan-400 hover:underline flex items-center gap-2">
                        <Download size={16}/>
                        Download Template
                    </button>
                </div>
                <div className="mt-4">
                    <label className="w-full flex items-center justify-center px-4 py-6 bg-gray-700 text-gray-400 rounded-lg shadow-lg tracking-wide uppercase border border-dashed border-gray-500 cursor-pointer hover:bg-gray-600 hover:text-white">
                        <UploadCloud size={32} className="mr-4"/>
                        <span className="text-base">{file ? file.name : 'Select a .csv file'}</span>
                        <input type='file' className="hidden" accept=".csv" onChange={handleFileChange} />
                    </label>
                </div>
                {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
                <div className="flex justify-end space-x-2 mt-6">
                    <button onClick={onClose} className="bg-gray-600 px-4 py-2 rounded">Cancel</button>
                    <button onClick={handleImport} disabled={!file} className="bg-green-600 px-4 py-2 rounded disabled:opacity-50">Import</button>
                </div>
            </div>
        </div>
    );
};
const VisualAidModal = ({ exercise, onClose, onDescriptionFetched, cachedDescription }) => {
    const [description, setDescription] = useState(cachedDescription || '');
    const [isLoading, setIsLoading] = useState(!cachedDescription);
    const [error, setError] = useState('');

    useEffect(() => {
        if (exercise.gifUrl) return; // Don't fetch text if we have a GIF
        if (cachedDescription) return;

        const fetchDescription = async () => {
            const prompt = `Provide a concise, 2-3 line explanation for how to perform a ${exercise.name}. Focus on the key steps.`;
            const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
            const apiKey = firebaseConfig.apiKey;
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
            try {
                const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                if (!response.ok) throw new Error('API request failed');
                const result = await response.json();
                const text = result.candidates[0].content.parts[0].text;
                setDescription(text);
                onDescriptionFetched(exercise.name, text);
            } catch (e) {
                setError('Could not fetch exercise description.');
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDescription();
    }, [exercise.name, exercise.gifUrl, cachedDescription, onDescriptionFetched]);

    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4"><div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-md relative"><button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24} /></button><div className="p-6"><h2 className="text-2xl font-bold text-white mb-4 text-center">{exercise.name}</h2><div className="min-h-[10rem] bg-gray-900 rounded-lg p-4 text-gray-300 flex justify-center items-center">
            {exercise.gifUrl ? (
                <img src={exercise.gifUrl} alt={`${exercise.name} GIF`} className="max-w-full max-h-64 rounded-md" />
            ) : (
                isLoading ? <Loader2 className="animate-spin" /> : error || description
            )}
        </div></div></div></div>
    );
};
const ExerciseItem = ({ exercise, onUpdate, onSetUpdate, onComplete, onSkip, onUndo, onEdit, onShowVisualAid, trend, onDragStart, onDragOver, onDrop, onDragEnd, isDragging }) => {
    const [note, setNote] = useState(exercise.note);
    const [isSkipping, setIsSkipping] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleNoteBlur = () => {
        if (isSkipping && note.trim() !== '') {
            onSkip(note);
            setIsSkipping(false);
        } else {
            onUpdate({ note });
        }
    };

    const handleExpandClick = () => {
        if (!isExpanded && (exercise.type === 'strength' || !exercise.type) && (!exercise.actualSets || exercise.actualSets.length === 0)) {
            const numSets = parseInt(exercise.targetSets) || 0;
            const reps = exercise.targetReps?.split('-')[0].trim() || '';
            const weight = exercise.targetWeightValue || '';
            const defaultSets = Array.from({ length: numSets }, () => ({ reps, weight }));
            onUpdate({ actualSets: defaultSets });
        }
        setIsExpanded(!isExpanded);
    };

    const targetSetsCount = parseInt(exercise.targetSets) || 0;
    const exerciseType = exercise.type?.toLowerCase() || 'strength'; // Fallback for old data

    return (
        <div draggable={exercise.status === 'pending'} onDragStart={onDragStart} onDragOver={onDragOver} onDrop={onDrop} onDragEnd={onDragEnd} className={`bg-gray-800 rounded-lg shadow-md exercise-item transition-all duration-300 status-${exercise.status} ${isDragging ? 'opacity-50' : 'opacity-100'}`}>
            <div className="p-4"><div className="flex items-start space-x-4"><input type="checkbox" checked={exercise.status !== 'pending'} onChange={onComplete} className="form-checkbox h-7 w-7 mt-1 bg-gray-700 border-gray-600 rounded text-cyan-500 focus:ring-cyan-500/50 cursor-pointer" disabled={exercise.status !== 'pending'} /><div className="flex-1 min-w-0"><div className="flex justify-between items-center"><div className="flex items-center flex-wrap"><h3 className="text-lg font-semibold text-white">{exercise.name}</h3>{trend}</div><div className="flex items-center space-x-1">{exerciseType === 'strength' && <button onClick={handleExpandClick} className="p-1 text-gray-500 hover:text-cyan-400"><ChevronsUpDown size={20} /></button>}<button onClick={onShowVisualAid} className="p-1 text-gray-500 hover:text-cyan-400"><Info size={20} /></button>{exercise.status === 'pending' && <button onClick={onEdit} className="p-1 text-gray-500 hover:text-cyan-400"><Pencil size={18} /></button>}{exercise.status === 'pending' && <button onClick={() => setIsSkipping(true)} className="p-1 text-gray-500 hover:text-red-400"><X size={20} /></button>}{exercise.status !== 'pending' && <button onClick={onUndo} className="p-1 text-gray-500 hover:text-cyan-400" title="Undo"><Undo2 size={20} /></button>}</div></div>
            
            <div className="mt-2 p-3 bg-gray-900/50 rounded-md">
                {exerciseType === 'strength' && (
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div><div className="text-xs text-gray-400">Sets</div><div className="text-lg font-bold text-white">{exercise.targetSets}</div></div>
                        <div><div className="text-xs text-gray-400">Reps</div><div className="text-lg font-bold text-white">{exercise.targetReps}</div></div>
                        <div><div className="text-xs text-gray-400">Weight</div><div className="text-lg font-bold text-white">{exercise.targetWeight || 'Bodyweight'}</div></div>
                    </div>
                )}
                {exerciseType === 'cardio' && (
                     <div className="grid grid-cols-2 gap-4 text-center">
                        <div><div className="text-xs text-gray-400">Time</div><div className="text-lg font-bold text-white">{exercise.targetTime}</div></div>
                        <div><div className="text-xs text-gray-400">Distance</div><div className="text-lg font-bold text-white">{exercise.targetDistance}</div></div>
                    </div>
                )}

                {isExpanded && exerciseType === 'strength' && (
                    <div className="mt-4 pt-4 border-t border-gray-700 space-y-2">
                        {Array.from({ length: targetSetsCount }).map((_, setIndex) => (
                            <div key={setIndex} className="grid grid-cols-[auto,1fr,1fr] gap-x-3 items-center">
                                <span className="text-sm font-medium text-gray-400">Set {setIndex + 1}</span>
                                <input type="number" value={exercise.actualSets[setIndex]?.reps ?? ''} onChange={e => onSetUpdate(setIndex, 'reps', e.target.value)} placeholder={exercise.targetReps?.split('-')[0].trim() || 'Reps'} className="bg-gray-700 p-2 rounded w-full text-center" disabled={exercise.status !== 'pending'} />
                                <input type="number" value={exercise.actualSets[setIndex]?.weight ?? ''} onChange={e => onSetUpdate(setIndex, 'weight', e.target.value)} placeholder={`${exercise.targetWeightValue || '0'} kg`} className="bg-gray-700 p-2 rounded w-full text-center" disabled={exercise.status !== 'pending'} step="0.5" />
                            </div>
                        ))}
                    </div>
                )}

                {exerciseType === 'cardio' && (
                     <div className={`mt-4 grid grid-cols-2 gap-3 ${exercise.status !== 'pending' ? 'opacity-50' : ''}`}>
                        <input type="number" value={exercise.actualTime || ''} onChange={e => onUpdate({ actualTime: e.target.value })} placeholder="Time (min)" className="bg-gray-700 p-2 rounded" disabled={exercise.status !== 'pending'} min="0" />
                        <input type="number" value={exercise.actualDistance || ''} onChange={e => onUpdate({ actualDistance: e.target.value })} placeholder={`Distance (${exercise.defaultUnit})`} className="bg-gray-700 p-2 rounded" disabled={exercise.status !== 'pending'} min="0" />
                    </div>
                )}

                <div className={`mt-4 flex items-center gap-4 ${exercise.status !== 'pending' ? 'opacity-50' : ''}`}>
                    <input type="text" value={note || ''} onChange={e => setNote(e.target.value)} onBlur={handleNoteBlur} placeholder={isSkipping ? "Reason for skipping is required" : "Notes"} className={`flex-grow bg-gray-700 p-2 rounded ${isSkipping ? 'border-2 border-red-500' : ''}`} disabled={exercise.status !== 'pending' && !isSkipping} />
                     {exercise.calories && <div className="text-sm text-amber-400 flex items-center flex-shrink-0"><Flame size={14} className="mr-1.5"/>~{exercise.calories} kcal</div>}
                </div>
            </div>
            
            </div></div></div>
        </div>
    );
};

const SessionNotesModal = ({ notes, onSave, onClear, onClose }) => {
    const [sessionNotes, setSessionNotes] = useState(notes || '');
    const handleSave = () => { onSave(sessionNotes); onClose(); };
    const handleClear = () => {
        setSessionNotes('');
        onClear();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
            <div className="bg-gray-800 text-white rounded-lg p-6 w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24} /></button>
                <h2 className="text-2xl font-bold mb-4">Session Briefing</h2>
                <p className="text-sm text-gray-400 mb-4">Add notes for the entire workout session. Perfect for coach instructions or personal reminders.</p>
                <textarea value={sessionNotes} onChange={(e) => setSessionNotes(e.target.value)} placeholder="e.g., Focus on form, don't go too heavy today." className="w-full h-40 bg-gray-900 text-gray-200 rounded-lg p-3 border border-gray-600 focus:border-cyan-500" />
                <div className="flex justify-between items-center mt-6">
                    <button onClick={handleClear} className="bg-red-900/50 hover:bg-red-900 px-4 py-2 rounded">Clear</button>
                    <div className="space-x-2">
                        <button onClick={onClose} className="bg-gray-600 px-4 py-2 rounded">Cancel</button>
                        <button onClick={handleSave} className="bg-cyan-600 px-4 py-2 rounded">Save Notes</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const WorkoutSummaryStats = ({ stats }) => {
    if (!stats || stats.exerciseCount === 0) return null;
    return (
        <div className="bg-gray-800 p-4 rounded-lg mb-6">
            <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider">Exercises</div>
                    <div className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                        <Dumbbell className="text-cyan-400" size={20}/>
                        {stats.exerciseCount}
                    </div>
                </div>
                {stats.totalVolume > 0 && 
                    <div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider">Volume</div>
                        <div className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                            <Weight className="text-cyan-400" size={20}/>
                            {stats.totalVolume.toLocaleString()} <span className="text-base font-normal text-gray-400">kg</span>
                        </div>
                    </div>
                }
                {stats.totalCalories > 0 &&
                    <div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider">Calories</div>
                        <div className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                            <Flame className="text-amber-400" size={20}/>
                            {stats.totalCalories}
                        </div>
                    </div>
                }
            </div>
        </div>
    );
};


// --- MAIN APP COMPONENT ---
export default function App() {
    const [currentUser, setCurrentUser] = useState(null);
    const [weeklyPlan, setWeeklyPlan] = useState({});
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeModal, setActiveModal] = useState(null);
    const [editingExercise, setEditingExercise] = useState(null);
    const [userProfile, setUserProfile] = useState({ name: '', height: '', weight: '', age: '', profilePic: null });
    const [toast, setToast] = useState({ show: false, message: '' });
    const [draggedItem, setDraggedItem] = useState(null);
    const [dropTarget, setDropTarget] = useState(null);
    const [loading, setLoading] = useState(true);
    const [exerciseDescriptions, setExerciseDescriptions] = useState({});
    const [exerciseLibrary, setExerciseLibrary] = useState([]);
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setCurrentUser(user);
                const userDocRef = doc(db, 'artifacts', appId, 'users', user.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    const data = userDocSnap.data();
                    setUserProfile(data.profile || { name: user.displayName, email: user.email, profilePic: user.photoURL });
                    setWeeklyPlan(data.workouts || {});
                    setExerciseDescriptions(data.descriptions || {});
                } else {
                    const profile = { name: user.displayName || 'New User', email: user.email, profilePic: user.photoURL };
                    await setDoc(userDocRef, { profile, workouts: {}, descriptions: {} });
                    setUserProfile(profile);
                }
            } else {
                setCurrentUser(null);
                setWeeklyPlan({});
                setUserProfile({ name: '', height: '', weight: '', age: '', profilePic: null });
            }
            setLoading(false);
        });

        const performInitialSignIn = async () => {
            if (!auth.currentUser) {
                 try {
                    if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                       await signInWithCustomToken(auth, __initial_auth_token);
                    } else {
                       await signInAnonymously(auth);
                    }
                } catch (error) {
                    console.error("Initial sign-in failed:", error);
                }
            }
        };
        
        const fetchExerciseLibrary = async () => {
             const lib = [
                { id: 'ex1', name: 'Lat Pulldown', category: 'Strength', bodyPart: 'Upper Body', metricType: 'weight_reps', defaultUnit: 'kg' },
                { id: 'ex2', name: 'Chest Press', category: 'Strength', bodyPart: 'Upper Body', metricType: 'weight_reps', defaultUnit: 'kg' },
                { id: 'ex3', name: 'Squat', category: 'Strength', bodyPart: 'Lower Body', metricType: 'weight_reps', defaultUnit: 'kg' },
                { id: 'ex4', name: 'Leg Extension', category: 'Strength', bodyPart: 'Lower Body', metricType: 'weight_reps', defaultUnit: 'kg' },
                { id: 'ex5', name: 'Pressups', category: 'Strength', bodyPart: 'Upper Body', metricType: 'bodyweight', defaultUnit: 'reps' },
                { id: 'ex6', name: 'Run', category: 'Cardio', bodyPart: 'Full Body', metricType: 'time_distance', defaultUnit: 'km' },
                { id: 'ex7', name: 'Cycle', category: 'Cardio', bodyPart: 'Lower Body', metricType: 'time_distance', defaultUnit: 'km' },
                { id: 'ex8', name: 'Stairmaster', category: 'Cardio', bodyPart: 'Lower Body', metricType: 'time_distance', defaultUnit: 'floors' },
                { id: 'ex9', name: 'Eliptical', category: 'Cardio', bodyPart: 'Full Body', metricType: 'time_distance', defaultUnit: 'km' },
                { id: 'ex10', name: 'Walk (Distance)', category: 'Other', bodyPart: 'Full Body', metricType: 'time_distance', defaultUnit: 'km' },
                { id: 'ex11', name: 'Walk (Steps)', category: 'Other', bodyPart: 'Full Body', metricType: 'time_distance', defaultUnit: 'steps' },
                { id: 'ex12', name: 'Other', category: 'Other', bodyPart: 'N/A', metricType: 'custom' },
            ];
            setExerciseLibrary(lib);
        };

        performInitialSignIn();
        fetchExerciseLibrary();
        return () => unsubscribe();
    }, [appId]);
    
    const showToast = (message) => { setToast({ show: true, message }); setTimeout(() => setToast({ show: false, message: '' }), 2000); };
    
    const handleLogin = async () => { 
        setLoading(true);
        try { 
            await signInWithPopup(auth, provider); 
        } catch (error) { 
            console.error("Authentication error:", error); 
            setLoading(false);
        } 
    };

    const handleLogout = async () => { 
        await signOut(auth);
    };

    const updateFirestore = async (data) => {
        if (!currentUser) return;
        const userDocRef = doc(db, 'artifacts', appId, 'users', currentUser.uid);
        await setDoc(userDocRef, data, { merge: true });
    };

    const updateDayData = (dateKey, newDayData) => {
        const newWeeklyPlan = { ...weeklyPlan, [dateKey]: newDayData };
        setWeeklyPlan(newWeeklyPlan);
        updateFirestore({ workouts: newWeeklyPlan });
    };

    const handleSetUpdate = (exerciseId, setIndex, field, value) => {
        const dateKey = toYYYYMMDD(currentDate);
        const dayData = weeklyPlan[dateKey] || { exercises: [], sessionNotes: '' };

        const newExercises = dayData.exercises.map(ex => {
            if (ex.id === exerciseId) {
                const newActualSets = [...(ex.actualSets || [])];
                
                while(newActualSets.length <= setIndex) {
                    newActualSets.push({ reps: '', weight: '' });
                }
                
                newActualSets[setIndex] = {
                    ...newActualSets[setIndex],
                    [field]: value
                };

                return { ...ex, actualSets: newActualSets };
            }
            return ex;
        });

        updateDayData(dateKey, { ...dayData, exercises: newExercises });
    };

    const updateExercise = (id, updatedFields) => {
        const dateKey = toYYYYMMDD(currentDate);
        const dayData = weeklyPlan[dateKey] || { exercises: [], sessionNotes: '' };
        const newExercises = dayData.exercises.map(ex => ex.id === id ? { ...ex, ...updatedFields } : ex);
        updateDayData(dateKey, { ...dayData, exercises: newExercises });
    };

    const handleSaveProfile = (newProfile) => { setUserProfile(newProfile); updateFirestore({ profile: newProfile }); };
    const findLastPerformance = (exerciseName) => {
        let lastPerf = null;
        const sortedDates = Object.keys(weeklyPlan).sort().reverse();
        for (const dateKey of sortedDates) {
            const day = weeklyPlan[dateKey];
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
    const handleEditExercise = (exercise) => { setEditingExercise(exercise); setActiveModal('edit'); };
    const handleSaveEditedExercise = (editedExercise) => { updateExercise(editedExercise.id, editedExercise); showToast("Exercise updated!"); };
    const handleDeleteExercise = (id) => {
        const dateKey = toYYYYMMDD(currentDate);
        const dayData = weeklyPlan[dateKey];
        const newExercises = dayData.exercises.filter(ex => ex.id !== id);
        updateDayData(dateKey, { ...dayData, exercises: newExercises });
        showToast("Exercise deleted");
    };
    const handleAddExercise = (newExerciseData) => {
        const dateKey = toYYYYMMDD(currentDate);
        const newExercise = { id: Math.random(), ...newExerciseData, actualSets: [], note: '', status: 'pending', completedTimestamp: null, calories: null, targetWeightValue: parseFloat(newExerciseData.targetWeight) || 0 };
        const dayData = weeklyPlan[dateKey] || { exercises: [], sessionNotes: '' };
        const newExercises = [...dayData.exercises, newExercise];
        updateDayData(dateKey, { ...dayData, exercises: newExercises });
        showToast("Exercise added!");
    };
    const handleImportConfirm = (csvData) => {
        const newPlan = { ...weeklyPlan };

        csvData.forEach(row => {
            const dateKey = toYYYYMMDD(new Date(row.date));
            if (!dateKey) return;

            if (!newPlan[dateKey]) {
                newPlan[dateKey] = { exercises: [], sessionNotes: '' };
            }
            if(row.sessionNotes && !newPlan[dateKey].sessionNotes) {
                 newPlan[dateKey].sessionNotes = row.sessionNotes;
            }

            const newExercise = {
                id: Math.random(),
                name: row.exerciseName,
                type: row.type?.toLowerCase() || 'strength',
                targetSets: row.targetSets || 'N/A',
                targetReps: row.targetReps || 'N/A',
                targetWeight: row.targetWeight || 'N/A',
                targetWeightValue: parseFloat(row.targetWeight) || 0,
                actualSets: [],
                note: '',
                status: 'pending',
                completedTimestamp: null,
                calories: null
            };
            newPlan[dateKey].exercises.push(newExercise);
        });

        setWeeklyPlan(newPlan);
        updateFirestore({ workouts: newPlan });
        showToast("Plan imported successfully!");
    };
    const generateSummary = () => {
        const dayData = weeklyPlan[toYYYYMMDD(currentDate)];
        if (!dayData) return "No workout for today.";
        let summary = `Workout Summary for ${formatDate(currentDate)}:\n`;
        if(dayData.sessionNotes) summary += `\nCoach's Notes: ${dayData.sessionNotes}\n`;
        summary += "\n";
        dayData.exercises.forEach(ex => {
            if (ex.status === 'pending') return;
            summary += `• ${ex.name}: `;
            if (ex.status === 'completed' || ex.status === 'completed-under') summary += `Completed.`;
            if (ex.status === 'skipped') { summary += `Skipped. Notes: ${ex.note || 'No reason given.'}\n`; return; }
            if (ex.type === 'strength' && ex.actualSets && ex.actualSets.length > 0) {
                const setsSummary = ex.actualSets.map(s => `${s.reps || '_'}x${s.weight || '_'}kg`).join(', ');
                summary += ` ${setsSummary}.`;
            } else if (ex.type === 'strength') {
                summary += ` ${ex.targetSets}x${ex.targetReps} @ ${ex.targetWeight}.`;
            }
            else { if (ex.actualTime) summary += ` Time: ${ex.actualTime} min.`; if (ex.actualDistance) summary += ` Distance: ${ex.actualDistance} km.`; }
            if (ex.note) summary += ` Notes: ${ex.note}.`;
            if (ex.calories) summary += ` (~${ex.calories} kcal)`;
            summary += '\n';
        });
        return summary;
    };
    const handleCopySummary = () => { const summaryText = generateSummary(); navigator.clipboard.writeText(summaryText); showToast("Summary copied to clipboard!"); setActiveModal(null); };
    
    const fetchCalorieEstimation = async (exercise) => {
        const prompt = `Estimate the calories burned for this exercise, given a user weight of ${userProfile.weight || 100}kg. Provide only the number. Exercise: ${exercise.name}, Sets: ${exercise.actualReps || exercise.targetSets}, Reps: ${exercise.actualReps || exercise.targetReps}, Weight: ${exercise.actualWeight || exercise.targetWeightValue}kg`;
        const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
        const apiKey = firebaseConfig.apiKey;
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        try {
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) throw new Error('API request failed');
            const result = await response.json();
            const text = result.candidates[0].content.parts[0].text;
            const calories = parseInt(text.match(/\d+/)[0]);
            return calories;
        } catch (e) {
            console.error("Calorie estimation failed:", e);
            return null;
        }
    };

    const completeExercise = async (id) => {
        const dateKey = toYYYYMMDD(currentDate);
        const exercise = weeklyPlan[dateKey].exercises.find(ex => ex.id === id);
        if (!exercise) return;
        
        const updatedFields = { status: 'completed', completedTimestamp: Date.now() };

        if (exercise.type === 'strength') {
            const numSets = parseInt(exercise.targetSets) || 0;
            const newActualSets = [...(exercise.actualSets || [])];
            
            while (newActualSets.length < numSets) {
                newActualSets.push({});
            }
            if (newActualSets.length > numSets) {
                newActualSets.length = numSets;
            }

            for (let i = 0; i < numSets; i++) {
                newActualSets[i] = {
                    reps: newActualSets[i]?.reps || exercise.targetReps?.split('-')[0].trim() || '',
                    weight: newActualSets[i]?.weight || exercise.targetWeightValue || '',
                };
            }
            updatedFields.actualSets = newActualSets;

            const lastSetWeight = newActualSets[newActualSets.length - 1]?.weight;
            const actualWeight = parseFloat(lastSetWeight) || exercise.targetWeightValue;
            if (actualWeight < exercise.targetWeightValue) {
                updatedFields.status = 'completed-under';
            }
        }
        
        const calories = await fetchCalorieEstimation({ ...exercise, ...updatedFields });
        if (calories) {
            updatedFields.calories = calories;
        }
        
        updateExercise(id, updatedFields);
        showToast("Great Job!");
    };
    
    const skipExercise = (id, note) => { updateExercise(id, { status: 'skipped', note, completedTimestamp: Date.now() }); showToast("Exercise skipped"); };
    const undoExercise = (id) => { const dateKey = toYYYYMMDD(currentDate); const exerciseToUndo = weeklyPlan[dateKey].exercises.find(ex => ex.id === id); if (!exerciseToUndo) return; updateExercise(id, { status: 'pending', completedTimestamp: null, actualSets: [], actualTime: '', actualDistance: '', note: exerciseToUndo.status === 'skipped' ? exerciseToUndo.note : '', calories: null }); showToast("Action undone"); };
    const exercisesForDay = useMemo(() => { const dayData = weeklyPlan[toYYYYMMDD(currentDate)]; if (!dayData || !dayData.exercises) return []; return [...dayData.exercises].sort((a, b) => { const aDone = a.status !== 'pending', bDone = b.status !== 'pending'; if (aDone !== bDone) return aDone - bDone; return (a.completedTimestamp || 0) - (b.completedTimestamp || 0); }); }, [currentDate, weeklyPlan]);
    const isWorkoutComplete = useMemo(() => { if (exercisesForDay.length === 0) return false; return exercisesForDay.every(ex => ex.status !== 'pending'); }, [exercisesForDay]);
    const handleDragStart = (e, item) => setDraggedItem(item);
    const handleDragOver = (e, item) => { e.preventDefault(); if (item.id !== draggedItem?.id) setDropTarget(item.id); };
    const handleDrop = (e, dropItem) => { e.preventDefault(); if (!draggedItem || draggedItem.id === dropItem.id) return; const dateKey = toYYYYMMDD(currentDate); const dayData = weeklyPlan[dateKey]; let currentItems = [...dayData.exercises]; const draggedIndex = currentItems.findIndex(item => item.id === draggedItem.id); const dropIndex = currentItems.findIndex(item => item.id === dropItem.id); const [reorderedItem] = currentItems.splice(draggedIndex, 1); currentItems.splice(dropIndex, 0, reorderedItem); updateDayData(dateKey, { ...dayData, exercises: currentItems }); setDraggedItem(null); setDropTarget(null); };
    const handleDragEnd = () => { setDraggedItem(null); setDropTarget(null); };
    const handleDescriptionFetched = (name, description) => {
        const newDescriptions = { ...exerciseDescriptions, [name]: description };
        setExerciseDescriptions(newDescriptions);
        updateFirestore({ descriptions: newDescriptions });
    };
    const handleSaveSessionNotes = (notes) => {
        const dateKey = toYYYYMMDD(currentDate);
        const dayData = weeklyPlan[dateKey] || { exercises: [], sessionNotes: '' };
        updateDayData(dateKey, { ...dayData, sessionNotes: notes });
        showToast("Session notes saved!");
    };

    const handleClearSessionNotes = () => {
        const dateKey = toYYYYMMDD(currentDate);
        const dayData = weeklyPlan[dateKey];
        if (dayData) {
            updateDayData(dateKey, { ...dayData, sessionNotes: '' });
            showToast("Session notes cleared!");
        }
    };

    const workoutSummaryStats = useMemo(() => {
        if (!exercisesForDay || exercisesForDay.length === 0) return null;

        const completedExercises = exercisesForDay.filter(ex => ex.status !== 'pending' && ex.status !== 'skipped');

        const totalCalories = completedExercises.reduce((sum, ex) => sum + (ex.calories || 0), 0);
        
        const totalVolume = completedExercises.reduce((volume, ex) => {
            if ((ex.type !== 'strength' && ex.type) || !ex.actualSets || ex.actualSets.length === 0) return volume;
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


    if (!firebaseConfig || !firebaseConfig.apiKey || firebaseConfig.apiKey === "YOUR_NEW_REGENERATED_API_KEY_HERE") {
        return <ConfigErrorScreen />;
    }
    if (loading) return <div className="bg-gray-900 h-screen flex items-center justify-center text-white"><Loader2 className="animate-spin mr-4" />Loading...</div>;
    if (!currentUser) return <LoginScreen onLogin={handleLogin} />;

    const dayData = weeklyPlan[toYYYYMMDD(currentDate)];
    const completionPercent = exercisesForDay.length > 0 ? (exercisesForDay.filter(e => e.status !== 'pending').length / exercisesForDay.length) * 100 : 0;

    return (
        <>
            <style>{`.exercise-item { border-left: 6px solid transparent; } .status-completed { border-left-color: #22c55e; } .status-beat-target { border-left-color: #22c55e; } .status-completed-under { border-left-color: #f97316; } .status-skipped { border-left-color: #ef4444; } .drop-indicator { border-top: 2px solid #22d3ee; }`}</style>
            <div className="bg-gray-900 text-gray-100 min-h-screen font-sans">
                <div className={`fixed top-0 left-0 h-full bg-gray-800 w-64 z-40 transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}><div className="p-4"><div className="flex items-center space-x-3 mb-6"><img src={userProfile.profilePic || `https://placehold.co/100x100/1f2937/7dd3fc?text=${(userProfile.name || ' ').charAt(0)}`} alt="Profile" className="w-12 h-12 rounded-full object-cover" /><div><p className="font-bold text-lg">{userProfile.name}</p><button onClick={() => { setActiveModal('profile'); setIsMenuOpen(false); }} className="text-xs text-cyan-400">Edit Profile</button></div></div><ul><li onClick={() => { setActiveModal('trends'); setIsMenuOpen(false); }} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-700 cursor-pointer"><TrendingUp size={20} /><span>Trends</span></li><li onClick={() => { setActiveModal('import'); setIsMenuOpen(false); }} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-700 cursor-pointer"><FileText size={20} /><span>Import from CSV</span></li><li onClick={handleLogout} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-700 cursor-pointer"><LogOut size={20} /><span>Logout</span></li></ul></div></div>
                {isMenuOpen && <div onClick={() => setIsMenuOpen(false)} className="fixed inset-0 bg-black/50 z-30"></div>}
                <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8 pb-32">
                    <header className="flex items-center justify-between mb-6"><button onClick={() => setIsMenuOpen(true)} className="p-2 rounded-md hover:bg-gray-700"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg></button><h1 className="text-xl font-bold text-white tracking-tight">Workout Companion</h1><button onClick={() => setActiveModal('profile')} className="p-1 rounded-full hover:bg-gray-700"><img src={userProfile.profilePic || `https://placehold.co/100x100/1f2937/7dd3fc?text=${(userProfile.name || ' ').charAt(0)}`} alt="Profile" className="w-8 h-8 rounded-full object-cover" /></button></header>
                    <div className="flex items-center justify-between bg-gray-800 p-2 rounded-lg mb-4"><button onClick={() => setCurrentDate(d => { const newD = new Date(d); newD.setDate(d.getDate() - 1); return newD; })} className="p-2 rounded-md hover:bg-gray-700"><ChevronLeft/></button><div className="text-center"><div className="flex items-center justify-center"><div className="text-lg font-bold text-white">{formatDate(currentDate)}</div><button onClick={() => setActiveModal('sessionNotes')} className="ml-2 p-1 text-gray-400 hover:text-cyan-400"><BookOpen size={18} /></button></div>{toYYYYMMDD(new Date()) !== toYYYYMMDD(currentDate) && <button onClick={() => setCurrentDate(new Date())} className="text-xs text-cyan-400 hover:text-cyan-300">Go to Today</button>}</div><button onClick={() => setCurrentDate(d => { const newD = new Date(d); newD.setDate(d.getDate() + 1); return newD; })} className="p-2 rounded-md hover:bg-gray-700"><ChevronRight/></button></div>
                    {dayData?.sessionNotes && <div className="bg-sky-900/50 border border-sky-700 text-sky-200 p-3 rounded-lg mb-4 text-sm"><p><span className="font-bold">Session Briefing:</span> {dayData.sessionNotes}</p></div>}
                    
                    {exercisesForDay.length > 0 && (<div className="mb-6"><div className="w-full bg-gray-700 rounded-full h-4 mb-1"><div className="bg-cyan-500 h-4 rounded-full" style={{ width: `${completionPercent}%` }}></div></div><p className="text-right text-xs text-gray-400">{Math.round(completionPercent)}% Complete</p></div>)}

                    {workoutSummaryStats && <WorkoutSummaryStats stats={workoutSummaryStats} />}

                    <div className="space-y-4">{isWorkoutComplete && (<div className="bg-green-800/50 border border-green-600 text-white p-4 rounded-lg text-center flex items-center justify-center space-x-3"><PartyPopper className="text-green-300" /><div><h3 className="font-bold text-lg">Workout Complete!</h3><p className="text-sm text-green-200">Great job finishing all your exercises for today.</p></div></div>)}{exercisesForDay.length > 0 ? exercisesForDay.map(ex => { let trendIndicator = null; if (ex.type === 'strength') { const prevWeight = findLastPerformance(ex.name)?.targetWeightValue; if (prevWeight !== null && ex.targetWeightValue > prevWeight) { const percentIncrease = ((ex.targetWeightValue - prevWeight) / prevWeight) * 100; trendIndicator = (<span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-900 text-green-300"><TrendingUp className="w-3 h-3 mr-1" />+{percentIncrease.toFixed(1)}%</span>); } } return (<div key={ex.id} className={dropTarget === ex.id ? 'drop-indicator' : ''}><ExerciseItem exercise={ex} onUpdate={(fields) => updateExercise(ex.id, fields)} onSetUpdate={(setIndex, field, value) => handleSetUpdate(ex.id, setIndex, field, value)} onComplete={() => completeExercise(ex.id)} onSkip={(note) => skipExercise(ex.id, note)} onUndo={() => undoExercise(ex.id)} onEdit={() => handleEditExercise(ex)} onShowVisualAid={() => setActiveModal({type: 'visual', exercise: ex})} trend={trendIndicator} onDragStart={(e) => handleDragStart(e, ex)} onDragOver={(e) => handleDragOver(e, ex)} onDrop={(e) => handleDrop(e, ex)} onDragEnd={handleDragEnd} isDragging={draggedItem?.id === ex.id} /></div>)}) : (<div className="text-center py-16 bg-gray-800 rounded-lg flex flex-col items-center justify-center space-y-4"><ClipboardPlus size={48} className="text-gray-500" /><h3 className="text-xl font-semibold text-white">No Workout Planned</h3><p className="text-gray-400 mt-2 max-w-xs">It's a rest day! Or, you can add a new workout to get started.</p><button onClick={() => setActiveModal('add')} className="mt-4 flex items-center justify-center bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg"><Plus size={20} className="mr-2" />Add a Workout</button></div>)}</div>
                </div>
                 <div className="fixed bottom-0 left-0 right-0 bg-gray-900/80 backdrop-blur-sm border-t border-gray-700"><div className="max-w-2xl mx-auto p-4 flex gap-4"><button onClick={() => setActiveModal('add')} className="w-1/2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg text-base transition-all duration-200 flex items-center justify-center"><Plus size={20} className="mr-2" />Add Exercise</button><button onClick={() => setActiveModal('summary')} className="w-1/2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-lg text-base transition-all duration-200 flex items-center justify-center"><ClipboardList size={20} className="mr-2" />Review Summary</button></div></div>
                {activeModal === 'profile' && <ProfileModal user={userProfile} onSave={handleSaveProfile} onClose={() => setActiveModal(null)} />}
                {activeModal === 'trends' && <TrendsModal weeklyPlan={weeklyPlan} onClose={() => setActiveModal(null)} />}
                {activeModal === 'import' && <CSVImportModal onImport={handleImportConfirm} onClose={() => setActiveModal(null)} />}
                {activeModal === 'edit' && <EditExerciseModal exercise={editingExercise} onSave={handleSaveEditedExercise} onDelete={handleDeleteExercise} onClose={() => setActiveModal(null)} />}
                {activeModal === 'add' && <AddExerciseModal onAdd={handleAddExercise} exerciseLibrary={exerciseLibrary} findLastPerformance={findLastPerformance} onClose={() => setActiveModal(null)} />}
                {activeModal === 'summary' && <SummaryModal summary={generateSummary()} onClose={() => setActiveModal(null)} onCopy={handleCopySummary} />}
                {activeModal === 'sessionNotes' && <SessionNotesModal notes={dayData?.sessionNotes} onSave={handleSaveSessionNotes} onClear={handleClearSessionNotes} onClose={() => setActiveModal(null)} />}
                {activeModal?.type === 'visual' && <VisualAidModal exercise={activeModal.exercise} onClose={() => setActiveModal(null)} onDescriptionFetched={handleDescriptionFetched} cachedDescription={exerciseDescriptions[activeModal.exercise.name]} />}
                {toast.show && <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-green-500 text-white py-2 px-5 rounded-full text-sm font-semibold shadow-lg transition-all duration-300 opacity-100 translate-y-0">{toast.message}</div>}
            </div>
        </>
    );
}
